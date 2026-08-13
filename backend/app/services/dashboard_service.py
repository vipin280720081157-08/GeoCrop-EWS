"""Aggregates sensor + prediction data into the single dashboard payload."""
from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.sensor_reading import SensorReading
from app.models.prediction import Prediction


def get_trend_7d(db: Session) -> list[dict]:
    """Returns one aggregated point per day for the last 7 days."""
    since = datetime.utcnow() - timedelta(days=7)
    readings = (
        db.query(SensorReading)
        .filter(SensorReading.created_at >= since)
        .order_by(SensorReading.created_at.asc())
        .all()
    )
    predictions = (
        db.query(Prediction)
        .filter(Prediction.created_at >= since)
        .order_by(Prediction.created_at.asc())
        .all()
    )

    by_day: dict[str, dict] = {}
    for r in readings:
        key = r.created_at.strftime("%Y-%m-%d")
        by_day.setdefault(key, {"temps": [], "hums": [], "soils": []})
        by_day[key]["temps"].append(r.temperature)
        by_day[key]["hums"].append(r.humidity)
        by_day[key]["soils"].append(r.soil_moisture)

    risk_by_day: dict[str, list[int]] = {}
    for p in predictions:
        key = p.created_at.strftime("%Y-%m-%d")
        risk_by_day.setdefault(key, []).append(p.risk_score)

    trend = []
    for key in sorted(by_day.keys()):
        vals = by_day[key]
        risks = risk_by_day.get(key, [0])
        avg_risk = round(sum(risks) / len(risks))
        trend.append({
            "date": datetime.strptime(key, "%Y-%m-%d").strftime("%b %-d") if False else datetime.strptime(key, "%Y-%m-%d").strftime("%b %d"),
            "temperature": round(sum(vals["temps"]) / len(vals["temps"]), 1) if vals["temps"] else 0,
            "humidity": round(sum(vals["hums"]) / len(vals["hums"]), 1) if vals["hums"] else 0,
            "soil_moisture": round(sum(vals["soils"]) / len(vals["soils"]), 1) if vals["soils"] else 0,
            "risk_score": avg_risk,
            "readiness": round(max(0, 100 - avg_risk * 0.6)),
        })
    return trend[-7:]


def build_alerts(latest_prediction: Prediction | None) -> list[dict]:
    alerts = []
    if latest_prediction:
        alerts.append({
            "level": latest_prediction.risk_level,
            "text": f"{latest_prediction.disease} risk updated to {latest_prediction.risk_level}",
            "time": "Just now",
        })
    return alerts
