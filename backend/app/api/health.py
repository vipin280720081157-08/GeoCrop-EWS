"""Health check endpoint — used by Render and the frontend connection indicator."""
from fastapi import APIRouter

from app.ml.predict import get_model_status_per_crop

router = APIRouter(tags=["Health"])


@router.get("/api/health")
def health_check():
    models_status = get_model_status_per_crop()
    model_available = any(models_status.values())
    return {
        "status": "ok",
        "service": "GeoCrop API",
        "model_available": model_available,
        "models_status": models_status,
    }
