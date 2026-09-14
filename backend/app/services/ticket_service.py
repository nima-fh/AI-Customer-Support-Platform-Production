from sqlalchemy.orm import Session

from ..db.models import Ticket, Customer, Message
from ..schemas.ticket import TicketCreate, TicketUpdate


def get_ticket(ticket_id: int, db: Session, customer_id: int):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id, Ticket.customer_id == customer_id)
        .first()
    )

    return ticket


def create_ticket(
    ticket_data: TicketCreate, db: Session, conversation_id: int | None = None
):
    customer = db.query(Customer).filter(Customer.id == ticket_data.customer_id).first()

    if customer is None:
        return None

    ticket = Ticket(
        customer_id=ticket_data.customer_id,
        subject=ticket_data.subject,
        message=ticket_data.message,
        status=ticket_data.status,
        priority=ticket_data.priority,
        category=ticket_data.category,
        escalation_required=ticket_data.escalation_required,
        conversation_id=conversation_id,
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket


def update_ticket(
    ticket_id: int, ticket_data: TicketUpdate, db: Session, customer_id: int
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id, Ticket.customer_id == customer_id)
        .first()
    )

    if ticket is None:
        return None

    update_data = ticket_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(ticket, field, value)

    try:
        db.commit()
        db.refresh(ticket)

        return ticket

    except Exception:
        db.rollback()
        raise


def delete_ticket(ticket_id: int, db: Session, customer_id: int):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id, Ticket.customer_id == customer_id)
        .first()
    )

    if ticket is None:
        return None

    db.delete(ticket)
    db.commit()

    return ticket


def get_customer_tickets(customer_id: int, db: Session):
    return db.query(Ticket).filter(Ticket.customer_id == customer_id).all()


def get_escalated_tickets(db: Session):
    return (
        db.query(Ticket)
        .filter(Ticket.escalation_required == True)
        .order_by(Ticket.id.desc())
        .all()
    )


def get_ticket_conversation(ticket_id: int, db: Session):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if ticket is None:
        return None

    if ticket.conversation_id is None:
        return []

    return (
        db.query(Message)
        .filter(Message.conversation_id == ticket.conversation_id)
        .order_by(Message.id.asc())
        .all()
    )
