from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime

from ..db import SessionLocal
from ..models import ShortURL

router = APIRouter(prefix="", tags=["Redirect"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/{short_code}")
def redirect_short_url(short_code: str, db: Session = Depends(get_db)):
    short_url = db.query(ShortURL).filter(
        ShortURL.short_code == short_code,
        ShortURL.is_active == True
    ).first()

    if not short_url:
        raise HTTPException(status_code=404, detail="Short URL not found")

    if short_url.expires_at and short_url.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Short URL expired")

    short_url.clicks += 1
    db.commit()

    return RedirectResponse(url=short_url.original_url)