from pydantic import BaseModel, ConfigDict


class OrderCreate(BaseModel):
    customer_id: int | None = None
    status: str
    total_price: float


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    status: str
    total_price: float

    model_config = ConfigDict(from_attributes=True)


class OrderUpdate(BaseModel):
    status: str | None = None
    total_price: float | None = None
