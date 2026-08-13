"""
Disease + risk prediction module.

`predict(...)` is the single entry point used by the rest of the backend.
As of this version, it wires in TWO separately trained, calibrated models
(see GeoCrop-Model-Training-Report.md for the full training methodology):

  1. risk_model.pkl    -> predicts risk_level directly (LOW/MEDIUM/HIGH/CRITICAL)
  2. disease_model.pkl  -> predicts disease_id (33 diseases + "none")

Both were trained as ONE UNIFIED MODEL ACROSS ALL 8 CROPS (crop_id is an
input feature, not 8 separate per-crop models -- an explicit, documented
architecture choice, see the training report).

Falls back to the original rule-based heuristic (unchanged logic) whenever:
  - the trained artifacts aren't present (fresh clone before training), OR
  - the incoming crop/growth_stage can't be mapped onto the trained models'
    known vocabulary (e.g. a stage name that doesn't match the locked
    ontology) -- this is deliberate graceful degradation, not a bug guard
    to silence.

To go live with real models: drop the six files from GeoCrop_Model_Training
.ipynb's Drive output (risk_model.pkl, risk_label_encoder.pkl,
disease_model.pkl, disease_label_encoder.pkl, feature_encoders.pkl,
model_metadata.json) into backend/model/. No other backend code needs to
change -- predict() will automatically prefer the trained models.
"""
from __future__ import annotations

import os
import random
from datetime import datetime, timezone
from functools import lru_cache
from typing import Optional

import joblib

from app.config import get_settings
from app.ml.feature_engineering import (
    CROP_PROFILES,
    contributing_factors,
    clamp,
)
from app.ml.feature_builder import build_feature_row

settings = get_settings()

ARTIFACT_FILES = {
    "risk_model": "risk_model.pkl",
    "risk_encoder": "risk_label_encoder.pkl",
    "disease_model": "disease_model.pkl",
    "disease_encoder": "disease_label_encoder.pkl",
    "cat_encoders": "feature_encoders.pkl",
}

# Probability-weighted midpoints for converting the risk model's class
# probabilities into a continuous 0-100 score for the UI's progress-bar
# display. These match the locked risk-level thresholds' midpoints from
# the dataset-generation spec exactly, so a risk_score shown here stays
# consistent with what the training data's own thresholds meant.
RISK_LEVEL_MIDPOINTS = {"LOW": 17.5, "MEDIUM": 47.5, "HIGH": 70.0, "CRITICAL": 90.0}


@lru_cache
def _load_artifacts():
    """Loads all five trained-model artifacts once and caches them. Returns
    a dict of Nones (every key) if any file is missing or fails to load --
    predict() checks for this and falls back to the rule-based path rather
    than partially trusting an incomplete artifact set."""
    paths = {k: os.path.join(settings.model_dir, v) for k, v in ARTIFACT_FILES.items()}
    if not all(os.path.exists(p) for p in paths.values()):
        return {k: None for k in ARTIFACT_FILES}
    try:
        return {k: joblib.load(p) for k, p in paths.items()}
    except Exception:
        # Corrupt or incompatible artifact -- fall back safely rather than crash.
        return {k: None for k in ARTIFACT_FILES}


def _risk_level_from_score(score: int) -> str:
    """Only used by the RULE-BASED fallback path (the trained risk model
    predicts its class directly and never needs this re-derivation)."""
    if score >= 70:
        return "HIGH" if score < 80 else "CRITICAL"
    if score >= 40:
        return "MEDIUM"
    return "LOW"


def _readiness(risk_score: int, rainfall_score: float) -> tuple[int, str]:
    readiness = round(clamp(100 - risk_score * 0.62 - rainfall_score * 0.08 + random.uniform(-2, 2), 8, 98))
    label = "Good"
    if readiness < 45:
        label = "Poor"
    elif readiness < 70:
        label = "Fair"
    return readiness, label


