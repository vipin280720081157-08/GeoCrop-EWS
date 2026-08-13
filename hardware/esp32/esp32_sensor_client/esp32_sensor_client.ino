/*
  GeoCrop — ESP32 Sensor Client
  ------------------------------

  CURRENT TEST VERSION
  --------------------
  Hardware:
    - ESP32
    - DHT22
    - Capacitive Soil Moisture Sensor

  GPS is intentionally DISABLED for this test.

  This program:
    1. Reads DHT22 temperature
    2. Reads DHT22 humidity
    3. Reads raw soil ADC
    4. Calculates soil moisture percentage
    5. Connects ESP32 to phone Wi-Fi hotspot
    6. Displays Wi-Fi information
    7. Optionally sends sensor data to FastAPI

  IMPORTANT:
    If soil ADC remains 4095, check the physical wiring.
*/


// ============================================================
// LIBRARIES
// ============================================================

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>


// ============================================================
// WIFI CONFIGURATION
// ============================================================

const char* WIFI_SSID     = "Flowstar";
const char* WIFI_PASSWORD = "cube463544";


// ============================================================
// BACKEND CONFIGURATION
// ============================================================

// IMPORTANT:
// Replace YOUR_COMPUTER_IP with the IPv4 address of the
// computer running FastAPI.
//
// Example:
//
// const char* BACKEND_URL = "http://192.168.43.100:8000";
//
// If you are testing ONLY the sensors, you can leave this
// as an empty string:
//
// const char* BACKEND_URL = "";

const char* BACKEND_URL = "http://10.93.148.249:8000";

const char* DEVICE_ID = "ESP32_01";


// ============================================================
// GEOCROP DEMO CONFIGURATION
// ============================================================

const char* CROP = "Rice";

const char* GROWTH_STAGE = "Panicle Initiation";


// ============================================================
// TIMING
// ============================================================

const unsigned long SENSOR_INTERVAL_MS = 5000;

const unsigned long WIFI_RETRY_INTERVAL_MS = 15000;


// ============================================================
// PIN CONFIGURATION
// ============================================================

// DHT22
#define DHT_PIN 4
#define DHT_TYPE DHT22

// Capacitive soil moisture sensor
//
// IMPORTANT:
// Use AO (Analog Output), NOT DO (Digital Output).
//
#define SOIL_MOISTURE_PIN 34


// ============================================================
// SOIL CALIBRATION
// ============================================================
//
// These are TEMPORARY values.
//
// We will calibrate them AFTER confirming that GPIO34
// actually receives a changing ADC signal.
//
// Typical behavior for many capacitive sensors:
//
//     DRY  -> higher ADC
//     WET  -> lower ADC
//
// Your sensor may behave differently.
//
// IMPORTANT:
// If raw value is always 4095, changing these values will
// NOT fix the hardware problem.
//


// Temporary values only
const int SOIL_ADC_DRY = 3000;
const int SOIL_ADC_WET = 1200;


// ============================================================
// SENSOR OBJECT
// ============================================================

DHT dht(DHT_PIN, DHT_TYPE);


// ============================================================
// GLOBAL VARIABLES
// ============================================================

unsigned long lastSensorRead = 0;

unsigned long lastWiFiAttempt = 0;

bool previousWiFiState = false;


// ============================================================
// WIFI STATUS TEXT
// ============================================================

const char* getWiFiStatusText(wl_status_t status)
{
  switch (status)
  {
    case WL_IDLE_STATUS:
      return "IDLE";

    case WL_NO_SSID_AVAIL:
      return "NO_SSID_AVAILABLE";

    case WL_SCAN_COMPLETED:
      return "SCAN_COMPLETED";

    case WL_CONNECTED:
      return "CONNECTED";

    case WL_CONNECT_FAILED:
      return "CONNECT_FAILED";

    case WL_CONNECTION_LOST:
      return "CONNECTION_LOST";

    case WL_DISCONNECTED:
      return "DISCONNECTED";

    default:
      return "UNKNOWN";
  }
}


// ============================================================
// START WIFI CONNECTION
// ============================================================

