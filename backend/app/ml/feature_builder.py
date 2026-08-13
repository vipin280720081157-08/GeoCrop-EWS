"""
GeoCrop — PREDICTION-TIME FEATURE BUILDER
==============================================
Builds the EXACT same 11-column feature vector the models were trained on
(see ai/scripts/features.py FEATURE_COLUMNS in the training notebook):

  month, temperature_c, humidity_pct, soil_moisture_pct,
  temp_24h_avg_c, humidity_24h_avg_pct, soil_moisture_24h_avg_pct,
  crop_id_enc, stage_id_enc, division_id_enc, season_id_enc

Column order matters — the trained models expect this exact order. This
module is the single place that order is defined on the serving side, so
it can never silently drift from the trained models' expectations.
"""
from datetime import datetime
from typing import Optional

import numpy as np
import pandas as pd

from app.ml.geocrop_ontology import (
    month_to_season, is_valid_crop_stage, DEFAULT_DIVISION_ID,
)

FEATURE_COLUMNS = [
    "month", "temperature_c", "humidity_pct", "soil_moisture_pct",
    "temp_24h_avg_c", "humidity_24h_avg_pct", "soil_moisture_24h_avg_pct",
    "crop_id_enc", "stage_id_enc", "division_id_enc", "season_id_enc",
]


def compute_24h_averages(current_temp, current_humidity, current_soil,
                          recent_readings: list[dict]) -> tuple[float, float, float]:
    """
    recent_readings: list of {"temperature": float, "humidity": float,
    "soil_moisture": float} dicts from the last 24h, oldest-to-newest,
    NOT including the current reading. The current reading is included in
    the average here (matching the training data's rolling window, which
    used min_periods=1 and therefore always included the point itself).
    """
    temps = [r["temperature"] for r in recent_readings] + [current_temp]
    hums = [r["humidity"] for r in recent_readings] + [current_humidity]
    soils = [r["soil_moisture"] for r in recent_readings] + [current_soil]
    return (
        round(float(np.mean(temps)), 1),
        round(float(np.mean(hums)), 1),
        round(float(np.mean(soils)), 1),
    )


def encode_categorical(value: str, encoder) -> int:
    """Encodes a single categorical value using a fitted sklearn
    LabelEncoder, returning -1 for a value the encoder never saw during
    training (defensive — should not happen for crop/season/division given
    the closed locked vocab, but stage_id typos are plausible)."""
    if value in set(encoder.classes_):
        return int(encoder.transform([value])[0])
    return -1


def build_feature_row(
    crop_id: str,
    stage_id: Optional[str],
    temperature_c: float,
    humidity_pct: float,
    soil_moisture_pct: float,
    timestamp: datetime,
    recent_readings: list[dict],
    cat_encoders: dict,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
) -> Optional[pd.DataFrame]:
    """
    Returns a single-row DataFrame with the exact FEATURE_COLUMNS the
    trained models expect, or None if the inputs can't be mapped onto the
    trained models' known vocabulary (caller should fall back to the
    rule-based heuristic in that case — this is the same graceful-
    degradation principle used everywhere else in this project).
    """
    if not stage_id or not is_valid_crop_stage(crop_id, stage_id):
        return None  # unknown/missing stage — trained model can't be used honestly

    month = timestamp.month
    season_id = month_to_season(month)

    # Division: real GPS-to-region lookup is planned (spec v2 §14) but not
    # yet implemented — explicit placeholder default, not a silent guess.
    division_id = DEFAULT_DIVISION_ID

    temp_avg, hum_avg, soil_avg = compute_24h_averages(
        temperature_c, humidity_pct, soil_moisture_pct, recent_readings)

    crop_enc = encode_categorical(crop_id, cat_encoders["crop_id"])
    stage_enc = encode_categorical(stage_id, cat_encoders["stage_id"])
    division_enc = encode_categorical(division_id, cat_encoders["division_id"])
    season_enc = encode_categorical(season_id, cat_encoders["season_id"])

    if -1 in (crop_enc, stage_enc, division_enc, season_enc):
        return None  # a value outside the trained vocabulary — fall back honestly

    row = {
        "month": month, "temperature_c": temperature_c, "humidity_pct": humidity_pct,
        "soil_moisture_pct": soil_moisture_pct, "temp_24h_avg_c": temp_avg,
        "humidity_24h_avg_pct": hum_avg, "soil_moisture_24h_avg_pct": soil_avg,
        "crop_id_enc": crop_enc, "stage_id_enc": stage_enc,
        "division_id_enc": division_enc, "season_id_enc": season_enc,
    }
    return pd.DataFrame([row])[FEATURE_COLUMNS]
