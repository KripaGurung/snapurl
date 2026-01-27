from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from ..db import Base

class MessageQR(Base):
    __tablename__ = "message_qr"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(20), unique=True, index=True, nullable=False)
    content = Column(Text, nullable=False)
    type = Column(String(20), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False) 