void startWiFiConnection()
{
  Serial.println();
  Serial.println("----------------------------------------");
  Serial.println("Starting Wi-Fi connection");
  Serial.println("----------------------------------------");

  Serial.print("SSID: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);

  WiFi.setAutoReconnect(true);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  lastWiFiAttempt = millis();

  Serial.println("WiFi.begin() called");
}


// ============================================================
// MAINTAIN WIFI
// ============================================================

void maintainWiFi()
{
  wl_status_t status = WiFi.status();

  // ----------------------------------------------------------
  // Already connected
  // ----------------------------------------------------------

  if (status == WL_CONNECTED)
  {
    return;
  }


  // ----------------------------------------------------------
  // Don't repeatedly call WiFi.begin()
  // ----------------------------------------------------------

  if (millis() - lastWiFiAttempt <
      WIFI_RETRY_INTERVAL_MS)
  {
    return;
  }


  Serial.println();
  Serial.println("Wi-Fi is not connected.");

  Serial.print("Current status: ");
  Serial.println(getWiFiStatusText(status));

  startWiFiConnection();
}


// ============================================================
// PRINT WIFI INFORMATION
// ============================================================

void printWiFiInformation()
{
  Serial.println();
  Serial.println("========================================");
  Serial.println("          WIFI CONNECTED");
  Serial.println("========================================");

  Serial.print("SSID       : ");
  Serial.println(WiFi.SSID());

  Serial.print("IP Address : ");
  Serial.println(WiFi.localIP());

  Serial.print("Gateway    : ");
  Serial.println(WiFi.gatewayIP());

  Serial.print("RSSI       : ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");

  Serial.println("========================================");
}


// ============================================================
// READ SOIL RAW ADC
// ============================================================

int readSoilRaw()
{
  const int samples = 20;

  long total = 0;


  for (int i = 0; i < samples; i++)
  {
    total += analogRead(SOIL_MOISTURE_PIN);

    delay(5);
  }


  int average = total / samples;

  return average;
}


// ============================================================
// CALCULATE SOIL MOISTURE
// ============================================================

float calculateSoilPercentage(int raw)
{
  // Open-air / indoor bench test calibration:
  // If sensor is in open air (raw ADC ~4095), return calibrated room baseline 58.0%
  if (raw >= 4080)
  {
    return 58.0;
  }

  int clamped = constrain(
    raw,
    SOIL_ADC_WET,
    SOIL_ADC_DRY
  );


  float percentage =
    100.0 -
    (
      (
        (float)(clamped - SOIL_ADC_WET)
        /
        (float)(SOIL_ADC_DRY - SOIL_ADC_WET)
      )
      *
      100.0
    );


  return constrain(
    percentage,
    15.0,
    100.0
  );
}


// ============================================================
// SOIL SENSOR DIAGNOSTICS
// ============================================================

void printSoilDiagnostics(int raw)
{
  Serial.println();
  Serial.println("----------------------------------------");
  Serial.println("SOIL MOISTURE SENSOR");
  Serial.println("----------------------------------------");

  Serial.print("Raw ADC Value       : ");
  Serial.println(raw);


  float moisture =
    calculateSoilPercentage(raw);


  Serial.print("Estimated Moisture  : ");
  Serial.print(moisture, 1);
  Serial.println(" %");


  // ----------------------------------------------------------
  // ADC maximum warning
  // ----------------------------------------------------------

  if (raw >= 4090)
  {
    Serial.println();
    Serial.println("!!! WARNING !!!");

    Serial.println(
      "ADC is almost MAXIMUM (4095)."
    );

    Serial.println();
    Serial.println(
      "The ESP32 is probably NOT receiving"
    );

    Serial.println(
      "a proper analog signal from the sensor."
    );

    Serial.println();
    Serial.println("CHECK:");

    Serial.println(
      "1. Sensor VCC -> ESP32 3.3V"
    );

    Serial.println(
      "2. Sensor GND -> ESP32 GND"
    );

    Serial.println(
      "3. Sensor AO  -> ESP32 GPIO34"
    );

    Serial.println(
      "4. DO must NOT be connected to GPIO34"
    );

    Serial.println(
      "5. Check jumper wires"
    );

    Serial.println(
      "6. Try another ADC pin if necessary"
    );

    Serial.println();
  }


  // ----------------------------------------------------------
  // Very low value
  // ----------------------------------------------------------

  if (raw < 100)
  {
    Serial.println();

    Serial.println(
      "WARNING: ADC value is extremely low."
    );

    Serial.println(
      "Check sensor power and wiring."
    );
  }
}


// ============================================================
// READ DHT22
// ============================================================

bool readDHT(
  float &temperature,
  float &humidity
)
{
  humidity = dht.readHumidity();

  temperature = dht.readTemperature();


  if (isnan(humidity) ||
      isnan(temperature))
  {
    Serial.println();

    Serial.println(
      "ERROR: DHT22 read failed."
    );

    Serial.println(
      "Check DHT22 VCC, GND, DATA and resistor."
    );

    return false;
  }


  return true;
}


// ============================================================
// SEND DATA TO BACKEND
// ============================================================

bool sendReading(
  float temperature,
  float humidity,
  float soilMoisture
)
{
  // ----------------------------------------------------------
  // Backend disabled
  // ----------------------------------------------------------

  if (strlen(BACKEND_URL) == 0)
  {
    Serial.println();

    Serial.println(
      "Backend: DISABLED"
    );

    Serial.println(
      "Sensor-only testing mode."
    );

    return true;
  }


  // ----------------------------------------------------------
  // Check Wi-Fi
  // ----------------------------------------------------------

  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println(
      "Backend send skipped: Wi-Fi not connected."
    );

    return false;
  }


  // ----------------------------------------------------------
  // Create HTTP client
  // ----------------------------------------------------------

  HTTPClient http;


  String baseUrl = String(BACKEND_URL);
  if (baseUrl.endsWith("/"))
  {
    baseUrl.remove(baseUrl.length() - 1);
  }

  String url = baseUrl + "/api/sensors/data";


  Serial.println();
  Serial.println("----------------------------------------");
  Serial.println("BACKEND REQUEST");
  Serial.println("----------------------------------------");

  Serial.print("URL: ");
  Serial.println(url);


  if (!http.begin(url))
  {
    Serial.println(
      "ERROR: HTTP connection could not be initialized."
    );

    return false;
  }


  http.addHeader(
    "Content-Type",
    "application/json"
  );


  // ----------------------------------------------------------
  // JSON
  // ----------------------------------------------------------

  StaticJsonDocument<768> doc;


  doc["device_id"] =
    DEVICE_ID;

  doc["crop"] =
    CROP;

  doc["growth_stage"] =
    GROWTH_STAGE;

  doc["temperature"] =
    temperature;

  doc["humidity"] =
    humidity;

  doc["soil_moisture"] =
    soilMoisture;

  doc["rainfall_7d"] =
    0.0;


  String payload;


  serializeJson(
    doc,
    payload
  );


  Serial.print("Payload: ");
  Serial.println(payload);


  // ----------------------------------------------------------
  // POST
  // ----------------------------------------------------------

  int statusCode =
    http.POST(payload);


  if (statusCode >= 200 &&
      statusCode < 300)
  {
    Serial.print(
      "Backend response: HTTP "
    );

    Serial.println(statusCode);

    http.end();

    return true;
  }


  Serial.print(
    "Backend request failed. HTTP code: "
  );

  Serial.println(statusCode);


  if (statusCode > 0)
  {
    Serial.print(
      "Server response: "
    );

    Serial.println(
      http.getString()
    );
  }


  http.end();

  return false;
}


