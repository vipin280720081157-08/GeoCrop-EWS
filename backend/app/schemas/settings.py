"""Pydantic schemas for reading and updating application settings."""
from pydantic import BaseModel


class SettingsOut(BaseModel):
    crop: str
    temp_unit: str
    rain_unit: str
    humidity_threshold: float
    soil_threshold: float
    risk_threshold: float
    notify_high_risk: bool
    notify_daily_report: bool
    notify_sensor_offline: bool
    notify_weekly_summary: bool

    class Config:
        from_attributes = True


class SettingsUpdate(BaseModel):
    crop: str | None = None
    temp_unit: str | None = None
    rain_unit: str | None = None
    humidity_threshold: float | None = None
    soil_threshold: float | None = None
    risk_threshold: float | None = None
    notify_high_risk: bool | None = None
    notify_daily_report: bool | None = None
    notify_sensor_offline: bool | None = None
    notify_weekly_summary: bool | None = None
