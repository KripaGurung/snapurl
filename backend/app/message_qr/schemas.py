from pydantic import BaseModel
from typing import Literal

class MessageQRCreate(BaseModel):
    type: Literal["plain", "note", "alert"]
    content: str

class MessageQRResponse(BaseModel):
    token: str
    qr_url: str