# GeoCrop — AI Model Training & Integration Guide

This guide provides a comprehensive, practical, step-by-step walkthrough for building, evaluating, exporting, and integrating real machine learning models for disease prediction across the three supported crops in **GeoCrop**: **Paddy**, **Turmeric**, and **Tomato**.

> [!IMPORTANT]
> **Independent Crop Model Principle**  
> `Paddy model ≠ Turmeric model ≠ Tomato model`  
> Each crop is an independent agronomic system. Each crop requires:
> - Its own dedicated historical dataset (`backend/ml/datasets/{crop}/data.csv`)
> - Its own preprocessing and feature scaling
> - Its own trained classification model (`trained_model.pkl`)
> - Its own label encoder (`label_encoder.pkl`)
> - Its own evaluation report
> - Its own independent model artifact directory (`backend/model/{crop}/`)

---

## 1. Directory Structure

GeoCrop uses a clear, decoupled directory architecture for ML training and model serving:

```text
GeoCrop-EWS/
├── docs/
│   └── AI-MODEL-TRAINING-AND-INTEGRATION.md
├── backend/
│   ├── model/                      # Served model artifacts (Joblib)
│   │   ├── paddy/
│   │   │   ├── trained_model.pkl
│   │   │   └── label_encoder.pkl
│   │   ├── turmeric/
│   │   │   ├── trained_model.pkl
│   │   │   └── label_encoder.pkl
│   │   └── tomato/
│   │       ├── trained_model.pkl
│   │       └── label_encoder.pkl
│   └── ml/
│       ├── datasets/               # Raw training CSV datasets
│       │   ├── paddy/data.csv
│       │   ├── turmeric/data.csv
│       │   └── tomato/data.csv
│       ├── training/               # Python training scripts
│       │   ├── common.py           # Core ML pipeline logic
│       │   ├── train_paddy.py
│       │   ├── train_turmeric.py
│       │   └── train_tomato.py
│       ├── feature_engineering.py  # Crop profiles & factor calculations
│       └── predict.py              # FastAPI inference router & fallback
```

---

## 2. End-to-End 30-Point Machine Learning Workflow

### Phase 1: Data Acquisition & Preprocessing
1. **Dataset Collection**: Gather tabular sensor logs paired with verified ground-truth disease diagnoses (field observation records or agricultural extension logs).
2. **Dataset Cleaning**: Remove corrupt rows, invalid telemetry values (e.g. humidity > 100% or temperature < -10°C).
3. **Dataset Validation**: Ensure the dataset contains the 4 required feature columns: `temperature`, `humidity`, `soil_moisture`, `rainfall_7d`, and 1 target label `disease`.
4. **Feature Selection**: Select key micro-climate factors driving crop pathogen development:
   - Air Temperature (°C)
   - Relative Humidity (%)
   - Soil Moisture (%)
   - Cumulative 7-Day Rainfall (mm)
5. **Target Definition**: The target column (`disease`) must contain class names relevant to that specific crop.
   - **Paddy**: `Bacterial Leaf Blight`, `Rice Blast`, `Sheath Blight`, `Healthy`
   - **Turmeric**: `Rhizome Rot`, `Leaf Spot`, `Leaf Blotch`, `Healthy`
   - **Tomato**: `Early Blight`, `Late Blight`, `Leaf Mold`, `Healthy`
6. **Train/Validation/Test Split**: Perform an 80/20 stratified split using `sklearn.model_selection.train_test_split(stratify=y)` to preserve disease class distribution.
7. **Handling Missing Values**: Use median imputation for continuous micro-climate telemetry features. Drop rows where target `disease` is missing.
8. **Handling Outliers**: Filter extreme telemetry outliers outside physiological plant limits using IQR filtering.
9. **Feature Scaling**: Random Forest algorithms are invariant to feature scaling, but if using SVM or Logistic Regression, apply `StandardScaler`.
10. **Categorical Encoding**: Use `sklearn.preprocessing.LabelEncoder` on the target `disease` column and save `label_encoder.pkl`.
11. **Preventing Data Leakage**: Fit scalers and label encoders *strictly* on training splits (`fit_transform`) and apply `transform` on validation/test sets.

### Phase 2: Model Training & Artifact Export
12. **Training the Paddy Model**: Run `python backend/ml/training/train_paddy.py`.
13. **Training the Turmeric Model**: Run `python backend/ml/training/train_turmeric.py`.
14. **Training the Tomato Model**: Run `python backend/ml/training/train_tomato.py`.
15. **Model Evaluation**: Print out test accuracy, precision, recall, F1-score, and confusion matrix before exporting artifacts.
16. **Saving Model Artifacts**: Export `trained_model.pkl` and `label_encoder.pkl` using `joblib.dump()` into `backend/model/{crop}/`.
17. **Model Versioning**: Record git commit hash, dataset shape, and evaluation metrics alongside artifact deployments.

