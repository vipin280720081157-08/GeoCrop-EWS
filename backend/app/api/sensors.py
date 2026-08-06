"""
Sensor endpoints.

POST /api/sensors/data   — ESP32 posts a new reading every ~30s.
GET  /api/sensors/latest — Most recent reading (Live Monitoring page).
GET  /api/sensors/history — Historical readings for charts / analytics.
"""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.sensor_reading import SensorReading
from app.schemas.sensor import SensorDataIn, SensorReadingOut
from app.utils.logger import get_logger

router = APIRouter(prefix="/api/sensors", tags=["Sensors"])
logger = get_logger(__name__)


@router.post("/data", response_model=SensorReadingOut, status_code=201)
def ingest_sensor_data(payload: SensorDataIn, db: Session = Depends(get_db)):
    """Receives a JSON reading from the ESP32 device and stores it."""
    reading = SensorReading(
        device_id=payload.device_id,
        crop=payload.crop,
        growth_stage=payload.growth_stage,
        temperature=payload.temperature,
        humidity=payload.humidity,
        soil_moisture=payload.soil_moisture,
        rainfall_7d=payload.rainfall_7d,
        latitude=payload.latitude,
        longitude=payload.longitude,
        created_at=datetime.utcnow(),
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    logger.info("Ingested sensor reading id=%s device=%s", reading.id, reading.device_id)
    return reading


@router.get("/latest", response_model=SensorReadingOut)
def get_latest_reading(db: Session = Depends(get_db)):
    reading = db.query(SensorReading).order_by(SensorReading.created_at.desc()).first()
    if not reading:
        raise HTTPException(status_code=404, detail="No sensor readings available yet.")
    return reading


@router.get("/history", response_model=list[SensorReadingOut])
def get_history(
    days: int = Query(default=30, ge=1, le=365),
    limit: int = Query(default=500, ge=1, le=5000),
    db: Session = Depends(get_db),
):
    since = datetime.utcnow() - timedelta(days=days)
    readings = (
        db.query(SensorReading)
        .filter(SensorReading.created_at >= since)
        .order_by(SensorReading.created_at.asc())
        .limit(limit)
        .all()
    )
    return readings
