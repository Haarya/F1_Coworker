# Explanation Guide — The Silent Co-Driver

> A beginner-friendly walkthrough of the project architecture, technology choices, and developer setup.

---

## 1. How the Project Works — End-to-End Data Flow

This section traces a single data point from raw audio to a rendered dashboard element. Every radio message follows this exact pipeline:

```
   ┌──────────────────────────────────────────────────────────────────────┐
   │                        DATA FLOW OVERVIEW                           │
   │                                                                     │
   │  ① Raw Audio     ② ASR              ③ SER               ④ FastF1   │
   │  ┌──────────┐   ┌──────────────┐   ┌───────────────┐   ┌────────┐  │
   │  │ 16kHz    │──▶│ Whisper      │──▶│ Wav2Vec2      │──▶│ Match  │  │
   │  │ WAV clip │   │ Transcription│   │ Emotion Class.│   │ UTC →  │  │
   │  │ (HF DS)  │   │              │   │               │   │ Telem  │  │
   │  └──────────┘   └──────┬───────┘   └──────┬────────┘   └───┬────┘  │
   │                        │                   │                │       │
   │                        ▼                   ▼                ▼       │
   │                   "Mate, the        emotions: {       speed: 285   │
   │                    rears are         angry: 0.72,     throttle: 92 │
   │                    gone!"            fearful: 0.15    brake: false  │
   │                                      ...}             G_lat: 3.2   │
   │                                      CL: 78                        │
   │                                                                     │
   │  ⑤ Math Normalization        ⑥ Rule Engine        ⑦ ML Prediction  │
   │  ┌────────────────────┐     ┌────────────────┐   ┌──────────────┐  │
   │  │ S_psych =          │     │ CL > 80?       │   │ Random Forest│  │
   │  │ max(0, 78 -        │     │ Heavy braking?  │   │ → +0.15s     │  │
   │  │   0.3 × 3.2 × 20) │     │ Speed > 200?    │   │   penalty    │  │
   │  │ = max(0, 58.8)     │     │ → INTERCEPT!    │   │   in Sector 3│  │
   │  │ = 58.8             │     └────────────────┘   └──────────────┘  │
   │  └────────────────────┘                                             │
   │                                                                     │
   │  ⑧ Frontend Rendering                                              │
   │  ┌──────────────────────────────────────────────────────────────┐   │
   │  │  GSAP animates needle → 78° on tachometer                   │   │
   │  │  Chart.js plots speed vs. CL on dual-axis chart              │   │
   │  │  Visx colors track map segment red at driver position        │   │
   │  │  Transcript panel shows "Mate, the rears are gone!"          │   │
   │  │  Penalty card shows "82% prob of +0.15s in S3"              │   │
   │  │  Active Intercept flashes if conditions met                  │   │
   │  └──────────────────────────────────────────────────────────────┘   │
   └──────────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Walkthrough

#### Step ① — Audio Ingestion
The `MikCil/f1-team-radio` dataset on Hugging Face contains ~14,000+ audio clips of F1 team radio communications. Each clip is a 16kHz mono WAV file with a UTC timestamp indicating when it was broadcast during a race session.

When the user selects a driver and Grand Prix on the dashboard, the backend fetches the relevant audio clips from this dataset using the HF `datasets` library in streaming mode. Only clips matching the selected lap range are loaded (typically 1-5 clips per lap).

#### Step ② — Automatic Speech Recognition (ASR)
Each audio clip is fed into `openai/whisper-large-v3`, a state-of-the-art speech recognition model. Whisper is particularly good at handling noisy audio — important because F1 team radio has heavy engine noise, wind buffeting, and radio static in the background.

Whisper outputs:
- **Transcript text**: The exact words spoken
- **Word-level timestamps**: When each word was spoken (useful for syncing text animation with audio playback)
- **Confidence score**: How certain the model is

#### Step ③ — Speech Emotion Recognition (SER)
The same raw audio waveform (not the transcript text) is processed by `ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition`. This model analyzes the *acoustic properties* of the voice — pitch, tempo, energy, spectral characteristics — to classify emotion.

It outputs probability scores for 7 emotions:
- `angry`, `fearful`, `sad`, `happy`, `surprised`, `neutral`, `disgust`

These probabilities are combined into a single **Cognitive Load Index (0-100)** using a weighted formula:

```
CL = (P(angry) × 1.0 + P(fearful) × 0.8 + P(sad) × 0.6 + P(surprised) × 0.4) × 100
```

Stress zones:
- **0-30**: Optimal arousal (green) — driver is focused and calm
- **30-60**: Elevated stress (yellow) — increased tension
- **60-100**: Cognitive overload (red) — driver is struggling

#### Step ④ — FastF1 Timestamp Matching
This is where it gets clever. Each radio message has a UTC timestamp. FastF1 provides telemetry data (speed, throttle, brake, RPM, GPS coordinates) also indexed by time.

The correlation pipeline aligns these two timelines:

```
T_delta = (radio_UTC_timestamp - session_start_UTC).total_seconds()

