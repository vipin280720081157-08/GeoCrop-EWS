"""Pydantic schemas for Weather API endpoints."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class WeatherOut(BaseModel):
    source: str = Field(default="weather_api", description="Source indicator, e.g. weather_api or fallback_api")
    provider: str = Field(default="Open-Meteo / OpenWeatherMap")
    location: str = Field(default="Perundurai, Erode District, Tamil Nadu")
    latitude: float
    longitude: float
    temperature: float = Field(..., description="Air temperature in °C")
    humidity: float = Field(..., description="Relative humidity %")
    weather_condition: str = Field(default="Clear")
    weather_description: str = Field(default="Clear sky")
    wind_speed: float = Field(default=0.0, description="Wind speed in m/s")
    pressure: float = Field(default=1013.25, description="Atmospheric pressure in hPa")
    cloud_coverage: float = Field(default=0.0, description="Cloud cover %")
    rainfall: float = Field(default=0.0, description="Current / recent 1h precipitation in mm")
    rainfall_7d: float = Field(default=4.8, description="Cumulative 7-day regional rainfall in mm")
    rainfall_unit: str = Field(default="mm")
    timestamp: str
