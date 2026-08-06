"""GET/PUT /api/settings — single-row application settings."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.settings import AppSettings
from app.schemas.settings import SettingsOut, SettingsUpdate

router = APIRouter(prefix="/api/settings", tags=["Settings"])


def _get_or_create(db: Session) -> AppSettings:
    settings = db.query(AppSettings).first()
    if not settings:
        settings = AppSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def _to_out(s: AppSettings) -> SettingsOut:
    return SettingsOut(
        crop=s.crop, temp_unit=s.temp_unit, rain_unit=s.rain_unit,
        humidity_threshold=s.humidity_threshold, soil_threshold=s.soil_threshold,
        risk_threshold=s.risk_threshold,
        notify_high_risk=bool(s.notify_high_risk),
        notify_daily_report=bool(s.notify_daily_report),
        notify_sensor_offline=bool(s.notify_sensor_offline),
        notify_weekly_summary=bool(s.notify_weekly_summary),
    )


@router.get("", response_model=SettingsOut)
def get_settings_endpoint(db: Session = Depends(get_db)):
    return _to_out(_get_or_create(db))


@router.put("", response_model=SettingsOut)
def update_settings_endpoint(payload: SettingsUpdate, db: Session = Depends(get_db)):
    settings = _get_or_create(db)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if key.startswith("notify_") and value is not None:
            value = int(value)
        setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return _to_out(settings)
