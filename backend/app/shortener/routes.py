from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from io import BytesIO
from fastapi.responses import StreamingResponse, RedirectResponse
import qrcode
from datetime import datetime

from .utils import generate_short_code, generate_qr_token, qr_expiry
from .schemas import ShortURLCreate
from ..db import get_db
from ..models import ShortURL, QRToken
from ..auth.deps import get_current_user

router = APIRouter(
    prefix="/urls",
    tags=["Shortener"]
)

@router.post("/")
def create_short_url(
    data: ShortURLCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    short_code = generate_short_code()

    short_url = ShortURL(
        original_url=data.original_url,
        short_code=short_code,
        user_id=user.id
    )

    db.add(short_url)
    db.commit()
    db.refresh(short_url)

    return {
        "short_code": short_code,
        "short_url": f"http://127.0.0.1:8000/{short_code}"
    }

@router.get("/{short_code}/qr")
def generate_qr(
    short_code: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    short = db.query(ShortURL).filter(
        ShortURL.short_code == short_code,
        ShortURL.user_id == user.id
    ).first()

    if not short:
        raise HTTPException(status_code=404, detail="Short URL not found")

    token = generate_qr_token()

    qr_entry = QRToken(
        token=token,
        short_url_id=short.id,
        owner_id=user.id,
        expires_at=qr_expiry()
    )

    db.add(qr_entry)
    db.commit()

    qr_link = f"http://127.0.0.1:8000/q/{token}"

    img = qrcode.make(qr_link)
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return StreamingResponse(buf, media_type="image/png")

@router.get("/q/{token}")
def scan_qr(
    token: str,
    db: Session = Depends(get_db)
):
    qr = db.query(QRToken).filter(
        QRToken.token == token,
        QRToken.expires_at > datetime.utcnow()
    ).first()

    if not qr:
        raise HTTPException(status_code=404, detail="QR expired or invalid")

    return RedirectResponse(url=qr.short_url.original_url)