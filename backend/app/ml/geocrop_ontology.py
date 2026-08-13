"""
GeoCrop — backend-side ontology constants.

Lightweight subset of the locked GeoCrop dataset specification, needed by
the backend to validate incoming crop/stage values and derive month/season
the SAME way the training dataset did. This is intentionally NOT a full
copy of the dataset-generation config (no disease mappings, no reference
data needed here) — just what prediction-time feature-building requires.
"""

LOCKED_CROPS = ["turmeric", "rice", "sugarcane", "coconut", "banana", "groundnut", "tapioca", "maize"]

LOCKED_STAGES = {
    "turmeric": ["seed_rhizome_sprouting", "plant_establishment", "vegetative_growth",
                 "rhizome_initiation", "rhizome_development", "crop_maturity", "harvesting"],
    "rice": ["seed_germination", "seedling_establishment", "tillering", "panicle_initiation",
             "booting", "heading", "flowering", "grain_filling", "grain_maturity", "harvesting"],
    "sugarcane": ["sett_germination_shoot_emergence", "plant_establishment", "tillering",
                  "grand_growth_stem_elongation", "ripening_maturity", "harvesting"],
    "coconut": ["seedling_establishment", "juvenile_vegetative_growth", "flowering",
                "fruit_set", "nut_development", "nut_maturity", "harvesting"],
    "banana": ["plant_establishment", "vegetative_growth", "shooting", "flowering",
               "fruit_set", "fruit_development", "fruit_maturity", "harvesting"],
    "groundnut": ["seed_germination_emergence", "seedling_establishment", "vegetative_growth",
                  "flowering", "peg_formation", "pod_development", "pod_filling", "crop_maturity", "harvesting"],
    "tapioca": ["stem_cutting_sprouting", "plant_establishment", "vegetative_growth",
                "root_initiation", "root_bulking", "root_maturity", "harvesting"],
    "maize": ["seed_germination_emergence", "seedling_establishment", "vegetative_growth",
              "tasseling", "silking", "pollination", "grain_filling", "physiological_maturity", "harvesting"],
}

LOCKED_DIVISIONS = ["main_erode", "perundurai", "gobichettipalayam", "bhavani", "sathyamangalam"]

# Default division used until real GPS-to-region boundary lookup is
# implemented (planned as P1 in GeoCrop-EWS-Specification-v2.md §14) —
# explicit placeholder, not silently guessed.
DEFAULT_DIVISION_ID = "main_erode"


def month_to_season(month: int) -> str:
    if month in (1, 2):
        return "winter"
    if month in (3, 4, 5):
        return "summer"
    if month in (6, 7, 8, 9):
        return "southwest_monsoon"
    if month in (10, 11, 12):
        return "northeast_monsoon"
    raise ValueError(f"Invalid month: {month}")


def is_valid_crop_stage(crop: str, stage: str) -> bool:
    return crop in LOCKED_STAGES and stage in LOCKED_STAGES.get(crop, [])
