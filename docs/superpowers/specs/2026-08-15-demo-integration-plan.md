# Demo-Ready Backend ↔ Frontend Integration Plan

**Deadline: 2 hours from now (~20:10 IST)**

## Background

The frontend UI is built and visually polished. The backend FastAPI server has routes for telemetry, circuit maps, radio events, stress analysis, and lap penalty prediction. However, **several critical components are broken or disconnected**, preventing a working demo. This plan fixes every broken link and seeds the database with real driver data so the demo runs end-to-end.

## Demo Data Spec

**Demo Drivers:** I will pre-cache FastF1 telemetry for these 3 drivers + 1 extra:
- **Max Verstappen (VER)** — 2024 Bahrain GP (March 2, 2024)
- **Lewis Hamilton (HAM)** — 2024 Bahrain GP (March 2, 2024)  
- **Charles Leclerc (LEC)** — 2024 Bahrain GP (March 2, 2024)
- **Isaac Hadjar (HAD)** — Not available in 2024 F1 data (he raced F2). I will substitute **Lando Norris (NOR)** instead.

**Demo Race:** 2024 Bahrain Grand Prix — this is the season opener with complete telemetry for all drivers. The circuit map image `Bahrain_Circuit.avif` needs to exist in the frontend assets.

**Demo Circuit for presentation:** Bahrain International Circuit — you'll select Year 2024, Driver VER/HAM/LEC/NOR, Circuit Bahrain.

The `emotion_model` setting referenced in `wav2vec2_emotion.py` is **missing from `config.py`**. The backend will crash on startup when the stress route tries to initialize. This must be fixed.

## Diagnosed Problems

| # | Component | Problem | Root Cause |
|---|-----------|---------|------------|
| 1 | **Backend won't start** | `config.py` missing `emotion_model` field | `wav2vec2_emotion.py` references `settings.emotion_model` but it doesn't exist |
| 2 | **Driver Analytics stuck on spinner** | `useTelemetryLaps` fires but circuit name doesn't match FastF1 GP name | Frontend sends `"BAHRAIN"` but FastF1 expects `"Bahrain"` (case-sensitive) |
| 3 | **Lap Penalty shows "Awaiting Model Data"** | The prediction chain requires stress → telemetry → POST to `/prediction/lap-penalty` | Stress endpoint crashes (Problem 1), so the chain never fires |
| 4 | **Team Radio shows hardcoded demo text** | `LiveTerminal.tsx` uses a `demoEvents[]` array instead of reading from backend | No connection to `/api/v1/radio/events` or SenseVoice transcripts |
| 5 | **No real driver data cached** | FastF1 downloads on-demand, causing 30s+ first-load lag | Need to pre-cache telemetry for demo drivers |
| 6 | **`radio_ml_database.json` has no SenseVoice transcripts** | The file exists but has minimal data | Need to populate it with real SenseVoice-processed transcripts for the demo drivers |

## Proposed Changes

### Component 1: Fix Backend Config & Startup

#### [MODIFY] `config.py`
- Add `emotion_model: str = "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"` to `Settings`
- This unblocks `wav2vec2_emotion.py` from crashing on `settings.emotion_model`

---

### Component 2: Pre-Cache Demo Data Script

#### [NEW] `backend/scripts/seed_demo_data.py`
- A one-shot script that:
  1. Loads FastF1 2024 Bahrain GP Race session (downloads + caches telemetry for ALL drivers)
  2. Generates a `radio_ml_database.json` with realistic SenseVoice-style transcripts for VER, HAM, LEC, NOR
  3. Each driver gets 8-12 radio events spread across the race with timestamps, transcripts, cognitive load scores, and emotion breakdowns
  4. Uses the real lap timing data to generate realistic `cognitiveLoad` values (higher CL near overtakes, pit stops, incidents)
- **Why not run the full ML pipeline?** Because PyTorch is CPU-only on Python 3.14 and would take hours. Instead, we use FastF1's real lap data + hand-crafted realistic transcripts that match actual F1 radio patterns.

---

### Component 3: Fix Frontend Circuit Name Matching

#### [MODIFY] `telemetry_service.py`
- Add a `normalize_gp_name()` helper that maps common frontend circuit names (e.g., `"BAHRAIN"`, `"ABU DHABI"`) to FastF1-compatible GP names (e.g., `"Bahrain"`, `"Abu Dhabi"`)
- Apply this normalization in `get_laps()` and `get_telemetry_stream()`

#### [MODIFY] `circuit_service.py`
- Same normalization applied to circuit path lookups

---

### Component 4: Connect LiveTerminal to Backend Radio Events

#### [MODIFY] `LiveTerminal.tsx`
- Replace hardcoded `demoEvents[]` array with data from `useRadioEvents()` hook
- Map backend radio events (which have `transcript`, `cognitiveLoad`, `timestamp`) to the existing UI format
- Keep the current styling (DRIVER vs OPERATOR chat bubbles, high-stress glow)
- Fallback to demo events if backend returns empty array (safety net for demo)

---

### Component 5: Fix Stress → Penalty Prediction Chain

#### [MODIFY] `radio.py`
- Add a new endpoint `GET /api/v1/radio/stress-for-driver` that reads the `radio_ml_database.json` and returns the latest stress result for a given driver
- This avoids the slow real-time audio processing during the demo

#### [MODIFY] `LapPenaltyCard.tsx`
- Instead of waiting for the real-time stress endpoint (which requires GPU audio processing), use the pre-computed stress data from `radioEvents` that are already loaded via `useRadioEvents()`
- Build the prediction features from the active radio event's `cognitiveLoad` + latest telemetry lap data
- This makes the penalty prediction fire immediately on page load

---

## Execution Order

1. **Fix `config.py`** (30 seconds) — unblocks backend startup
2. **Run `seed_demo_data.py`** (2-3 minutes) — downloads & caches FastF1 Bahrain 2024, generates radio database
3. **Fix `telemetry_service.py` + `circuit_service.py`** (2 minutes) — GP name normalization
4. **Fix `LiveTerminal.tsx`** (5 minutes) — connect to real radio events
5. **Fix `LapPenaltyCard.tsx`** (5 minutes) — use pre-computed stress for prediction
6. **Start backend, verify all endpoints** (2 minutes)
7. **Open frontend, verify full demo flow** (5 minutes)

**Total estimated time: ~25 minutes of coding + ~5 minutes of FastF1 download**

## Verification Plan

### Automated Tests
```bash
# Backend health
curl http://localhost:8000/health

# Telemetry loads for VER
curl "http://localhost:8000/api/v1/telemetry/laps?year=2024&gp=Bahrain&driver=VER"

# Radio events load
curl "http://localhost:8000/api/v1/radio/events?driver_id=VER&gp=Bahrain"

# Prediction fires
curl -X POST http://localhost:8000/api/v1/prediction/lap-penalty -H "Content-Type: application/json" -d '{"features":{"cognitive_load":75,"speed":280,"throttle":90,"brake":0,"g_lat":1.5,"sector":2}}'
```
