from sqlalchemy.orm import Session
from ..db.models import Order
from ..schemas.order import OrderCreate, OrderUpdate


def get_order(order_id: int, db: Session, customer_id: int):
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.customer_id == customer_id)
        .first()
    )
    return order


def create_order(order_data: OrderCreate, db: Session):
    order = Order(
        customer_id=order_data.customer_id,
        status=order_data.status,
        total_price=order_data.total_price,
    )
    try:
        db.add(order)
        db.commit()
        db.refresh(order)

        return order

    except Exception as e:
        db.rollback()
        raise e


def update_order(order_id: int, order_data: OrderUpdate, db: Session):
    order = db.query(Order).filter(Order.id == order_id).first()

    if order is None:
        return None

    updates = order_data.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(order, field, value)

    try:
        db.commit()
        db.refresh(order)

        return order

    except Exception:
        db.rollback()
        raise


def delete_order(order_id: int, db: Session):
    order = db.query(Order).filter(Order.id == order_id).first()

    if order is None:
        return False

    try:
        db.delete(order)
        db.commit()

        return True

    except Exception:
        db.rollback()
        raise


def get_customer_orders(customer_id: int, db: Session):
    return db.query(Order).filter(Order.customer_id == customer_id).all()
