from pydantic import BaseModel, ConfigDict


class OrderSummary(BaseModel):
    id: int
    status: str
    total_price: float

    model_config = ConfigDict(from_attributes=True)


class TicketSummary(BaseModel):
    id: int
    subject: str
    message: str
    status: str
    priority: str
    category: str
    escalation_required: bool

    model_config = ConfigDict(from_attributes=True)


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str

    model_config = ConfigDict(from_attributes=True)


class ConversationSummary(BaseModel):
    id: int
    status: str
    messages: list[MessageResponse]

    model_config = ConfigDict(from_attributes=True)


class CustomerResponse(BaseModel):
    id: int
    name: str
    email: str
    orders: list[OrderSummary]

    model_config = ConfigDict(from_attributes=True)


class CustomerListResponse(BaseModel):
    id: int
    name: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class CustomerDetailResponse(BaseModel):
    id: int
    name: str
    email: str
    orders: list[OrderSummary]
    tickets: list[TicketSummary]
    conversations: list[ConversationSummary]

    model_config = ConfigDict(from_attributes=True)
