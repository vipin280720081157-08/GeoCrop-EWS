"""Prediction — stores the output of the ML model + decision support engine."""
from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey

from app.database.base import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    sensor_reading_id = Column(Integer, ForeignKey("sensor_readings.id"), nullable=True)

    crop = Column(String, nullable=False)
    disease = Column(String, nullable=False)
    risk_level = Column(String, nullable=False)      # Low / Medium / High
    risk_score = Column(Integer, nullable=False)      # 0-100
    confidence = Column(Float, nullable=False)         # 0-100

    readiness_score = Column(Integer, nullable=True)
    readiness_label = Column(String, nullable=True)

    factors = Column(JSON, nullable=True)          # list of {factor, importance, detail}
    recommendations = Column(JSON, nullable=True)   # list of {text, priority}
    explanation = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
