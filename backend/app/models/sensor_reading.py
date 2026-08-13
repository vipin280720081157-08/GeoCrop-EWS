"""SensorReading — one row per reading received from the ESP32 field device."""
from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime

from app.database.base import Base


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True, nullable=False, default="ESP32_01")

    crop = Column(String, nullable=False, default="Rice")
    growth_stage = Column(String, nullable=True)

    temperature = Column(Float, nullable=False)   # °C
    humidity = Column(Float, nullable=False)       # %
    soil_moisture = Column(Float, nullable=False)  # %
    rainfall_7d = Column(Float, nullable=True, default=0.0)  # mm

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
