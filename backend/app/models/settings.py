"""AppSettings — single-row table holding user-configurable application settings."""
from sqlalchemy import Column, Integer, String, Float

from app.database.base import Base


class AppSettings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, default=1)

    crop = Column(String, default="rice")
    temp_unit = Column(String, default="Celsius")
    rain_unit = Column(String, default="mm")

    humidity_threshold = Column(Float, default=78.0)
    soil_threshold = Column(Float, default=80.0)
    risk_threshold = Column(Float, default=70.0)

    notify_high_risk = Column(Integer, default=1)     # stored as 0/1 for SQLite compatibility
    notify_daily_report = Column(Integer, default=1)
    notify_sensor_offline = Column(Integer, default=0)
    notify_weekly_summary = Column(Integer, default=1)
