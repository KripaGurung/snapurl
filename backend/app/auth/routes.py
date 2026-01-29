from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer

from app.db import get_db
from app.models import User
from .utils import hash_password, verify_password
from .jwt import create_access_token, decode_access_token
from .schemas import SignupRequest, LoginRequest

router = APIRouter()


@router.post("/signup", status_code=201)
def signup(
    data: SignupRequest,
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "Signup successful"}


@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    access_token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }