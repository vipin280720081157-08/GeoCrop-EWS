/*
  GeoCrop EWS — ESP32 Sensor Client
  ----------------------------------
  Reads DHT22 (temperature + humidity), a capacitive soil moisture sensor,
  and a GPS module, then POSTs a JSON reading to the FastAPI backend every
  SEND_INTERVAL_MS milliseconds. Retries automatically if the backend is
  unreachable.

  Wiring: see /hardware/wiring_diagram.png and /docs/HARDWARE.md

  Required libraries (Arduino Library Manager):
    - DHT sensor library (Adafruit)
    - Adafruit Unified Sensor
    - TinyGPSPlus
    - ArduinoJson
    (WiFi.h and HTTPClient.h ship with the ESP32 board package)
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>

// ---------------------------------------------------------------------
// CONFIGURATION — edit these values for your deployment
// ---------------------------------------------------------------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Backend URL — local dev example: "http://192.168.1.50:8000"
// Production (Render) example: "https://geocrop-ews-api.onrender.com"
const char* BACKEND_URL   = "http://192.168.1.50:8000";
const char* DEVICE_ID     = "ESP32_01";
const char* CROP          = "Rice";           // "Rice" or "Tomato"
const char* GROWTH_STAGE  = "Panicle Initiation";

const unsigned long SEND_INTERVAL_MS = 30000;  // 30 seconds, per spec
const unsigned long RETRY_DELAY_MS   = 5000;   // wait before retrying a failed POST
const int MAX_RETRIES = 3;

// ---------------------------------------------------------------------
// PIN CONFIGURATION
// ---------------------------------------------------------------------
#define DHT_PIN            4        // DHT22 data pin
#define DHT_TYPE            DHT22
#define SOIL_MOISTURE_PIN  34        // Analog (ADC1) pin — capacitive soil sensor
#define GPS_RX_PIN         16        // ESP32 RX2  <- GPS TX
#define GPS_TX_PIN         17        // ESP32 TX2  -> GPS RX

// Calibrate these against your specific sensor (dry soil vs. water):
const int SOIL_ADC_DRY = 3000;   // raw ADC reading in dry air
const int SOIL_ADC_WET = 1200;   // raw ADC reading fully submerged in water

DHT dht(DHT_PIN, DHT_TYPE);
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

// Rolling 7-day rainfall placeholder — replace with a rain gauge sensor or
// a weather-API lookup on the backend if available. Kept here as 0 by
// default so the payload schema stays consistent with the backend.
float rainfall7d = 0.0;

unsigned long lastSendTime = 0;

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected. IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nWiFi connection failed — will retry in loop().");
  }
}

float readSoilMoisturePercent() {
  int raw = analogRead(SOIL_MOISTURE_PIN);
  int clamped = constrain(raw, SOIL_ADC_WET, SOIL_ADC_DRY);
  float percent = 100.0 - (((float)(clamped - SOIL_ADC_WET) / (SOIL_ADC_DRY - SOIL_ADC_WET)) * 100.0);
  return constrain(percent, 0.0, 100.0);
}

void readGPS(double &lat, double &lng, bool &fixValid) {
  // Feed any available GPS bytes to the parser for up to 1 second.
  unsigned long start = millis();
  while (millis() - start < 1000) {
    while (gpsSerial.available() > 0) {
      gps.encode(gpsSerial.read());
    }
  }
  if (gps.location.isValid()) {
    lat = gps.location.lat();
    lng = gps.location.lng();
    fixValid = true;
  } else {
    fixValid = false;
  }
}

bool sendReading(float temperature, float humidity, float soilMoisture, double lat, double lng, bool hasFix) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected — skipping send.");
    return false;
  }

  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/sensors/data";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<512> doc;
  doc["device_id"] = DEVICE_ID;
  doc["crop"] = CROP;
  doc["growth_stage"] = GROWTH_STAGE;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["soil_moisture"] = soilMoisture;
  doc["rainfall_7d"] = rainfall7d;
  if (hasFix) {
    doc["latitude"] = lat;
    doc["longitude"] = lng;
  }

  String payload;
  serializeJson(doc, payload);
  Serial.println("POST " + url);
  Serial.println(payload);

  int statusCode = http.POST(payload);
  bool success = statusCode >= 200 && statusCode < 300;

  if (success) {
    Serial.printf("Sent OK (HTTP %d)\n", statusCode);
  } else {
    Serial.printf("Send failed (HTTP %d): %s\n", statusCode, http.getString().c_str());
  }

  http.end();
  return success;
}

void sendWithRetry(float temperature, float humidity, float soilMoisture, double lat, double lng, bool hasFix) {
  for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (sendReading(temperature, humidity, soilMoisture, lat, lng, hasFix)) {
      return;
    }
    Serial.printf("Retry %d/%d in %lu ms...\n", attempt, MAX_RETRIES, RETRY_DELAY_MS);
    delay(RETRY_DELAY_MS);
  }
  Serial.println("All retries failed — will try again next cycle.");
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  dht.begin();
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  analogReadResolution(12); // 0-4095 on ESP32

  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  if (millis() - lastSendTime >= SEND_INTERVAL_MS || lastSendTime == 0) {
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Failed to read from DHT22 sensor — skipping this cycle.");
    } else {
      float soilMoisture = readSoilMoisturePercent();
      double lat = 0, lng = 0;
      bool hasFix = false;
      readGPS(lat, lng, hasFix);

      Serial.printf("T=%.1fC H=%.1f%% Soil=%.1f%% Fix=%s\n", temperature, humidity, soilMoisture, hasFix ? "yes" : "no");
      sendWithRetry(temperature, humidity, soilMoisture, lat, lng, hasFix);
    }

    lastSendTime = millis();
  }
}
