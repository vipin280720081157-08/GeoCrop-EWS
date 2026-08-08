export type RiskLevel = "Low" | "Medium" | "High";
export type Crop = "Paddy" | "Turmeric" | "Tomato";

export interface SensorReading {
  id: number;
  device_id: string;
  crop: string;
  growth_stage: string | null;
  temperature: number;
  humidity: number;
  soil_moisture: number;
  rainfall_7d: number | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface ContributingFactor {
  factor: string;
  importance: number;
  detail: string;
}

export interface Recommendation {
  text: string;
  priority: "Low" | "Medium" | "High";
}

export interface Prediction {
  id?: number;
  crop: string;
  disease: string;
  risk_level: RiskLevel;
  risk_score: number;
  confidence?: number | null;
  readiness_score?: number | null;
  readiness_label?: string | null;
  factors: ContributingFactor[];
  recommendations: Recommendation[];
  explanation?: string | null;
  source?: "trained_model" | "rule_based_fallback" | string;
  created_at?: string | null;
}

export interface TrendPoint {
  date: string;
  temperature: number;
  humidity: number;
  soil_moisture: number;
  risk_score: number;
  readiness: number;
}

export interface AlertItem {
  level: RiskLevel;
  text: string;
  time: string;
}

export interface DashboardData {
  latest_sensor: SensorReading | null;
  latest_prediction: Prediction | null;
  trend_7d: TrendPoint[];
  alerts: AlertItem[];
  device_connected: boolean;
}

export interface AppSettings {
  crop: Crop;
  temp_unit: "Celsius" | "Fahrenheit";
  rain_unit: "mm" | "inches";
  humidity_threshold: number;
  soil_threshold: number;
  risk_threshold: number;
}

export interface ReportMeta {
  id: number;
  report_type: string;
  file_name: string;
  created_at: string;
}

export type StatusState = "ready" | "online" | "receiving" | "connected" | "available" | "fixed" | "checking" | "waiting" | "unavailable" | "offline" | "no_data";

export interface SystemStatus {
  application: "ready";
  backend: "online" | "checking" | "unavailable";
  dataService: "receiving" | "checking" | "no_data";
  hardware: "connected" | "checking" | "offline";
  aiModel: "available" | "checking" | "unavailable";
  gps: "fixed" | "waiting" | "unavailable";
}
