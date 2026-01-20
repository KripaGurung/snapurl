from fastapi import FastAPI
from .db import engine
from . import models
from .auth.routes import router as auth_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SnapUrl API")

app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "SnapUrl backend is running successfully."}
