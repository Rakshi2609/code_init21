from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

from app.routes import predict, ocr, grievance, simplify, auth

app = FastAPI(title="SAMAAN ML Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="", tags=["predict"])
app.include_router(ocr.router, prefix="", tags=["ocr"])
app.include_router(grievance.router, prefix="", tags=["grievance"])
app.include_router(simplify.router, prefix="", tags=["simplify"])
app.include_router(auth.router, prefix="", tags=["auth"])


@app.on_event("startup")
async def startup_event():
    from app.db import USING_MONGO
    if USING_MONGO:
        print("[STARTUP] ✅  Storage: MongoDB Atlas")
    else:
        print("[STARTUP] ⚠️   Storage: local file fallback (no MongoDB)")

@app.get("/")
async def root():
    return {"service": "SAMAAN ML Backend", "status": "ok"}
