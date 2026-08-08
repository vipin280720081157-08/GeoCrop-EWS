"""
Shared ML training pipeline helper for GeoCrop crops.

This script implements the standardized training workflow:
1. Dataset verification & loading
2. Validation of required feature columns and target disease label
3. Preprocessing (missing value imputation, outlier handling, label encoding)
4. Train/Test split with stratification
5. Model training (Random Forest Classifier)
6. Metrics evaluation (Accuracy, F1-Score, Classification Report)
7. Artifact export (trained_model.pkl & label_encoder.pkl) to backend/model/{crop}/
"""

import os
import sys
from pathlib import Path
import os
import sys
from pathlib import Path

REQUIRED_COLUMNS = ["temperature", "humidity", "soil_moisture", "rainfall_7d", "disease"]

def run_crop_training(crop_name: str, dataset_path: str = None) -> None:
    """Runs training pipeline for a given crop if dataset is present."""
    crop_key = crop_name.lower()
    root_dir = Path(__file__).resolve().parent.parent.parent
    
    if not dataset_path:
        dataset_path = root_dir / "ml" / "datasets" / crop_key / "data.csv"
    else:
        dataset_path = Path(dataset_path)

    if not dataset_path.exists():
        print(f"Training dataset not found for {crop_name}.")
        print(f"Expected file at: {dataset_path}")
        print("Please refer to docs/AI-MODEL-TRAINING-AND-INTEGRATION.md for dataset formatting guidelines.")
        sys.exit(1)

    try:
        import joblib
        import pandas as pd
        from sklearn.model_selection import train_test_split
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.preprocessing import LabelEncoder
        from sklearn.metrics import classification_report, accuracy_score
    except ImportError:
        print("Error: Missing required packages for model training (pandas, scikit-learn, joblib).")
        print("Install them via: pip install pandas scikit-learn joblib")
        sys.exit(1)

    print(f"--- Starting Training Pipeline for {crop_name} ---")
    print(f"Loading dataset from: {dataset_path}")

    df = pd.read_csv(dataset_path)
    
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        print(f"Error: Dataset is missing required columns: {missing_cols}")
        print(f"Required columns: {REQUIRED_COLUMNS}")
        sys.exit(1)

    # Simple cleaning
    df = df.dropna(subset=REQUIRED_COLUMNS)
    
    X = df[["temperature", "humidity", "soil_moisture", "rainfall_7d"]]
    y_raw = df["disease"]

    encoder = LabelEncoder()
    y = encoder.fit_transform(y_raw)

    if len(set(y)) < 2:
        print(f"Error: Dataset for {crop_name} must contain at least 2 distinct disease classes.")
        sys.exit(1)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n{crop_name} Model Evaluation:")
    print(f"Test Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=encoder.classes_))

    # Output directory
    output_dir = root_dir / "model" / crop_key
    output_dir.mkdir(parents=True, exist_ok=True)

    model_path = output_dir / "trained_model.pkl"
    encoder_path = output_dir / "label_encoder.pkl"

    joblib.dump(clf, model_path)
    joblib.dump(encoder, encoder_path)

    print(f"\nSuccessfully trained and saved {crop_name} model artifacts:")
    print(f"  Model:   {model_path}")
    print(f"  Encoder: {encoder_path}")
    print(f"GeoCrop API will now serve trained ML predictions for {crop_name}!")
