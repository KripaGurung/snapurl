from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import os
import uvicorn

from app.db import get_db, engine
from app import models

from app.auth.routes import router as auth_router
from app.shortener.routes import router as shortener_router
from app.message_qr.routes import router as message_qr_router

app = FastAPI(title="SnapUrl API")

models.Base.metadata.create_all(bind=engine)

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
def root():
    return {"status": "FastAPI backend running"}

@app.get("/s/{short_code}", include_in_schema=False)
def redirect_short_url(
    short_code: str,
    db: Session = Depends(get_db)
):
    url = (
        db.query(models.ShortURL)
        .filter(
            models.ShortURL.short_code == short_code,
            models.ShortURL.is_active.is_(True)
        )
        .first()
    )

    if not url:
        raise HTTPException(status_code=404, detail="Short URL not found")

    url.clicks += 1
    db.commit()

    return RedirectResponse(url.original_url, status_code=302)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=False
    )