### Phase 3: Backend Serving & Inference Integration
18. **Loading Models in FastAPI**: `backend/app/ml/predict.py` uses `@lru_cache` to load crop artifacts dynamically when requested.
19. **Crop-Specific Feature Mapping**: `backend/app/ml/feature_engineering.py` maps environmental conditions to crop-specific agronomic thresholds (`CROP_PROFILES`).
20. **Prediction API**: `POST /api/predict` receives environmental parameters and crop context, returning disease risk, readiness score, and actionable recommendations.
21. **Model Availability Status**: Backend health endpoint (`GET /api/health`) reports per-crop status:
    ```json
    {
      "status": "ok",
      "model_available": true,
      "models_status": {
        "Paddy": true,
        "Turmeric": false,
        "Tomato": true
      }
    }
    ```
22. **Source Tracing (Model vs Baseline)**: When trained artifacts exist for the selected crop, `source: "trained_model"` is returned along with calibrated model confidence (`confidence: 94.2`). When artifacts are missing, `source: "rule_based_fallback"` is returned with `confidence: null`.
23. **Error Handling**: If a model file is missing or corrupt, GeoCrop gracefully degrades to the deterministic agronomic rule engine without crashing the API or blocking the user.
24. **Testing Prediction Endpoint**: Validate using cURL or Swagger UI (`http://localhost:8000/docs`).
25. **Connecting to Frontend**: Frontend `useApp` context and `SystemCheckOverlay` subscribe to `/api/health` and display real status badges ("ML Model" vs "Rule Engine").

### Phase 4: Model Maintenance & Upgrades
26. **Reproducible Training Commands**:
    ```bash
    # Train Paddy Model
    python backend/ml/training/train_paddy.py --dataset backend/ml/datasets/paddy/data.csv

    # Train Turmeric Model
    python backend/ml/training/train_turmeric.py --dataset backend/ml/datasets/turmeric/data.csv

    # Train Tomato Model
    python backend/ml/training/train_tomato.py --dataset backend/ml/datasets/tomato/data.csv
    ```
27. **Recommended Directory Structure**: As shown in Section 1.
28. **Expected Model Input Schema**:
    | Feature | Type | Unit | Description |
    | :--- | :--- | :--- | :--- |
    | `temperature` | float | °C | Air temperature |
    | `humidity` | float | % | Relative humidity |
    | `soil_moisture` | float | % | Volumetric soil moisture |
    | `rainfall_7d` | float | mm | 7-day cumulative rainfall |
29. **Expected Prediction Output Schema**:
    ```json
    {
      "crop": "Paddy",
      "disease": "Bacterial Leaf Blight",
      "risk_level": "High",
      "risk_score": 85,
      "confidence": 92.4,
      "readiness_score": 38,
      "readiness_label": "Poor",
      "source": "trained_model",
      "factors": [
        {"factor": "Humidity", "importance": 42, "detail": "Relative humidity 88% exceeds optimal range (65-80%)"}
      ],
      "recommendations": [
        {"text": "Improve field drainage immediately.", "priority": "High"}
      ]
    }
    ```
30. **Safe Model Update Process**:
    - Step 1: Train and evaluate new model offline.
    - Step 2: Copy new `.pkl` files to `backend/model/{crop}/`.
    - Step 3: Call `_load_crop_artifacts.cache_clear()` or restart the FastAPI process. GeoCrop automatically picks up the updated model without downtime.

---

## 3. Crop Model Availability Matrix

| Crop | Dataset Path | Model Artifact Path | Current Default Status |
| :--- | :--- | :--- | :--- |
| **Paddy** | `backend/ml/datasets/paddy/data.csv` | `backend/model/paddy/trained_model.pkl` | **Baseline Rule Engine** (Model file missing) |
| **Turmeric** | `backend/ml/datasets/turmeric/data.csv` | `backend/model/turmeric/trained_model.pkl` | **Baseline Rule Engine** (Model file missing) |
| **Tomato** | `backend/ml/datasets/tomato/data.csv` | `backend/model/tomato/trained_model.pkl` | **Baseline Rule Engine** (Model file missing) |

---

## 4. Dataset CSV Format Example

`backend/ml/datasets/paddy/data.csv`:
```csv
temperature,humidity,soil_moisture,rainfall_7d,disease
28.5,88.0,75.0,45.0,Bacterial Leaf Blight
24.0,65.0,55.0,10.0,Healthy
31.0,92.0,82.0,95.0,Rice Blast
26.5,70.0,60.0,15.0,Healthy
```
