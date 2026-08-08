# GeoCrop EWS — Technical Audit & Enhancement Plan

**Scope of this document:** audit only. No code is changed in this pass. Once you approve/adjust this plan, implementation proceeds section-by-section from the existing codebase.

---

## 1. Current Application Audit

### What actually exists today (ground truth, not aspirational)

**Frontend** (`frontend/`, React + TS + Vite + Tailwind): 8 routed pages — Dashboard, Live Monitoring, Disease Prediction, Decision Support, Historical Analytics, GIS Map, Reports, Settings. All pull from real backend endpoints via Axios hooks (`useSensorData`, `usePrediction`), polling every 5-10s. No mock/dummy data at the frontend layer.

**Backend** (`backend/`, FastAPI + SQLAlchemy + Alembic): 4 tables (SensorReadings, Predictions, Reports, Settings), real endpoints matching the spec, PDF generation via ReportLab, PostgreSQL in production / SQLite locally.

**AI layer** (`backend/app/ml/predict.py`): this is the single most important honest finding of this audit —

> **There is currently no trained machine learning model.** `predict()` runs a deterministic, hand-written rule-based heuristic (weighted deviation from agronomically "optimal" temperature/humidity/soil ranges, hardcoded per-crop in `feature_engineering.py`). The `trained_model.pkl` / `label_encoder.pkl` loading path exists and works, but no model has ever been trained or dropped in. Every prediction, confidence score, and "contributing factor" the dashboard has shown so far is a formula, not a learned pattern.

This is not a criticism of the build so far — it was the correct sequencing (working system → real model). But it means: **any claim of "ML-based disease prediction" made to judges today would be inaccurate.** This is the #1 thing this enhancement phase must fix.

**Hardware**: ESP32 + DHT22 + capacitive/resistive soil sensor + NEO-6M GPS, wired and posting real sensor data over WiFi to the deployed Render backend. This is real, working, and — per your constraint — untouched going forward.

### Audit classification

| Area | Classification | Why |
|---|---|---|
| ESP32 firmware + wiring | **KEEP** | Working, real, out of scope for this phase |
| FastAPI route structure (`/api/*`) | **KEEP** | Clean, RESTful, matches spec, no changes needed to the contract |
| Database schema (4 tables) | **IMPROVE** | Missing fields needed for real ML (see §16) |
| Dashboard, Live Monitoring pages | **KEEP** | Genuinely useful, real data, honest framing |
| Disease Prediction page | **REPLACE (backend logic) / KEEP (UI shell)** | UI is fine; the number it displays is currently fake |
| Decision Support page | **IMPROVE** | Recommendation *logic* is rule-based (fine — decision support should stay rule-based per your own honesty principle), but rules currently fire off the fake risk score, not a real one |
| Historical Analytics | **KEEP (structure) / IMPROVE (content)** | Real DB-backed history and prediction table already — good foundation, just needs real predictions flowing into it |
| GIS Map | **KEEP** | Already scoped honestly to one real device location (no fake "nearby monitoring points"), single Leaflet marker |
| Reports (PDF) | **KEEP** | Real ReportLab generation from real stored data |
| Settings | **IMPROVE** | Functional but the "crop" selector here and the "crop" the ESP32 sends are two independent sources of truth — needs reconciling |
| `predict.py` rule-based engine | **REPLACE with real model, KEEP as documented fallback** | Its actual future role: safety-net baseline explicitly labeled as such, not the primary system |
| Responsive/mobile layout | **IMPROVE** | Grid breakpoints exist (`md:`/`lg:`/`xl:`) and the sidebar collapses on mobile, but data tables use raw horizontal scroll (`overflow-x-auto`) which violates "no horizontal scrolling," and GIS map/chart heights are fixed rather than viewport-aware |
| Dataset / training pipeline | **DOES NOT EXIST — must be built** | Nothing to classify; this is new work |
| Explainability | **REPLACE** | Current "contributing factors" bars are the same hand-written deviation formula, not derived from a trained model |
| Model evaluation / benchmarking | **DOES NOT EXIST — must be built** | No experiments have been run because no model exists |

