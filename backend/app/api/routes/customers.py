from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...services.customer_service import get_customer, get_customers
from ...db.database import get_db
from ...db.models import User
from ...schemas.customer import (
    CustomerResponse,
    CustomerListResponse,
    CustomerDetailResponse,
)
from ...auth.dependencies import get_current_user
from ...auth.agent_dependencies import get_current_agent


router = APIRouter()


@router.get("/customers/me", response_model=CustomerResponse)
def get_my_customer(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    customer = get_customer(current_user.customer_id, db)

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    return customer


@router.get("/customers", response_model=list[CustomerListResponse])
def get_all_customers(
    current_agent: User = Depends(get_current_agent),
    db: Session = Depends(get_db),
):
    return get_customers(db)


@router.get(
    "/customers/{customer_id}",
    response_model=CustomerDetailResponse,
)
def get_customer_details(
    customer_id: int,
    current_agent: User = Depends(get_current_agent),
    db: Session = Depends(get_db),
):
    customer = get_customer(customer_id, db)

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    return customer
