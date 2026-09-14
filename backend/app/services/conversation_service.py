from sqlalchemy.orm import Session

from ..db.models import Conversation, Customer, Message, Ticket
from ..schemas.conversation import ConversationCreate


def create_conversation(conversation_data: ConversationCreate, db: Session):
    customer = (
        db.query(Customer).filter(Customer.id == conversation_data.customer_id).first()
    )

    if customer is None:
        return None

    conversation = Conversation(customer_id=conversation_data.customer_id)

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


def get_conversation(
    conversation_id: int,
    customer_id: int,
    db: Session,
):
    return (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.customer_id == customer_id,
        )
        .first()
    )


def get_customer_conversations(
    customer_id: int,
    db: Session,
):
    return (
        db.query(Conversation)
        .filter(Conversation.customer_id == customer_id)
        .order_by(Conversation.id.desc())
        .all()
    )


def delete_conversation(
    conversation_id: int,
    customer_id: int,
    db: Session,
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.customer_id == customer_id,
        )
        .first()
    )

    if conversation is None:
        return None

    # Keep linked tickets, but remove their conversation reference.
    db.query(Ticket).filter(Ticket.conversation_id == conversation_id).update(
        {Ticket.conversation_id: None},
        synchronize_session=False,
    )

    # Delete conversation messages first because they reference
    # the conversation.
    db.query(Message).filter(Message.conversation_id == conversation_id).delete(
        synchronize_session=False
    )

    db.delete(conversation)
    db.commit()

    return conversation
