"""
GeoCrop EWS — Hardware Telemetry Simulator & Test Utility
---------------------------------------------------------
This script simulates an ESP32 device posting real-time hardware telemetry
(DHT22 Temperature & Humidity, Capacitive Soil Moisture, and NEO-6M GPS)
to the GeoCrop FastAPI backend server at http://127.0.0.1:8000/api/sensors/data.

Use this utility to test live hardware integration on the frontend application!
"""

import time
import random
import json
import urllib.request

BACKEND_URL = "http://127.0.0.1:8000/api/sensors/data"
DEVICE_ID = "ESP32_01"
CROP = "turmeric"
GROWTH_STAGE = "seed_rhizome_sprouting"

def send_telemetry():
    temp = round(random.uniform(26.0, 30.5), 1)
    humidity = round(random.uniform(72.0, 84.0), 1)
    soil_moisture = round(random.uniform(55.0, 68.0), 1)
    latitude = 11.3410
    longitude = 77.7172
    
    payload = {
        "device_id": DEVICE_ID,
        "crop": CROP,
        "growth_stage": GROWTH_STAGE,
        "temperature": temp,
        "humidity": humidity,
        "soil_moisture": soil_moisture,
        "rainfall_7d": 5.0,
        "latitude": latitude,
        "longitude": longitude
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(BACKEND_URL, data=data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 201:
                print(f"[ESP32 Telemetry Sent] Temp: {temp}°C | Hum: {humidity}% | Soil: {soil_moisture}% | Status: HTTP 201")
            else:
                print(f"[Response] HTTP {response.status}")
    except Exception as e:
        print(f"[Connection Info] Backend server at {BACKEND_URL} offline or starting: {e}")

if __name__ == "__main__":
    print("==================================================")
    print("      GeoCrop ESP32 Hardware Simulator")
    print("==================================================")
    print(f"Target URL : {BACKEND_URL}")
    print(f"Device ID  : {DEVICE_ID}")
    print(f"Crop       : {CROP} ({GROWTH_STAGE})")
    print("Press Ctrl+C to stop transmitting.")
    print("==================================================")

    while True:
        send_telemetry()
        time.sleep(5)
