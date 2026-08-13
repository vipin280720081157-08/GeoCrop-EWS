"""
Weather API endpoints.
GET /api/weather — Returns current external weather, wind, pressure, cloud cover, and precipitation.
"""
from typing import Optional
from fastapi import APIRouter, Query
from app.schemas.weather import WeatherOut
from app.services.weather_service import get_current_weather

router = APIRouter(prefix="/api", tags=["Weather"])

@router.get("/weather", response_model=WeatherOut)
def get_weather(
    lat: Optional[float] = Query(default=None, ge=-90, le=90),
    lon: Optional[float] = Query(default=None, ge=-180, le=180),
):
    """
    Returns weather data fetched from OpenWeatherMap (or Open-Meteo fallback) with 15-minute caching.
    Uses ESP32 GPS coordinates if provided, or Perundurai, Erode District default location.
    """
    return get_current_weather(lat, lon)
