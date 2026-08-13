export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type CropId =
  | "turmeric"
  | "rice"
  | "sugarcane"
  | "coconut"
  | "banana"
  | "groundnut"
  | "tapioca"
  | "maize";

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
  confidence: number;
  readiness_score?: number | null;
  readiness_label?: string | null;
  factors: ContributingFactor[];
  recommendations: Recommendation[];
  explanation?: string | null;
  source?: string | null;          // "trained_model" | "rule_based_fallback"
  model_version?: string | null;    // e.g. "geocrop_v1", null for rule-based
  created_at?: string | null;
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  priority?: "High" | "Medium" | "Low";
}

export interface HardwareStatus {
  dht22: "Connected" | "Not Connected" | "Connecting" | "Status unavailable";
  soilMoisture: "Connected" | "Not Connected" | "Connecting" | "Status unavailable";
  gps: "Connected" | "Not Connected" | "Connecting" | "Status unavailable";
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
  crop: string;
  temp_unit: "Celsius" | "Fahrenheit";
  rain_unit: "mm" | "inches";
  humidity_threshold: number;
  soil_threshold: number;
  risk_threshold: number;
  notify_high_risk: boolean;
  notify_daily_report: boolean;
  notify_sensor_offline: boolean;
  notify_weekly_summary: boolean;
}

export interface ReportMeta {
  id: number;
  report_type: string;
  file_name: string;
  created_at: string;
}

export interface WeatherData {
  source: string;
  provider: string;
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  weather_condition: string;
  weather_description: string;
  wind_speed: number;
  pressure: number;
  cloud_coverage: number;
  rainfall: number;
  rainfall_7d: number;
  rainfall_unit: string;
  timestamp: string;
}

export interface NPKData {
  source: string;
  is_real_sensor: boolean;
  crop: string;
  growth_stage: string | null;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  unit: string;
  label: string;
  disclaimer: string;
}

export type NotificationSeverity = "CRITICAL" | "WARNING" | "INFO" | "SUCCESS" | "TASK";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  timestamp: string;
  source: "ESP32" | "Weather API" | "GeoCrop Risk Model" | "Farmer Task";
  read: boolean;
  actionText?: string;
  actionUrl?: string;
}