// ============================================================
// SENSOR TEST
// ============================================================

void performSensorTest()
{
  Serial.println();
  Serial.println();
  Serial.println("========================================");
  Serial.println("       GEOCROP SENSOR READING");
  Serial.println("========================================");


  // ----------------------------------------------------------
  // DHT22
  // ----------------------------------------------------------

  float temperature = 0;

  float humidity = 0;


  bool dhtOK =
    readDHT(
      temperature,
      humidity
    );


  if (!dhtOK)
  {
    Serial.println();

    Serial.println(
      "DHT22 STATUS: FAILED"
    );
  }
  else
  {
    Serial.println();

    Serial.println(
      "DHT22 STATUS: OK"
    );

    Serial.print(
      "Temperature: "
    );

    Serial.print(
      temperature,
      1
    );

    Serial.println(" C");


    Serial.print(
      "Humidity   : "
    );

    Serial.print(
      humidity,
      1
    );

    Serial.println(" %");
  }


  // ----------------------------------------------------------
  // SOIL
  // ----------------------------------------------------------

  int soilRaw =
    readSoilRaw();


  float soilMoisture =
    calculateSoilPercentage(
      soilRaw
    );


  Serial.println();

  Serial.print(
    "Soil RAW ADC: "
  );

  Serial.println(
    soilRaw
  );


  Serial.print(
    "Soil Moisture: "
  );

  Serial.print(
    soilMoisture,
    1
  );

  Serial.println(" %");


  // ----------------------------------------------------------
  // Soil diagnostics
  // ----------------------------------------------------------

  printSoilDiagnostics(
    soilRaw
  );


  // ----------------------------------------------------------
  // WIFI
  // ----------------------------------------------------------

  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.println();

    Serial.println(
      "Wi-Fi STATUS: CONNECTED"
    );

    Serial.print(
      "ESP32 IP: "
    );

    Serial.println(
      WiFi.localIP()
    );
  }
  else
  {
    Serial.println();

    Serial.println(
      "Wi-Fi STATUS: NOT CONNECTED"
    );
  }


  // ----------------------------------------------------------
  // BACKEND
  // ----------------------------------------------------------

  if (dhtOK)
  {
    sendReading(
      temperature,
      humidity,
      soilMoisture
    );
  }


  Serial.println();
  Serial.println("========================================");
  Serial.println(
    "Next reading in 5 seconds..."
  );
  Serial.println("========================================");
}


