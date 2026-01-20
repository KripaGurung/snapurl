from fastapi import FastAPI

app = FastAPI(title="SnapUrl API")

@app.get("/")
def root():
    return {"message": "SnapUrl backend is running successfully."}