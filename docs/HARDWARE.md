# Hardware Guide — ESP32 Field Unit

This guide covers wiring, configuration, uploading firmware, and verifying
that data reaches the backend.

See also: `hardware/wiring_diagram.png` and `hardware/esp32/esp32_sensor_client.ino`.

## Components

| Component | Purpose |
|---|---|
| ESP32 Dev Board | Reads sensors, connects to Wi-Fi, POSTs data |
| DHT22 | Air temperature + relative humidity |
| Capacitive Soil Moisture Sensor v2.0 | Soil moisture % |
| GPS Module (e.g. NEO-6M) | Field latitude/longitude |
| Breadboard + jumper wires | Prototyping |
| 5V USB power supply (or battery + regulator) | Power |

## Wiring

| Sensor Pin | ESP32 Pin | Notes |
|---|---|---|
| DHT22 `DATA` | `GPIO4` | Add a 10kΩ pull-up resistor between DATA and VCC if not built into your module |
| DHT22 `VCC` | `3V3` or `5V` | Check your module's rating |
| DHT22 `GND` | `GND` | |
| Soil Sensor `AOUT` | `GPIO34` (ADC1) | Must be an ADC1 pin — ADC2 pins conflict with Wi-Fi |
| Soil Sensor `VCC` | `3V3` | |
| Soil Sensor `GND` | `GND` | |
| GPS `TX` | `GPIO16` (RX2) | ESP32 receives on this pin |
| GPS `RX` | `GPIO17` (TX2) | ESP32 transmits on this pin |
| GPS `VCC` | `3V3` or `5V` | Check your module's rating |
| GPS `GND` | `GND` | |

All grounds (ESP32, DHT22, soil sensor, GPS) must be common.

## Soil Moisture Calibration

Capacitive sensors output a raw ADC value (0–4095 on ESP32) that is **higher
in dry air and lower when wet** (inverse of what you'd expect). Before first
use:

1. Upload a simple sketch that just prints `analogRead(34)`.
2. Note the reading in **completely dry air** → this is `SOIL_ADC_DRY`.
3. Note the reading **fully submerged in a glass of water** → this is `SOIL_ADC_WET`.
4. Update these two constants at the top of `esp32_sensor_client.ino`.

## Wi-Fi & Backend Configuration

Open `hardware/esp32/esp32_sensor_client.ino` and edit the configuration
block near the top:

```cpp
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* BACKEND_URL   = "http://192.168.1.50:8000";   // local dev
// const char* BACKEND_URL = "https://geocrop-ews-api.onrender.com"; // production
const char* DEVICE_ID     = "ESP32_01";
const char* CROP          = "Rice";
```

For local development, use your computer's LAN IP address (not
`localhost`, since the ESP32 is a separate device on the network) — find it
with `ipconfig` (Windows) or `ifconfig` / `ip addr` (macOS/Linux).

## Uploading the Firmware

1. Install the [Arduino IDE](https://www.arduino.cc/en/software) (or use
   PlatformIO).
2. In Arduino IDE → **Preferences**, add this Additional Board Manager URL:
   `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. **Tools → Board → Boards Manager** → search "esp32" → install.
4. **Tools → Board** → select your specific ESP32 dev board.
5. Install libraries via **Sketch → Include Library → Manage Libraries**:
   - `DHT sensor library` (Adafruit)
   - `Adafruit Unified Sensor`
   - `TinyGPSPlus`
   - `ArduinoJson`
6. Connect the ESP32 via USB, select the correct **Port**.
7. Click **Upload**.
8. Open **Tools → Serial Monitor** at `115200` baud to see connection and
   send logs.

## Verifying Data Reaches the Backend

1. Start the backend locally (`uvicorn app.main:app --reload`, see the
   root README).
2. Watch the Serial Monitor — you should see `POST http://.../api/sensors/data`
   followed by `Sent OK (HTTP 201)` every 30 seconds.
3. Confirm from the backend side:
   ```bash
   curl http://localhost:8000/api/sensors/latest
   ```
   should return the reading you just sent.
4. Open the frontend's **Live Monitoring** page — values should update
   automatically within a few seconds of the next successful send.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Failed to read from DHT22 sensor` | Check wiring/pull-up resistor; DHT22 needs ~2s between reads |
| Soil moisture always 0% or 100% | Recalibrate `SOIL_ADC_DRY` / `SOIL_ADC_WET` |
| GPS `Fix=no` indefinitely | GPS needs a clear sky view; first fix can take several minutes outdoors |
| `WiFi connection failed` | Double-check SSID/password; ESP32 only supports 2.4GHz networks |
| `Send failed (HTTP 0)` | Backend unreachable — check `BACKEND_URL`, firewall, and that the backend is running |
| `Send failed (HTTP 422)` | Payload validation error — check field types/ranges match `SensorDataIn` in `app/schemas/sensor.py` |
