from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from ..db import SessionLocal
from ..models import ShortURL
from ..auth.deps import get_current_user
from .utils import generate_short_code

router = APIRouter(prefix="/urls", tags=["Short URLs"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_short_url(
    original_url: str,
    expires_at: Optional[datetime] = None,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    
    while True:
        short_code = generate_short_code()
        exists = db.query(ShortURL).filter(
            ShortURL.short_code == short_code
        ).first()
        if not exists:
            break

    short_url = ShortURL(
        original_url=original_url,
        short_code=short_code,
        expires_at=expires_at,
        owner=user
    )
    db.add(short_url)
    db.commit()
    db.refresh(short_url)

    return {
        "original_url": original_url,
        "short_code": short_code,
        "short_url": f"http://localhost:8000/{short_code}"
    }