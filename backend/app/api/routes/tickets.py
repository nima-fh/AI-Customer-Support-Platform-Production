from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.realtime.manager import manager

from ...db.database import get_db
from ...db.models import User, Ticket, Message, Conversation
from ...schemas.ticket import TicketCreate, TicketResponse, TicketUpdate
from ...services.ticket_service import (
    create_ticket,
    get_ticket,
    update_ticket,
    delete_ticket,
    get_customer_tickets,
    get_ticket_conversation,
    get_escalated_tickets as get_escalated_tickets_service,
)
from ...auth.dependencies import get_current_user
from ...auth.agent_dependencies import get_current_agent
from ...schemas.message import AgentMessageCreate


router = APIRouter()


@router.post("/tickets", response_model=TicketResponse)
def create_ticket_endpoint(
    ticket_data: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Force the ticket to belong to the authenticated customer
    ticket_data.customer_id = current_user.customer_id

    ticket = create_ticket(ticket_data, db)

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    return ticket


@router.get("/tickets/me", response_model=list[TicketResponse])
def get_my_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_customer_tickets(current_user.customer_id, db)


@router.get("/tickets/escalated", response_model=list[TicketResponse])
def get_escalated_tickets(
    current_agent: User = Depends(get_current_agent),
    db: Session = Depends(get_db),
):
    return get_escalated_tickets_service(db)


@router.get("/tickets/{ticket_id}/conversation")
def get_ticket_conversation_endpoint(
    ticket_id: int,
    current_agent: User = Depends(get_current_agent),
    db: Session = Depends(get_db),
):
    messages = get_ticket_conversation(ticket_id, db)

    if messages is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    return messages


@router.patch("/tickets/agent/{ticket_id}", response_model=TicketResponse)
def update_ticket_as_agent(
    ticket_id: int,
    ticket_data: TicketUpdate,
    current_agent: User = Depends(get_current_agent),
    db: Session = Depends(get_db),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    update_data = ticket_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(ticket, field, value)

    try:
        db.commit()
        db.refresh(ticket)

        return ticket

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to update ticket",
        )


@router.post("/tickets/agent/{ticket_id}/messages")
async def send_agent_message(
    ticket_id: int,
    message_data: AgentMessageCreate,
    current_agent: User = Depends(get_current_agent),
    db: Session = Depends(get_db),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    if ticket.conversation_id is None:
        raise HTTPException(
            status_code=400,
            detail="This ticket is not linked to a conversation",
        )

    conversation = (
        db.query(Conversation).filter(Conversation.id == ticket.conversation_id).first()
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    message = Message(
        conversation_id=conversation.id,
        role="agent",
        content=message_data.content,
    )

    db.add(message)

    try:
        db.commit()
        db.refresh(message)

        # Broadcast the new message to everyone
        # connected to this conversation.
        await manager.broadcast(
            conversation.id,
            {
                "type": "message",
                "message": {
                    "id": message.id,
                    "conversation_id": message.conversation_id,
                    "role": message.role,
                    "content": message.content,
                },
            },
        )

        return message

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to send agent message",
        )


@router.post(
    "/tickets/{ticket_id}/take-over",
    response_model=TicketResponse,
)
async def take_over_ticket(
    ticket_id: int,
    current_agent: User = Depends(get_current_agent),
    db: Session = Depends(get_db),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    if ticket.conversation_id is None:
        raise HTTPException(
            status_code=400,
            detail="This ticket has no linked conversation",
        )

    conversation = (
        db.query(Conversation).filter(Conversation.id == ticket.conversation_id).first()
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    conversation.status = "human_active"
    conversation.assigned_agent_id = current_agent.id

    try:
        db.commit()
        db.refresh(ticket)

        await manager.broadcast(
            conversation.id,
            {
                "type": "conversation_status",
                "status": conversation.status,
                "assigned_agent_id": conversation.assigned_agent_id,
            },
        )

        return ticket

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to take over conversation",
        )


@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket_endpoint(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ticket = get_ticket(
        ticket_id,
        db,
        current_user.customer_id,
    )

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    return ticket


@router.patch("/tickets/{ticket_id}", response_model=TicketResponse)
def update_ticket_endpoint(
    ticket_id: int,
    ticket_data: TicketUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ticket = update_ticket(
        ticket_id,
        ticket_data,
        db,
        current_user.customer_id,
    )

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    return ticket


@router.delete("/tickets/{ticket_id}")
def delete_ticket_endpoint(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ticket = delete_ticket(
        ticket_id,
        db,
        current_user.customer_id,
    )

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    return {"message": "Ticket deleted successfully"}
