"""
GeoCrop Development Utility — Reset Local Development Database

This script safely clears all telemetry sensor records, predictions, and
generated report records from the local development SQLite database (`geocrop.db`),
resetting the application to an honest empty real-data state.

Usage:
    python scripts/reset_dev_data.py

Safety:
- Does NOT delete table schemas or migration history.
- Prompts for confirmation in interactive mode, or accepts `--yes` flag.
"""

import sys
import os
from pathlib import Path

# Add backend directory to path
root_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(root_dir / "backend"))

def reset_dev_database(auto_confirm: bool = False):
    db_path = root_dir / "backend" / "geocrop.db"
    
    if not db_path.exists():
        print(f"Local SQLite database file does not exist at: {db_path}")
        print("Nothing to reset.")
        return

    if not auto_confirm:
        print("WARNING: This will clear all local sensor readings, predictions, and report archives from geocrop.db.")
        answer = input("Are you sure you want to reset local development data? (y/N): ").strip().lower()
        if answer not in ("y", "yes"):
            print("Reset cancelled.")
            return

    try:
        from app.database.base import init_db
        from app.database.session import engine, SessionLocal
        from app.models.sensor_reading import SensorReading
        from app.models.prediction import Prediction
        from app.models.report import Report
        
        init_db()
        db = SessionLocal()
        num_preds = db.query(Prediction).delete()
        num_sensors = db.query(SensorReading).delete()
        num_reports = db.query(Report).delete()
        db.commit()
        db.close()

        print(f"Success! Local database reset completed:")
        print(f"  - Deleted {num_sensors} sensor readings")
        print(f"  - Deleted {num_preds} prediction logs")
        print(f"  - Deleted {num_reports} report records")
        print("\nGeoCrop is now running in an honest empty real-data state.")

    except Exception as e:
        print(f"Error resetting database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    auto_confirm = "--yes" in sys.argv or "-y" in sys.argv
    reset_dev_database(auto_confirm=auto_confirm)
