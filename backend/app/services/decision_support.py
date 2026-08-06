"""
Decision Support Engine.

Converts a raw prediction (disease, risk level, contributing factors) into
practical, actionable preventive recommendations. Deliberately avoids
recommending pesticides or chemical treatments — the system focuses on
preventive farm-management practices only.
"""
from app.ml.feature_engineering import CROP_PROFILES


def build_recommendations(prediction: dict, sensor: dict, crop: str) -> list[dict]:
    profile = CROP_PROFILES.get(crop, CROP_PROFILES["Rice"])
    recs: list[dict] = []

    soil_hi = profile["soil_opt"][1]
    hum_hi = profile["humidity_opt"][1]
    temp_hi = profile["temp_opt"][1]

    if sensor["soil_moisture"] > soil_hi:
        recs.append({
            "text": "Improve field drainage — soil moisture is above the optimal range for this crop stage.",
            "priority": "High",
        })
    if sensor["humidity"] > hum_hi:
        recs.append({
            "text": "Increase field ventilation / row spacing airflow to reduce prolonged leaf wetness.",
            "priority": "High" if prediction["risk_level"] == "High" else "Medium",
        })
    if prediction["risk_level"] != "Low":
        recs.append({
            "text": "Increase field inspection frequency to twice daily to catch early symptoms.",
            "priority": "High" if prediction["risk_level"] == "High" else "Medium",
        })
    recs.append({
        "text": "Continue monitoring environmental changes over the coming 48–72 hours.",
        "priority": "Low",
    })
    if sensor["temperature"] > temp_hi:
        recs.append({
            "text": "Consider shade netting or adjusted irrigation timing to moderate canopy temperature.",
            "priority": "Medium",
        })
    if len(recs) < 3:
        recs.append({
            "text": "Maintain current irrigation schedule; conditions remain within a safe range.",
            "priority": "Low",
        })

    seen = set()
    deduped = []
    for r in recs:
        if r["text"] not in seen:
            seen.add(r["text"])
            deduped.append(r)
    return deduped[:5]


def environmental_warnings(sensor: dict, crop: str) -> list[dict]:
    profile = CROP_PROFILES.get(crop, CROP_PROFILES["Rice"])
    warnings = []
    if sensor["humidity"] > profile["humidity_opt"][1]:
        warnings.append({"text": f"Humidity ({sensor['humidity']:.1f}%) exceeds optimal range for {crop.lower()}.", "level": "Medium"})
    if sensor["soil_moisture"] > profile["soil_opt"][1]:
        warnings.append({"text": f"Soil moisture ({sensor['soil_moisture']:.1f}%) is above the recommended threshold.", "level": "High"})
    if sensor["temperature"] > profile["temp_opt"][1]:
        warnings.append({"text": f"Temperature ({sensor['temperature']:.1f}°C) is above the optimal growth range.", "level": "Medium"})
    if not warnings:
        warnings.append({"text": "All monitored parameters are currently within the optimal range.", "level": "Low"})
    return warnings
