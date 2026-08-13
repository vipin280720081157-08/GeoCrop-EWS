# Deployment Guide

This project deploys as two services:

- **Backend** → [Render](https://render.com) (FastAPI + PostgreSQL)
- **Frontend** → [Vercel](https://vercel.com) (static Vite build)

Final data flow once deployed:

```
ESP32 → Render Backend → PostgreSQL → Prediction → Frontend (Vercel)
```

---

## 1. PostgreSQL Database (Render)

1. In the Render dashboard: **New → PostgreSQL**.
2. Choose a name (e.g. `geocrop-ews-db`), region, and the free/starter plan.
3. Once created, copy the **Internal Database URL** (for the backend service,
   same region) or **External Database URL** (for connecting from your own
   machine) — format:
   ```
   postgresql://<user>:<password>@<host>/<dbname>
   ```

## 2. Backend (Render Web Service)

1. Push this repository to GitHub/GitLab.
2. In Render: **New → Web Service** → connect your repo → set **Root
   Directory** to `backend`.
3. **Environment**: Python 3.
4. **Build Command**:
   ```
   pip install -r requirements.txt
   ```
5. **Start Command**:
   ```
   alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
6. **Environment Variables**:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | the PostgreSQL Internal Database URL from step 1 |
   | `CORS_ORIGINS` | `https://your-frontend.vercel.app` (add `http://localhost:5173` too while testing) |
   | `APP_ENV` | `production` |
7. Deploy. Once live, verify:
   ```
   curl https://<your-backend>.onrender.com/api/health
   ```
8. If you have a trained model, upload `trained_model.pkl` and
   `label_encoder.pkl` into `backend/model/` and redeploy (or use Render's
   persistent disk / a build step to fetch them from storage).

### CORS

`CORS_ORIGINS` is a comma-separated list read by `app/config.py`. Always
include the exact Vercel URL (and any custom domain) your frontend is
served from, or browser requests will be blocked.

## 3. Frontend (Vercel)

1. In Vercel: **New Project** → import the same repo → set **Root
   Directory** to `frontend`.
2. **Framework Preset**: Vite.
3. **Build Command**: `npm run build` (default).
4. **Output Directory**: `dist` (default).
5. **Environment Variables**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-backend>.onrender.com` |
6. Deploy. Vercel gives you a URL like `https://geocrop-ews.vercel.app`.
7. Go back to the Render backend and update `CORS_ORIGINS` to include this
   exact URL, then redeploy the backend.

## 4. ESP32 → Production Backend

Update `hardware/esp32/esp32_sensor_client.ino`:
```cpp
const char* BACKEND_URL = "https://<your-backend>.onrender.com";
```
Re-upload the sketch. The device now posts directly to the deployed API.

> Note: Render free-tier web services can spin down after inactivity, so the
> first request (or first ESP32 POST) after idle time may take ~30–60s to
> respond while the service wakes up.

---

## Local → Production Checklist

- [ ] `alembic upgrade head` run against the production database (the Render
      start command above does this automatically on every deploy)
- [ ] `CORS_ORIGINS` includes the live Vercel URL
- [ ] `VITE_API_URL` points at the live Render URL (not `localhost`)
- [ ] ESP32 `BACKEND_URL` points at the live Render URL
- [ ] `backend/model/trained_model.pkl` + `label_encoder.pkl` present if you
      want real ML predictions instead of the rule-based fallback

---

## Database Migrations in Production

Alembic is the source of truth in production (unlike local dev, which also
auto-creates tables on startup for convenience). To run a new migration
after changing models:

```bash
cd backend
alembic revision --autogenerate -m "describe your change"
alembic upgrade head        # apply locally to verify
git push                    # Render will run "alembic upgrade head" again on deploy
```