def _explanation(crop: str, disease: str, risk_level: str, factors: list[dict], source: str) -> str:
    lead = factors[0] if factors else {"factor": "environmental conditions", "detail": ""}
    second = factors[1] if len(factors) > 1 else {"factor": "other factors", "detail": ""}
    tail = {
        "CRITICAL": "Conditions are strongly favorable for pathogen development -- preventive action is strongly advised.",
        "HIGH": "Conditions are highly favorable for pathogen development -- preventive action is advised promptly.",
        "MEDIUM": "Conditions show a moderate likelihood of disease onset over the coming days.",
        "LOW": "Current conditions remain largely unfavorable for disease development.",
    }.get(risk_level, "")
    basis = "a trained model" if source == "trained_model" else "a baseline environmental estimate"
    disease_label = disease.replace("_", " ").title() if disease and disease != "none" else "no specific disease"
    return (
        f"{risk_level.title()} risk of {disease_label} predicted for {crop} (based on {basis}). "
        f"{lead['factor']} ({lead['detail']}) is the leading contributing factor, "
        f"followed by {second['factor'].lower()} ({second['detail']}). {tail}"
    )


def _rule_based_predict(crop: str, temperature: float, humidity: float,
                         soil_moisture: float, rainfall_7d: float) -> dict:
    """Deterministic agronomic heuristic used until a trained model is
    available or usable for this specific input (unchanged logic from the
    original single-model version, only the crop_id vocabulary changed
    from 2 crops to the locked 8)."""
    profile = CROP_PROFILES.get(crop, CROP_PROFILES["rice"])
    factors = contributing_factors(crop, temperature, humidity, soil_moisture, rainfall_7d)
    t_lo, t_hi = profile["temp_opt"]
    h_lo, h_hi = profile["humidity_opt"]
    s_lo, s_hi = profile["soil_opt"]

    def dev(v, lo, hi):
        if lo <= v <= hi:
            return 8.0
        span = (hi - lo) or 1
        d = (lo - v) if v < lo else (v - hi)
        return clamp(20 + (d / span) * 140, 0, 100)

    raw_score = (
        dev(temperature, t_lo, t_hi) * 0.28
        + dev(humidity, h_lo, h_hi) * 0.38
        + dev(soil_moisture, s_lo, s_hi) * 0.22
        + clamp((rainfall_7d / 120) * 100, 0, 100) * 0.12
    )
    risk_score = int(round(clamp(raw_score, 2, 98)))
    risk_level = _risk_level_from_score(risk_score)

    if humidity > h_hi and t_lo <= temperature <= t_hi:
        disease = profile["diseases"][0]
    elif soil_moisture > s_hi and humidity > h_hi:
        disease = profile["diseases"][min(1, len(profile["diseases"]) - 1)]
    elif soil_moisture > s_hi and temperature > t_hi:
        disease = profile["diseases"][min(2, len(profile["diseases"]) - 1)]
    else:
        disease = profile["diseases"][-1]

    confidence = round(clamp(72 + abs(risk_score - 50) / 50 * 22 + random.uniform(0, 4), 70, 98), 1)
    readiness, readiness_label = _readiness(risk_score, clamp((rainfall_7d / 120) * 100, 0, 100))
    explanation = _explanation(crop, disease, risk_level, factors, "rule_based_fallback")

    return {
        "crop": crop, "disease": disease, "risk_level": risk_level, "risk_score": risk_score,
        "confidence": confidence, "readiness_score": readiness, "readiness_label": readiness_label,
        "factors": factors, "explanation": explanation, "source": "rule_based_fallback",
        "model_version": None,
    }


