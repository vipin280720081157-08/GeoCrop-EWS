"""Report — metadata for generated PDF reports (daily / weekly / historical)."""
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime

from app.database.base import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String, nullable=False)  # daily | weekly | historical
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