Find telemetry point where |telemetry.session_time - T_delta| is minimized
```

This gives us the *exact* car state (speed, position, braking) at the moment the driver spoke.

#### Step ⑤ — G-Force Math Normalization
A driver screaming through a 5G corner isn't necessarily frustrated — they're under immense physical strain. The Cognitive G-Force Separator removes this physical component:

```
G_lat = v² × κ / g        (lateral G-force from corner curvature)
S_psych = max(0, CL - α × G_lat × 20)    (pure psychological frustration)
```

This means a CL of 78 during a high-G corner might have an S_psych of only 58 — the driver sounds stressed but it's partly physical, not mental.

#### Step ⑥ — Active Intercept Rule Engine
If `CL > 80` AND the driver is entering a heavy braking zone AND speed > 200 km/h, the system triggers a safety lockout overlay. This simulates a real race engineer deciding "don't talk to the driver right now, they need to focus."

#### Step ⑦ — Predictive Lap Penalty
A Random Forest regression model, trained on the session's data, predicts how much time the driver will lose in the next sector based on their current stress markers and acoustic features (voice jitter/shimmer).

#### Step ⑧ — Frontend Rendering
All of the above arrives at the React dashboard via REST API calls. GSAP animations drive the gauge needle. Chart.js renders the telemetry chart. Visx paints the track map. The playback system advances through clips to simulate a live race feed.

---

## 2. Tech Stack & Tool Justification

### Frontend

| Tool | What It Does | Why We Chose It | Alternatives Considered |
|------|-------------|-----------------|------------------------|
| **React 19** | UI component framework | Industry standard, excellent ecosystem, hooks-based architecture fits our state management needs | Vue, Svelte — React has better library support for our viz stack |
| **Vite** | Build tool & dev server | Instant HMR, native ESM, orders of magnitude faster than Webpack | Create React App (deprecated), Webpack (slower) |
| **Tailwind CSS v4** | Utility-first CSS | Rapid styling without context-switching to CSS files, built-in dark mode support | Styled Components (runtime overhead), CSS Modules (verbose) |
| **Framer Motion** | Scroll-linked canvas animation | Already in use for the Ferrari landing page; `useScroll`/`useTransform` are perfect for scroll-to-frame mapping | GSAP ScrollTrigger (would work, but we'd lose the existing implementation) |
| **GSAP** | Complex timeline animations | Best-in-class for physics-based easing (needle bounce), staggered reveals, and coordinating multiple animations in sync | Framer Motion variants (less precise timing control), CSS animations (no orchestration) |
| **Chart.js + react-chartjs-2** | Telemetry line charts | High-performance canvas-based rendering (5000+ points at 60fps), dual-axis support out of the box, excellent plugin ecosystem | Recharts (SVG-based, slower at high point counts), D3 (too low-level for charts) |
| **Visx (D3-based)** | Track map SVG rendering | React-native D3 bindings that compose naturally with JSX; scales, shapes, and tooltips as React components | Raw D3 (imperative, fights React's declarative model), Mapbox (overkill for circuit outlines) |
| **@react-three/fiber** | 3D car viewport | React renderer for Three.js — declarative 3D scenes that integrate with React state management | Raw Three.js (imperative), Babylon.js (heavier bundle) |
| **React Router v7** | Client-side routing | Already installed; handles Landing → Dashboard → Stint navigation | Next.js router (we chose Vite over Next.js) |

### Backend

| Tool | What It Does | Why We Chose It | Alternatives Considered |
|------|-------------|-----------------|------------------------|
| **FastAPI** | REST API framework | Async by default, auto-generates OpenAPI docs, Pydantic integration, excellent for ML serving | Flask (no async), Django (too heavy), Express.js (would split the ML from the API) |
| **Uvicorn** | ASGI server | Standard FastAPI server, high performance | Gunicorn + Uvicorn workers (for production scale — overkill for hackathon) |
| **Pydantic v2** | Data validation & serialization | Type-safe request/response schemas, auto-generates JSON Schema, integrates natively with FastAPI | Marshmallow (separate from FastAPI), dataclasses (no validation) |
| **Hugging Face Transformers** | ML model loading & inference | Unified API for loading Whisper and Wav2Vec2, handles tokenization/preprocessing automatically | Direct PyTorch model loading (more code, less abstractions) |
| **Whisper (openai/whisper-large-v3)** | Speech-to-text | State-of-the-art ASR that handles noisy F1 audio; word-level timestamps for UI sync | Whisper-small (faster but less accurate), Google Speech-to-Text (requires API key, cloud dependency) |
| **Wav2Vec2 Emotion** | Emotion classification | Works directly on raw audio waveform (no text needed); 7-class emotion output maps cleanly to our CL formula | Text-based sentiment analysis (loses vocal cues entirely), OpenAI GPT-4o audio (expensive, cloud-only) |
| **FastF1** | F1 telemetry data | Official-grade telemetry access: lap times, car telemetry (speed, throttle, brake, RPM), GPS coordinates, sector data | Manual Ergast API calls (lower fidelity, no telemetry), paid F1 API (cost prohibitive) |
| **Scikit-learn** | Random Forest predictor | Simple, interpretable ML for the lap penalty prediction; trains in milliseconds on ~50 samples | XGBoost (overkill), PyTorch NN (needs far more data than we have) |
| **librosa** | Audio feature extraction | Industry-standard for jitter, shimmer, pitch, and spectral analysis; complements the deep learning models with classical acoustic features | torchaudio (duplicates PyTorch dependency), custom FFT (reinventing the wheel) |

---

## 3. Developer Action Checklist & Setup Guide

### 3.1 Prerequisites

| Requirement | Version | How to Check |
|-------------|---------|-------------|
| **Python** | 3.11 or 3.12 (recommended) | `python --version` |
| **Node.js** | 18+ (LTS) or 26.5.0 | `node --version` |
| **npm** | 9+ or 11.17.0 | `npm --version` |
| **Git** | Any recent version | `git --version` |
| **GPU (optional)** | NVIDIA with CUDA 11.8+ | `nvidia-smi` |

> [!NOTE]
> **Python 3.14** is listed in `PLAN.md` but `torch` may not have wheels for it yet. Use Python 3.11 or 3.12 for guaranteed compatibility with PyTorch and all ML dependencies.

> [!NOTE]
> **GPU is optional but strongly recommended.** Whisper-large-v3 runs ~5× faster on GPU. On CPU, expect ~20s per 10s audio clip. The rest of the stack (FastF1, API, frontend) runs fine on CPU.

### 3.2 Hugging Face Token Setup

The project uses two gated/large models from Hugging Face. You need a **User Access Token** to download them.

**Steps**:

1. **Create a Hugging Face Account**: Go to [huggingface.co](https://huggingface.co) and sign up (or log in).

2. **Generate an Access Token**:
   - Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   - Click **"New token"**
   - Name it something like `silent-codriver`
   - Select **"Read"** access (we only need to download models, not upload)
   - Click **"Generate"**
   - **Copy the token immediately** — it starts with `hf_` and looks like `hf_ABCDefGHijKLmnOPqrSTuvWXyz123456`

3. **Accept Model Agreements** (if required):
   - Visit [huggingface.co/openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3) — if there's an agreement page, accept it.
   - Visit [huggingface.co/ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition](https://huggingface.co/ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition) — same process.

4. **Store the Token**: You'll add it to your `.env` file in the next section.

### 3.3 Environment Variables (`.env`)

Create a `.env` file in the project root (`C:\Users\aarya\Desktop\F1\.env`):

```env
# ─── Hugging Face ───
HF_TOKEN=hf_YOUR_TOKEN_HERE