---

## 2. Major Weaknesses

1. **No real model.** Everything downstream (risk score, confidence, explanation, recommendations) currently inherits from a formula, not learned patterns from labeled data. This is a credibility risk in front of judges who ask "what algorithm, what accuracy, what dataset?"
2. **No dataset strategy.** No labeled disease-outcome data has been sourced, cleaned, or structured.
3. **No evaluation methodology.** Without a real model there's nothing to benchmark, so there are currently zero metrics to defend.
4. **Crop scope undecided**, and the two-crop hardcoded profile system (`Rice`/`Tomato`) doesn't match the team's current Paddy/Turmeric direction — see §9 for a data-driven recommendation.
5. **Mobile responsiveness is partial, not complete** — tables and some fixed-height visual components break the "no horizontal scroll" goal.
6. **Confidence scores are currently meaningless** — `_rule_based_predict()` computes a "confidence" number that has no statistical grounding (it's `72 + |risk-50|/50 * 22 + noise`). This is exactly the kind of overclaiming the brief warns against, even if the UI doesn't say "100%."
7. **No data validation/quality layer** beyond Pydantic type/range checks — no outlier detection, no duplicate detection, no sensor-fault detection (e.g., a stuck DHT22 sending the same value forever would currently be accepted silently).
8. **Settings/crop desync** — the Settings page lets a user pick a crop in the UI, but the ESP32 firmware hardcodes its own `CROP` constant independently. These can drift apart with nothing reconciling them.
9. **Render free-tier persistence risk** — `backend/model/*.pkl` is not committed to git (by design, per the original scaffold). On Render, redeploys rebuild from the git repo, so an uploaded-but-uncommitted model file would be **lost on the next deploy**. This must be fixed before relying on a trained model in production.

---

## 3. Features to Remove

- **The rule-based "confidence" score as currently computed.** Keep the rule-based *risk logic* as an explicit, clearly-labeled fallback (good engineering — degrade gracefully if the model fails to load), but its confidence number should be removed or replaced with something honest like "Fallback estimate — not model-derived" rather than a fabricated percentage.
- **Nothing else needs outright removal.** The audit did not find hype-driven or decorative features (no blockchain, no LLM chatbot, no "digital twin" language) — the existing scope has actually stayed disciplined. This is a good sign; the enhancement work is mostly additive/corrective, not subtractive.

---

## 4. Features to Improve

| Feature | How |
|---|---|
| Disease Prediction page | Swap the data source from rule-based heuristic to real trained model output, once trained (§6–8). UI stays the same. |
| Decision Support rules | Keep rule-based (this is appropriate — recommendations should be transparent, deterministic, and auditable, not a black box), but drive them from real risk output and make the rule logic itself documented and versioned so it can be cited in a paper. |
| Contributing Factors / explainability | Replace hand-written deviation-scoring with real feature importances from the trained model (§10). |
| Settings ↔ hardware crop sync | Either (a) make crop a value the backend controls and the ESP32 reads on each request cycle via a lightweight config endpoint, or (b) explicitly document that crop is a hardware-side constant and remove the illusion of runtime control from Settings until multi-crop hardware exists. Recommend (b) for hackathon timeline; (a) is a good "future work" line for the paper. |
| Mobile responsiveness | Rework tables into stacked card views below `md` breakpoint; make chart/map containers use relative heights (`aspect-ratio` or `vh`-based) instead of fixed pixel heights; audit every page at 375px width. |
| Data validation | Add basic sensor-fault checks server-side (e.g., reject/flag identical readings repeated >N times, flag physically implausible deltas between consecutive readings). |

---

## 5. New High-Value Features

Only proposing features that pass the 8-question test from your brief.

### 5.1 Confidence-aware, calibrated risk output
- **Problem:** raw classifier probabilities are usually poorly calibrated (a model saying "80% confident" is often wrong more than 20% of the time). Showing miscalibrated confidence to a farmer is actively misleading.
- **Solution:** apply `CalibratedClassifierCV` (Platt scaling or isotonic regression) on top of the best benchmarked model.
- **Data required:** a held-out calibration split from the same labeled dataset.
- **Implementation:** scikit-learn, drop-in wrapper around the chosen classifier before saving to `.pkl`.
- **Feasibility:** high — standard scikit-learn API, no new infra.
- **Value:** turns "confidence" from decoration into a defensible statistic — directly answers a judge's question.

### 5.2 Temporal risk trend, not just point-in-time prediction
- **Problem:** a single reading is noisy; disease risk is a function of *sustained* conditions (e.g., humidity above threshold for 48+ hours matters more than one high reading).
- **Solution:** engineer rolling-window features (24h/72h mean & max humidity, consecutive hours above threshold) as model inputs, not just instantaneous sensor values.
- **Data required:** the sensor history you're already storing (`sensor_readings` table) — no new hardware.
- **Implementation:** backend feature-engineering step before inference, computed from existing DB rows.
- **Feasibility:** high — pure software, uses data already being collected.
- **Value:** this is genuine methodological novelty grounded in plant pathology (most fungal/bacterial crop diseases are driven by *duration* of favorable conditions, not instantaneous readings) — a legitimate, citable design decision for a paper.

### 5.3 Explicit fallback-mode transparency
- **Problem:** if the trained model fails to load (missing file, corrupted artifact, cold-start on a redeploy), the system currently silently substitutes the rule-based heuristic with no indication to the user.
- **Solution:** surface a small, honest badge in the UI — "Model-based prediction" vs. "Baseline estimate (model unavailable)" — sourced from the `source` field `predict.py` already returns internally but currently discards.
- **Data required:** none new — the field already exists in the Python return value, just needs to reach the API response and UI.
- **Feasibility:** trivial — a few lines across 3 files.
- **Value:** directly satisfies your "communicate uncertainty honestly" requirement; also a good talking point for judges ("the system tells you when it's degraded").

### 5.4 Field Readiness Score — keep, but recompute from real model outputs
Already exists as a UI concept and is a reasonable, explainable derived metric (not a separate model) — no change needed to its *definition*, only to what feeds it once real risk scores exist.

### Features considered and deliberately NOT recommended
- **Anomaly detection as a separate model:** rejected for now — the rolling-window features in 5.2 already capture "unusual sustained conditions" without a second model to train, validate, and explain. Revisit only if benchmarking shows the primary classifier misses clear sensor-fault cases.
- **Personalized field-level recommendations beyond current rule engine:** rejected — with one ESP32 device, "personalization" has no second field to differentiate against; would be simulated, not real, personalization. Legitimate future work once multi-field deployment exists.

---

## 6. Proposed AI/ML Methodology

```
Raw sensor readings (DB)
        │
        ▼
Feature engineering
  • instantaneous: temperature, humidity, soil_moisture, rainfall_7d
  • rolling-window: 24h/72h mean, max, hours-above-threshold
  • crop encoding (categorical)
  • growth-stage encoding (categorical, if available)
        │
        ▼
Train/validation/test split
  • time-based split (not random) — see §8
        │
        ▼
Model benchmarking (§7)
        │
        ▼
Best model → probability calibration (§5.1)
        │
        ▼
joblib.dump → backend/model/trained_model.pkl + label_encoder.pkl
        │
        ▼
predict.py loads model (already-built loader, no change needed)
        │
        ▼
Risk score + calibrated confidence + real feature importances
        │
        ▼
Decision Support rule engine (unchanged, rule-based by design)
        │
        ▼
Dashboard
```

Key point: **the loading/serving side of this pipeline is already built correctly** (`backend/app/ml/predict.py` was designed exactly for this drop-in swap from day one). The work required is entirely on the training side, which lives outside the deployed app (a training script/notebook, run once, producing the two `.pkl` files).

---

## 7. Model Benchmarking Strategy

For structured/tabular agricultural data with a modest sample size (realistic for a hackathon timeline), tree-ensemble methods are the right family — deep learning is not justified here (small tabular data, no image/sequence structure) and would itself be an example of the "complexity ≠ innovation" trap the brief warns against.

**Models to compare:**

| Model | Why included |
|---|---|
| Logistic Regression (baseline) | Establishes the simplest defensible baseline — if tree ensembles can't beat this by a meaningful margin, that's an important, honest finding to report, not to hide |
| Random Forest | Current placeholder algorithm — robust, interpretable via feature importances, low overfitting risk on small data |
| Gradient Boosting (scikit-learn) | Often stronger than RF on structured data, still interpretable |
| XGBoost | Industry-standard boosting implementation, handles missing values natively, strong track record on agricultural/environmental tabular tasks in literature |
| LightGBM | Faster training, often competitive with XGBoost, useful if the dataset grows large enough that training time matters |

CatBoost is not included by default — it earns its keep specifically with high-cardinality categorical features, which this dataset (2-3 crop categories, a handful of growth stages) doesn't have. Add it only if benchmarking shows the categorical encoding is a bottleneck.

**Evaluation protocol:**
- Stratified k-fold cross-validation (k=5) on the training split, **plus** a held-out time-based test set (§8) — CV alone is insufficient for time-series-adjacent data.
- Metrics: Accuracy, Macro F1 (primary metric — robust to class imbalance across Low/Medium/High risk), per-class Precision/Recall, confusion matrix, ROC-AUC (one-vs-rest if >2 classes).
- Calibration curve (reliability diagram) for the final selected model.
- Report all models side-by-side in a comparison table — do not just report the winner. This table is the single most important artifact for both hackathon judges and a future paper.

**Selection rule:** best Macro F1 on the held-out test set, with calibration quality as tiebreaker. Document *why* the winner won — this becomes your methodology section.

---

## 8. Dataset Strategy

This is the section requiring the most honesty, per your brief.

**What data is required:**
- Environmental features: temperature, humidity, soil moisture, rainfall (already collected by your hardware/backend schema).
- Crop identity and growth stage (already in schema).
- Geographic context (lat/long — already collected; primarily useful for tying to regional climate patterns, not as a raw model feature by itself, since a single field's GPS coordinate has no generalizable signal alone).
- **Ground-truth disease labels** — this is the hard part and does not currently exist anywhere in this project.

**Where real labels can realistically come from (ranked by defensibility):**
1. **Published agricultural research datasets** with paired environmental-condition + disease-incidence records (e.g., ICAR, state agricultural university extension datasets, published plant pathology studies with climate correlation tables). These give genuine environmental→disease mappings, which is exactly your model's task.
2. **Government/extension advisory thresholds** (e.g., Tamil Nadu Agricultural University or ICAR disease-forecasting bulletins, which already publish evidence-based environmental thresholds for specific crop diseases). These can be used to construct labels via documented, citable rules — this is **not** the same as your current ad-hoc heuristic, because it would be traceable to a named scientific source rather than invented ranges.
3. **Public plant-disease image datasets (e.g., PlantVillage) are explicitly NOT a fit** — they label individual leaf images, not environmental-condition sequences, and have no temperature/humidity/soil pairing. Do not use these to justify an environmental-risk model; they answer a different question (image-based symptom classification, not pre-symptom risk forecasting).
4. **Your own hardware, going forward, with manual field observation logging** — the most scientifically honest source, but realistically only produces a handful of labeled examples in a hackathon timeframe. Valuable as a small real-world validation set even if not the primary training source.

**Explicit rule for this project: no fabricated/synthetic disease outcomes presented as real observations.** Where real per-observation labels aren't available in time, use rule-derived labels **only if the rule is sourced from a citable agricultural authority**, and label them in the dataset documentation as "threshold-derived from [source]," never as "observed disease incidence." This distinction must appear in any research-paper writeup.

**Data quality handling:**
- Missing values: forward-fill only within a short window (sensor gaps <30 min); beyond that, don't impute — mark as missing and exclude from training rows requiring that feature.
- Outliers: reject physically impossible values at ingestion (already partially done via Pydantic `ge`/`le` bounds) — extend with rate-of-change checks (e.g., temperature can't jump 15°C in 30 seconds).
- Duplicates: hash (device_id, timestamp-rounded-to-minute) to detect and drop accidental duplicate POSTs (e.g., from ESP32 retry logic double-sending on a false-negative response).
- Class imbalance: expect Low-risk to dominate real data (most days are not high-risk) — use stratified splits and class-weighted loss / `class_weight="balanced"`, report per-class metrics rather than only aggregate accuracy so this imbalance can't hide poor minority-class (High risk) performance.
- Data leakage: **time-based split, not random split.** Rolling-window features mean adjacent-in-time rows are correlated; a random split would leak future information into training. Split by contiguous time blocks (e.g., train on first 70% of the timeline, validate on next 15%, test on final 15%).

### Crop scope recommendation

Evaluating Paddy/Rice vs. Turmeric against your 7 criteria:

| Criterion | Paddy/Rice | Turmeric |
|---|---|---|
| Published environmental-disease datasets | Strong — Rice Blast, Bacterial Leaf Blight, Sheath Blight are among the most-studied crop diseases globally with well-documented temperature/humidity thresholds (IRRI, ICAR publications) | Weak — turmeric disease research exists but environmental-condition-correlated datasets are far sparser in accessible literature |
| Local relevance (Erode, TN) | High — TN is a major rice-growing region | High — Erode is genuinely a major turmeric market, strong local narrative value |
| Model trainability with available data | High | Low-to-moderate |
| Validation possibility in hackathon timeframe | Feasible | Difficult |

**Recommendation: prioritize Rice/Paddy as the primary, fully-modeled crop.** Keep Turmeric as a documented "designed for extensibility" secondary crop — the architecture (per-crop profiles, per-crop model dispatch) already supports adding it later without redesign, but do not force a from-scratch Turmeric model into the hackathon timeline just for local-relevance points if the dataset isn't there to defend it. This is a stronger, more honest story for judges than a poorly-validated Turmeric model: **"we scoped rigorously to what the data could support, and designed the system to extend."**

---

## 9. (see above — merged into §8 crop recommendation for coherence)

---

## 10. Novel Methodology

**What does this system do differently from a conventional crop disease prediction system?**

The defensible answer, based on what's actually feasible here:

> This system frames disease risk as a function of **sustained environmental exposure** (temporal, rolling-window conditions) rather than instantaneous readings, combines this with **field-specific geographic context**, and produces **calibrated, explainable, confidence-aware risk estimates** — with an explicit, disclosed fallback mode rather than a black box that fails silently.

The methodological contribution is the **combination**: temporal feature engineering + calibration + explainability + honest degradation, applied to a low-cost IoT sensing pipeline. No single piece is individually novel in the research sense, but the integrated, honestly-validated system for a specific low-cost hardware context is a legitimate applied-systems contribution — appropriate framing for a strong hackathon submission and a reasonable "systems paper" (not a "new algorithm" paper).

---

## 11. Explainability Strategy

Answering "why did the model produce this risk?" at two levels:

1. **Global**: model feature importances (`.feature_importances_` for tree ensembles, or permutation importance for a fair cross-model comparison) computed once after training, documented in the model card.
2. **Per-prediction**: for the specific reading just evaluated, use **SHAP values** (via the `shap` library, which supports tree ensembles natively and efficiently) to show which of *this instance's* features pushed risk up or down — this directly replaces the current hand-written "contributing factors" bars with a real, per-prediction, model-derived explanation, while keeping the exact same UI component.

---

## 12. Decision-Support Strategy

Keep rule-based, by design — this is the right call, not a limitation. Prediction (risk score) and decision support (recommended actions) should remain **separable and both independently auditable**: a judge or reviewer should be able to see "here is the model's risk output" and "here is the deterministic rule that turned that output into an action" as two distinct, inspectable steps. Document the rule table itself (which currently lives in `decision_support.py`) as a named, versioned artifact — this is exactly the kind of transparent design that supports both hackathon defensibility and a future methods section.

---

## 13. Real-Time Architecture

```
ESP32 (unchanged)
   │  HTTP POST every 30s
   ▼
FastAPI /api/sensors/data
   │  Pydantic validation (extend with fault-detection, §4)
   ▼
PostgreSQL — sensor_readings table
   │
   ▼
Feature engineering (NEW: rolling-window computation from recent DB rows)
   │
   ▼
predict.py → trained_model.pkl (NEW) with rule-based fallback (EXISTING, kept)
   │
   ▼
Calibrated risk + SHAP explanation + source flag (NEW fields)
   │
   ▼
decision_support.py rule engine (EXISTING, unchanged logic, real input now)
   │
   ▼
Stored in predictions table (EXISTING schema, +2 new columns, §16)
   │
   ▼
React dashboard (EXISTING UI, new data underneath)
```

---

## 14. Web Application Improvements (page-by-page)

| Page | Recommendation |
|---|---|
| Dashboard | Keep. Add the "model-based vs. baseline" badge (§5.3). |
| Live Monitoring | Keep as-is. |
| Disease Prediction | Keep UI. Swap explanation source to SHAP (§11). |
| Decision Support | Keep UI and rule logic. No structural change. |
| Historical Analytics | Keep. Once real predictions accumulate, this page becomes genuinely valuable (currently would show a thin history since real predictions have barely started flowing). |
| GIS Map | Keep as-is — already appropriately scoped. |
| Reports | Keep. Add model version/source info to the PDF footer for traceability. |
| Settings | Fix crop/hardware desync (§4). |
| No new pages recommended.** Adding a "model comparison" or "experiments" page was considered and rejected — that content belongs in project documentation/paper, not in the farmer-facing operational dashboard; mixing audiences would violate your own "every page should have a purpose" principle. |

---

## 15. Mobile Responsiveness Plan

1. Audit every page at 375px (iPhone SE) and 768px (tablet) widths — this hasn't been systematically done yet.
2. Convert `HistoricalAnalytics` and `Reports` tables to a stacked-card layout below `md` breakpoint (each row becomes a labeled mini-card) instead of `overflow-x-auto` scrolling.
3. Replace fixed-pixel chart/map heights with responsive units.
4. Re-verify the sidebar mobile drawer and header's conditional element-hiding (already partially implemented) still make sense once table layouts change.
5. Keep the existing visual language exactly — this is a layout fix, not a redesign.

---

## 16. Backend/API Changes

- `predictions` table: add `model_version` (string) and `source` (`"trained_model"` / `"rule_based_fallback"`) columns — `predict.py` already computes `source` internally but currently drops it before returning; this is a small, low-risk addition.
- `sensor_readings`: no schema change needed — rolling-window features are computed from existing columns at inference time, not stored redundantly.
- New lightweight internal endpoint (or extend existing `/api/predict`) to expose SHAP-based per-prediction factors in the same `factors` field shape the frontend already consumes — **no frontend contract change required**, since the existing `ContributingFactor` schema (`factor`, `importance`, `detail`) can hold SHAP output directly.
- Alembic migration required for the two new columns (straightforward, additive, non-breaking).

---

## 17. Database/Data Storage Changes

- Store `model_version` per prediction (so historical predictions remain interpretable even after the model is retrained later — critical for research reproducibility).
- No new tables required. A separate `training_runs` / `experiments` table is **optional** (§18) — recommended only if you want the benchmarking history queryable from the app itself rather than kept in a training notebook/repo; for hackathon timeline, keeping experiment tracking in the training repo (not the production DB) is sufficient and lower-risk.

---

## 18. AI Integration Into Existing Codebase

- Training happens **outside** the deployed app (a separate script/notebook, run locally or in Colab) — this is already the correct architecture (`backend/model/README.md` documents exactly this handoff).
- Trained artifacts (`trained_model.pkl`, `label_encoder.pkl`) must be **committed to the git repository** (not left as an untracked upload) so Render's build-from-git deploy process actually includes them — this closes the persistence risk flagged in §2.9.
- `predict.py` requires **no structural changes** to support this — it already tries the trained model first and falls back gracefully. Only the addition of the `source`/importance fields flowing through to the API response is new work.

### Research/Paper Readiness

Retain, from day one of the training work: the full model comparison table (§7), calibration curves, the exact dataset construction/cleaning steps with justification (§8), the time-based split methodology, and a short "limitations" section (small sample size, single hardware unit, threshold-derived vs. observed labels where applicable). This is what turns a hackathon artifact into something publishable — the honesty required by this audit is the same honesty a paper reviewer will demand.

---

## 19. Hackathon Demonstration Strategy

Demonstrate the **full honest pipeline live**: show a real sensor reading arriving, show the model (not the fallback) producing a risk score, show the SHAP-based explanation for that specific reading, show the decision-support rule firing from it. Then — separately — show the benchmarking table as evidence of *why* this model was chosen over alternatives. Two distinct demo beats: "it works live" and "here's the evidence it's the right model," rather than conflating them.

---

## 20. Risk Analysis

| Risk | Likelihood | Fallback |
|---|---|---|
| Trained model artifact not committed / lost on redeploy | Medium (easy to forget) | `predict.py` already degrades to rule-based automatically — demo still functions, just flag this clearly rather than let it be discovered live |
| Dataset too small for a defensible model | Medium-High given timeline | Report this honestly as a limitation; a well-benchmarked model on a small, honestly-labeled dataset is more defensible than a black-box on a fabricated large one |
| WiFi/live hardware failure during demo | Medium (always true for live IoT demos) | Historical Analytics page already has accumulated real data from earlier testing — can demo the full pipeline on stored data if live sensors misbehave |
| GPS still unsoldered / no fix | Known current state | Already handled gracefully by existing code (optional field) — no demo risk |
| Judges ask "what's your accuracy" and the honest number is modest | High probability of being asked | Prepare the answer in advance: report Macro F1, explain the class-imbalance context, and pair it with the calibration story — modest-but-honest beats impressive-but-fabricated every time with technical judges |

---

## 21. Implementation Order

**Critical (do first, nothing else matters without these):**
1. Dataset sourcing + construction + documentation (§8)
2. Feature engineering pipeline (rolling-window features, §5.2/§6)
3. Model benchmarking (§7) → select + calibrate (§5.1) final model
4. Commit trained artifacts to git; verify Render deploy picks them up (§18)
5. Wire `source`/`model_version` fields end-to-end (§16/§17)

**High value (do next):**
6. SHAP-based explainability replacing hand-written factors (§11)
7. Mobile responsiveness fixes, especially tables (§15)
8. Settings/crop desync fix (§4)
9. Fallback-mode UI badge (§5.3)

**Optional (only after the above is solid):**
10. Report PDF footer model-version stamp
11. Sensor fault-detection rules beyond basic range validation
12. Any Turmeric secondary-crop groundwork, time permitting

---

## Bottom line

The application, backend, and hardware are in genuinely good shape — well-scoped, honestly framed, nothing embarrassing to defend. The single real gap is that **the AI is not yet AI** — it's a placeholder formula, by design, waiting for exactly this phase. Everything in this plan exists to close that one gap credibly, without touching hardware, without adding hype features, and without breaking anything that already works.

**Awaiting your review/adjustments before any implementation begins**, per your instructions.
