from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .utils import generate_short_code
from .schemas import ShortURLCreate
from ..db import get_db
from ..models import ShortURL
from ..auth.deps import get_current_user

router = APIRouter(
    prefix="/urls",
    tags=["Shortener"]
)

@router.post("/")
def create_short_url(
    data: ShortURLCreate,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    short_code = generate_short_code()

    short_url = ShortURL(
        original_url=data.original_url,
        short_code=short_code,
        owner=user
    )

    db.add(short_url)
    db.commit()
    db.refresh(short_url)

    return {
        "original_url": data.original_url,
        "short_code": short_code,
        "short_url": f"http://127.0.0.1:8000/{short_code}"
    }