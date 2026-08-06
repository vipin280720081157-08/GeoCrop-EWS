"""
GeoCrop EWS API — FastAPI application entry point.

Run locally:
    uvicorn app.main:app --reload

Docs available at /docs (Swagger) and /redoc once running.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database.base import init_db
from app.api import dashboard, sensors, predictions, reports, settings as settings_router, health

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="Backend API for the Geographic Crop Disease Early Warning and Decision Support System.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(dashboard.router)
app.include_router(sensors.router)
app.include_router(predictions.router)
app.include_router(reports.router)
app.include_router(settings_router.router)


@app.on_event("startup")
def on_startup():
    """
    Creates tables automatically on startup for local/dev convenience.
    In production, prefer running `alembic upgrade head` explicitly instead
    (see docs/DEPLOYMENT.md) and this call becomes a harmless no-op.
    """
    init_db()


@app.get("/")
def root():
    return {
        "message": "GeoCrop EWS API is running.",
        "docs": "/docs",
        "health": "/api/health",
    }
