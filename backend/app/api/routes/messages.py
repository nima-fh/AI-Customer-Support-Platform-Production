from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...db.database import get_db
from ...db.models import User
from ...schemas.message import MessageCreate, MessageResponse
from ...services.message_service import send_message, get_conversation_messages
from ...auth.dependencies import get_current_user
from ...services.conversation_service import get_conversation


router = APIRouter()


@router.post(
    "/conversations/{conversation_id}/messages", response_model=MessageResponse
)
def send_message_endpoint(
    conversation_id: int,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    message = send_message(conversation_id, message_data, db, current_user.customer_id)

    if message is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return message


@router.get(
    "/conversations/{conversation_id}/messages", response_model=list[MessageResponse]
)
def get_messages_endpoint(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversation = get_conversation(conversation_id, current_user.customer_id, db)

    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return get_conversation_messages(conversation_id, db)
