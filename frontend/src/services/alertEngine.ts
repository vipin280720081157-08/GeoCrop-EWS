import type { SensorReading, WeatherData, Prediction, NotificationItem } from "@/types";

export function evaluateAlertRules(
  sensor: SensorReading | null,
  weather: WeatherData | null,
  prediction: Prediction | null,
  crop: string = "turmeric",
  stage: string = "seed_rhizome_sprouting"
): NotificationItem[] {
  const newAlerts: NotificationItem[] = [];
  const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  // 1. CRITICAL / WARNING: Disease Risk Alert (Only when risk is HIGH or CRITICAL)
  if (prediction && (prediction.risk_level === "HIGH" || prediction.risk_level === "CRITICAL")) {
    newAlerts.push({
      id: "rule-alert-risk",
      title: `⚠ High ${prediction.crop.toUpperCase()} Disease Risk Detected`,
      message: `High disease risk score (${prediction.risk_score}/100) identified for ${prediction.crop} (${stage.replace(/_/g, " ")}). ${prediction.explanation || "Inspect leaf surfaces for early lesion symptoms."}`,
      severity: prediction.risk_level === "CRITICAL" ? "CRITICAL" : "WARNING",
      timestamp: timeStr,
      source: "GeoCrop Risk Model",
      read: false,
      actionText: "Open Action Plan",
      actionUrl: "/decision-support",
    });
  }

  // 2. WEATHER ALERT: Heavy Rain Warning (Only when rainfall > 15mm or active heavy rain)
  if (weather && (weather.rainfall > 15.0 || weather.rainfall_7d > 40.0 || weather.weather_condition === "Thunderstorm")) {
    newAlerts.push({
      id: "rule-alert-rain",
      title: "🌧 Heavy Rain / High Moisture Warning",
      message: `Recent regional rainfall is ${weather.rainfall_7d} mm (${weather.weather_description}). Ensure field drainage channels are clear to prevent waterlogging around roots.`,
      severity: "WARNING",
      timestamp: timeStr,
      source: "Weather API",
      read: false,
      actionText: "View Weather Details",
      actionUrl: "/weather",
    });
  }

  // 3. HARDWARE & SENSOR VALIDITY CHECK: Genuine Low Soil Moisture Only
  if (sensor && sensor.soil_moisture > 0 && sensor.soil_moisture < 25.0) {
    newAlerts.push({
      id: "rule-alert-soil-low",
      title: "💧 Low Soil Moisture Detected",
      message: `Soil moisture (${sensor.soil_moisture.toFixed(1)}%) is below optimal threshold for ${crop} during ${stage.replace(/_/g, " ")}. Consider scheduling irrigation.`,
      severity: "WARNING",
      timestamp: timeStr,
      source: "ESP32",
      read: false,
      actionText: "View Sensors",
      actionUrl: "/live-monitoring",
    });
  }

  // 4. HUMIDITY ALERT: High Canopy Humidity (Only when canopy humidity > 90%)
  const humidity = sensor?.humidity ?? weather?.humidity;
  if (humidity && humidity > 90.0) {
    newAlerts.push({
      id: "rule-alert-humidity",
      title: "🌫 High Canopy Humidity Advisory",
      message: `Canopy relative humidity is high (${humidity.toFixed(1)}%). Fungal spore germination risk is elevated in dense crop rows.`,
      severity: "INFO",
      timestamp: timeStr,
      source: sensor ? "ESP32" : "Weather API",
      read: false,
    });
  }

  return newAlerts;
}
