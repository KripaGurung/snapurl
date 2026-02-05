from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
import os

import qrcode
from io import BytesIO
from fastapi.responses import StreamingResponse

from .models import MessageQR
from .schemas import MessageQRCreate, MessageQRResponse
from .utils import generate_message_token
from ..db import get_db
from ..auth.deps import get_current_user
from ..models import User

router = APIRouter(
    prefix="/messages",
    tags=["Message QR"]
)

BASE_URL = os.getenv("BASE_URL")

if not BASE_URL:
    raise RuntimeError("BASE_URL environment variable is not set")

@router.post("", response_model=MessageQRResponse)
async def create_message_qr(
    data: MessageQRCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    while True:
        token = generate_message_token()
        result = await db.execute(
            select(MessageQR).where(MessageQR.token == token)
        )
        exists = result.scalar_one_or_none()
        if not exists:
            break

    expires_at = datetime.utcnow() + timedelta(days=7)

    msg = MessageQR(
        token=token,
        content=data.content,
        type=data.type,
        owner_id=current_user.id,
        expires_at=expires_at
    )

    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    return {
        "token": token,
        "qr_url": f"{BASE_URL}/m/{token}"
    }

@router.get("/m/{token}")
async def view_message(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(MessageQR).where(MessageQR.token == token)
    )
    msg = result.scalar_one_or_none()

    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    if msg.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="QR expired")

    return {
        "type": msg.type,
        "content": msg.content,
        "created_at": msg.created_at
    }

@router.get("/{token}/qr")
async def get_message_qr_image(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(MessageQR).where(MessageQR.token == token)
    )
    msg = result.scalar_one_or_none()

    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    if msg.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="QR expired")

    qr_url = f"{BASE_URL}/m/{token}"

    qr = qrcode.make(qr_url)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="image/png")