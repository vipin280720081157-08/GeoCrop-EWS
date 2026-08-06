"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-08-04
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "sensor_readings",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("device_id", sa.String, nullable=False, server_default="ESP32_01"),
        sa.Column("crop", sa.String, nullable=False, server_default="Rice"),
        sa.Column("growth_stage", sa.String, nullable=True),
        sa.Column("temperature", sa.Float, nullable=False),
        sa.Column("humidity", sa.Float, nullable=False),
        sa.Column("soil_moisture", sa.Float, nullable=False),
        sa.Column("rainfall_7d", sa.Float, nullable=True, server_default="0"),
        sa.Column("latitude", sa.Float, nullable=True),
        sa.Column("longitude", sa.Float, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=True),
    )
    op.create_index("ix_sensor_readings_device_id", "sensor_readings", ["device_id"])
    op.create_index("ix_sensor_readings_created_at", "sensor_readings", ["created_at"])

    op.create_table(
        "predictions",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("sensor_reading_id", sa.Integer, sa.ForeignKey("sensor_readings.id"), nullable=True),
        sa.Column("crop", sa.String, nullable=False),
        sa.Column("disease", sa.String, nullable=False),
        sa.Column("risk_level", sa.String, nullable=False),
        sa.Column("risk_score", sa.Integer, nullable=False),
        sa.Column("confidence", sa.Float, nullable=False),
        sa.Column("readiness_score", sa.Integer, nullable=True),
        sa.Column("readiness_label", sa.String, nullable=True),
        sa.Column("factors", sa.JSON, nullable=True),
        sa.Column("recommendations", sa.JSON, nullable=True),
        sa.Column("explanation", sa.String, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=True),
    )
    op.create_index("ix_predictions_created_at", "predictions", ["created_at"])

    op.create_table(
        "reports",
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        sa.Column("report_type", sa.String, nullable=False),
        sa.Column("file_name", sa.String, nullable=False),
        sa.Column("file_path", sa.String, nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=True),
    )
    op.create_index("ix_reports_created_at", "reports", ["created_at"])

    op.create_table(
        "settings",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("crop", sa.String, server_default="Rice"),
        sa.Column("temp_unit", sa.String, server_default="Celsius"),
        sa.Column("rain_unit", sa.String, server_default="mm"),
        sa.Column("humidity_threshold", sa.Float, server_default="78"),
        sa.Column("soil_threshold", sa.Float, server_default="80"),
        sa.Column("risk_threshold", sa.Float, server_default="70"),
        sa.Column("notify_high_risk", sa.Integer, server_default="1"),
        sa.Column("notify_daily_report", sa.Integer, server_default="1"),
        sa.Column("notify_sensor_offline", sa.Integer, server_default="0"),
        sa.Column("notify_weekly_summary", sa.Integer, server_default="1"),
    )


def downgrade():
    op.drop_table("settings")
    op.drop_table("reports")
    op.drop_index("ix_predictions_created_at", table_name="predictions")
    op.drop_table("predictions")
    op.drop_index("ix_sensor_readings_created_at", table_name="sensor_readings")
    op.drop_index("ix_sensor_readings_device_id", table_name="sensor_readings")
    op.drop_table("sensor_readings")
