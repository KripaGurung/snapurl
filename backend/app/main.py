print("RUNNING backend/app/main.py")

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
import os
import uvicorn

from app.db import get_db, engine
from app import models

from app.auth.routes import router as auth_router
from app.shortener.routes import router as shortener_router
from app.message_qr.routes import router as message_qr_router

app = FastAPI(title="SnapUrl API")


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(shortener_router, prefix="/api/shortener", tags=["Shortener"])
app.include_router(message_qr_router, prefix="/api/message-qr", tags=["Message QR"])


@app.get("/")
async def root():
    return {"status": "FastAPI backend running"}

@app.get("/s/{short_code}", include_in_schema=False)
async def redirect_short_url(
    short_code: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(models.ShortURL).where(
            models.ShortURL.short_code == short_code,
            models.ShortURL.is_active.is_(True)
        )
    )
    url = result.scalar_one_or_none()

    if not url:
        raise HTTPException(status_code=404, detail="Short URL not found")

    if url.expires_at and url.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Short URL expired")

    url.clicks += 1
    await db.commit()

    return RedirectResponse(url.original_url, status_code=302)

@app.get("/q/{token}", include_in_schema=False)
async def redirect_qr_token(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(
            models.ShortURL.original_url,
            models.QRToken.expires_at
        )
        .join(
            models.QRToken,
            models.QRToken.short_url_id == models.ShortURL.id
        )
        .where(models.QRToken.token == token)
    )

    row = result.first()

    if not row:
        raise HTTPException(status_code=404, detail="Invalid QR code")

    original_url, expires_at = row

    if expires_at and expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="QR code expired")

    return RedirectResponse(original_url, status_code=302)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )