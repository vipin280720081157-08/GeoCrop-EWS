"""
Synthetic NPK endpoint.
GET /api/npk — Returns crop/stage aware demonstration NPK values.
"""
from typing import Optional
from fastapi import APIRouter, Query
from app.schemas.npk import NPKOut
from app.services.npk_service import get_synthetic_npk

router = APIRouter(prefix="/api", tags=["Soil Nutrients"])

@router.get("/npk", response_model=NPKOut)
def get_npk(
    crop: str = Query(default="turmeric"),
    growth_stage: Optional[str] = Query(default=None),
):
    """
    Returns synthetic demonstration NPK soil nutrient values for the specified crop & growth stage.
    EXPLICIT: This data is synthetic demonstration data because GeoCrop has no physical NPK sensor.
    """
    return get_synthetic_npk(crop, growth_stage)