# ─── Backend ───
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=["http://localhost:5173"]

# ─── Models (defaults are fine, override only if needed) ───
# WHISPER_MODEL=openai/whisper-large-v3
# EMOTION_MODEL=ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition
# DATASET_NAME=MikCil/f1-team-radio

# ─── ML Tuning ───
# GFORCE_ALPHA=0.3
# INTERCEPT_CL_THRESHOLD=80.0
```

Also create `.env.example` (committed to git, without real values) so other team members know what to set up.

### 3.4 Backend Setup

```bash
# From project root: C:\Users\aarya\Desktop\F1

# 1. Create Python virtual environment
python -m venv .venv

# 2. Activate it
#    Windows (PowerShell):
.venv\Scripts\Activate.ps1
#    Windows (cmd):
.venv\Scripts\activate.bat
#    macOS/Linux:
source .venv/bin/activate

# 3. Install dependencies
pip install -r backend/requirements.txt

# 4. (Optional) Install PyTorch with CUDA support
# If you have an NVIDIA GPU, install the CUDA version for 5× faster inference:
pip install torch --index-url https://download.pytorch.org/whl/cu118

# 5. Start the backend server
cd backend
uvicorn main:app --reload --port 8000

# The API will be available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

### 3.5 Frontend Setup

```bash
# From project root: C:\Users\aarya\Desktop\F1

# 1. Navigate to frontend
cd frontend

# 2. Install all npm dependencies
npm install

# 3. Start the dev server
npm run dev

# The frontend will be available at http://localhost:5173
```

