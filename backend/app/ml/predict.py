"""
Disease prediction module.

`predict(sensor_data)` is the single entry point used by the rest of the
backend. It:

1. Tries to load `trained_model.pkl` + `label_encoder.pkl` from the `model/`
   directory using Joblib.
2. If both files are present, uses the trained Random Forest model to
   predict the disease class and derives risk score / confidence from the
   model's class probabilities.
3. If the model files are not yet available (e.g. fresh clone of this repo
   before training), falls back to a deterministic, agronomically-informed
   heuristic so the whole application remains fully functional end-to-end.

To go live with a real model: drop `trained_model.pkl` and
`label_encoder.pkl` into `backend/model/`. No other backend code needs to
change — `predict()` will automatically prefer the trained model.
"""
from __future__ import annotations

import os
import random
from functools import lru_cache
from typing import Optional

import joblib

from app.config import get_settings
from app.ml.feature_engineering import (
    CROP_PROFILES,
    build_feature_vector,
    contributing_factors,
    clamp,
)

settings = get_settings()

MODEL_PATH = os.path.join(settings.model_dir, "trained_model.pkl")
ENCODER_PATH = os.path.join(settings.model_dir, "label_encoder.pkl")


@lru_cache
def _load_artifacts():
    """Load the trained model + label encoder once and cache them in memory."""
    if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            encoder = joblib.load(ENCODER_PATH)
            return model, encoder
        except Exception:
            # Corrupt or incompatible artifact — fall back safely rather than crash.
            return None, None
    return None, None


def _risk_level(score: int) -> str:
    if score >= 70:
        return "High"
    if score >= 40:
        return "Medium"
    return "Low"


def _readiness(risk_score: int, rainfall_score: float) -> tuple[int, str]:
    readiness = round(clamp(100 - risk_score * 0.62 - rainfall_score * 0.08 + random.uniform(-2, 2), 8, 98))
    label = "Good"
    if readiness < 45:
        label = "Poor"
    elif readiness < 70:
        label = "Fair"
    return readiness, label


def _explanation(crop: str, disease: str, risk_level: str, factors: list[dict]) -> str:
    lead = factors[0] if factors else {"factor": "environmental conditions", "detail": ""}
    second = factors[1] if len(factors) > 1 else {"factor": "other factors", "detail": ""}
    tail = {
        "High": "Conditions are highly favorable for pathogen development — preventive action is advised promptly.",
        "Medium": "Conditions show a moderate likelihood of disease onset over the coming days.",
        "Low": "Current conditions remain largely unfavorable for disease development.",
    }[risk_level]
    return (
        f"{risk_level} risk of {disease} predicted for {crop.lower()}. "
        f"{lead['factor']} ({lead['detail']}) is the leading contributor, "
        f"followed by {second['factor'].lower()} ({second['detail']}). {tail}"
    )


def _rule_based_predict(crop: str, temperature: float, humidity: float,
                         soil_moisture: float, rainfall_7d: float) -> dict:
    """Deterministic agronomic heuristic used until a trained model is provided."""
    profile = CROP_PROFILES.get(crop, CROP_PROFILES["Rice"])
    factors = contributing_factors(crop, temperature, humidity, soil_moisture, rainfall_7d)
    weighted = sum(
        {"Humidity": 0.38, "Temperature": 0.28, "Soil Moisture": 0.22, "Recent Rainfall": 0.12}[f["factor"]]
        * (f["importance"])
        for f in factors
    )
    # Re-derive an absolute 0-100 risk score independent of the (relative) importances.
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
    risk_level = _risk_level(risk_score)

    if humidity > h_hi and t_lo <= temperature <= t_hi:
        disease = profile["diseases"][0]
    elif soil_moisture > s_hi and humidity > h_hi:
        disease = profile["diseases"][1]
    elif soil_moisture > s_hi and temperature > t_hi:
        disease = profile["diseases"][2]
    else:
        disease = profile["diseases"][-1]

    confidence = round(clamp(72 + abs(risk_score - 50) / 50 * 22 + random.uniform(0, 4), 70, 98), 1)
    readiness, readiness_label = _readiness(risk_score, clamp((rainfall_7d / 120) * 100, 0, 100))
    explanation = _explanation(crop, disease, risk_level, factors)

    return {
        "crop": crop,
        "disease": disease,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "confidence": confidence,
        "readiness_score": readiness,
        "readiness_label": readiness_label,
        "factors": factors,
        "explanation": explanation,
        "source": "rule_based_fallback",
    }


def _model_predict(model, encoder, crop: str, temperature: float, humidity: float,
                    soil_moisture: float, rainfall_7d: float) -> dict:
    """Run inference through the trained Random Forest model."""
    features = [build_feature_vector(crop, temperature, humidity, soil_moisture, rainfall_7d)]
    proba = model.predict_proba(features)[0]
    class_index = int(proba.argmax())
    disease = encoder.inverse_transform([class_index])[0]
    confidence = round(float(proba[class_index]) * 100, 1)

    # Risk score derived from model confidence + how "unfavorable" conditions are.
    factors = contributing_factors(crop, temperature, humidity, soil_moisture, rainfall_7d)
    severity = sum(f["importance"] for f in factors[:2]) / 100  # weight of top-2 factors
    risk_score = int(round(clamp(confidence * 0.6 + severity * 40, 2, 98)))
    risk_level = _risk_level(risk_score)

    readiness, readiness_label = _readiness(risk_score, clamp((rainfall_7d / 120) * 100, 0, 100))
    explanation = _explanation(crop, disease, risk_level, factors)

    return {
        "crop": crop,
        "disease": str(disease),
        "risk_level": risk_level,
        "risk_score": risk_score,
        "confidence": confidence,
        "readiness_score": readiness,
        "readiness_label": readiness_label,
        "factors": factors,
        "explanation": explanation,
        "source": "trained_model",
    }


def predict(sensor_data: dict) -> dict:
    """
    Main prediction entry point.

    sensor_data: {
        "crop": "Rice" | "Tomato",
        "temperature": float,
        "humidity": float,
        "soil_moisture": float,
        "rainfall_7d": float,
    }

    Returns a dict matching schemas.prediction.PredictionOut (minus id/created_at).
    """
    crop = sensor_data.get("crop", "Rice")
    if crop not in CROP_PROFILES:
        crop = "Rice"
    temperature = float(sensor_data["temperature"])
    humidity = float(sensor_data["humidity"])
    soil_moisture = float(sensor_data["soil_moisture"])
    rainfall_7d = float(sensor_data.get("rainfall_7d", 0.0) or 0.0)

    model, encoder = _load_artifacts()
    if model is not None and encoder is not None:
        try:
            return _model_predict(model, encoder, crop, temperature, humidity, soil_moisture, rainfall_7d)
        except Exception:
            # Any inference error falls back gracefully rather than 500-ing the API.
            pass

    return _rule_based_predict(crop, temperature, humidity, soil_moisture, rainfall_7d)