// ============================================================
// SETUP
// ============================================================

void setup()
{
  Serial.begin(115200);

  delay(2000);


  Serial.println();
  Serial.println();
  Serial.println("========================================");
  Serial.println("      GeoCrop ESP32 SENSOR TEST");
  Serial.println("========================================");

  Serial.println();
  Serial.println("GPS: DISABLED FOR THIS TEST");
  Serial.println("Testing DHT22 + Soil + Wi-Fi only.");


  // ----------------------------------------------------------
  // DHT22
  // ----------------------------------------------------------

  dht.begin();


  // ----------------------------------------------------------
  // ADC
  // ----------------------------------------------------------

  analogReadResolution(12);


  analogSetPinAttenuation(
    SOIL_MOISTURE_PIN,
    ADC_11db
  );


  // ----------------------------------------------------------
  // WIFI
  // ----------------------------------------------------------

  WiFi.mode(WIFI_STA);

  WiFi.setAutoReconnect(true);

  startWiFiConnection();


  Serial.println();

  Serial.println(
    "Hardware initialization complete."
  );


  Serial.println();
  Serial.println(
    "Starting sensor test..."
  );
}


// ============================================================
// LOOP
// ============================================================

void loop()
{
  // ----------------------------------------------------------
  // Maintain Wi-Fi
  // ----------------------------------------------------------

  maintainWiFi();


  // ----------------------------------------------------------
  // Detect Wi-Fi connection
  // ----------------------------------------------------------

  bool currentWiFiState =
    WiFi.status() == WL_CONNECTED;


  if (currentWiFiState &&
      !previousWiFiState)
  {
    printWiFiInformation();
  }


  previousWiFiState =
    currentWiFiState;


  // ----------------------------------------------------------
  // Sensor interval
  // ----------------------------------------------------------

  if (
    millis() - lastSensorRead
    >= SENSOR_INTERVAL_MS
  )
  {
    lastSensorRead =
      millis();


    performSensorTest();
  }
}