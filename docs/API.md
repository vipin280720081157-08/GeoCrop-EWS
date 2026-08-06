# API Reference — GeoCrop EWS Backend

Base URL (local): `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs` (Swagger UI) or `/redoc`

All responses are JSON. All timestamps are UTC ISO-8601 strings.

---

## Health

### `GET /api/health`
Simple liveness check used by Render and the frontend.

**Response**
```json
{ "status": "ok", "service": "GeoCrop EWS API" }
```

---

## Dashboard

### `GET /api/dashboard`
Aggregated payload that powers the Dashboard page: latest sensor reading,
latest prediction, 7-day trend, alerts, and device connectivity.

**Response**
```json
{
  "latest_sensor": { "...": "SensorReading" },
  "latest_prediction": { "...": "Prediction" },
  "trend_7d": [{ "date": "Aug 04", "temperature": 29.6, "humidity": 74.2, "soil_moisture": 66.1, "risk_score": 72, "readiness": 58 }],
  "alerts": [{ "level": "High", "text": "Rice Blast risk updated to High", "time": "Just now" }],
  "device_connected": true
}
```

---

## Sensors

### `POST /api/sensors/data`
Called by the ESP32 every ~30 seconds.

**Body**
```json
{
  "device_id": "ESP32_01",
  "crop": "Rice",
  "growth_stage": "Panicle Initiation",
  "temperature": 29.6,
  "humidity": 82.0,
  "soil_moisture": 68.5,
  "rainfall_7d": 58.2,
  "latitude": 10.7867,
  "longitude": 79.1378
}
```
**Response** `201 Created` — the stored `SensorReading` (includes `id`, `created_at`).

### `GET /api/sensors/latest`
Returns the single most recent sensor reading. `404` if none exist yet.

### `GET /api/sensors/history?days=30&limit=500`
Returns readings from the last `days` days (default 30), oldest first.

---

## Predictions

### `POST /api/predict`
Runs the ML model (or rule-based fallback) + Decision Support Engine.

**Body (optional)** — if omitted, uses the most recent stored sensor reading:
```json
{ "crop": "Rice", "temperature": 29.6, "humidity": 82.0, "soil_moisture": 68.5, "rainfall_7d": 58.2 }
```

**Response** — a `Prediction` object including `factors`, `recommendations`,
`explanation`, `risk_level`, `risk_score`, `confidence`, `readiness_score`.

### `GET /api/predictions/latest`
Most recently stored prediction. `404` if none exist yet.

### `GET /api/predictions/history?limit=50`
Most recent predictions, newest first (powers the Historical Analytics table).

---

## Reports

### `GET /api/reports`
List of previously generated report metadata (id, type, file name, created_at).

### `POST /api/reports/pdf`
Generates a PDF report from the latest sensor + prediction data and returns
it as a downloadable file (`application/pdf`).

**Body**
```json
{ "report_type": "daily" }
```
`report_type` is one of `daily`, `weekly`, `historical`.

### `GET /api/reports/{report_id}/download`
Re-downloads a previously generated report by id.

---

## Settings

### `GET /api/settings`
Returns the single application settings row (created with defaults on first
access).

### `PUT /api/settings`
Partial update — send only the fields you want to change.
```json
{ "crop": "Tomato", "humidity_threshold": 75 }
```

---

## Error format

FastAPI's default error shape is used throughout:
```json
{ "detail": "No sensor readings available yet." }
```
