# GeoCrop — Web Application Enhancement Specification

**Status:** Specification only. No code in this document. Builds on `GeoCrop-EWS-Enhancement-Plan.md` (technical/AI audit). This document governs the user-facing web application exclusively.

**How to use this document:** every section is written to be directly actionable by an implementing engineer or coding AI without further clarification. Where exact copy text is required, it is given in quotes. Where a value is unknown until real data exists, the spec says so explicitly and defines the honest placeholder.

---

## 1. Final Application Identity

- **Name:** GeoCrop
- **Tagline (always paired with the name on first mention per page/screen):** "Geographic Crop Disease Early Warning & Decision Support"
- **Short form (nav/browser tab/tight spaces):** GeoCrop
- **Browser tab title:** `GeoCrop — Crop Disease Early Warning`
- **Favicon:** simple leaf mark in primary green, no gradient
- **No sub-brand names.** Remove "AgriSense EWS" and every derivative everywhere: sidebar header block, browser title, `<meta>` description, any loading screen text, PDF report headers/footers, empty-state copy, error copy, footer (if one exists — see §11 on whether a footer is warranted at all).

---

## 2. Final UX Philosophy

GeoCrop is an **operational instrument**, not a marketing surface. Every screen answers a specific question a field-monitoring user has, using only information the system can trace to a real source (hardware, backend, user selection, or static app config). If a value cannot be traced, it is not shown — a labeled absence ("Waiting for sensor data") is always preferred over a plausible-looking fabrication.

Three standing rules govern every subsequent section:
1. **Traceability** — every displayed value must be answerable with "this came from X."
2. **Graceful degradation** — the app is always usable, even with backend/hardware/model fully offline; degraded states are shown, never hidden or faked.
3. **Restraint** — professional monitoring software, not a hackathon showcase. No motion for motion's sake, no color for decoration's sake.

---

## 3. Final Visual Design Direction

Retain the existing enterprise-monitoring visual language established in the original UI/UX spec (flat design, soft neutral surfaces, thin borders, minimal shadow, small-radius rounded corners, line icons). This is not being replaced — it is being tightened and extended to dark mode. Explicitly forbidden regardless of theme: gradients used decoratively, glow/neon effects, glassmorphism, particle/AI-themed backgrounds, animated gradients, skeuomorphic 3D card effects, stylized/display typography, oversized rounded corners (>12px), drop-shadow-heavy cards.

---

## 4. Final Color System

### Light theme (default)

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#2E7D32` | Primary actions, active nav, brand mark |
| `primaryLight` | `#E6F0E7` | Active nav background, subtle primary fills |
| `secondary` | `#1565C0` | Links, GIS elements, analytical accents |
| `secondaryLight` | `#E5EEFA` | Info fills, hover states |
| `accent` | `#F9A825` | Sparingly — key metric emphasis only |
| `success` | `#43A047` | Healthy status, Low risk |
| `successLight` | `#E8F5E9` | Success fills |
| `warning` | `#FB8C00` | Medium risk, caution |
| `warningLight` | `#FFF3E0` | Warning fills |
| `error` | `#D32F2F` | High risk, critical only |
| `errorLight` | `#FDECEA` | Error fills |
| `background` | `#F5F7FA` | App background |
| `card` | `#FFFFFF` | Card surfaces |
| `sidebar` | `#263238` | Sidebar surface (same in both themes — sidebar stays dark always, see §11) |
| `border` | `#E0E0E0` | Card/table borders |
| `textPrimary` | `#263238` | Headings, primary text |
| `textSecondary` | `#607D8B` | Labels, secondary text |
| `textDisabled` | `#9E9E9E` | Disabled/inactive |

