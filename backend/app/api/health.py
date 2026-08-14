"""Health check endpoint — used by Render and the frontend connection indicator."""
from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/api/health")
def health_check():
    return {"status": "ok", "service": "GeoCrop EWS API"}


@router.get("/api/ml/health")
def ml_health_check():
    from app.ml.predict import _load_artifacts
    artifacts = _load_artifacts()
    status = {}
    for key, val in artifacts.items():
        status[key] = "loaded" if val is not None else "unavailable"
    all_loaded = all(v == "loaded" for v in status.values())
    return {
        "status": "healthy" if all_loaded else "degraded",
        "artifacts": status,
        "mode": "trained_model" if all_loaded else "rule_based_fallback",
    }

