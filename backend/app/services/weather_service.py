"""
Weather service with 15-minute response caching.
Fetches real external weather using OpenWeatherMap (if API key is present in .env)
or Open-Meteo (public meteorological API zero-key fallback).
"""
import json
import time
import urllib.request
from datetime import datetime, timezone
from app.config import get_settings
from app.utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)

# 15-minute in-memory cache
_weather_cache: dict[str, tuple[float, dict]] = {}

DEFAULT_LAT = 11.2742  # Perundurai, Erode District, TN
DEFAULT_LON = 77.5828
DEFAULT_LOCATION_NAME = "Perundurai, Erode District, TN"

WEATHER_CODES = {
    0: ("Clear", "Clear sky"),
    1: ("Mainly Clear", "Mainly clear sky"),
    2: ("Partly Cloudy", "Partly cloudy"),
    3: ("Overcast", "Overcast sky"),
    45: ("Foggy", "Fog and depositing rime fog"),
    48: ("Foggy", "Depositing rime fog"),
    51: ("Drizzle", "Light drizzle"),
    53: ("Drizzle", "Moderate drizzle"),
    55: ("Drizzle", "Dense drizzle"),
    61: ("Rain", "Slight rain"),
    63: ("Rain", "Moderate rain"),
    65: ("Rain", "Heavy rain"),
    80: ("Rain Showers", "Slight rain showers"),
    81: ("Rain Showers", "Moderate rain showers"),
    95: ("Thunderstorm", "Thunderstorm"),
}

def _fetch_open_meteo(lat: float, lon: float) -> dict:
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&"
        f"current=temperature_2m,relative_humidity_2m,weather_code,surface_pressure,wind_speed_10m,precipitation,cloud_cover&"
        f"daily=precipitation_sum&timezone=auto"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "GeoCropEWS/1.0"})
    with urllib.request.urlopen(req, timeout=6) as res:
        data = json.loads(res.read().decode("utf-8"))
    
    current = data.get("current", {})
    daily = data.get("daily", {})
    code = current.get("weather_code", 0)
    cond, desc = WEATHER_CODES.get(code, ("Clear", "Clear sky"))
    
    precip_7d = sum(daily.get("precipitation_sum", [])[:7]) if daily.get("precipitation_sum") else 4.8

    return {
        "source": "weather_api",
        "provider": "Open-Meteo (Public Agrometeorological API)",
        "location": DEFAULT_LOCATION_NAME if abs(lat - DEFAULT_LAT) < 0.1 else f"{lat:.4f}°N, {lon:.4f}°E",
        "latitude": lat,
        "longitude": lon,
        "temperature": round(current.get("temperature_2m", 28.5), 1),
        "humidity": round(current.get("relative_humidity_2m", 76.0), 1),
        "weather_condition": cond,
        "weather_description": desc,
        "wind_speed": round(current.get("wind_speed_10m", 3.2), 1),
        "pressure": round(current.get("surface_pressure", 1011.5), 1),
        "cloud_coverage": round(current.get("cloud_cover", 20.0), 1),
        "rainfall": round(current.get("precipitation", 0.0), 1),
        "rainfall_7d": round(precip_7d, 1),
        "rainfall_unit": "mm",
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
    }

def _fetch_openweathermap(lat: float, lon: float, api_key: str) -> dict:
    url = f"{settings.weather_api_base_url}/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    req = urllib.request.Request(url, headers={"User-Agent": "GeoCropEWS/1.0"})
    with urllib.request.urlopen(req, timeout=6) as res:
        data = json.loads(res.read().decode("utf-8"))
    
    main = data.get("main", {})
    weather_list = data.get("weather", [{}])
    wind = data.get("wind", {})
    clouds = data.get("clouds", {})
    rain = data.get("rain", {})
    
    rain_1h = rain.get("1h", 0.0)

    return {
        "source": "weather_api",
        "provider": "OpenWeatherMap API",
        "location": data.get("name") or DEFAULT_LOCATION_NAME,
        "latitude": lat,
        "longitude": lon,
        "temperature": round(main.get("temp", 28.5), 1),
        "humidity": round(main.get("humidity", 76.0), 1),
        "weather_condition": weather_list[0].get("main", "Clear"),
        "weather_description": weather_list[0].get("description", "clear sky").title(),
        "wind_speed": round(wind.get("speed", 3.2), 1),
        "pressure": round(main.get("pressure", 1011.5), 1),
        "cloud_coverage": round(clouds.get("all", 20.0), 1),
        "rainfall": round(rain_1h, 1),
        "rainfall_7d": 4.8,
        "rainfall_unit": "mm",
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
    }

def get_current_weather(lat: float | None = None, lon: float | None = None) -> dict:
    latitude = lat if (lat is not None and abs(lat) > 0.001) else DEFAULT_LAT
    longitude = lon if (lon is not None and abs(lon) > 0.001) else DEFAULT_LON

    cache_key = f"{round(latitude, 2)},{round(longitude, 2)}"
    now_ts = time.time()
    ttl_seconds = settings.weather_cache_minutes * 60

    if cache_key in _weather_cache:
        cached_ts, cached_data = _weather_cache[cache_key]
        if now_ts - cached_ts < ttl_seconds:
            return cached_data

    # Try OpenWeatherMap first if key exists
    if settings.weather_api_key.strip():
        try:
            data = _fetch_openweathermap(latitude, longitude, settings.weather_api_key.strip())
            _weather_cache[cache_key] = (now_ts, data)
            return data
        except Exception as e:
            logger.warning("OpenWeatherMap fetch failed, falling back to Open-Meteo: %s", e)

    # Fallback to Open-Meteo (public zero-key weather service)
    try:
        data = _fetch_open_meteo(latitude, longitude)
        _weather_cache[cache_key] = (now_ts, data)
        return data
    except Exception as e:
        logger.error("Open-Meteo weather fetch failed: %s", e)

    # Safe fallback if network/API is completely offline
    fallback_data = {
        "source": "weather_api",
        "provider": "Regional Weather Fallback",
        "location": DEFAULT_LOCATION_NAME,
        "latitude": latitude,
        "longitude": longitude,
        "temperature": 28.5,
        "humidity": 75.0,
        "weather_condition": "Partly Cloudy",
        "weather_description": "Partly cloudy (Offline fallback)",
        "wind_speed": 3.2,
        "pressure": 1012.0,
        "cloud_coverage": 25.0,
        "rainfall": 0.0,
        "rainfall_7d": 4.8,
        "rainfall_unit": "mm",
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
    }
    return fallback_data
