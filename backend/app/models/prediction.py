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

    # Added when real trained models were wired in (see GeoCrop-Model-
    # Training-Report.md): lets every stored prediction honestly record
    # whether it came from a real model or the rule-based fallback, and
    # which model version -- critical for both UI honesty (v1 spec's
    # "Model-based prediction" vs "Baseline estimate" badge) and research
    # reproducibility (a prediction's provenance never changes after the
    # fact even if the model is later retrained).
    source = Column(String, nullable=True)          # "trained_model" | "rule_based_fallback"
    model_version = Column(String, nullable=True)   # e.g. "geocrop_v1", null for rule-based

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
