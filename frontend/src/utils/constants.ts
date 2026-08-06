export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", path: "/" },
  { key: "live", label: "Live Monitoring", path: "/live-monitoring" },
  { key: "prediction", label: "Disease Prediction", path: "/disease-prediction" },
  { key: "decision", label: "Decision Support", path: "/decision-support" },
  { key: "analytics", label: "Historical Analytics", path: "/historical-analytics" },
  { key: "gis", label: "GIS Map", path: "/gis-map" },
  { key: "reports", label: "Reports", path: "/reports" },
  { key: "settings", label: "Settings", path: "/settings" },
] as const;

export const CROP_PROFILES: Record<string, { growthStages: string[] }> = {
  Rice: { growthStages: ["Seedling", "Tillering", "Panicle Initiation", "Flowering", "Grain Filling", "Maturity"] },
  Tomato: { growthStages: ["Seedling", "Vegetative", "Flowering", "Fruit Set", "Ripening", "Harvest"] },
};

/** How often the Live Monitoring page polls the backend for fresh readings. */
export const POLL_INTERVAL_MS = 5000;
