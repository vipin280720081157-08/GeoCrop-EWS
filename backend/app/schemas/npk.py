"""Pydantic schemas for Synthetic NPK demonstration endpoint."""
from typing import Optional
from pydantic import BaseModel, Field

class NPKOut(BaseModel):
    source: str = Field(default="synthetic", description="Explicit source badge indicator")
    is_real_sensor: bool = Field(default=False, description="Flag explicitly declaring no physical NPK sensor is connected")
    crop: str
    growth_stage: Optional[str] = None
    nitrogen: float = Field(..., description="Nitrogen (N) value in kg/ha")
    phosphorus: float = Field(..., description="Phosphorus (P) value in kg/ha")
    potassium: float = Field(..., description="Potassium (K) value in kg/ha")
    unit: str = Field(default="kg/ha")
    label: str = Field(default="NPK — Demonstration Values (Synthetic)")
    disclaimer: str = Field(default="Not measured by hardware — GeoCrop currently has no physical NPK sensor.")
