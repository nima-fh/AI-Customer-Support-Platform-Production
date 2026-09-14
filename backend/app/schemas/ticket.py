from pydantic import BaseModel, ConfigDict
from enum import Enum


class TicketStatus(str, Enum):
    OPEN = "open"
    PENDING = "pending"
    CLOSED = "closed"


class TicketPriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"


class TicketCreate(BaseModel):
    customer_id: int | None = None
    subject: str
    message: str
    status: TicketStatus = TicketStatus.OPEN
    priority: TicketPriority = TicketPriority.NORMAL
    category: str = "other"
    escalation_required: bool = False


class TicketUpdate(BaseModel):
    subject: str | None = None
    message: str | None = None
    status: TicketStatus | None = None
    priority: TicketPriority | None = None
    category: str | None = None
    escalation_required: bool | None = None


class TicketResponse(BaseModel):
    id: int
    customer_id: int
    subject: str
    message: str
    status: TicketStatus
    priority: TicketPriority
    category: str
    escalation_required: bool

    model_config = ConfigDict(from_attributes=True)
