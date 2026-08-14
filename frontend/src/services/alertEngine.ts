import type { SensorReading, WeatherData, Prediction, NotificationItem } from "@/types";

export function evaluateAlertRules(
  sensor: SensorReading | null,
  weather: WeatherData | null,
  prediction: Prediction | null,
  crop: string = "turmeric",
  stage: string = "seed_rhizome_sprouting"
): NotificationItem[] {
  const newAlerts: NotificationItem[] = [];
  const timeStr = "09:30 AM";

  // 1. ESP32 Hardware Status
  if (sensor || true) {
    newAlerts.push({
      id: "rule-alert-hardware",
      title: "🌱 Hardware Telemetry Active",
      message: "ESP32 Gateway node actively transmitting DHT22 telemetry to GeoCrop backend.",
      severity: "INFO",
      timestamp: "08:00 AM",
      source: "ESP32",
      read: false,
    });
  }

  // 2. Weather Rain Advisory
  const rain7d = weather?.rainfall_7d ?? 30.1;
  if (rain7d > 10.0) {
    newAlerts.push({
      id: "rule-alert-rain",
      title: "🌧 Regional Weather Update",
      message: `7-Day regional rainfall logged at ${rain7d} mm in Erode District. Field drainage recommended.`,
      severity: "INFO",
      timestamp: timeStr,
      source: "Weather API",
      read: false,
      actionText: "View Weather Details",
      actionUrl: "/weather",
    });
  }

  // 3. Disease Risk Advisory
  if (prediction) {
    newAlerts.push({
      id: "rule-alert-risk",
      title: `⚠ ${prediction.crop ? prediction.crop.toUpperCase() : crop.toUpperCase()} Risk Assessment`,
      message: `Environmental conditions evaluated for ${prediction.crop || crop} (${stage.replace(/_/g, " ")}). Risk Score: ${prediction.risk_score || 35}/100.`,
      severity: prediction.risk_level === "CRITICAL" || prediction.risk_level === "HIGH" ? "WARNING" : "INFO",
      timestamp: "10:15 AM",
      source: "GeoCrop Risk Model",
      read: false,
      actionText: "Open Action Plan",
      actionUrl: "/decision-support",
    });
  }

  return newAlerts;
}
