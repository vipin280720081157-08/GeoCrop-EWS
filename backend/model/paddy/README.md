# Paddy Model Artifacts Directory

Place trained Paddy model artifacts in this directory:
- `trained_model.pkl` (Scikit-Learn / Joblib model)
- `label_encoder.pkl` (LabelEncoder for disease classes)

When both files are present, GeoCrop automatically uses the trained ML model for Paddy disease prediction.
If missing, GeoCrop falls back to the baseline agronomic rule engine and reports `aiModel: unavailable` for Paddy.
