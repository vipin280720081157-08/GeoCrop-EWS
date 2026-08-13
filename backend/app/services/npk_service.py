"""
Synthetic NPK service for demonstration / reference data.
Provides crop-aware and stage-aware Nitrogen (N), Phosphorus (P), Potassium (K) values
for all 8 locked GeoCrop crops.

CRITICAL: NPK values are synthetic demonstration values because GeoCrop currently
has no physical NPK hardware sensor connected to the ESP32 node.
"""
from typing import Optional

# Configurable synthetic NPK lookup table (kg/ha) across standard crop growth stages
SYNTHETIC_NPK_PROFILES: dict[str, dict[str, tuple[float, float, float]]] = {
    "turmeric": {
        "default": (150.0, 60.0, 108.0),
        "seed_rhizome_sprouting": (40.0, 30.0, 30.0),
        "plant_establishment": (80.0, 45.0, 50.0),
        "vegetative_growth": (150.0, 60.0, 80.0),
        "rhizome_initiation": (120.0, 60.0, 108.0),
        "rhizome_development": (90.0, 45.0, 108.0),
        "crop_maturity": (30.0, 20.0, 60.0),
        "harvesting": (10.0, 10.0, 20.0),
    },
    "rice": {
        "default": (120.0, 40.0, 40.0),
        "seed_germination": (20.0, 20.0, 20.0),
        "seedling_establishment": (40.0, 30.0, 30.0),
        "tillering": (90.0, 40.0, 40.0),
        "panicle_initiation": (120.0, 40.0, 40.0),
        "booting": (100.0, 40.0, 40.0),
        "heading": (80.0, 30.0, 30.0),
        "flowering": (60.0, 20.0, 20.0),
        "grain_filling": (40.0, 20.0, 20.0),
        "grain_maturity": (20.0, 10.0, 10.0),
        "harvesting": (10.0, 5.0, 5.0),
    },
    "sugarcane": {
        "default": (280.0, 60.0, 120.0),
        "sett_germination_shoot_emergence": (60.0, 40.0, 40.0),
        "plant_establishment": (120.0, 60.0, 60.0),
        "tillering": (220.0, 60.0, 90.0),
        "grand_growth_stem_elongation": (280.0, 60.0, 120.0),
        "ripening_maturity": (80.0, 30.0, 120.0),
        "harvesting": (20.0, 10.0, 40.0),
    },
    "coconut": {
        "default": (560.0, 320.0, 1200.0), # g/palm/year standard baseline
        "seedling_establishment": (200.0, 150.0, 400.0),
        "juvenile_vegetative_growth": (350.0, 220.0, 750.0),
        "flowering": (500.0, 300.0, 1000.0),
        "fruit_set": (560.0, 320.0, 1200.0),
        "nut_development": (560.0, 320.0, 1200.0),
        "nut_maturity": (400.0, 200.0, 900.0),
        "harvesting": (200.0, 100.0, 500.0),
    },
    "banana": {
        "default": (200.0, 50.0, 300.0),
        "plant_establishment": (60.0, 30.0, 80.0),
        "vegetative_growth": (160.0, 50.0, 200.0),
        "shooting": (200.0, 50.0, 300.0),
        "flowering": (180.0, 40.0, 300.0),
        "fruit_set": (150.0, 30.0, 280.0),
        "fruit_development": (120.0, 20.0, 250.0),
        "fruit_maturity": (60.0, 10.0, 150.0),
        "harvesting": (20.0, 5.0, 50.0),
    },
    "groundnut": {
        "default": (25.0, 50.0, 75.0),
        "seed_germination_emergence": (10.0, 20.0, 20.0),
        "seedling_establishment": (15.0, 35.0, 40.0),
        "vegetative_growth": (25.0, 50.0, 60.0),
        "flowering": (25.0, 50.0, 75.0),
        "peg_formation": (20.0, 45.0, 75.0),
        "pod_development": (15.0, 40.0, 65.0),
        "pod_filling": (10.0, 30.0, 50.0),
        "crop_maturity": (5.0, 15.0, 25.0),
        "harvesting": (0.0, 5.0, 10.0),
    },
    "tapioca": {
        "default": (90.0, 45.0, 90.0),
        "stem_cutting_sprouting": (20.0, 20.0, 20.0),
        "plant_establishment": (45.0, 35.0, 40.0),
        "vegetative_growth": (90.0, 45.0, 70.0),
        "root_initiation": (90.0, 45.0, 90.0),
        "root_bulking": (60.0, 30.0, 90.0),
        "root_maturity": (30.0, 15.0, 60.0),
        "harvesting": (10.0, 5.0, 20.0),
    },
    "maize": {
        "default": (135.0, 62.5, 50.0),
        "seed_germination_emergence": (25.0, 25.0, 20.0),
        "seedling_establishment": (50.0, 40.0, 30.0),
        "vegetative_growth": (110.0, 62.5, 45.0),
        "tasseling": (135.0, 62.5, 50.0),
        "silking": (135.0, 62.5, 50.0),
        "pollination": (100.0, 45.0, 40.0),
        "grain_filling": (60.0, 30.0, 30.0),
        "physiological_maturity": (30.0, 15.0, 15.0),
        "harvesting": (10.0, 5.0, 5.0),
    },
}

def get_synthetic_npk(crop: str = "turmeric", growth_stage: Optional[str] = None) -> dict:
    crop_clean = (crop or "turmeric").lower()
    crop_profile = SYNTHETIC_NPK_PROFILES.get(crop_clean, SYNTHETIC_NPK_PROFILES["turmeric"])
    
    stage_clean = (growth_stage or "default").lower()
    n, p, k = crop_profile.get(stage_clean, crop_profile["default"])

    return {
        "source": "synthetic",
        "is_real_sensor": False,
        "crop": crop_clean,
        "growth_stage": growth_stage,
        "nitrogen": n,
        "phosphorus": p,
        "potassium": k,
        "unit": "kg/ha",
        "label": "NPK — Demonstration Values (Synthetic)",
        "disclaimer": "Not measured by hardware — GeoCrop currently has no physical NPK sensor.",
    }
