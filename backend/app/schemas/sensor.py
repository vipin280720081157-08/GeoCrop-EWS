"""Pydantic schemas for sensor reading ingestion and retrieval."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SensorDataIn(BaseModel):
    """Payload posted by the ESP32 device every ~30 seconds."""
    device_id: str = Field(default="ESP32_01")
    crop: str = Field(default="Rice")
    growth_stage: Optional[str] = None
    temperature: float = Field(..., ge=-10, le=60, description="Degrees Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity %")
    soil_moisture: float = Field(..., ge=0, le=100, description="Soil moisture %")
    rainfall_7d: Optional[float] = Field(default=0.0, ge=0)
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class SensorReadingOut(BaseModel):
    id: int
    device_id: str
    crop: str
    growth_stage: Optional[str]
    temperature: float
    humidity: float
    soil_moisture: float
    rainfall_7d: Optional[float]
    latitude: Optional[float]
    longitude: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True
