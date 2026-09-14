from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...db.database import get_db
from ...db.models import User
from ...schemas.conversation import ConversationCreate, ConversationResponse
from ...services.conversation_service import (
    create_conversation,
    get_conversation,
    get_customer_conversations,
    delete_conversation,
)
from ...auth.dependencies import get_current_user


router = APIRouter()


@router.post("/conversations", response_model=ConversationResponse)
def create_conversation_endpoint(
    conversation_data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer_id = current_user.customer_id

    conversation = create_conversation(ConversationCreate(customer_id=customer_id), db)

    if conversation is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    return conversation


@router.get("/conversations/me", response_model=list[ConversationResponse])
def get_my_conversations(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return get_customer_conversations(current_user.customer_id, db)


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation_endpoint(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer_id = current_user.customer_id

    conversation = get_conversation(conversation_id, customer_id, db)

    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return conversation


@router.delete("/conversations/{conversation_id}")
def delete_conversation_endpoint(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer_id = current_user.customer_id

    conversation = delete_conversation(
        conversation_id,
        customer_id,
        db,
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    return {"message": "Conversation deleted successfully"}
