# Model Artifacts

This folder holds the two files the ML module (`app/ml/predict.py`) loads
with Joblib at runtime:

- `trained_model.pkl` — a trained `sklearn.ensemble.RandomForestClassifier`
- `label_encoder.pkl` — a `sklearn.preprocessing.LabelEncoder` mapping class
  indices back to disease names (e.g. "Rice Blast", "Late Blight")

**These two files are intentionally not included in this repository.**
Until they are added, `predict()` automatically falls back to a
deterministic, agronomically-informed rule-based heuristic, so the entire
application (frontend, backend, reports) works end-to-end without them.

## Expected feature order

The model must accept a 2D array of shape `(n_samples, 5)` with columns, in
this exact order (see `app/ml/feature_engineering.py::build_feature_vector`):

| index | feature         | notes                          |
|-------|-----------------|---------------------------------|
| 0     | temperature     | °C                              |
| 1     | humidity        | %                                |
| 2     | soil_moisture   | %                                |
| 3     | rainfall_7d     | mm, cumulative over 7 days       |
| 4     | crop_index      | 0 = Rice, 1 = Tomato             |

`model.predict_proba(X)` must be available (used to derive confidence).

## Training and replacing the model

1. Train your `RandomForestClassifier` on labeled historical data using the
   feature order above.
2. Fit a `LabelEncoder` on the disease name labels.
3. Save both with Joblib:

```python
import joblib
joblib.dump(model, "trained_model.pkl")
joblib.dump(label_encoder, "label_encoder.pkl")
```

4. Copy both files into this folder (`backend/model/`).
5. Restart the backend. No other backend code needs to change —
   `predict()` will automatically prefer the trained model over the
   rule-based fallback the next time it runs.
