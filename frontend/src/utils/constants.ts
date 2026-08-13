export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", path: "/" },
  { key: "live", label: "Live Field", path: "/live-monitoring" },
  { key: "hardware", label: "3D Hardware", path: "/hardware" },
  { key: "weather", label: "Weather", path: "/weather" },
  { key: "crop_stage", label: "Crop & Stage", path: "/crop-stage" },
  { key: "prediction", label: "Risk Analysis", path: "/disease-prediction" },
  { key: "decision", label: "Recommendations", path: "/decision-support" },
  { key: "tasks", label: "Tasks", path: "/tasks" },
  { key: "alerts", label: "Alerts", path: "/alerts" },
  { key: "analytics", label: "History", path: "/historical-analytics" },
  { key: "settings", label: "Settings", path: "/settings" },
] as const;

export interface CropOption {
  id: string;
  name: string;
}

export interface StageOption {
  id: string;
  name: string;
}

export const LOCKED_CROPS: CropOption[] = [
  { id: "turmeric", name: "Turmeric" },
  { id: "rice", name: "Rice" },
  { id: "sugarcane", name: "Sugarcane" },
  { id: "coconut", name: "Coconut" },
  { id: "banana", name: "Banana" },
  { id: "groundnut", name: "Groundnut" },
  { id: "tapioca", name: "Tapioca" },
  { id: "maize", name: "Maize" },
];

export const CROP_STAGES: Record<string, StageOption[]> = {
  turmeric: [
    { id: "seed_rhizome_sprouting", name: "Seed Rhizome Sprouting" },
    { id: "plant_establishment", name: "Plant Establishment" },
    { id: "vegetative_growth", name: "Vegetative Growth" },
    { id: "rhizome_initiation", name: "Rhizome Initiation" },
    { id: "rhizome_development", name: "Rhizome Development" },
    { id: "crop_maturity", name: "Crop Maturity" },
    { id: "harvesting", name: "Harvesting" },
  ],
  rice: [
    { id: "seed_germination", name: "Seed Germination" },
    { id: "seedling_establishment", name: "Seedling Establishment" },
    { id: "tillering", name: "Tillering" },
    { id: "panicle_initiation", name: "Panicle Initiation" },
    { id: "booting", name: "Booting" },
    { id: "heading", name: "Heading" },
    { id: "flowering", name: "Flowering" },
    { id: "grain_filling", name: "Grain Filling" },
    { id: "grain_maturity", name: "Grain Maturity" },
    { id: "harvesting", name: "Harvesting" },
  ],
  sugarcane: [
    { id: "sett_germination_shoot_emergence", name: "Sett Germination and Shoot Emergence" },
    { id: "plant_establishment", name: "Plant Establishment" },
    { id: "tillering", name: "Tillering" },
    { id: "grand_growth_stem_elongation", name: "Grand Growth and Stem Elongation" },
    { id: "ripening_maturity", name: "Ripening and Maturity" },
    { id: "harvesting", name: "Harvesting" },
  ],
  coconut: [
    { id: "seedling_establishment", name: "Seedling Establishment" },
    { id: "juvenile_vegetative_growth", name: "Juvenile Vegetative Growth" },
    { id: "flowering", name: "Flowering" },
    { id: "fruit_set", name: "Fruit Set" },
    { id: "nut_development", name: "Nut Development" },
    { id: "nut_maturity", name: "Nut Maturity" },
    { id: "harvesting", name: "Harvesting" },
  ],
  banana: [
    { id: "plant_establishment", name: "Plant Establishment" },
    { id: "vegetative_growth", name: "Vegetative Growth" },
    { id: "shooting", name: "Shooting" },
    { id: "flowering", name: "Flowering" },
    { id: "fruit_set", name: "Fruit Set" },
    { id: "fruit_development", name: "Fruit Development" },
    { id: "fruit_maturity", name: "Fruit Maturity" },
    { id: "harvesting", name: "Harvesting" },
  ],
  groundnut: [
    { id: "seed_germination_emergence", name: "Seed Germination and Emergence" },
    { id: "seedling_establishment", name: "Seedling Establishment" },
    { id: "vegetative_growth", name: "Vegetative Growth" },
    { id: "flowering", name: "Flowering" },
    { id: "peg_formation", name: "Peg Formation" },
    { id: "pod_development", name: "Pod Development" },
    { id: "pod_filling", name: "Pod Filling" },
    { id: "crop_maturity", name: "Crop Maturity" },
    { id: "harvesting", name: "Harvesting" },
  ],
  tapioca: [
    { id: "stem_cutting_sprouting", name: "Stem Cutting Sprouting" },
    { id: "plant_establishment", name: "Plant Establishment" },
    { id: "vegetative_growth", name: "Vegetative Growth" },
    { id: "root_initiation", name: "Root Initiation" },
    { id: "root_bulking", name: "Root Bulking" },
    { id: "root_maturity", name: "Root Maturity" },
    { id: "harvesting", name: "Harvesting" },
  ],
  maize: [
    { id: "seed_germination_emergence", name: "Seed Germination and Emergence" },
    { id: "seedling_establishment", name: "Seedling Establishment" },
    { id: "vegetative_growth", name: "Vegetative Growth" },
    { id: "tasseling", name: "Tasseling" },
    { id: "silking", name: "Silking" },
    { id: "pollination", name: "Pollination" },
    { id: "grain_filling", name: "Grain Filling" },
    { id: "physiological_maturity", name: "Physiological Maturity" },
    { id: "harvesting", name: "Harvesting" },
  ],
};

export const ERODE_DIVISIONS = [
  { id: "main_erode", name: "Main Erode" },
  { id: "perundurai", name: "Perundurai" },
  { id: "gobichettipalayam", name: "Gobichettipalayam" },
  { id: "bhavani", name: "Bhavani" },
  { id: "sathyamangalam", name: "Sathyamangalam" },
];

export const POLL_INTERVAL_MS = 5000;