def _model_predict(artifacts: dict, crop: str, stage: str, temperature: float, humidity: float,
                    soil_moisture: float, rainfall_7d: float, timestamp: datetime,
                    recent_readings: list[dict], latitude: Optional[float], longitude: Optional[float]) -> Optional[dict]:
    """Runs inference through BOTH trained models. Returns None (caller
    falls back to rule-based) if the feature builder can't map this input
    onto the trained vocabulary -- e.g. an unrecognized growth_stage."""
    feature_row = build_feature_row(
        crop_id=crop, stage_id=stage, temperature_c=temperature, humidity_pct=humidity,
        soil_moisture_pct=soil_moisture, timestamp=timestamp, recent_readings=recent_readings,
        cat_encoders=artifacts["cat_encoders"], latitude=latitude, longitude=longitude,
    )
    if feature_row is None:
        return None

    risk_model, risk_encoder = artifacts["risk_model"], artifacts["risk_encoder"]
    disease_model, disease_encoder = artifacts["disease_model"], artifacts["disease_encoder"]

    risk_proba = risk_model.predict_proba(feature_row)[0]
    risk_class_idx = int(risk_proba.argmax())
    risk_level = str(risk_encoder.inverse_transform([risk_class_idx])[0])
    risk_confidence = round(float(risk_proba[risk_class_idx]) * 100, 1)
    risk_score = int(round(sum(
        p * RISK_LEVEL_MIDPOINTS.get(str(cls), 50.0)
        for p, cls in zip(risk_proba, risk_encoder.classes_)
    )))

    disease_proba = disease_model.predict_proba(feature_row)[0]
    disease_class_idx = int(disease_proba.argmax())
    disease = str(disease_encoder.inverse_transform([disease_class_idx])[0])
    disease_confidence = round(float(disease_proba[disease_class_idx]) * 100, 1)

    # Overall reported confidence: the risk model's confidence in its own
    # predicted level (this is what the risk display most directly needs);
    # the disease model's confidence is available in factors/explanation
    # rather than overloading a single top-level number with two meanings.
    factors = contributing_factors(crop, temperature, humidity, soil_moisture, rainfall_7d)
    readiness, readiness_label = _readiness(risk_score, clamp((rainfall_7d / 120) * 100, 0, 100))
    explanation = _explanation(crop, disease, risk_level, factors, "trained_model")
    explanation += f" (Disease prediction confidence: {disease_confidence}%.)"

    return {
        "crop": crop, "disease": disease, "risk_level": risk_level, "risk_score": risk_score,
        "confidence": risk_confidence, "readiness_score": readiness, "readiness_label": readiness_label,
        "factors": factors, "explanation": explanation, "source": "trained_model",
        "model_version": "geocrop_v1",
    }


def predict(sensor_data: dict) -> dict:
    """
    Main prediction entry point.

    sensor_data: {
        "crop": one of the 8 locked crop_id values (e.g. "rice", "turmeric"),
        "temperature": float,
        "humidity": float,
        "soil_moisture": float,
        "rainfall_7d": float,
        "growth_stage": optional str -- must match the locked stage_id
            vocabulary for this crop to use the trained models; any other
            value (or missing) falls back to the rule-based heuristic,
        "timestamp": optional datetime, defaults to now (UTC),
        "recent_readings": optional list of {"temperature","humidity",
            "soil_moisture"} dicts from the last 24h, used to compute the
            rolling averages the trained models expect; defaults to [] if
            not supplied (24h average then equals the current reading alone),
        "latitude"/"longitude": optional, reserved for future GPS-to-region
            resolution (see feature_builder.py) -- currently unused beyond
            being accepted without error.
    }

    Returns a dict matching schemas.prediction.PredictionOut (minus id/created_at).
    """
    crop = sensor_data.get("crop", "rice")
    if crop not in CROP_PROFILES:
        crop = "rice"
    temperature = float(sensor_data["temperature"])
    humidity = float(sensor_data["humidity"])
    soil_moisture = float(sensor_data["soil_moisture"])
    rainfall_7d = float(sensor_data.get("rainfall_7d", 0.0) or 0.0)
    stage = sensor_data.get("growth_stage")
    timestamp = sensor_data.get("timestamp") or datetime.now(timezone.utc)
    recent_readings = sensor_data.get("recent_readings") or []
    latitude = sensor_data.get("latitude")
    longitude = sensor_data.get("longitude")

    artifacts = _load_artifacts()
    if all(v is not None for v in artifacts.values()):
        try:
            result = _model_predict(
                artifacts, crop, stage, temperature, humidity, soil_moisture,
                rainfall_7d, timestamp, recent_readings, latitude, longitude,
            )
            if result is not None:
                return result
        except Exception:
            # Any inference error falls back gracefully rather than 500-ing the API.
            pass

    return _rule_based_predict(crop, temperature, humidity, soil_moisture, rainfall_7d)
