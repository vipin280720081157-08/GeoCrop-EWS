"""
Prediction endpoints.

POST /api/predict            -- Runs the ML model + decision support engine
                                against either supplied conditions or the
                                latest stored sensor reading.
GET  /api/predictions/latest -- Most recent stored prediction.
"""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.sensor_reading import SensorReading
from app.models.prediction import Prediction
from app.schemas.prediction import PredictionRequest, PredictionOut
from app.ml.predict import predict
from app.services.decision_support import build_recommendations
from app.utils.logger import get_logger

router = APIRouter(prefix="/api", tags=["Predictions"])
logger = get_logger(__name__)


def _fetch_recent_readings(db: Session, device_id: str, before: datetime) -> list[dict]:
    """Fetches the last 24h of sensor readings for a device (excluding the
    reading being predicted from, if any) -- used by predict() to compute
    the trained models' 24h rolling-average features honestly from real
    stored history, not a fabricated average."""
    since = before - timedelta(hours=24)
    rows = (
        db.query(SensorReading)
        .filter(SensorReading.device_id == device_id)
        .filter(SensorReading.created_at >= since)
        .filter(SensorReading.created_at < before)
        .order_by(SensorReading.created_at.asc())
        .all()
    )
    return [{"temperature": r.temperature, "humidity": r.humidity, "soil_moisture": r.soil_moisture} for r in rows]


@router.post("/predict", response_model=PredictionOut)
def run_prediction(payload: PredictionRequest | None = None, db: Session = Depends(get_db)):
    """
    Runs a fresh prediction.
    If a body is supplied, uses those conditions directly (useful for the
    Disease Prediction page's "what-if" style interactions) -- in that case
    24h averages default to the supplied instantaneous values alone, since
    there's no real device history for a hypothetical what-if reading.
    Otherwise uses the most recent stored sensor reading plus its real 24h
    history from the database.
    """
    if payload is not None:
        sensor_dict = payload.model_dump()
        sensor_dict["timestamp"] = datetime.now(timezone.utc)
        sensor_dict["recent_readings"] = []
    else:
        latest = db.query(SensorReading).order_by(SensorReading.created_at.desc()).first()
        if not latest:
            raise HTTPException(status_code=404, detail="No sensor data available to predict from.")
        sensor_dict = {
            "crop": latest.crop,
            "temperature": latest.temperature,
            "humidity": latest.humidity,
            "soil_moisture": latest.soil_moisture,
            "rainfall_7d": latest.rainfall_7d or 0.0,
            "growth_stage": latest.growth_stage,
            "timestamp": latest.created_at,
            "recent_readings": _fetch_recent_readings(db, latest.device_id, latest.created_at),
            "latitude": latest.latitude,
            "longitude": latest.longitude,
        }

    result = predict(sensor_dict)
    recommendations = build_recommendations(result, sensor_dict, sensor_dict["crop"])
    result["recommendations"] = recommendations

    prediction = Prediction(
        crop=result["crop"],
        disease=result["disease"],
        risk_level=result["risk_level"],
        risk_score=result["risk_score"],
        confidence=result["confidence"],
        readiness_score=result.get("readiness_score"),
        readiness_label=result.get("readiness_label"),
        factors=result.get("factors"),
        recommendations=recommendations,
        explanation=result.get("explanation"),
        source=result.get("source"),
        model_version=result.get("model_version"),
        created_at=datetime.utcnow(),
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    logger.info("Prediction id=%s disease=%s risk=%s source=%s", prediction.id, prediction.disease, prediction.risk_level, prediction.source)

    return PredictionOut(
        id=prediction.id,
        crop=prediction.crop,
        disease=prediction.disease,
        risk_level=prediction.risk_level,
        risk_score=prediction.risk_score,
        confidence=prediction.confidence,
        readiness_score=prediction.readiness_score,
        readiness_label=prediction.readiness_label,
        factors=prediction.factors or [],
        recommendations=prediction.recommendations or [],
        explanation=prediction.explanation,
        source=prediction.source,
        model_version=prediction.model_version,
        created_at=prediction.created_at,
    )


@router.get("/predictions/latest", response_model=PredictionOut)
def get_latest_prediction(db: Session = Depends(get_db)):
    prediction = db.query(Prediction).order_by(Prediction.created_at.desc()).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="No predictions available yet.")
    return PredictionOut(
        id=prediction.id,
        crop=prediction.crop,
        disease=prediction.disease,
        risk_level=prediction.risk_level,
        risk_score=prediction.risk_score,
        confidence=prediction.confidence,
        readiness_score=prediction.readiness_score,
        readiness_label=prediction.readiness_label,
        factors=prediction.factors or [],
        recommendations=prediction.recommendations or [],
        explanation=prediction.explanation,
        source=prediction.source,
        model_version=prediction.model_version,
        created_at=prediction.created_at,
    )


@router.get("/predictions/history", response_model=list[PredictionOut])
def get_prediction_history(limit: int = 50, db: Session = Depends(get_db)):
    """Extra convenience endpoint (beyond the minimum spec) powering the
    Historical Analytics page's Prediction History table."""
    predictions = db.query(Prediction).order_by(Prediction.created_at.desc()).limit(limit).all()
    return [
        PredictionOut(
            id=p.id, crop=p.crop, disease=p.disease, risk_level=p.risk_level,
            risk_score=p.risk_score, confidence=p.confidence,
            readiness_score=p.readiness_score, readiness_label=p.readiness_label,
            factors=p.factors or [], recommendations=p.recommendations or [],
            explanation=p.explanation, source=p.source, model_version=p.model_version,
            created_at=p.created_at,
        )
        for p in predictions
    ]
