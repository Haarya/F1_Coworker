# The Silent Co-Driver - Project Execution Plan

## Context
This plan outlines the implementation of "The Silent Co-Driver," a hackathon project that analyzes F1 driver stress from team radio communications and correlates emotional tone with lap time performance. The workspace is currently empty (C:\Users\aarya\Desktop\F1), requiring a complete build from scratch.

## Core Requirements
- Split architecture: user-facing frontend + data-processing backend (no notebook-only)
- Mandatory Hugging Face integration with individual team member accounts
- Use pre-trained models: `openai/whisper-large-v3` (ASR) and `ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition` (emotion)
- Dataset: `MikCil/f1-team-radio` (16kHz audio clips with UTC timestamps) + FastF1 telemetry
- Balanced difficulty: leverage existing models but build meaningful integration logic
- Clean dashboard UI resembling race engineer's command center
- Provision for 3D car model addition if time permits
- End-to-end functional prototype prioritized over partial features

## Technology Stack

### Backend (Python 3.14)
- **Framework**: FastAPI 0.115+ (async, OpenAPI docs, WebSocket support)
- **ASGI Server**: Uvicorn
- **HF Integration**: `transformers` + `torch` (direct pipeline calls)
- **Audio Processing**: `soundfile` + `librosa`
- **Telemetry**: `FastF1` library
- **Data Validation**: Pydantic v2
- **Dataset Access**: `datasets` (Hugging Face)

### Frontend (Node.js 26.5.0 + npm 11.17.0)
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS v4 + custom CSS variables
- **Charts**: Chart.js 4 + react-chartjs-2 (dual-axis)
- **3D Provision**: Three.js via `@react-three/fiber` (placeholder)
- **Audio Playback**: HTML5 Audio API via React hook
- **State Management**: React hooks + Context API

## Project Directory Structure
```
C:\Users\aarya\Desktop\F1/
├── README.md
├── .claude/
│   └── settings.json
├── .env.example
├── .gitignore
├── backend/
│   ├── requirements.txt
│   ├── main.py
│   ├── config.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── whisper.py
│   │   └── wav2vec2_emotion.py
│   ├── pipelines/
│   │   ├── __init__.py
│   │   ├── transcription.py
│   │   ├── stress_analysis.py
│   │   └── correlation.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── radio_service.py
│   │   └── telemetry_service.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── radio.py
│   │   ├── telemetry.py
│   │   └── analysis.py
│   └── routes/
│       ├── __init__.py
│       ├── radio.py
│       ├── telemetry.py
│       └── analysis.py
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── public/
│   │   └── favicon.ico
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── vite-env.d.ts
│       ├── context/
│       │   └── RaceSessionContext.tsx
│       ├── hooks/
│       │   ├── useRadioData.ts
│       │   ├── useTelemetry.ts
│       │   └── useCorrelation.ts
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── TopBar.tsx
│       │   │   └── SidePanel.tsx
│       │   ├── audio/
│       │   │   ├── AudioPlayer.tsx
│       │   │   └── ClipQueue.tsx
│       │   ├── transcript/
│       │   │   └── LiveTranscript.tsx
│       │   ├── stress/
│       │   │   ├── GaugeTachometer.tsx
│       │   │   └── StressIndicator.tsx
│       │   ├── telemetry/
│       │   │   └── TelemetryOverlay.tsx
│       │   ├── car/
│       │   │   ├── CarModelPlaceholder.tsx
│       │   │   └── CarViewport.tsx
│       │   └── shared/
│       │       ├── LoadingSpinner.tsx
│       │       ├── ErrorBoundary.tsx
│       │       └── SkeletonCard.tsx
│       ├── api/
│       │   └── client.ts
│       ├── utils/
│       │   ├── timeFormat.ts
│       │   └── gaThemes.ts
│       └── styles/
│           ├── index.css
│           ├── tachometer.css
│           └── dashboard.css
└── scripts/
    ├── download_hf_dataset.py
    └── benchmark_models.py
```

## Data Pipeline

### Stage 1: Ingestion
- Load `MikCil/f1-team-radio` via HF `datasets` library (streaming mode)
- Accept filters: `driver_id`, `grand_prix`, `session_date`
- Load F1 session via `FastF1`: `fastf1.get_session(year, gp_name, 'R')`
- Extract `.session_start_time` (UTC) for timestamp alignment