### Dark theme

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#43A047` | Slightly brighter green for AA contrast on dark surfaces |
| `primaryLight` | `#1B3A20` | Active nav background, subtle primary fills |
| `secondary` | `#4FA3F7` | Links, GIS/analytical accents (lightened for contrast) |
| `secondaryLight` | `#12283F` | Info fills |
| `accent` | `#FFB84D` | Key metric emphasis |
| `success` | `#4CAF50` | Healthy, Low risk |
| `successLight` | `#173620` | Success fills |
| `warning` | `#FFA726` | Medium risk |
| `warningLight` | `#3A2A10` | Warning fills |
| `error` | `#EF5350` | High risk, critical only |
| `errorLight` | `#3A1414` | Error fills |
| `background` | `#161B1F` | App background (charcoal, not pure black) |
| `card` | `#1E252A` | Card surfaces (slightly lighter than background) |
| `sidebar` | `#12171A` | Sidebar — even darker than cards for hierarchy |
| `border` | `#2C363C` | Card/table borders |
| `textPrimary` | `#ECEFF1` | Headings, primary text |
| `textSecondary` | `#94A3AD` | Labels, secondary text |
| `textDisabled` | `#5A656B` | Disabled/inactive |

**Rule:** risk-level colors (`success`/`warning`/`error`) are semantic and never repurposed for anything else, in either theme. `accent` is used at most once per screen — never as a repeated decorative color.

---

## 5. Typography

- Family: **Inter** (already loaded via Google Fonts in the existing app — keep), fallback `Roboto, "Source Sans Pro", sans-serif`.
- No change to the existing type scale (28px page titles / 22px section titles / 18px card titles / 16px body / 15px buttons / 13px chart labels) — it already satisfies "highly readable, professional."
- Dark mode uses the same scale; only color tokens change, never size/weight, to keep both themes feeling like the same product.

---

## 6. Iconography

Lucide icons throughout (already in use — keep). Outline style, 2px stroke, 20px default / 24px in cards / 22px in navigation — unchanged from existing spec. New icons required by this spec: `Sun` / `Moon` (theme toggle), `WifiOff`/`Wifi` (already used for connection status), `CircleCheck`/`CircleAlert`/`CircleX` (system status rows), `Satellite` or `MapPinOff` (GPS state), `BrainCircuit` avoided deliberately — do not use an "AI brain" icon anywhere, it implies more than the system delivers; use `Cpu` or `Stethoscope` (already in use) for model-related icons instead.

---

## 7. Layout / Grid System

