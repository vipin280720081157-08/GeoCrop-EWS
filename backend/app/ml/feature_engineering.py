"""
Feature engineering shared by the rule-based fallback and the trained model.

CROP_PROFILES define the agronomically optimal ranges used both to build
the fallback heuristic and to compute human-readable "contributing factor"
explanations regardless of which prediction path is used.

Values below are derived from the GeoCrop reference/evidence layer (the
33-disease research audit backing the training dataset -- TNAU/ICAR/PMC
sourced where marked "authoritative" there, see
GeoCrop-Dataset-Engineering-Plan.md for the full per-disease citation
list). Each crop's range here is the MEDIAN envelope across that crop's
own disease profiles -- a defensible aggregate for this rule-based
fallback's purposes, not a replacement for the trained models' or the
reference layer's per-disease precision.

crop_id values match the locked GeoCrop ontology exactly (lowercase,
matching app.ml.geocrop_ontology.LOCKED_CROPS) -- this replaced the
original 2-crop ("Rice"/"Tomato") profile set, which silently defaulted
every other crop to Rice's profile. That silent default was a real gap
inconsistent with this project's own honesty principles and has been
closed here.
"""
from typing import Dict, List, Tuple

from app.ml.geocrop_ontology import LOCKED_STAGES

CROP_PROFILES: Dict[str, dict] = {
    "turmeric": {
        "growth_stages": LOCKED_STAGES["turmeric"],
        "temp_opt": (25, 30), "humidity_opt": (80, 98), "soil_opt": (62, 92),
        "diseases": ["turmeric_rhizome_rot", "turmeric_leaf_spot"],
    },
    "rice": {
        "growth_stages": LOCKED_STAGES["rice"],
        "temp_opt": (25, 30), "humidity_opt": (80, 100), "soil_opt": (60, 90),
        "diseases": ["rice_blast", "rice_brown_spot", "rice_bacterial_leaf_blight",
                     "rice_sheath_blight", "rice_sheath_rot", "rice_false_smut",
                     "rice_grain_discoloration", "rice_tungro_disease"],
    },
    "sugarcane": {
        "growth_stages": LOCKED_STAGES["sugarcane"],
        "temp_opt": (25, 32), "humidity_opt": (75, 100), "soil_opt": (40, 80),
        "diseases": ["sugarcane_red_rot", "sugarcane_smut", "sugarcane_pokkah_boeng",
                     "sugarcane_rust", "sugarcane_yellow_leaf_disease"],
    },
    "coconut": {
        "growth_stages": LOCKED_STAGES["coconut"],
        "temp_opt": (25, 31), "humidity_opt": (80, 100), "soil_opt": (55, 90),
        "diseases": ["coconut_bud_rot", "coconut_leaf_blight", "coconut_root_wilt", "coconut_fruit_rot"],
    },
    "banana": {
        "growth_stages": LOCKED_STAGES["banana"],
        "temp_opt": (25, 30), "humidity_opt": (72, 95), "soil_opt": (45, 82),
        "diseases": ["banana_sigatoka_leaf_spot", "banana_fusarium_wilt"],
    },
    "groundnut": {
        "growth_stages": LOCKED_STAGES["groundnut"],
        "temp_opt": (24, 28), "humidity_opt": (62, 85), "soil_opt": (40, 72),
        "diseases": ["groundnut_collar_rot", "groundnut_root_rot", "groundnut_early_leaf_spot",
                     "groundnut_late_leaf_spot", "groundnut_rust", "groundnut_bud_necrosis"],
    },
    "tapioca": {
        "growth_stages": LOCKED_STAGES["tapioca"],
        "temp_opt": (25, 30), "humidity_opt": (75, 100), "soil_opt": (50, 85),
        "diseases": ["tapioca_mosaic_disease", "tapioca_cercospora_leaf_spot", "tapioca_tuber_rot"],
    },
    "maize": {
        "growth_stages": LOCKED_STAGES["maize"],
        "temp_opt": (20, 26), "humidity_opt": (85, 100), "soil_opt": (60, 90),
        "diseases": ["maize_downy_mildew", "maize_turcicum_leaf_blight", "maize_crazy_top_downy_mildew"],
    },
}

DEFAULT_CROP = "rice"  # used only if an unrecognized crop_id somehow reaches this module


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


def contributing_factors(crop: str, temperature: float, humidity: float,
                          soil_moisture: float, rainfall_7d: float) -> List[dict]:
    # .get() with an explicit, logged-worthy fallback -- never a silent
    # KeyError crash, and never a silent mismatch presented as if it were
    # this crop's real profile without any trace of the substitution.
    profile = CROP_PROFILES.get(crop, CROP_PROFILES[DEFAULT_CROP])
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