### Stage 2: Processing
For each radio message:
1. **Audio bytes** read from dataset entry
2. **Whisper Transcription**: Use `openai/whisper-large-v3` (or use dataset's pre-generated transcription as baseline)
3. **Wav2Vec2 Emotion Analysis**: Process raw 16kHz waveform → emotion probabilities
4. **Cognitive Load Index Calculation**: 
   - Weighted sum: `P(angry)*1.0 + P(fearful)*0.8 + P(sad)*0.6 + P(surprised)*0.4`
   - Normalized to 0-100 scale
   - 0-30: Optimal arousal (green), 30-60: Elevated (yellow), 60-100: Cognitive overload (red)

### Stage 3: Correlation (Timestamp Synchronization)
**Mathematical Approach**:
```
T_msg = audio message UTC timestamp (from dataset)
T_session_start = FastF1 session start time (UTC)
T_delta = (T_msg - T_session_start).total_seconds()  // seconds from session start

telemetry_df['SessionTime'] = seconds from session start
Find closest match: idx = (telemetry_df['SessionTime'] - T_delta).abs().idxmin()
Return telemetry row at idx (speed, throttle, brake, RPM, etc.)
```

**Lap-specific alignment**:
1. Load lap data: `laps_df = session.laps`
2. For lap N: get `T_lap_start` and `T_lap_end` boundaries
3. For each radio message: check if `T_msg` ∈ [`T_lap_start`, `T_lap_end`]
4. If yes: compute `relative_lap_time = (T_msg - T_lap_start).total_seconds()`
5. Match to lap-specific telemetry stream

## Backend API Design

### Radio Endpoints
- `GET /api/v1/radio/events?driver_id=...&gp=...` → List radio events
- `GET /api/v1/radio/audio/{eventId}` → Audio stream (MP3)
- `GET /api/v1/radio/transcript/{eventId}` → `{transcript, confidence, cognitiveLoad}`

### Telemetry Endpoints
- `GET /api/v1/telemetry/sessions?year=...&gp=...` → Available sessions
- `GET /api/v1/telemetry/laps?session=...&driver=...` → Lap times
- `GET /api/v1/telemetry/stream?session=...&driver=...&lapFrom=...&lapUntil=...` → Telemetry stream

### Analysis Endpoints (Core Correlation)
- `GET /api/v1/analysis/correlation?gp=...&driver=...&lapNum=...` → Combined time-series
- `GET /api/v1/analysis/summary?gp=...&driver=...` → Aggregate stats

### WebSocket (Optional)
- `ws://localhost:8000/ws/analysis-flow` → Streaming results

## Frontend Component Tree & State

### Component Hierarchy
```
App
├── RaceSessionProvider (context)
│   ├── Dashboard
│   │   ├── TopBar (driver/GP selectors, lap selector)
│   │   ├── [Grid Layout: 3 columns × 2 rows]
│   │   │   ├── Col 1: SidePanel (EventList + AudioPlayer)
│   │   │   │   ├── EventList (scrollable radio clips)
│   │   │   │   └── AudioPlayer (playback controls)
│   │   │   ├── Col 2: LiveTranscript + StressGauge
│   │   │   │   ├── LiveTranscript (auto-scrolling)
│   │   │   │   └── GaugeTachometer (animated dial)
│   │   │   └── Col 3: TelemetryOverlay + CarPlaceholder
│   │   │       ├── TelemetryOverlay (dual-axis Chart.js)
│   │   │       └── CarModelPlaceholder (later: CarViewport)
│   │   └── SummaryBar (bottom: sector statistics)
```

### RaceSessionContext State
```typescript
interface RaceSessionState {
  // Selection
  driverId: string | null
  gpName: string | null
  trackName: string | 'Race'
  currentLap: number | null
  availableLaps: number[]
  
  // Data
  radioEvents: RadioEvent[]
  telemetryStream: TelemetryPoint[]
  correlationData: CorrelationSeries[]
  
  // Playback
  activeEventId: string | null
  currentTranscript: Transcript
  currentCLIndex: number
  
  // UI
  isPlaying: boolean
  isAnalyzing: boolean
}
```

## Implementation Phases

### Phase 0: Scaffold (30 mins)
1. Create directory structure
2. `npm create vite@latest frontend -- --template react-ts`
3. Backend: `requirements.txt` + install packages
4. Create `.env` with `HF_TOKEN=xxx`
5. Write `README.md` with setup instructions

### Phase 1: Backend Core - Data Sources (1.5 hrs)
1. `services/radio_service.py`: Load HF dataset with streaming/filtering
2. `services/telemetry_service.py`: Load FastF1 sessions, lap data
3. `scripts/test_load.py`: Verify data loading and timestamp access
4. Pydantic schemas: `schemas/radio.py`, `schemas/telemetry.py`

### Phase 2: Debug - Models + Pipelines (1.5 hrs)
1. `models/whisper.py`: Load `openai/whisper-large-v3` (singleton)
2. `models/wav2vec2_emotion.py`: Load emotion model + CL Index function
3. Test both on sample audio from HF dataset
4. Benchmark: target <5s for 1-5 clip processing

### Phase 3: Backend - API Routes (1 hr)
1. Radio endpoints: events, audio, transcript
2. Telemetry endpoints: sessions, laps, stream
3. Analysis endpoints: correlation (core merge), summary
4. Test with curl/Postman

### Phase 4: Frontend - Static Shell (1 hr)
1. Dashboard grid layout with Tailwind + CSS variables
2. Dark theme: `#0a0a0a` background, `#E10600` Ferrari red accent
3. Reusable components: `SkeletonCard`, `LoadingSpinner`, `ErrorBoundary`
4. Hard-coded dropdowns in TopBar
5. `api/client.ts`: Fetch wrappers for all endpoints

### Phase 5: Frontend - Wiring (1.5 hrs)
1. Implement `RaceSessionContext`
2. Wire Radio events list + EventCard components
3. `AudioPlayer`: Play raw audio from `/radio/audio/{eventId}`
4. `LiveTranscript`: Scrollable message block with active transcript

### Phase 6: Frontend - Visualization (1.5 hrs)
1. `GaugeTachometer`:
   - SVG/CSS conic-gradient: green→yellow→orange→red
   - Needle rotation: `transform: rotate(var(--cl-angle)deg)`
   - Transition: `1.2s cubic-bezier(0.34, 1.56, 0.64, 1)`
2. `TelemetryOverlay`:
   - Dual-axis Chart.js line chart
   - X: Lap progress (%)
   - Y1: Speed (km/h) - solid line
   - Y2: Cognitive Load Index - dashed line
   - Radio event markers as dots on chart
3. Test with static mock data

### Phase 7: End-to-End Integration (1 hr)
1. Connect hooks to real API
2. "Analyze" button triggers correlation endpoint
3. Full flow test:
   - Select Verstappen, 2024 Australia, Lap 1
   - See radio clips list
   - Click clip → transcribed text appears
   - Gauge moves to stress value
   - Telemetry chart updates
4. Add summary bar: per-sector driver statistics

### Phase 8: Polish & Extras (Remaining Time)
1. Animation transitions between lap changes
2. Play queue functionality
3. **3D Car Model Provision** (if time):
   - Install `three` + `@react-three/fiber`
   - `CarViewport.tsx`: Three.js scene with rotating car
   - Replace `CarModelPlaceholder` with `CarViewport` in dashboard
   - Optional: map current CL Index to car glow color (green→red)
   - Fallback: placeholder card with "3D model coming soon" text

## Key Design Decisions

### Risk Mitigation & Tradeoffs
1. **Pre-existing Transcriptions**: Use HF dataset's ASR transcriptions as baseline; allow "Re-transcribe" button to run Whisper on-demand (saves 10x latency)
2. **On-Demand Processing**: Only process clips within selected lap window (1-5 clips) → avoids GPU overload from 14k+ clips
3. **No Model Training**: Strictly use HF pre-trained models per rules; novelty in integration logic and temporal alignment
4. **In-Memory Caching**: Load HF dataset once at startup; FastF1 loads sessions on demand → no database needed for MVP
5. **MVP Focus**: Prioritize working correlation + visualization over live WebSocket streaming (historic dataset isn't truly live)

### 3D Car Model Integration Strategy
- **Always Present**: `CarModelPlaceholder.tsx` renders in MVP (dark card with "Coming soon")
- **Future Slot**: `CarViewport.tsx` built but inactive until model available
- **Integration Point**: Dashboard grid column 3 reserves space for either component
- **Minimalist Approach**: If implemented, use low-poly GLB model or Three.js primitives (~2-3 MB) with orbital camera
- **Data Link**: Map current Context CL Index to material emissive intensity (green→red glow)

## Critical Files for Implementation

1. **Backend Core**:
   - `backend/pipelines/correlation.py` (timestamp alignment logic)
   - `backend/models/wav2vec2_emotion.py` (CL Index calculation)
   - `backend/services/radio_service.py` (HF dataset access)

2. **Frontend Components**:
   - `frontend/src/components/stress/GaugeTachometer.tsx` (animated stress gauge)
   - `frontend/src/components/telemetry/TelemetryOverlay.tsx` (dual-axis chart)
   - `frontend/src/context/RaceSessionContext.tsx` (state management)
   - `frontend/src/components/car/CarModelPlaceholder.tsx` (3D provision)

3. **API Contracts**:
   - `backend/schemas/analysis.py` (correlation request/response models)
   - `frontend/src/api/client.ts` (endpoint wrappers)

## Verification & Testing

### Unit Tests
- Validate CL Index calculation with known emotion probabilities
- Test timestamp alignment with mock UTC → telemetry mappings
- Verify Pydantic schema serialization/deserialization

### Integration Tests
- End-to-end flow: dataset → audio → models → correlation → API → UI
- Test with known F1 radio clips and corresponding lap telemetry

### Performance Benchmarks
- Target: <3s response for correlation API (lap with 1-5 radio clips)
- Memory usage: <1GB for dataset caching + model loading
- UI: 60fps gauge animation, smooth chart updates

### Success Criteria
1. User can select driver/Grand Prix/lap
2. System displays list of radio transmissions for that lap
3. Playing a clip shows:
   - Transcribed text in Live Transcript
   - Moving Stress Tachometer needle (green→red based on emotion)
   - Updating Telemetry Overlay (stress vs speed lines)
4. Clear explanation of what the system does and why it matters
5. Clean, intuitive UI requiring minimal explanation to use

This plan provides a balanced, achievable path to a functional hackathon prototype that demonstrates the core concept while leaving room for enhancements like the 3D car model if time permits.