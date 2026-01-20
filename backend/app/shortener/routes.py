from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

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
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    short_code = generate_short_code()

    short_url = ShortURL(
        original_url=original_url,
        short_code=short_code,
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