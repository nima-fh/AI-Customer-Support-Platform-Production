from app.auth.security import hash_password
from app.db.database import SessionLocal
from app.db.models import (
    Customer,
    User,
    Order,
    Ticket,
    Conversation,
    Message,
)


def seed_database():
    db = SessionLocal()

    try:
        # Prevent duplicate seed data
        existing_agent = (
            db.query(User).filter(User.email == "agent@supportai.com").first()
        )

        existing_customer = (
            db.query(User).filter(User.email == "demo@supportai.com").first()
        )

        if existing_agent or existing_customer:
            print("Seed data already exists.")
            return

        # -------------------------------------------------
        # Customers
        # -------------------------------------------------

        customer = Customer(
            name="Demo Customer",
            email="demo@supportai.com",
        )

        agent_customer = Customer(
            name="Support Agent",
            email="agent@supportai.com",
        )

        db.add_all([customer, agent_customer])
        db.flush()

        # -------------------------------------------------
        # Users
        # -------------------------------------------------

        customer_user = User(
            email="demo@supportai.com",
            hashed_password=hash_password("Demo1234!"),
            is_verified=True,
            is_active=True,
            role="customer",
            customer_id=customer.id,
        )

        agent_user = User(
            email="agent@supportai.com",
            hashed_password=hash_password("Agent1234!"),
            is_verified=True,
            is_active=True,
            role="support_agent",
            customer_id=agent_customer.id,
        )

        db.add_all([customer_user, agent_user])
        db.flush()

        # -------------------------------------------------
        # Orders
        # -------------------------------------------------

        order_1 = Order(
            customer_id=customer.id,
            status="shipped",
            total_price=120.50,
        )

        order_2 = Order(
            customer_id=customer.id,
            status="pending",
            total_price=89.99,
        )

        db.add_all([order_1, order_2])
        db.flush()

        # -------------------------------------------------
        # Conversation
        # -------------------------------------------------

        conversation = Conversation(
            customer_id=customer.id,
            status="ai_active",
        )

        db.add(conversation)
        db.flush()

        # -------------------------------------------------
        # Messages
        # -------------------------------------------------

        message_1 = Message(
            conversation_id=conversation.id,
            role="user",
            content="Hi, can you tell me the status of my order?",
        )

        message_2 = Message(
            conversation_id=conversation.id,
            role="assistant",
            content="Sure! I can check your order status for you.",
        )

        db.add_all([message_1, message_2])

        # -------------------------------------------------
        # Ticket
        # -------------------------------------------------

        ticket = Ticket(
            customer_id=customer.id,
            conversation_id=conversation.id,
            subject="Order status inquiry",
            message="Customer wants to know the status of their order.",
            status="open",
            priority="normal",
            category="shipping",
            escalation_required=False,
        )

        db.add(ticket)

        # -------------------------------------------------
        # Commit
        # -------------------------------------------------

        db.commit()

        print("Database seeded successfully.")
        print()
        print("Demo customer:")
        print("  Email: demo@supportai.com")
        print("  Password: Demo1234!")
        print()
        print("Support agent:")
        print("  Email: agent@supportai.com")
        print("  Password: Agent1234!")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
