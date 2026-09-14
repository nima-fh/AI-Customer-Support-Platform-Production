from sqlalchemy import Integer, String, Numeric, ForeignKey, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    is_verified: Mapped[bool] = mapped_column(default=False, nullable=False)

    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    role: Mapped[str] = mapped_column(String(30), nullable=False, default="customer")

    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id"), unique=True, nullable=False
    )

    customer: Mapped["Customer"] = relationship(back_populates="user")


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False)

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    orders: Mapped[list["Order"]] = relationship(back_populates="customer")

    tickets: Mapped[list["Ticket"]] = relationship(back_populates="customer")

    conversations: Mapped[list["Conversation"]] = relationship(
        back_populates="customer"
    )

    user: Mapped["User"] = relationship(back_populates="customer", uselist=False)


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=False)

    status: Mapped[str] = mapped_column(String(50), nullable=False)

    total_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    customer: Mapped["Customer"] = relationship(back_populates="orders")


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=False)

    conversation_id: Mapped[int | None] = mapped_column(
        ForeignKey("conversations.id"), nullable=True
    )

    subject: Mapped[str] = mapped_column(String(100), nullable=False)

    message: Mapped[str] = mapped_column(Text, nullable=False)

    status: Mapped[str] = mapped_column(String(50), nullable=False)

    priority: Mapped[str] = mapped_column(String(50), nullable=False)

    category: Mapped[str] = mapped_column(String(50), nullable=False, default="other")

    escalation_required: Mapped[bool] = mapped_column(default=False, nullable=False)

    customer: Mapped["Customer"] = relationship(back_populates="tickets")

    conversation: Mapped["Conversation | None"] = relationship(back_populates="ticket")


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=False)

    status: Mapped[str] = mapped_column(String(30), nullable=False, default="ai_active")

    assigned_agent_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )

    customer: Mapped["Customer"] = relationship(back_populates="conversations")

    assigned_agent: Mapped["User | None"] = relationship(
        foreign_keys=[assigned_agent_id]
    )

    messages: Mapped[list["Message"]] = relationship(back_populates="conversation")

    ticket: Mapped["Ticket | None"] = relationship(back_populates="conversation")


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    conversation_id: Mapped[int] = mapped_column(
        ForeignKey("conversations.id"), nullable=False
    )

    role: Mapped[str] = mapped_column(String(20), nullable=False)

    content: Mapped[str] = mapped_column(Text, nullable=False)

    conversation: Mapped["Conversation"] = relationship(back_populates="messages")
