from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime

from .db import engine, get_db
from . import models
from .auth.routes import router as auth_router
from .shortener.routes import router as shortener_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SnapUrl API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(shortener_router)


@app.get("/")
def root():
    return {"message": "SnapUrl backend is running successfully."}


@app.get("/{short_code}")
def redirect_short_url(
    short_code: str,
    db: Session = Depends(get_db)
):
    url = db.query(models.ShortURL).filter(
        models.ShortURL.short_code == short_code,
        models.ShortURL.is_active == True
    ).first()

    if not url:
        raise HTTPException(status_code=404, detail="Short URL not found")

    url.clicks += 1
    db.commit()

    return RedirectResponse(url.original_url)

@app.get("/q/{token}")
def scan_qr(token: str, db: Session = Depends(get_db)):
    qr = db.query(models.QRToken).filter(
        models.QRToken.token == token
    ).first()

    if not qr:
        raise HTTPException(status_code=404, detail="Invalid QR")

    if qr.expires_at < datetime.utcnow():
        return {"message": "QR expired"}

    short = db.query(models.ShortURL).filter(
        models.ShortURL.id == qr.short_url_id
    ).first()

    return RedirectResponse(short.original_url)