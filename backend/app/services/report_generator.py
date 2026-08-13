"""
PDF report generation using ReportLab.

Generates a clean, single-page report (daily / weekly / historical) that
mirrors the visual language of the dashboard (same color palette) and
includes: sensor readings, GPS, prediction, confidence, risk, recommendations
and timestamp, as required by the project spec.
"""
import os
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

COLORS = {
    "primary": (0x2E / 255, 0x7D / 255, 0x32 / 255),
    "secondary": (0x15 / 255, 0x65 / 255, 0xC0 / 255),
    "error": (0xD3 / 255, 0x2F / 255, 0x2F / 255),
    "warning": (0xFB / 255, 0x8C / 255, 0x00 / 255),
    "success": (0x43 / 255, 0xA0 / 255, 0x47 / 255),
    "text": (0x26 / 255, 0x32 / 255, 0x38 / 255),
    "secondary_text": (0x60 / 255, 0x7D / 255, 0x8B / 255),
    "border": (0.878, 0.878, 0.878),
}

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "generated_reports")
os.makedirs(REPORTS_DIR, exist_ok=True)


def _risk_color(level: str):
    return {"High": COLORS["error"], "Medium": COLORS["warning"], "Low": COLORS["success"]}.get(level, COLORS["text"])


def generate_report_pdf(report_type: str, sensor: dict, prediction: dict, recommendations: list[dict]) -> tuple[str, str]:
    """Builds the PDF and returns (file_name, absolute_file_path)."""
    timestamp = datetime.utcnow()
    file_name = f"{report_type}_report_{timestamp.strftime('%Y%m%d_%H%M%S')}.pdf"
    file_path = os.path.join(REPORTS_DIR, file_name)

    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4
    margin = 20 * mm
    y = height - margin

    # Header
    c.setFillColorRGB(*COLORS["primary"])
    c.rect(0, height - 26 * mm, width, 26 * mm, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(margin, height - 12 * mm, "Geographic Crop Disease Early Warning")
    c.setFont("Helvetica", 10)
    c.drawString(margin, height - 19 * mm, f"{report_type.capitalize()} Report  ·  Generated {timestamp.strftime('%Y-%m-%d %H:%M UTC')}")

    y = height - 38 * mm
    c.setFillColorRGB(*COLORS["text"])
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "Field & Environmental Conditions")
    y -= 8 * mm

    rows = [
        ("Crop", sensor.get("crop", "-")),
        ("Temperature", f"{sensor.get('temperature', 0):.1f} °C"),
        ("Humidity", f"{sensor.get('humidity', 0):.1f} %"),
        ("Soil Moisture", f"{sensor.get('soil_moisture', 0):.1f} %"),
        ("Rainfall (7d)", f"{sensor.get('rainfall_7d', 0):.1f} mm"),
        ("GPS Location", f"{sensor.get('latitude', '-')}, {sensor.get('longitude', '-')}"),
    ]
    c.setFont("Helvetica", 10)
    for label, value in rows:
        c.setFillColorRGB(*COLORS["secondary_text"])
        c.drawString(margin, y, label)
        c.setFillColorRGB(*COLORS["text"])
        c.drawRightString(width - margin, y, str(value))
        c.setStrokeColorRGB(*COLORS["border"])
        c.line(margin, y - 2 * mm, width - margin, y - 2 * mm)
        y -= 8 * mm

    y -= 4 * mm
    c.setFillColorRGB(*COLORS["text"])
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "Disease Prediction")
    y -= 8 * mm

    pred_rows = [
        ("Predicted Disease", prediction.get("disease", "-")),
        ("Risk Level", prediction.get("risk_level", "-")),
        ("Risk Score", f"{prediction.get('risk_score', 0)} / 100"),
        ("Confidence Score", f"{prediction.get('confidence', 0)}%"),
        ("Field Readiness Score", f"{prediction.get('readiness_score', '-')} / 100"),
    ]
    c.setFont("Helvetica", 10)
    for label, value in pred_rows:
        c.setFillColorRGB(*COLORS["secondary_text"])
        c.drawString(margin, y, label)
        if label == "Risk Level":
            c.setFillColorRGB(*_risk_color(str(value)))
        else:
            c.setFillColorRGB(*COLORS["text"])
        c.setFont("Helvetica-Bold", 10)
        c.drawRightString(width - margin, y, str(value))
        c.setFont("Helvetica", 10)
        c.setStrokeColorRGB(*COLORS["border"])
        c.line(margin, y - 2 * mm, width - margin, y - 2 * mm)
        y -= 8 * mm

    if prediction.get("explanation"):
        y -= 4 * mm
        c.setFillColorRGB(*COLORS["text"])
        c.setFont("Helvetica-Bold", 11)
        c.drawString(margin, y, "AI Explanation")
        y -= 6 * mm
        c.setFont("Helvetica", 9)
        c.setFillColorRGB(*COLORS["secondary_text"])
        text_obj = c.beginText(margin, y)
        text_obj.setLeading(12)
        for line in _wrap_text(prediction["explanation"], 95):
            text_obj.textLine(line)
        c.drawText(text_obj)
        y -= (len(_wrap_text(prediction["explanation"], 95)) * 4.2 * mm) + 4 * mm

    y -= 2 * mm
    c.setFillColorRGB(*COLORS["text"])
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "Preventive Recommendations")
    y -= 8 * mm
    c.setFont("Helvetica", 10)
    for i, rec in enumerate(recommendations, start=1):
        c.setFillColorRGB(*COLORS["text"])
        for line in _wrap_text(f"{i}. [{rec['priority']}] {rec['text']}", 100):
            c.drawString(margin, y, line)
            y -= 6 * mm

    c.setFillColorRGB(*COLORS["secondary_text"])
    c.setFont("Helvetica-Oblique", 8)
    c.drawString(margin, 15 * mm, "Generated automatically by the GeoCrop EWS Decision Support Engine.")

    c.showPage()
    c.save()
    return file_name, file_path


def _wrap_text(text: str, width: int) -> list[str]:
    words = text.split()
    lines, current = [], ""
    for w in words:
        if len(current) + len(w) + 1 <= width:
            current = f"{current} {w}".strip()
        else:
            lines.append(current)
            current = w
    if current:
        lines.append(current)
    return lines
