"""
Backend API Tests for GeoCrop EWS.
Tests endpoints directly without requiring external HTTP client packages.
"""

import unittest
from app.api.health import health_check
from app.api.dashboard import get_dashboard
from app.ml.predict import predict, get_model_status_per_crop
from app.database.base import init_db
from app.database.session import SessionLocal, engine

class TestGeoCropAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()

    def test_health_check(self):
        res = health_check()
        self.assertEqual(res.get("status"), "ok")
        self.assertIn("models_status", res)
        self.assertIn("Paddy", res["models_status"])
        self.assertIn("Turmeric", res["models_status"])
        self.assertIn("Tomato", res["models_status"])

    def test_predict_function(self):
        sensor_data = {
            "crop": "Paddy",
            "temperature": 29.5,
            "humidity": 85.0,
            "soil_moisture": 70.0,
            "rainfall_7d": 40.0
        }
        res = predict(sensor_data)
        self.assertEqual(res.get("crop"), "Paddy")
        self.assertIn("disease", res)
        self.assertIn("risk_level", res)
        self.assertIn("risk_score", res)
        self.assertEqual(res.get("source"), "rule_based_fallback")

    def test_model_status_per_crop(self):
        status = get_model_status_per_crop()
        self.assertEqual(status.get("Paddy"), False)
        self.assertEqual(status.get("Turmeric"), False)
        self.assertEqual(status.get("Tomato"), False)

    def test_dashboard_function(self):
        db = SessionLocal()
        try:
            res = get_dashboard(db=db)
            self.assertIsNotNone(res)
            self.assertIn("trend_7d", res.__dict__)
            self.assertIn("alerts", res.__dict__)
        finally:
            db.close()

if __name__ == "__main__":
    unittest.main()
