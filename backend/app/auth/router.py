from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, Customer
from app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    TokenResponse,
)
from app.auth.security import hash_password, verify_password, create_access_token
from app.auth.dependencies import get_current_user


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=RegisterResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")

    existing_customer = db.query(Customer).filter(Customer.email == data.email).first()

    if existing_customer:
        raise HTTPException(
            status_code=400, detail="Customer with this email already exists."
        )

    customer = Customer(name=data.name, email=data.email)

    db.add(customer)
    db.flush()

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        customer_id=customer.id,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return RegisterResponse(id=user.id, email=user.email, customer_id=user.customer_id)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is inactive.")

    access_token = create_access_token(user_id=user.id)

    return TokenResponse(access_token=access_token, token_type="bearer")


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "customer_id": current_user.customer_id,
        "name": current_user.customer.name,
        "role": current_user.role,
    }
