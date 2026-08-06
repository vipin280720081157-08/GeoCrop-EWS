# GeoCrop EWS

**Geographic Crop Disease Early Warning and Decision Support System**

An IoT + Machine Learning + GIS based decision support platform that helps
farmers detect crop disease risk *before* visible symptoms appear —
combining real-time field sensors, a disease-prediction model, and a
Decision Support Engine that turns predictions into practical, preventive
guidance. Built for Rice and Tomato.

This is a hackathon-grade professional prototype: no login, no user
accounts — it opens straight to the Dashboard.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Technologies Used](#technologies-used)
4. [Hardware Components](#hardware-components)
5. [Software Requirements](#software-requirements)
6. [Local Installation](#local-installation)
7. [Hardware Guide](#hardware-guide)
8. [AI Model Guide](#ai-model-guide)
9. [Deployment Guide](#deployment-guide)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

```
ESP32 (DHT22 + Soil Moisture + GPS)
        │  Wi-Fi / HTTP JSON
        ▼
FastAPI Backend
        │
        ├──► SQLite (local) / PostgreSQL (Render)
        │
        ├──► Random Forest Model (with rule-based fallback)
        │
        ▼
Decision Support Engine
        │
        ▼
React Dashboard (Vercel)
```

The frontend has 8 pages: **Dashboard, Live Monitoring, Disease Prediction,
Decision Support, Historical Analytics, GIS Map, Reports, Settings** — all
consuming real backend APIs, no mock data.

---

## Folder Structure

```
GeoCrop-EWS/
├── frontend/                # React + TypeScript + Vite + Tailwind
│   ├── src/
│   │   ├── components/      # Reusable UI: Card, Sidebar, Header, StatCard...
│   │   ├── pages/            # The 8 dashboard pages
│   │   ├── layouts/          # DashboardLayout (sidebar + header shell)
│   │   ├── hooks/             # useSensorData, usePrediction, usePolling
│   │   ├── services/          # Axios API calls
│   │   ├── utils/              # constants, formatting, color tokens
│   │   ├── types/               # Shared TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
├── backend/                  # FastAPI + SQLAlchemy + Alembic
│   ├── app/
│   │   ├── api/                # Route handlers (dashboard, sensors, predictions, reports, settings, health)
│   │   ├── database/             # Engine/session + declarative base
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   ├── schemas/                  # Pydantic request/response schemas
│   │   ├── services/                   # Decision support, dashboard aggregation, PDF generation
│   │   ├── ml/                           # predict.py + feature engineering
│   │   ├── main.py
│   │   └── config.py
│   ├── model/                # trained_model.pkl + label_encoder.pkl (bring your own)
│   ├── alembic/               # Database migrations
│   ├── requirements.txt
│   └── .env.example
│
├── hardware/
│   ├── esp32/esp32_sensor_client.ino
│   └── wiring_diagram.png
│
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── HARDWARE.md
│
└── README.md                 # you are here
```

---

## Technologies Used

**Frontend:** React, TypeScript, Vite, TailwindCSS, React Router, Axios, Recharts, React Leaflet
**Backend:** FastAPI, SQLAlchemy, Alembic, Pydantic, Uvicorn
**Database:** SQLite (development) → PostgreSQL (production, Render)
**AI:** Scikit-learn, Joblib
**Hardware:** ESP32, DHT22, Capacitive Soil Moisture Sensor, GPS Module
**Deployment:** Vercel (frontend), Render (backend + PostgreSQL)

---

## Hardware Components

| Component | Purpose |
|---|---|
| ESP32 Dev Board | Wi-Fi microcontroller, reads sensors and POSTs data |
| DHT22 | Air temperature + humidity |
| Capacitive Soil Moisture Sensor | Soil moisture % |
| GPS Module (e.g. NEO-6M) | Field GPS coordinates |

Full wiring instructions: [`docs/HARDWARE.md`](docs/HARDWARE.md) and
[`hardware/wiring_diagram.png`](hardware/wiring_diagram.png).

---

## Software Requirements

- **Node.js** 18+ and npm (frontend)
- **Python** 3.11+ (backend)
- **Arduino IDE** or PlatformIO (ESP32 firmware)
- Git

---

## Local Installation

Clone the repository first:
```bash
git clone <your-repo-url>
cd GeoCrop-EWS
```

### Backend

All commands below are run **from the `backend/` folder**.

```bash
cd backend

# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy environment variables and adjust if needed
cp .env.example .env            # Windows: copy .env.example .env

# 4. Apply database migrations (creates geocrop.db locally via SQLite)
alembic upgrade head

# 5. Start the API server (auto-reloads on code changes)
uvicorn app.main:app --reload
```

The API is now running at **http://localhost:8000** (docs at `/docs`).

> Tip: the backend also auto-creates tables on startup as a convenience, so
> even skipping step 4 will work for a quick local try — but running
> Alembic migrations is the recommended path, especially before deploying.

### Frontend

All commands below are run **from the `frontend/` folder**, in a separate
terminal.

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env            # Windows: copy .env.example .env
# Ensure VITE_API_URL=http://localhost:8000 inside .env

# 3. Start the dev server
npm run dev
```

Open **http://localhost:5173** — the app opens directly on the Dashboard.

### Seeing real data

Until the ESP32 hardware is connected (or the model files are added), you
can simulate a sensor reading with `curl` to see the full pipeline work
end-to-end:

```bash
curl -X POST http://localhost:8000/api/sensors/data \
  -H "Content-Type: application/json" \
  -d '{"device_id":"ESP32_01","crop":"Rice","growth_stage":"Panicle Initiation","temperature":29.6,"humidity":82.0,"soil_moisture":68.5,"rainfall_7d":58.2,"latitude":10.7867,"longitude":79.1378}'

curl -X POST http://localhost:8000/api/predict
```

Refresh the frontend — Dashboard, Live Monitoring, Disease Prediction, and
Decision Support will all populate from this real stored data.

---

## Hardware Guide

See [`docs/HARDWARE.md`](docs/HARDWARE.md) for:
- Full wiring tables (DHT22, soil sensor, GPS, ESP32 GPIO pins)
- Power supply notes
- Soil sensor calibration steps
- Wi-Fi / backend URL configuration
- Uploading the Arduino sketch
- Verifying data reaches the backend

---

## AI Model Guide

The ML module lives at `backend/app/ml/predict.py`. It automatically loads
`backend/model/trained_model.pkl` + `backend/model/label_encoder.pkl` with
Joblib if present; otherwise it uses a deterministic, agronomically-informed
rule-based fallback so the whole app works out of the box.

See [`backend/model/README.md`](backend/model/README.md) for:
- Where exactly to place the two `.pkl` files
- The exact feature order the model must expect
- How to train and swap in your own model (no other backend code changes needed)

---

## Deployment Guide

Full step-by-step instructions: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

Summary:
- **Backend + PostgreSQL** → Render (`alembic upgrade head` runs automatically on each deploy)
- **Frontend** → Vercel (set `VITE_API_URL` to your Render backend URL)
- Update `CORS_ORIGINS` on the backend to include your live Vercel URL
- Point the ESP32's `BACKEND_URL` at the deployed Render URL

---

## Troubleshooting

| Area | Symptom | Fix |
|---|---|---|
| Backend | `ModuleNotFoundError` on startup | Ensure the virtual environment is activated and `pip install -r requirements.txt` succeeded |
| Backend | `sqlite3.OperationalError: unable to open database file` | Run commands from inside `backend/`, not the repo root |
| Backend | `alembic.util.exc.CommandError: Can't locate revision` | Delete `geocrop.db` and re-run `alembic upgrade head` for a clean local DB |
| Frontend | Blank page / network errors in console | Confirm the backend is running and `VITE_API_URL` in `frontend/.env` matches it |
| Frontend | CORS error in browser console | Add the frontend's exact origin to `CORS_ORIGINS` in `backend/.env` and restart the backend |
| Database | Can't connect to PostgreSQL in production | Double check `DATABASE_URL` format: `postgresql://user:pass@host/dbname`; ensure `psycopg2-binary` is installed |
| ESP32 | Data never appears in `/api/sensors/latest` | Confirm `BACKEND_URL` uses your computer's LAN IP (not `localhost`) during local testing, and that both devices share the same Wi-Fi network |
| Deployment | 502/504 from Render right after deploy | Free-tier services can take ~30-60s to wake from idle — retry after a short wait |
| Model | Predictions look generic / same every time | This is expected until `trained_model.pkl` + `label_encoder.pkl` are added — see the AI Model Guide above |

For more targeted guidance:
- API-specific issues → [`docs/API.md`](docs/API.md)
- Hardware-specific issues → [`docs/HARDWARE.md`](docs/HARDWARE.md)
- Deployment-specific issues → [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

---

## License

Built for hackathon demonstration purposes. Adapt freely for your own
agricultural monitoring deployments.
