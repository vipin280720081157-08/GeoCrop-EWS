"""Health check endpoint — used by Render and the frontend connection indicator."""
from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/api/health")
def health_check():
    return {"status": "ok", "service": "GeoCrop EWS API"}
