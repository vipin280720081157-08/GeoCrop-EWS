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

export const SUPPORTED_CROPS = ["Paddy", "Turmeric", "Tomato"] as const;
export type SupportedCrop = (typeof SUPPORTED_CROPS)[number];

export const CROP_PROFILES: Record<string, { growthStages: string[] }> = {
  Paddy: { growthStages: ["Seedling", "Tillering", "Panicle Initiation", "Flowering", "Grain Filling", "Maturity"] },
  Turmeric: { growthStages: ["Sprouting", "Vegetative", "Rhizome Initiation", "Rhizome Development", "Maturity"] },
  Tomato: { growthStages: ["Seedling", "Vegetative", "Flowering", "Fruit Set", "Ripening", "Harvest"] },
};

/** How often the Live Monitoring page polls the backend for fresh readings. */
export const POLL_INTERVAL_MS = 5000;

export const STATE_COPY = {
  loading: "Loading monitoring data...",
  noSensorData: "No sensor data available yet.",
  noPrediction: "No prediction available yet.",
  hardwareOffline: "Hardware connection unavailable.",
  gpsWaiting: "Waiting for GPS location.",
  gpsUnavailable: "GPS location unavailable.",
  modelUnavailable: "Prediction model unavailable — showing baseline estimate.",
  backendUnreachable: "Unable to connect to the data service.",
  insufficientHistory: "Historical trends will appear here as data accumulates.",
} as const;
