from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from .models import MessageQR
from .schemas import MessageQRCreate, MessageQRResponse
from .utils import generate_message_token
from ..db import get_db
from ..auth.deps import get_current_user
from ..models import User

router = APIRouter(prefix="/messages", tags=["Message QR"])

BASE_URL = "http://127.0.0.1:8000" 


@router.post("/", response_model=MessageQRResponse)
def create_message_qr(
    data: MessageQRCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    token = generate_message_token()

    msg = MessageQR(
        token=token,
        content=data.content,
        type=data.type,
        owner_id=current_user.id
    )

    db.add(msg)
    db.commit()

    return {
        "token": token,
        "qr_url": f"{BASE_URL}/m/{token}"
    }


@router.get("/m/{token}")
def view_message(token: str, db: Session = Depends(get_db)):
    msg = db.query(MessageQR).filter(MessageQR.token == token).first()

    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    return {
        "type": msg.type,
        "content": msg.content,
        "created_at": msg.created_at
    }