"""GET /api/dashboard — single aggregated payload for the Dashboard page."""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.sensor_reading import SensorReading
from app.models.prediction import Prediction
from app.schemas.dashboard import DashboardOut
from app.services.dashboard_service import get_trend_7d, build_alerts

router = APIRouter(prefix="/api", tags=["Dashboard"])


@router.get("/dashboard", response_model=DashboardOut)
def get_dashboard(db: Session = Depends(get_db)):
    latest_sensor = db.query(SensorReading).order_by(SensorReading.created_at.desc()).first()
    latest_prediction = db.query(Prediction).order_by(Prediction.created_at.desc()).first()

    device_connected = False
    if latest_sensor:
        device_connected = (datetime.utcnow() - latest_sensor.created_at) < timedelta(minutes=5)

    return DashboardOut(
        latest_sensor=latest_sensor,
        latest_prediction=latest_prediction,
        trend_7d=get_trend_7d(db),
        alerts=build_alerts(latest_prediction),
        device_connected=device_connected,
    )
