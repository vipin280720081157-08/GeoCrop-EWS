# Turmeric Model Artifacts Directory

Place trained Turmeric model artifacts in this directory:
- `trained_model.pkl` (Scikit-Learn / Joblib model)
- `label_encoder.pkl` (LabelEncoder for disease classes)

When both files are present, GeoCrop automatically uses the trained ML model for Turmeric disease prediction.
If missing, GeoCrop falls back to the baseline agronomic rule engine and reports `aiModel: unavailable` for Turmeric.
