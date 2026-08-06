"""
Report endpoints.

GET  /api/reports      — list previously generated reports.
POST /api/reports/pdf  — generate a new PDF report (daily/weekly/historical)
                          from the latest sensor + prediction data and
                          return it as a downloadable file.
"""
import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.sensor_reading import SensorReading
from app.models.prediction import Prediction
from app.models.report import Report
from app.schemas.report import ReportRequest, ReportOut
from app.services.report_generator import generate_report_pdf
from app.services.decision_support import build_recommendations

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("", response_model=list[ReportOut])
def list_reports(db: Session = Depends(get_db)):
    return db.query(Report).order_by(Report.created_at.desc()).limit(50).all()


@router.post("/pdf")
def create_report_pdf(payload: ReportRequest, db: Session = Depends(get_db)):
    sensor = db.query(SensorReading).order_by(SensorReading.created_at.desc()).first()
    prediction = db.query(Prediction).order_by(Prediction.created_at.desc()).first()

    if not sensor or not prediction:
        raise HTTPException(status_code=404, detail="Not enough data yet to generate a report.")

    sensor_dict = {
        "crop": sensor.crop, "temperature": sensor.temperature, "humidity": sensor.humidity,
        "soil_moisture": sensor.soil_moisture, "rainfall_7d": sensor.rainfall_7d or 0.0,
        "latitude": sensor.latitude, "longitude": sensor.longitude,
    }
    prediction_dict = {
        "disease": prediction.disease, "risk_level": prediction.risk_level,
        "risk_score": prediction.risk_score, "confidence": prediction.confidence,
        "readiness_score": prediction.readiness_score, "explanation": prediction.explanation,
    }
    recommendations = prediction.recommendations or build_recommendations(prediction_dict, sensor_dict, sensor.crop)

    file_name, file_path = generate_report_pdf(payload.report_type, sensor_dict, prediction_dict, recommendations)

    report = Report(report_type=payload.report_type, file_name=file_name, file_path=file_path)
    db.add(report)
    db.commit()

    return FileResponse(file_path, media_type="application/pdf", filename=file_name)


@router.get("/{report_id}/download")
def download_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report or not os.path.exists(report.file_path):
        raise HTTPException(status_code=404, detail="Report file not found.")
    return FileResponse(report.file_path, media_type="application/pdf", filename=report.file_name)
