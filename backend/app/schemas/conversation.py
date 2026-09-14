from pydantic import BaseModel, ConfigDict


class ConversationCreate(BaseModel):
    customer_id: int | None = None


class ConversationResponse(BaseModel):
    id: int
    customer_id: int
    status: str
    assigned_agent_id: int | None = None

    model_config = ConfigDict(from_attributes=True)