from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title="FinTrack API",
    description="Personal Expense Tracker REST API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for Next.js Frontend (Vercel & Localhost)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://fintrack-omega-plum.vercel.app",
]
if hasattr(settings, "CORS_ORIGINS") and settings.CORS_ORIGINS:
    for o in settings.CORS_ORIGINS:
        if o not in origins:
            origins.append(o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API v1 router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to FinTrack API v1", "docs": "/docs"}
