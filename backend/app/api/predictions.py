"""
Prediction endpoints.

POST /api/predict            — Runs the ML model + decision support engine
                                against either supplied conditions or the
                                latest stored sensor reading.
GET  /api/predictions/latest — Most recent stored prediction.
"""
from datetime import datetime

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


@router.post("/predict", response_model=PredictionOut)
def run_prediction(payload: PredictionRequest | None = None, db: Session = Depends(get_db)):
    """
    Runs a fresh prediction.
    If a body is supplied, uses those conditions directly (useful for the
    Disease Prediction page's "what-if" style interactions). Otherwise uses
    the most recent stored sensor reading.
    """
    if payload is not None:
        sensor_dict = payload.model_dump()
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
        created_at=datetime.utcnow(),
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    logger.info("Prediction id=%s disease=%s risk=%s", prediction.id, prediction.disease, prediction.risk_level)

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
            explanation=p.explanation, created_at=p.created_at,
        )
        for p in predictions
    ]
