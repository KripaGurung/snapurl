from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ShortURLCreate(BaseModel):
    original_url: str
    expires_at: Optional[datetime] = None