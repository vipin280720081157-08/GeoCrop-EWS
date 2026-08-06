"""Pydantic schema for the aggregated dashboard summary endpoint."""
from typing import List, Optional

from pydantic import BaseModel

from app.schemas.sensor import SensorReadingOut
from app.schemas.prediction import PredictionOut


class AlertItem(BaseModel):
    level: str
    text: str
    time: str


class TrendPoint(BaseModel):
    date: str
    temperature: float
    humidity: float
    soil_moisture: float
    risk_score: int
    readiness: int


class DashboardOut(BaseModel):
    latest_sensor: Optional[SensorReadingOut]
    latest_prediction: Optional[PredictionOut]
    trend_7d: List[TrendPoint]
    alerts: List[AlertItem]
    device_connected: bool
