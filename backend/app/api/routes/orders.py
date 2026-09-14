from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...services.order_service import (
    get_order,
    get_customer_orders,
    create_order,
    update_order,
    delete_order,
)
from ...db.database import get_db
from ...schemas.order import OrderCreate, OrderResponse, OrderUpdate
from ...db.models import User
from ...auth.dependencies import get_current_user


router = APIRouter()


@router.get("/orders/me", response_model=list[OrderResponse])
def get_my_orders(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return get_customer_orders(current_user.customer_id, db)


@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order_endpoint(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = get_order(order_id, db, current_user.customer_id)

    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    return order


@router.post("/orders", response_model=OrderResponse)
def create_order_endpoint(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Force the order to belong to the authenticated customer
    order_data.customer_id = current_user.customer_id

    order = create_order(order_data, db)

    return order


@router.patch("/orders/{order_id}", response_model=OrderResponse)
def update_order_endpoint(
    order_id: int,
    order_data: OrderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Make sure the order belongs to this customer
    order = get_order(order_id, db, current_user.customer_id)

    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    order = update_order(order_id, order_data, db)

    return order


@router.delete("/orders/{order_id}")
def delete_order_endpoint(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Make sure the order belongs to this customer
    order = get_order(order_id, db, current_user.customer_id)

    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    delete_order(order_id, db)

    return {"message": "Order deleted successfully"}