### 3.6 FastF1 Caching — First Run Behavior

> [!IMPORTANT]
> **The first time you request telemetry data for a specific race session, FastF1 will download it from the internet.** This can take 30-60 seconds per session. After the first download, data is cached locally in `backend/data/fastf1_cache/` and subsequent loads are instant.

**What happens on first request**:
1. User selects "2024 Australian GP" on the dashboard
2. Frontend calls `GET /api/v1/telemetry/laps?year=2024&gp_name=Australia&driver_id=VER`
3. Backend calls `fastf1.get_session(2024, 'Australia', 'R')` — this triggers a download
4. FastF1 downloads timing data, telemetry, and lap information from the Ergast API
5. Data is saved to `backend/data/fastf1_cache/`
6. Next request for the same session loads instantly from cache

**To pre-cache sessions** (recommended before demo):
```bash
cd backend
python scripts/download_hf_dataset.py --year 2024 --gp Australia
```

### 3.7 Running Both Services Together

For development, you need two terminal windows:

**Terminal 1 — Backend**:
```bash
cd C:\Users\aarya\Desktop\F1
.venv\Scripts\Activate.ps1
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend**:
```bash
cd C:\Users\aarya\Desktop\F1\frontend
npm run dev
```

Then open `http://localhost:5173` in your browser. The landing page loads first (Ferrari animation), and clicking "Enter Command Center" takes you to the dashboard, which communicates with the backend at `http://localhost:8000`.

---

## 4. Project Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             USER'S BROWSER                             │
│                                                                        │
│  ┌──────────────────┐     ┌────────────────────────────────────────┐   │
│  │  Landing Page    │     │         Pit Wall Dashboard              │   │
│  │  (Framer Motion  │────▶│                                        │   │
│  │   Canvas Scroll) │     │  ┌────────┐ ┌─────────┐ ┌──────────┐  │   │
│  │                  │     │  │ Gauges │ │ Charts  │ │ Track    │  │   │
│  │  Ferrari         │     │  │ (GSAP) │ │(ChartJS)│ │ Map      │  │   │
│  │  Image Sequence  │     │  │        │ │         │ │ (Visx)   │  │   │
│  └──────────────────┘     │  └────────┘ └─────────┘ └──────────┘  │   │
│                           │  ┌────────┐ ┌─────────┐ ┌──────────┐  │   │
│                           │  │Transcr.│ │ Audio   │ │ 3D Car   │  │   │
│                           │  │ Panel  │ │ Player  │ │(Three.js)│  │   │
│                           │  └────────┘ └─────────┘ └──────────┘  │   │
│                           └────────────────┬───────────────────────┘   │
│                                            │                           │
└────────────────────────────────────────────┼───────────────────────────┘
                                             │  HTTP REST API calls
                                             │  (fetch / axios)
                                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          FastAPI BACKEND                               │
