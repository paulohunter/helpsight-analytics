from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import upload

app = FastAPI(title="HelpSight Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to HelpSight Analytics API"}
