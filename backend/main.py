from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings

# Initialize FastAPI app
app = FastAPI(
    title="Silent Co-Driver API",
    description="F1 Telemetry and AI Backend",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes import telemetry, circuit, prediction

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Silent Co-Driver Backend is running"}

app.include_router(telemetry.router)
app.include_router(circuit.router)
app.include_router(prediction.router)
