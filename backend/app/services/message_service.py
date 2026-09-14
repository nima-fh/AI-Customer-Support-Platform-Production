from sqlalchemy.orm import Session

from ..db.models import Message, Conversation
from ..schemas.message import MessageCreate
from ..ai.service import generate_response


def create_message(conversation_id: int, message_data: MessageCreate, db: Session):
    conversation = (
        db.query(Conversation).filter(Conversation.id == conversation_id).first()
    )

    if conversation is None:
        return None

    message = Message(
        conversation_id=conversation_id,
        role=message_data.role,
        content=message_data.content,
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message


def get_conversation_history(conversation_id: int, db: Session, limit: int = 10):
    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.id.desc())
        .limit(limit)
        .all()
    )[::-1]


def send_message(
    conversation_id: int, message_data: MessageCreate, db: Session, customer_id: int
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id, Conversation.customer_id == customer_id
        )
        .first()
    )

    if conversation is None:
        return None

    history = get_conversation_history(conversation_id, db)

    user_message = Message(
        conversation_id=conversation_id, role="user", content=message_data.content
    )

    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # Human agent has taken over this conversation.
    # Save the customer message but do not call the AI.
    if conversation.status == "human_active":
        return None

    ai_response = generate_response(
        message=message_data.content,
        history=history,
        db=db,
        customer_id=customer_id,
        conversation_id=conversation_id,
    )

    assistant_message = Message(
        conversation_id=conversation_id, role="assistant", content=ai_response
    )

    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    return assistant_message


def get_conversation_messages(conversation_id: int, db: Session):
    return (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.id.asc())
        .all()
    )
