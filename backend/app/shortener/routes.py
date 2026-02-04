from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from io import BytesIO
from fastapi.responses import StreamingResponse
from datetime import datetime, timedelta
import os
import qrcode

from .utils import generate_short_code, generate_qr_token, qr_expiry
from .schemas import ShortURLCreate
from ..db import get_db
from ..models import ShortURL, QRToken, User
from ..auth.deps import get_current_user

router = APIRouter(
    prefix="/urls",
    tags=["Shortener"]
)

BASE_URL = os.getenv("BASE_URL")

if not BASE_URL:
    raise RuntimeError("BASE_URL environment variable is not set")

@router.post("/")
async def create_short_url(
    data: ShortURLCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    original_url = data.original_url.strip()

    if not original_url.startswith("http"):
        original_url = "https://" + original_url

    while True:
        short_code = generate_short_code()
        result = await db.execute(
            select(ShortURL).where(ShortURL.short_code == short_code)
        )
        exists = result.scalar_one_or_none()
        if not exists:
            break

    expires_at = datetime.utcnow() + timedelta(days=7)

    short_url = ShortURL(
        original_url=original_url,
        short_code=short_code,
        user_id=current_user.id,
        expires_at=expires_at
    )

    db.add(short_url)
    await db.commit()
    await db.refresh(short_url)

    return {
        "short_code": short_code,
        "short_url": f"{BASE_URL}/s/{short_code}",
        "expires_at": expires_at
    }

@router.get("/{short_code}/qr")
async def generate_qr(
    short_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(ShortURL).where(ShortURL.short_code == short_code)
    )
    short = result.scalar_one_or_none()

    if not short:
        raise HTTPException(status_code=404, detail="Short URL not found")

    if short.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Short URL expired")

    token = generate_qr_token()

    qr_entry = QRToken(
        token=token,
        short_url_id=short.id,
        owner_id=current_user.id,
        expires_at=qr_expiry()
    )

    db.add(qr_entry)
    await db.commit()

    qr_link = f"{BASE_URL}/q/{token}"

    img = qrcode.make(qr_link)
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/png")