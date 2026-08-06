"""Pydantic schemas for report metadata and PDF generation requests."""
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel

ReportType = Literal["daily", "weekly", "historical"]


class ReportRequest(BaseModel):
    report_type: ReportType = "daily"


class ReportOut(BaseModel):
    id: int
    report_type: str
    file_name: str
    created_at: datetime

    class Config:
        from_attributes = True
