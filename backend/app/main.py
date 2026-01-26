from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from .db import engine, get_db
from . import models
from .auth.routes import router as auth_router
from .shortener.routes import router as shortener_router
from app.message_qr.routes import router as message_qr_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SnapUrl API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(shortener_router)

app.include_router(message_qr_router)

@app.get("/")
def root():
    return {"message": "SnapUrl backend running"}

@app.get("/s/{short_code}")
def redirect_short_url(
    short_code: str,
    db: Session = Depends(get_db)
):
    url = db.query(models.ShortURL).filter(
        models.ShortURL.short_code == short_code,
        models.ShortURL.is_active.is_(True)
    ).first()

    if not url:
        raise HTTPException(status_code=404, detail="Short URL not found")

    return RedirectResponse(url.original_url)