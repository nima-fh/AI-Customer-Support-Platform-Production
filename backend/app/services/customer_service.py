from sqlalchemy.orm import Session
from ..db.models import Customer


def get_customer(customer_id: int, db: Session):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()

    return customer


def get_customers(db: Session):
    return db.query(Customer).order_by(Customer.id.desc()).all()