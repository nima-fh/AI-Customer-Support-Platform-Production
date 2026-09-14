from pydantic import BaseModel, ConfigDict


class MessageCreate(BaseModel):
    role: str
    content: str


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str

    model_config = ConfigDict(from_attributes=True)


class AgentMessageCreate(BaseModel):
    content: str
