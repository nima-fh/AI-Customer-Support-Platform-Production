from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...db.database import get_db
from ...db.models import User
from ...schemas.chat import ChatRequest, ChatResponse
from ...services.conversation_service import create_conversation, get_conversation
from ...schemas.conversation import ConversationCreate
from ...schemas.message import MessageCreate
from ...services.message_service import send_message
from ...auth.dependencies import get_current_user


router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer_id = current_user.customer_id

    if request.conversation_id is None:
        conversation = create_conversation(
            ConversationCreate(customer_id=customer_id), db
        )

    else:
        conversation = get_conversation(request.conversation_id, customer_id, db)

        if conversation is None:
            raise HTTPException(status_code=404, detail="Conversation not found")

    assistant_message = send_message(
        conversation.id,
        MessageCreate(role="user", content=request.message),
        db,
        current_user.customer_id,
    )

    return {
        "answer": assistant_message.content if assistant_message else None,
        "conversation_id": conversation.id,
        "conversation_status": conversation.status,
    }