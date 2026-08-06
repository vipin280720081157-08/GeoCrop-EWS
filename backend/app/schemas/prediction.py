"""Pydantic schemas for disease prediction requests and responses."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class PredictionRequest(BaseModel):
    crop: str
    temperature: float
    humidity: float
    soil_moisture: float
    rainfall_7d: float = 0.0
    growth_stage: Optional[str] = None


class ContributingFactor(BaseModel):
    factor: str
    importance: int
    detail: str


class Recommendation(BaseModel):
    text: str
    priority: str  # Low | Medium | High


class PredictionOut(BaseModel):
    id: Optional[int] = None
    crop: str
    disease: str
    risk_level: str
    risk_score: int
    confidence: float
    readiness_score: Optional[int] = None
    readiness_label: Optional[str] = None
    factors: List[ContributingFactor] = []
    recommendations: List[Recommendation] = []
    explanation: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
