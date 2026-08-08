"""
Feature engineering shared by the rule-based fallback and the trained model.

CROP_PROFILES define the agronomically optimal ranges used both to build
the fallback heuristic and to compute human-readable "contributing factor"
explanations regardless of which prediction path is used.
"""
from typing import Dict, List, Tuple

CROP_PROFILES: Dict[str, dict] = {
    "Paddy": {
        "growth_stages": ["Seedling", "Tillering", "Panicle Initiation", "Flowering", "Grain Filling", "Maturity"],
        "temp_opt": (24, 32),
        "humidity_opt": (55, 75),
        "soil_opt": (60, 80),
        "diseases": ["Rice Blast", "Bacterial Leaf Blight", "Sheath Blight", "Brown Spot"],
    },
    "Turmeric": {
        "growth_stages": ["Sprouting", "Vegetative", "Rhizome Initiation", "Rhizome Development", "Maturity"],
        "temp_opt": (20, 30),
        "humidity_opt": (60, 80),
        "soil_opt": (55, 75),
        "diseases": ["Leaf Spot", "Rhizome Rot", "Leaf Blotch", "Colletotrichum Leaf Spot"],
    },
    "Tomato": {
        "growth_stages": ["Seedling", "Vegetative", "Flowering", "Fruit Set", "Ripening", "Harvest"],
        "temp_opt": (21, 27),
        "humidity_opt": (45, 65),
        "soil_opt": (50, 70),
        "diseases": ["Late Blight", "Early Blight", "Bacterial Spot", "Powdery Mildew"],
    },
}


def clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def deviation_score(value: float, opt_range: Tuple[float, float]) -> float:
    """Score 0-100: how far `value` sits outside the optimal range."""
    lo, hi = opt_range
    if lo <= value <= hi:
        return 8.0
    span = (hi - lo) or 1
    dist = (lo - value) if value < lo else (value - hi)
    return clamp(20 + (dist / span) * 140, 0, 100)


def build_feature_vector(crop: str, temperature: float, humidity: float,
                          soil_moisture: float, rainfall_7d: float) -> List[float]:
    """
    Builds the numeric feature vector consumed by the trained Random Forest
    model: [temperature, humidity, soil_moisture, rainfall_7d, crop_index].
    Kept in one place so the training script and inference code always agree
    on feature order.
    """
    if crop == "Rice" or crop == "Paddy":
        crop_index = 0
    elif crop == "Turmeric":
        crop_index = 1
    else:
        crop_index = 2
    return [temperature, humidity, soil_moisture, rainfall_7d, crop_index]


def contributing_factors(crop: str, temperature: float, humidity: float,
                          soil_moisture: float, rainfall_7d: float) -> List[dict]:
    profile = CROP_PROFILES[crop]
    t_score = deviation_score(temperature, profile["temp_opt"])
    h_score = deviation_score(humidity, profile["humidity_opt"])
    s_score = deviation_score(soil_moisture, profile["soil_opt"])
    r_score = clamp((rainfall_7d / 120) * 100, 0, 100)

    raw = [
        {"factor": "Humidity", "value": h_score, "detail": f"{humidity:.1f}% relative humidity"},
        {"factor": "Temperature", "value": t_score, "detail": f"{temperature:.1f}°C air temperature"},
        {"factor": "Soil Moisture", "value": s_score, "detail": f"{soil_moisture:.1f}% soil moisture"},
        {"factor": "Recent Rainfall", "value": r_score, "detail": f"{rainfall_7d:.1f} mm in the last 7 days"},
    ]
    total = sum(f["value"] for f in raw) or 1
    factors = sorted(
        [{"factor": f["factor"], "importance": round(f["value"] / total * 100), "detail": f["detail"]} for f in raw],
        key=lambda f: f["importance"], reverse=True,
    )
    diff = 100 - sum(f["importance"] for f in factors)
    if factors:
        factors[0]["importance"] += diff
    return factors