- Outer container: full-bleed sidebar + header, content area constrained to `max-width: 1320px` **only when viewport exceeds ~1440px**; below that, content fills the available width with a consistent `24px` outer margin on all sides. This specifically fixes the "white vertical strip" issue: the previous fixed `max-w-[1440px] mx-auto` wrapper around the *entire* sidebar+content flex row created asymmetric empty gutters on wide monitors, visually reading as a stray vertical division. The corrected structure applies max-width **only to the content column**, never to the sidebar+content row as a whole, and only above 1440px — below that threshold there is no artificial constraint at all.
- Sidebar meets content with exactly **one** 1px border (the sidebar's own right edge) — no secondary divider, no shadow-based seam, no extra spacer column.
- Card grid gap: 20px (unchanged). Section gap: 32px (unchanged). Card padding: 20px (unchanged). Card corner radius: 12px (unchanged).

---

## 8. Responsive Behavior

Three defined breakpoints, tested explicitly at these widths (not just "roughly"):

| Range | Behavior |
|---|---|
| **Desktop** ≥1024px | Full sidebar (expandable/collapsible), 4-column stat grids, 2-column chart/card pairs, full header (search + datetime + status + user identity block) |
| **Tablet** 768–1023px | Sidebar becomes icon-only by default (labels on tap/hover), stat grids drop to 2 columns, chart/card pairs stack to 1 column where paired content would otherwise compress below readable width, header keeps status + menu, hides search bar |
| **Mobile** 375–430px | Sidebar becomes a full off-canvas drawer (hidden by default, hamburger-triggered, already exists — keep), all grids single-column, tables convert to stacked card-per-row representation (not horizontal scroll — see §17 for exact table→card mapping), header reduces to: hamburger, page title, theme toggle, connection status icon only (datetime and user identity block move into a small expandable row or are dropped from header entirely and shown only on Settings) |

**Absolute requirements, all breakpoints:** no horizontal page-level scroll under any circumstance; no card ever clips its content (cards grow to fit content, never truncate silently); charts/maps use responsive containers (percentage/viewport-relative), never fixed pixel heights that exceed small-viewport height; every interactive element maintains a minimum 44×44px touch target on mobile.

---

## 9. Navigation Structure

Unchanged set, unchanged order (all 8 retained per §11's page-by-page audit below): Dashboard, Live Monitoring, Disease Prediction, Decision Support, Historical Analytics, GIS Map, Reports, Settings. No new top-level pages added.

---

## 10. Header Design

**Desktop, left to right:** page title → (search bar, optional, only if search is actually functional against real data — otherwise remove it entirely rather than ship a decorative non-functional input) → spacer → real-time clock → connection status indicator (see §27) → theme toggle (Sun/Moon icon button) → **no user identity block** (removed per §1 of the concern list — "Field Officer" was fabricated; nothing legitimate currently replaces a logged-in user concept since this app has no auth, so this slot is simply removed, not backfilled with another placeholder).

**Tablet:** page title, connection status icon, theme toggle, hamburger (if sidebar is icon-only rather than drawer at this breakpoint, hamburger is only needed to expand labels — evaluate at implementation time whichever reads cleaner, both are acceptable per this spec).

**Mobile:** hamburger, page title, theme toggle, connection status icon. Clock is dropped (available in Settings/system status instead, not header-critical).

**On theme toggle click:** instantly switches theme, no transition longer than 150ms fade, persists to `localStorage` (this is a real deployed web app, not a sandboxed artifact — standard `localStorage` is appropriate and required here), applied before first paint on reload (avoid flash-of-wrong-theme by reading the stored preference in an inline script or root-level effect before render).

---

## 11. Sidebar Design

Stays visually dark in both light and dark themes (per §4 — this is intentional, matches the original spec's rationale of strong navigational contrast regardless of content theme). Branding block: leaf mark + "GeoCrop" + small-caps subtitle "Disease Early Warning" (drop "System" — redundant). No footer/version stamp in the sidebar; if a version stamp is wanted, it belongs in Settings → System Information, not persistently on-screen.

Remove the previous secondary tagline line if it duplicates the header — keep sidebar branding to exactly two lines (name + one-line descriptor), nothing else.

---

## 12. Initialization / Opening Experience

**Sequence:**
1. App shell renders immediately (sidebar, header, empty dashboard skeleton) — this is not gated on anything.
2. A single lightweight status sweep runs in parallel, in the background, with a **hard 2.5 second cap**: ping `/api/health` (Application/Backend), check timestamp recency of latest sensor reading (Hardware/Data), check a real `model_available` flag from the backend (AI Model — see §29 for where this flag comes from), check latest reading's lat/lng presence (GPS).
3. Whatever has resolved by 2.5s is shown; whatever hasn't is marked with its natural "checking..." → resolves asynchronously in place once available, never blocking.
4. The Dashboard is interactive from frame one — the status sweep is a background enhancement to the persistent System Status section (§13), not a blocking splash screen.

**Exact status line copy, each with a small check/circle/x indicator, not a progress bar:**
```
Application         ✓ Ready
Backend              ✓ Online   /  ○ Checking...  /  ✕ Unavailable
Data Service         ✓ Receiving data  /  ○ Checking...  /  ✕ No recent data
Hardware             ✓ Connected  /  ○ Checking...  /  ✕ Offline
AI Model             ✓ Available  /  ○ Checking...  /  ✕ Unavailable (baseline estimate in use)
GPS                  ✓ Fixed  /  ○ Waiting for GPS  /  ✕ Unavailable
```
No progress bar of any kind (nothing here is a measurable percentage of real work — a fake progress bar would violate §22). No text resembling "AI neural engine initializing" or similar. This status block, once resolved, **does not disappear** — it collapses into the persistent System Status row on the Dashboard (§13), so the same real information stays visible throughout the session, not just at launch.

---

## 13. Dashboard — Complete Structure

**Above the fold (desktop):** Page title + crop selector (top-right of header row, see §30) → System Status row (compact, 5 items from §12's list, always visible, real-time) → primary stat row.

**Primary stat row (4 cards, desktop; stacks 2×2 tablet, 1×4 mobile):**
1. **Current Disease Risk** — value is the risk level (`Low`/`Medium`/`High`) when a prediction exists; if none exists yet: card shows "No prediction yet" with a small "Run prediction" action if `/api/predict` is user-triggerable, or "Waiting for first prediction" if it's fully automatic. Never shows a risk level with no backing prediction record.
2. **Field Readiness Score** — same rule: real number from the latest prediction, or "Not available" placeholder.
3. **Current Environmental Snapshot** — temperature/humidity/soil moisture from the latest real sensor reading, with its timestamp shown as "as of Xm ago." If no reading exists at all: "Waiting for sensor data" (exact copy, per the user's own required phrasing).
4. **Model Status** — not a duplicate of AI Model in system status; this card specifically answers "is the number above from a real model or the baseline?" — value is either "Model-based prediction" or "Baseline estimate" (ties directly to the `source` field defined in the technical audit §5.3/§16).

**Second row:** Disease Risk Trend chart (7-day, real data from `predictions` table) — if fewer than 2 data points exist, replace the chart with a centered message: "Trend will appear once more predictions have been recorded" rather than rendering a chart with 0-1 points.

**Third row, two columns (stacks on tablet/mobile):**
- **Left: Recommendation Summary** — the single top-priority recommendation from the latest Decision Support output (not the full list — that lives on the Decision Support page), with a "View full decision support →" link. Empty state: "No recommendations yet — available once a prediction has run."
- **Right: Location** — a small static (non-interactive) map preview or coordinate readout showing the real last-known GPS fix, with explicit GPS state text (§28). Click-through to the full GIS Map page. If never fixed: "GPS location not yet available" — no default/fallback coordinate shown, ever (this replaces the previous hardcoded Thanjavur default center).

**Fourth row: Recent Alerts** — real, derived from actual state transitions (e.g., risk level changed since last prediction, sensor went offline) — not the previous synthetic multi-item alert list. If there is only one real event (or zero), show only that many rows; do not pad with invented alerts to fill the card. Empty state: "No recent alerts."

**Removed from the previous dashboard entirely:** "Monitored Field: Thanjavur Field Station · Rice" header line (fabricated location), the 4-item "Quick Actions" tile row (low value — every one of those destinations is already one sidebar click away; removing reduces clutter per §2's restraint principle), the 3-mini-chart row (temperature/humidity/soil mini trends) is merged into Live Monitoring where it belongs more naturally rather than duplicated on both pages.

---

## 14. Live Monitoring — Complete Structure

Purpose: real-time IoT read-out, nothing else. Primary stat cards (temperature, humidity, soil moisture, GPS) each explicitly labeled with data freshness state per §17's LIVE/RECENT/OFFLINE/NO DATA taxonomy — not just a number. Below: the three trend charts (moved here from Dashboard, see §13). Device status panel: Device ID (real, from `device_id` field — not invented), last updated timestamp, connection status, GPS fix state. No growth-stage or crop dropdown here — that's a Settings-level concept, not a live-monitoring concept; remove it from this page if currently present.

**Loading state:** skeleton cards, no numbers. **No-data state:** every stat card shows "Waiting for sensor data" (not "0" or a dash trying to look like a real reading — a literal `0°C` is a real-looking fake value and must never be the empty-state default). **Offline state:** cards show last-known values explicitly labeled "Last known — Xh ago (offline)" rather than silently going stale-but-unlabeled.

---

## 15. Disease Prediction — Complete Structure

Selected crop (from global crop selector, §30) → Model status line ("Model-based" / "Baseline estimate — model unavailable," exact source-tracing language, never hidden) → Risk level + risk score (only when real) → **Confidence, shown only when the backend provides a genuinely calibrated value** (per the technical audit, this doesn't exist yet on the rule-based fallback — in that case, the confidence field is omitted entirely, not shown as a fabricated percentage; this is a hard rule) → Prediction timestamp (real) → Environmental context at time of prediction (real values, not re-fetched live values that may have since changed) → Contributing factors (from real feature importances/SHAP once available; while only the rule-based fallback exists, this section is labeled "Estimated contributing factors (baseline heuristic)" rather than presented as model-derived) → plain-language explanation sentence (already exists, keep, but the sentence itself must be regenerated to reflect whichever source — model vs. baseline — actually produced the number).

**No prediction yet:** full-page empty state, not empty cards — "No prediction available yet for [crop]. Predictions run automatically as sensor data arrives." **Model unavailable for this crop:** distinct from "no prediction yet" — "AI model for [crop] is not yet available. Showing baseline environmental estimate." This is the honest three-crop reality (§30) surfaced exactly where a user would look for it.

---

## 16. Decision Support — Complete Structure

Explicitly sequenced UI: a small "Prediction →" reference chip at the top (crop, risk level, timestamp — links back to Disease Prediction) making the prediction→decision relationship visible, then the actual decision content below: full recommendation list with priority badges (existing pattern, keep), environmental warnings (existing, keep), decision timeline (existing, keep — this is rule-based and appropriately so, per the technical audit; no change needed to the rule engine itself, only to what feeds it). Never phrased conversationally ("I recommend...", "Based on my analysis...") — always in the existing declarative, instructional voice ("Increase field inspection frequency..."). No chat-style input box anywhere on this page.

---

## 17. Historical Analytics — Complete Structure

Time-range selector (7/14/30 day — keep). Four trend charts (temperature, humidity, soil moisture, disease risk — keep, all real data). **Prediction history table → mobile card conversion:** below 768px, each table row becomes a compact card showing Date, Disease, Risk (as the existing colored chip), Confidence — stacked vertically, full width, no horizontal scroll. This is the concrete mobile table pattern referenced generally in §8; apply the identical pattern to the Reports page table (§19).

**Sparse-data handling:** if fewer than 3 predictions exist total, do not render a 4-chart grid of mostly-empty charts — collapse to a single message state: "Historical trends will appear here as data accumulates. [X] readings recorded so far." This avoids a page that looks broken/empty on first real-world use before the system has been running long.

---

## 18. GIS Map — Complete Structure

One real marker, at the most recent real GPS fix — exactly as already implemented, keep as-is structurally. Explicit GPS state banner above the map (not just inferred from marker presence): "GPS Fixed" / "GPS Waiting" / "GPS Unavailable" (exact three states per the user's requirement), each with distinct icon/color (success/warning/neutral respectively — GPS unavailable is not an "error," it's simply absent data, use `textSecondary`/neutral styling, not red). When no fix has ever been obtained: map renders centered on a generic world/region view with no marker and the "GPS Unavailable" banner — never a fallback pin at an invented location.

---

## 19. Reports — Complete Structure

Report generation retains existing daily/weekly PDF flow. Metadata block on-screen before generation (and mirrored in the PDF header/footer) shows only fields with real values: selected crop, monitoring period, sensor data availability (yes/no + count), prediction timestamp, model version + source (model-based/baseline — ties to technical audit §16/§17), GPS status. Any field without a real value is simply omitted from the metadata block, not shown as blank or "N/A" clutter. Report history table uses the same mobile card-conversion pattern as §17.

---

## 20. Settings — Complete Structure

Sections, in order: **Crop Selection** (the three real crops, see §30) → **Theme** (light/dark, mirrors header toggle, single source of truth) → **Units** (°C/°F, mm/inches — existing, keep, purely a display preference, legitimate) → **Alert Thresholds** (existing sliders — legitimate, these genuinely configure decision-support rule behavior) → **System Information** (Device ID, backend connection state, model version(s) per crop, database type — all real, read-only) → **About** (static app description, version string).

**Removed:** the previous "Field Officer" / "Cauvery Delta Zone" — style profile identity fields (none currently exist as real Settings fields to my knowledge from the audit, but explicitly forbidden if any are added later — this app has no authentication layer, so there is no legitimate "user profile" to configure). Notification preference toggles (High risk alerts, Daily report ready, etc.) are **removed** unless a real notification delivery mechanism (email/SMS/push) is actually implemented — toggles that control nothing are exactly the kind of indefensible UI this spec exists to eliminate; if judges ask "does this toggle do anything," the honest answer today would be no.

---

## 21–22. Dark Mode / Light Mode Specification

Fully specified via the token tables in §4. Implementation requirement: every component (cards, tables, charts, chips, buttons, forms, map controls, header, sidebar) must consume theme tokens rather than hardcoded hex values, so no component is "forgotten" and left light-styled inside an otherwise dark page. Charts specifically: gridlines, axis text, and tooltip backgrounds must also swap per theme (a common miss — verify chart library theming explicitly, not just card backgrounds). Map tiles (Leaflet/OpenStreetMap): acceptable to keep the map tile layer itself unchanged in dark mode (map tiles are external imagery, not a themeable app surface) but the map's surrounding chrome (popup styling, legend, status banner) must follow the app theme.

---

## 23–26. Loading / Empty / Error / Offline States

Single shared state-copy table, applied consistently everywhere the situation occurs (do not let each page invent its own wording):

| State | Exact copy |
|---|---|
| Loading (generic) | "Loading monitoring data..." |
| No sensor data | "No sensor data available yet." |
| No prediction | "No prediction available yet." |
| Hardware offline | "Hardware connection unavailable." |
| GPS waiting | "Waiting for GPS location." |
| GPS unavailable | "GPS location unavailable." |
| AI model unavailable | "Prediction model unavailable — showing baseline estimate." |
| Backend unreachable | "Unable to connect to the data service." |
| Insufficient history for charts | "Historical trends will appear here as data accumulates." |

Every one of these renders as a proper in-card/in-page state with an appropriate neutral icon (not an error-red icon for merely-empty states — reserve red/error styling specifically for true failures like "Backend unreachable," use neutral gray/secondary styling for "not yet available" states). Never a blank white card with nothing in it.

---

## 27. Hardware Connection States

Exactly two real states, sourced from sensor-reading recency (already computed server-side per the existing `/api/dashboard` `device_connected` boolean — keep using this, don't invent a new mechanism): **Connected** (green dot + "Connected") and **Offline** (gray dot + "Offline"). No fabricated "Connecting..." intermediate state unless there's a real reconnection attempt in progress to represent.

## 28. GPS States

Three states, used identically everywhere GPS is referenced (Dashboard location card, Live Monitoring, GIS Map): **GPS Fixed** (success styling), **GPS Waiting** (neutral/warning-light styling — this is the "have hardware connection but no fix yet" state), **GPS Unavailable** (neutral styling — no reading has ever included coordinates). Derive Waiting vs. Unavailable from whether *any* historical reading ever had non-null lat/lng, not just the latest one.

## 29. AI/Model States

Two states per crop, sourced from a real backend flag — this requires one small, explicitly-scoped backend addition beyond what's in the technical audit: an endpoint or field (e.g., part of `/api/dashboard` or a new `/api/models/status`) returning, per supported crop, whether `trained_model.pkl` was successfully loaded for that crop's profile. Until multi-crop model files exist, this correctly reports **Unavailable** for all three crops except whichever one has a real trained artifact — the UI must not assume "Paddy has a model" just because Paddy was recommended as the priority crop in the technical audit; it must check the real flag.

## 30. Three-Crop UX

Global crop selector (header or top-of-Dashboard, one clear location, not duplicated in multiple places) with exactly three options: **Paddy, Turmeric, Tomato**. Selecting a crop filters/scopes: Dashboard stats, Disease Prediction, Decision Support, Historical Analytics. Each crop shows its own independent Model Status (§29) — switching crops must visibly change this status honestly (e.g., switching from Paddy to Turmeric might flip Model Status from "Available" to "Unavailable" if that's the real backend state). The selector itself never implies capability parity across crops — no visual treatment (badges, checkmarks) suggesting all three are equally ready unless they genuinely are.

---

## 31–32. Mobile UX / Desktop UX

Consolidated into the breakpoint table (§8) and the per-page mobile-specific notes throughout §13–20. No separate additional rules beyond what's already specified per-page — avoids this document defining two competing sources of truth for the same behavior.

---

## 33. Accessibility Considerations

- Color is never the sole indicator of state — every risk chip, status dot, and alert also carries an icon and/or text label (already largely true in the existing design system — verify consistently applied post-redesign).
- Minimum contrast ratio AA (4.5:1 body text, 3:1 large text) verified for both themes' token pairs — the dark-theme tokens in §4 were chosen specifically to satisfy this against their paired backgrounds; do not substitute different shades without re-checking contrast.
- All interactive elements reachable via keyboard, visible focus ring (2px, `secondary` color) in both themes.
- Charts include a text-equivalent summary (e.g., an accessible table toggle or aria-label summarizing the trend) where feasible — not required for hackathon v1 if time-constrained, but flag as a documented gap rather than silently skip.

---

## 34. What Should Be Removed

- All fabricated contextual copy: "Thanjavur Field Station," "Field Officer," "Cauvery Delta Zone," and any equivalent replacement placeholder location/person/org.
- "AgriSense EWS" branding, everywhere it appears.
- The unnecessary white vertical divider (root-caused in §7 — fix the layout container, don't just hide a border).
- Dashboard's Quick Actions tile row (redundant with sidebar navigation).
- Dashboard's duplicate mini-trend-chart row (consolidated into Live Monitoring).
- Settings notification toggles that don't control a real delivery mechanism.
- Any hardcoded default map center/marker shown in the absence of a real GPS fix.
- Any invented multi-farm/nearby-station markers on the GIS map (already correctly absent per the technical audit — stays absent).
- Fabricated "confidence" percentages from the rule-based fallback path.

## 35. What Should Be Retained

- Overall visual system: flat cards, restrained palette, Inter typography, Lucide icons, existing spacing/radius scale.
- Existing 8-page navigation structure, unchanged.
- Decision Support's rule-based, non-conversational design.
- GIS Map's honest single-marker scoping.
- Reports' real ReportLab PDF generation flow.
- Risk-level color semantics (green/orange/red only for actual risk, never decoratively).

## 36. What Should Be Redesigned

- Dashboard information hierarchy (§13) — restructured, not just re-colored.
- Header (§10) — remove fabricated identity block, add theme toggle, add real system status.
- All data tables — mobile card-conversion pattern (§17).
- Initialization flow (§12) — from a blocking splash concept to a non-blocking background status sweep.
- Every "confidence"/"contributing factors" display — explicitly source-labeled (model vs. baseline) rather than presented uniformly as if always model-derived.

## 37. What Should NOT Be Added

- No conversational AI / chatbot interface anywhere.
- No fake "live activity feed" or "recent farms" social-proof style elements.
- No additional top-level pages beyond the existing 8.
- No user accounts/login/roles (out of scope, would itself become a new fabrication risk if added superficially).
- No animated splash/progress bar pretending to measure real initialization work.
- No AI-themed decorative visual motifs (neural network graphics, glowing brain icons, particle effects).

---

## 38. Exact User Journey — Opening GeoCrop → Completing a Disease-Risk Workflow

1. User opens the deployed URL. App shell renders instantly; background status sweep begins (§12).
2. Within ~1-2 seconds, System Status row on Dashboard reflects real backend/hardware/model/GPS state.
3. User selects their crop from the global selector (defaults to whichever crop was last selected, persisted in `localStorage`; first-ever visit defaults to Paddy per the technical audit's priority recommendation, but this is a UI default only, not a claim of model availability).
4. Dashboard shows current risk (or an honest "no prediction yet" state), environmental snapshot, and a top recommendation.
5. User clicks through to Disease Prediction for the full picture: risk, model source, contributing factors, explanation.
6. User clicks through to Decision Support for the full actionable recommendation list and timeline.
7. User checks Historical Analytics to see whether risk has been trending up or down.
8. User checks GIS Map to confirm the physical field location and GPS status.
9. User generates a Report, which reflects exactly the same real data/state shown throughout the session — no discrepancy between what the dashboard showed and what the PDF says.

## 39. Exact Judge Demonstration Journey

1. Open the app live — point out the System Status row updates in real time, not a canned animation.
2. Show a live sensor reading arrive (Live Monitoring page timestamp ticking forward) — demonstrates the real ESP32→backend pipeline.
3. Switch to Disease Prediction — explicitly point out the Model Status line ("Model-based" or "Baseline estimate") — this is the moment to proactively explain the honest system state rather than let a judge discover it.
4. Show Decision Support and explain the rule engine is deliberately transparent/deterministic, not a black box.
5. Show Historical Analytics as evidence of accumulated real operation, not a demo-only feature.
6. Switch crop selector to demonstrate the three-crop architecture, and honestly narrate whichever crops currently lack a trained model as "designed for extensibility, model training in progress" rather than hiding the limitation.
7. Toggle dark/light theme briefly to demonstrate polish, then return to whichever theme suits the room's lighting for the rest of the demo.
8. Generate a live PDF report as a closing beat — a tangible, judge-holdable artifact.

---

## 40. Final Page-by-Page Specification Summary

| Page | Decision | Primary action | Notes |
|---|---|---|---|
| Dashboard | IMPROVE (restructured) | Navigate to detail pages | See §13 |
| Live Monitoring | IMPROVE | None (read-only) | See §14 |
| Disease Prediction | IMPROVE | None (read-only) | See §15 |
| Decision Support | IMPROVE | None (read-only) | See §16 |
| Historical Analytics | IMPROVE | Change time range, export | See §17 |
| GIS Map | KEEP (structure), IMPROVE (states) | None (read-only) | See §18 |
| Reports | IMPROVE | Generate PDF | See §19 |
| Settings | SIMPLIFY | Change crop/theme/units/thresholds | See §20 |

No page is removed or merged — all 8 have distinct, defensible purposes once corrected per the sections above.

---

## 41. Final Acceptance Checklist

- [ ] No occurrence of "AgriSense," "Thanjavur," "Field Officer," or "Cauvery Delta Zone" anywhere in the app, PDFs, or metadata.
- [ ] Every displayed value can be traced to hardware, backend, user selection, or static config — verified page by page.
- [ ] No fabricated sensor readings, confidence percentages, or location markers appear under any data state.
- [ ] Light and dark themes both fully styled across every component, verified with a full click-through in each theme.
- [ ] Theme preference persists across refresh.
- [ ] No horizontal scroll at 375px, 768px, 1024px, 1366px, 1440px.
- [ ] All tables convert to card layout below 768px.
- [ ] Dashboard usable within ~1-2s even with backend/hardware/model fully offline.
- [ ] System Status row present and real-time on Dashboard, not just at launch.
- [ ] Crop selector shows honest, independent Model Status per crop.
- [ ] Every empty/loading/error/offline state uses the exact copy table in §23–26.
- [ ] No conversational AI, chatbot, or fake activity feed present anywhere.
- [ ] Reports metadata omits any field without a real value rather than showing blank/N/A filler.
- [ ] Settings contains no toggle that doesn't control real, implemented behavior.

---

**Awaiting your review before this is handed to implementation, per your instructions.**