│                       http://localhost:8000                             │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                         ROUTES LAYER                             │  │
│  │  /api/v1/radio/*   /api/v1/telemetry/*   /api/v1/analysis/*     │  │
│  │  /api/v1/circuit/*   /api/v1/prediction/*                       │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
│                                 │                                      │
│  ┌──────────────────────────────▼───────────────────────────────────┐  │
│  │                       SERVICES LAYER                             │  │
│  │  radio_service    telemetry_service    analysis_service          │  │
│  │  circuit_service  prediction_service                             │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
│                                 │                                      │
│  ┌──────────────────────────────▼───────────────────────────────────┐  │
│  │                      PIPELINES LAYER                             │  │
│  │  transcription.py        stress_analysis.py                      │  │
│  │  correlation.py          cognitive_gforce.py                     │  │
│  │  intercept_engine.py     lap_penalty_predictor.py                │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
│                                 │                                      │
│  ┌──────────────────────────────▼───────────────────────────────────┐  │
│  │                    EXTERNAL DATA SOURCES                         │  │
│  │                                                                  │  │
│  │  ┌──────────────┐  ┌───────────────┐  ┌──────────────────────┐  │  │
│  │  │ HuggingFace  │  │    FastF1     │  │  HF Transformers     │  │  │
│  │  │ Datasets     │  │  Telemetry    │  │  Whisper + Wav2Vec2  │  │  │
│  │  │              │  │  Engine       │  │  (PyTorch)           │  │  │
│  │  │ MikCil/      │  │              │  │                      │  │  │
│  │  │ f1-team-radio│  │ Speed, RPM,  │  │  ASR + Emotion       │  │  │
│  │  │              │  │ GPS, Brake,  │  │  Classification      │  │  │
│  │  │ Audio clips  │  │ Throttle     │  │                      │  │  │
│  │  └──────────────┘  └───────────────┘  └──────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Key Concepts Explained

### What is "Scrollytelling"?
Scrollytelling is a web design technique where the user's scroll position controls an animation or story progression. In our project, scrolling through the landing page advances a sequence of 96 Ferrari images frame-by-frame, creating a smooth cinematic animation entirely controlled by the scroll wheel.

### What is a "Cognitive Load Index"?
In cognitive science, cognitive load refers to the total amount of mental effort being used in working memory. Our CL Index is a simplified proxy: we measure how *stressed* a driver sounds (via emotion classification of their voice) and map it to a 0-100 scale. High CL suggests the driver is mentally overloaded — they're more likely to make mistakes.

### What is the "Cognitive G-Force Separator"?
When an F1 car takes a corner at 200+ km/h, the driver experiences 4-6G of lateral force. This physical strain can make them grunt, strain their voice, or sound "stressed" even when they're perfectly focused. The separator removes this physical component from the stress measurement, leaving only genuine psychological frustration.

### What is "Active Intercept"?
In real F1, race engineers sometimes withhold radio messages if the driver is in a critical moment (like a heavy braking zone). Our Active Intercept simulates this: if the driver's cognitive load is dangerously high AND they're approaching a braking zone, the system locks the radio channel and flashes a warning overlay.

### What is FastF1?
FastF1 is a Python library that provides access to Formula 1 timing and telemetry data. It pulls data from the official F1 timing system and provides lap times, car telemetry (speed, throttle, brake, RPM), driver positions, and even GPS coordinates of the car on track — all indexed by time.

---

## 6. Phased Implementation Order

### Phase 1: Foundation
**Goal**: A working frontend shell + backend scaffold with mock data.

| Component | What Gets Built |
|-----------|----------------|
| Frontend | Dashboard grid layout, TopBar, SummaryBar, skeleton cards, GSAP entry animation, `RaceSessionContext` with mock data |
| Backend | Directory structure, `config.py`, all Pydantic schemas, route stubs returning hardcoded JSON, `main.py` with CORS |
| Integration | Frontend calls backend mock endpoints successfully |

### Phase 2: Core Intelligence
**Goal**: Real AI analysis and telemetry data flowing through the system.

| Component | What Gets Built |
|-----------|----------------|
| Frontend | Tachometer gauge (SVG + GSAP), Chart.js telemetry chart, Visx track map, LiveTranscript, AudioPlayer, simulated real-time playback |
| Backend | Whisper + Wav2Vec2 pipelines, FastF1 integration, timestamp correlation, circuit coordinate extraction, all endpoints serving real data |
| Integration | Full flow: select driver → see real radio clips → play audio → see transcript + stress gauge + telemetry chart + track map |

### Phase 3: Advanced Features
**Goal**: G-Force separation, Active Intercept, lap penalty prediction, 3D car.

| Component | What Gets Built |
|-----------|----------------|
| Frontend | Cognitive G-Force dual gauges, Active Intercept overlay (GSAP flash), LapPenaltyCard, CarViewport (Three.js with GLB), StintDeepDive route |
| Backend | G_lat computation, S_psych normalization, intercept rule engine, Random Forest lap penalty predictor, acoustic feature extraction (jitter/shimmer) |
| Integration | Full advanced pipeline: stress → G-force separation → intercept check → penalty prediction → dashboard rendering |
