from fastapi import FastAPI
from .database import engine
from . import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SnapUrl API")

@app.get("/")
def root():
    return {"message": "SnapUrl backend is running successfully."}