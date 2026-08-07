# Backend Architecture Plan — The Silent Co-Driver

> **Status**: Draft — Awaiting Review  
> **Last Updated**: 2026-08-08  
> **Phases**: 3 (Phase-gated — each phase requires approval before implementation)

---

## 1. System Architecture Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                        FastAPI Application                        │
│                                                                   │
│  ┌─────────┐   ┌──────────────┐   ┌───────────────────────────┐  │
│  │ Routes   │──▶│  Services     │──▶│  Pipelines / Models       │  │
│  │          │   │              │   │                           │  │
│  │ radio.py │   │ radio_svc    │   │ transcription.py          │  │
│  │ tele.py  │   │ telemetry_svc│   │   └─ Whisper Pipeline     │  │
│  │ analysis │   │ analysis_svc │   │ stress_analysis.py        │  │
│  │ circuit  │   │ circuit_svc  │   │   └─ Wav2Vec2 Pipeline    │  │
│  │ predict  │   │ predict_svc  │   │ correlation.py            │  │
│  └─────────┘   └──────────────┘   │   └─ Timestamp Alignment  │  │
│                                    │ cognitive_gforce.py        │  │
│  ┌─────────┐   ┌──────────────┐   │   └─ G_lat Normalization  │  │
│  │ Schemas  │   │  Config      │   │ intercept_engine.py       │  │
│  │ (Pydantic│   │  (.env +     │   │   └─ Rule Engine          │  │
│  │  v2)     │   │   config.py) │   │ lap_penalty_predictor.py  │  │
│  └─────────┘   └──────────────┘   │   └─ Random Forest        │  │
│                                    └───────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    External Data Sources                     │  │
│  │  ┌──────────────┐  ┌───────────────┐  ┌─────────────────┐  │  │
│  │  │ HF Datasets  │  │   FastF1      │  │  HF Transformers│  │  │
│  │  │ MikCil/      │  │   Telemetry   │  │  Whisper +      │  │  │
│  │  │ f1-team-radio│  │   Engine      │  │  Wav2Vec2       │  │  │
│  │  └──────────────┘  └───────────────┘  └─────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
backend/
├── main.py                          # FastAPI app factory, CORS, lifespan
├── config.py                        # Settings via pydantic-settings + .env
├── requirements.txt
│
├── routes/
│   ├── __init__.py                  # Router aggregation
│   ├── radio.py                     # /api/v1/radio/*
│   ├── telemetry.py                 # /api/v1/telemetry/*
│   ├── analysis.py                  # /api/v1/analysis/*
│   ├── circuit.py                   # /api/v1/circuit/*
│   └── prediction.py               # /api/v1/prediction/*
│
├── services/
│   ├── __init__.py
│   ├── radio_service.py             # HF dataset loading, filtering, audio serving
│   ├── telemetry_service.py         # FastF1 session/lap/telemetry access
│   ├── analysis_service.py          # Correlation orchestration
│   ├── circuit_service.py           # Track map coordinate extraction
│   └── prediction_service.py        # Lap penalty prediction orchestration
│
├── pipelines/
│   ├── __init__.py
│   ├── transcription.py             # Whisper ASR pipeline
│   ├── stress_analysis.py           # Wav2Vec2 emotion → CL Index
│   ├── correlation.py               # Timestamp alignment logic
│   ├── cognitive_gforce.py          # G_lat calculation + S_psych normalization
│   ├── intercept_engine.py          # Active Intercept rule engine
│   └── lap_penalty_predictor.py     # Random Forest regressor
│
├── models/
│   ├── __init__.py
│   ├── whisper.py                   # Singleton Whisper model loader
│   └── wav2vec2_emotion.py          # Singleton Wav2Vec2 emotion model loader
│
├── schemas/
│   ├── __init__.py
│   ├── radio.py                     # RadioEvent, Transcript, EmotionScores
│   ├── telemetry.py                 # TelemetryPoint, LapData, SessionInfo
│   ├── analysis.py                  # CorrelationResult, CognitiveSummary
│   ├── circuit.py                   # CircuitCoordinate, StressMapPoint
│   └── prediction.py               # LapPenalty, InterceptStatus
│
├── data/
│   └── fastf1_cache/               # FastF1 local cache (auto-populated)
│
└── scripts/
    ├── download_hf_dataset.py       # Pre-download dataset for offline use
    └── benchmark_models.py          # Model loading + inference benchmarks
```

---

## 3. Configuration — `config.py`

```python
# backend/config.py
from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # ─── Hugging Face ───
    hf_token: str                                     # Required — HF User Access Token
    whisper_model: str = "openai/whisper-large-v3"
    emotion_model: str = "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
    dataset_name: str = "MikCil/f1-team-radio"
    
    # ─── FastF1 ───
    fastf1_cache_dir: Path = Path("./data/fastf1_cache")
    
    # ─── Server ───
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: list[str] = ["http://localhost:5173"]
    
    # ─── ML ───
    cognitive_load_weights: dict = {
        "angry": 1.0,
        "fearful": 0.8,
        "sad": 0.6,
        "surprised": 0.4,
        "disgust": 0.3,
        "happy": 0.0,
        "neutral": 0.0,
    }
    
    # Cognitive G-Force separator alpha coefficient
    gforce_alpha: float = 0.3
    
    # Active Intercept thresholds
    intercept_cl_threshold: float = 80.0
    intercept_braking_threshold: float = 0.8  # brake pressure 0-1
    
    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

settings = Settings()
```

---

## 4. Hugging Face AI Pipelines

### 4.1 ASR — Whisper (`openai/whisper-large-v3`)

**Purpose**: Transcribe F1 team radio audio clips (16kHz mono WAV) into text, even under heavy engine noise and radio static.

**Singleton Loader**:
```python
# backend/models/whisper.py
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import torch

class WhisperModel:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
            torch_dtype = torch.float16 if device == "cuda" else torch.float32
            
            model = AutoModelForSpeechSeq2Seq.from_pretrained(
                settings.whisper_model,
                torch_dtype=torch_dtype,
                low_cpu_mem_usage=True,
                use_safetensors=True,
                token=settings.hf_token
            )
            model.to(device)
            
            processor = AutoProcessor.from_pretrained(
                settings.whisper_model,
                token=settings.hf_token
            )
            
            cls._instance = pipeline(
                "automatic-speech-recognition",
                model=model,
                tokenizer=processor.tokenizer,
                feature_extractor=processor.feature_extractor,
                torch_dtype=torch_dtype,
                device=device,
                return_timestamps="word"     # word-level timestamps
            )
        return cls._instance
```

**Transcription Pipeline**:
```python
# backend/pipelines/transcription.py

async def transcribe_audio(audio_array: np.ndarray, sampling_rate: int = 16000) -> Transcript:
    pipe = WhisperModel.get_instance()
    
    result = pipe(
        {"array": audio_array, "sampling_rate": sampling_rate},
        generate_kwargs={"language": "english", "task": "transcribe"},
        chunk_length_s=30,
        batch_size=1,
    )
    
    return Transcript(
        text=result["text"].strip(),
        confidence=1.0,  # Whisper doesn't expose per-sentence confidence natively
        words=[
            WordTimestamp(word=chunk["text"], start=chunk["timestamp"][0], end=chunk["timestamp"][1])
            for chunk in result.get("chunks", [])
            if chunk.get("timestamp") and chunk["timestamp"][0] is not None
        ]
    )
```

**Performance Notes**:
- First call incurs ~15-30s model download (cached after)
- Inference: ~2-5s per 10s clip on GPU, ~10-20s on CPU
- The dataset provides pre-computed transcripts as a fallback baseline

### 4.2 SER — Wav2Vec2 Emotion (`ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition`)

**Purpose**: Classify the emotional content of a 16kHz audio waveform into 7 emotion categories.

**Singleton Loader**:
```python
# backend/models/wav2vec2_emotion.py
from transformers import pipeline

class EmotionModel:
    _instance = None
    LABEL_MAP = ["angry", "disgust", "fearful", "happy", "neutral", "sad", "surprised"]
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = pipeline(
                "audio-classification",
                model=settings.emotion_model,
                token=settings.hf_token,
                top_k=None  # return all 7 emotion scores
            )
        return cls._instance
```

**Stress Analysis Pipeline**:
```python
# backend/pipelines/stress_analysis.py

async def analyze_stress(audio_array: np.ndarray, sampling_rate: int = 16000) -> StressResult:
    pipe = EmotionModel.get_instance()
    
    # Wav2Vec2 expects 16kHz input
    if sampling_rate != 16000:
        audio_array = librosa.resample(audio_array, orig_sr=sampling_rate, target_sr=16000)
    
    raw_results = pipe({"array": audio_array, "sampling_rate": 16000})
    
    # Build emotion scores dict
    emotions = {r["label"]: r["score"] for r in raw_results}
    
    # Calculate Cognitive Load Index (0-100)
    weights = settings.cognitive_load_weights
    raw_score = sum(emotions.get(emotion, 0.0) * weight for emotion, weight in weights.items())
    cl_index = min(100, max(0, raw_score * 100))
    
    # Determine stress zone
    if cl_index <= 30:
        zone = "optimal"
    elif cl_index <= 60:
        zone = "elevated"
    else:
        zone = "overload"
    
    return StressResult(
        emotions=EmotionScores(**emotions),
        cognitive_load=round(cl_index, 1),
        zone=zone
    )
```

---

## 5. FastF1 Telemetry Engine

### 5.1 Session Loading & Caching

```python
# backend/services/telemetry_service.py
import fastf1

# Enable caching on startup
fastf1.Cache.enable_cache(str(settings.fastf1_cache_dir))

class TelemetryService:
    _sessions: dict[str, fastf1.core.Session] = {}
    
    @classmethod
    async def get_session(cls, year: int, gp_name: str, session_type: str = 'R') -> fastf1.core.Session:
        key = f"{year}_{gp_name}_{session_type}"
        if key not in cls._sessions:
            session = fastf1.get_session(year, gp_name, session_type)
            session.load(telemetry=True, laps=True, weather=False, messages=False)
            cls._sessions[key] = session
        return cls._sessions[key]
```

**First-run behavior**: FastF1 downloads telemetry data from the Ergast/F1 API on first access (~30-60s per session). Subsequent loads are instant from the local cache directory.

### 5.2 Lap & Telemetry Data Extraction

```python
    @classmethod
    async def get_laps(cls, year: int, gp_name: str, driver: str) -> list[LapData]:
        session = await cls.get_session(year, gp_name)
        driver_laps = session.laps.pick_driver(driver)
        
        return [
            LapData(
                lap_number=int(lap["LapNumber"]),
                lap_time=lap["LapTime"].total_seconds() if pd.notna(lap["LapTime"]) else None,
                sector1=lap["Sector1Time"].total_seconds() if pd.notna(lap["Sector1Time"]) else None,
                sector2=lap["Sector2Time"].total_seconds() if pd.notna(lap["Sector2Time"]) else None,
                sector3=lap["Sector3Time"].total_seconds() if pd.notna(lap["Sector3Time"]) else None,
                compound=lap.get("Compound", "UNKNOWN"),
                stint=int(lap.get("Stint", 0)),
            )
            for _, lap in driver_laps.iterrows()
        ]
    
    @classmethod
    async def get_telemetry_stream(
        cls, year: int, gp_name: str, driver: str, 
        lap_from: int, lap_until: int
    ) -> list[TelemetryPoint]:
        session = await cls.get_session(year, gp_name)
        driver_laps = session.laps.pick_driver(driver)
        
        points = []
        for lap_num in range(lap_from, lap_until + 1):
            lap = driver_laps[driver_laps["LapNumber"] == lap_num]
            if lap.empty:
                continue
            
            tel = lap.iloc[0].get_telemetry()
            lap_start = lap.iloc[0]["LapStartDate"]
            
            for _, row in tel.iterrows():
                points.append(TelemetryPoint(
                    session_time=row["SessionTime"].total_seconds(),
                    speed=float(row["Speed"]),
                    throttle=float(row["Throttle"]),
                    brake=bool(row["Brake"]),
                    rpm=int(row["RPM"]),
                    gear=int(row["nGear"]),
                    drs=bool(row.get("DRS", 0)),
                    x=float(row["X"]),
                    y=float(row["Y"]),
                ))
        
        return points
```

### 5.3 Circuit Coordinate Extraction

```python
# backend/services/circuit_service.py

class CircuitService:
    @classmethod
    async def get_circuit_path(cls, year: int, gp_name: str, driver: str) -> list[CircuitCoordinate]:
        """Extract circuit outline from a fast lap's telemetry (X,Y) coordinates."""
        session = await TelemetryService.get_session(year, gp_name)
        driver_laps = session.laps.pick_driver(driver)
        
        # Use the fastest lap for clean circuit data
        fastest = driver_laps.pick_fastest()
        tel = fastest.get_telemetry()
        
        # Normalize coordinates to 0-1000 SVG viewport
        x_vals = tel["X"].values
        y_vals = tel["Y"].values
        x_min, x_max = x_vals.min(), x_vals.max()
        y_min, y_max = y_vals.min(), y_vals.max()
        
        scale = max(x_max - x_min, y_max - y_min)
        
        coords = []
        for _, row in tel.iterrows():
            nx = ((row["X"] - x_min) / scale) * 900 + 50   # 50px padding
            ny = ((row["Y"] - y_min) / scale) * 900 + 50
            
            # Determine sector from lap distance
            lap_dist = row.get("Distance", 0)
            total_dist = tel["Distance"].max()
            sector = 1 if lap_dist < total_dist * 0.33 else (2 if lap_dist < total_dist * 0.66 else 3)
            
            coords.append(CircuitCoordinate(
                x=round(nx, 1),
                y=round(ny, 1),
                sector=sector,
                is_heavy_braking=bool(row["Brake"]) and float(row["Speed"]) > 200
            ))
        
        # Downsample to ~300 points for SVG performance
        step = max(1, len(coords) // 300)
        return coords[::step]
```

### 5.4 UTC Timestamp Alignment

```python
# backend/pipelines/correlation.py

class CorrelationPipeline:
    @staticmethod
    async def align_radio_to_telemetry(
        radio_events: list[RadioEventRaw],
        telemetry: list[TelemetryPoint],
        session_start_utc: datetime
    ) -> list[CorrelationResult]:
        """
        Mathematical Approach:
        
        T_msg    = audio message UTC timestamp (from HF dataset)
        T_start  = FastF1 session start time (UTC)
        T_delta  = (T_msg - T_start).total_seconds()
        
        For each radio message, find the telemetry point with the 
        smallest |telemetry.session_time - T_delta|.
        """
        results = []
        
        # Pre-sort telemetry by session_time for binary search
        tel_times = np.array([t.session_time for t in telemetry])
        
        for event in radio_events:
            # Calculate seconds from session start
            t_delta = (event.utc_timestamp - session_start_utc).total_seconds()
            
            # Binary search for nearest telemetry point
            idx = np.searchsorted(tel_times, t_delta)
            idx = min(idx, len(tel_times) - 1)
            
            # Check neighbors for closest match
            if idx > 0 and abs(tel_times[idx - 1] - t_delta) < abs(tel_times[idx] - t_delta):
                idx = idx - 1
            
            matched_tel = telemetry[idx]
            
            results.append(CorrelationResult(
                event_id=event.id,
                timestamp=t_delta,
                speed=matched_tel.speed,
                throttle=matched_tel.throttle,
                brake=matched_tel.brake,
                rpm=matched_tel.rpm,
                gear=matched_tel.gear,
                x=matched_tel.x,
                y=matched_tel.y,
                cognitive_load=event.cognitive_load,
                g_lat=None,       # Computed in Phase 3 (cognitive_gforce.py)
                s_psych=None,     # Computed in Phase 3
                lap_progress=matched_tel.session_time / tel_times[-1] if tel_times[-1] > 0 else 0,
            ))
        
        return results
```

---

## 6. Mathematical & ML Pipeline Specifications

### 6.1 Lateral Acceleration (G_lat) — Derived from Curvature & Velocity

**Physical Formula**:

The lateral acceleration experienced by a driver in a corner is:

$$G_{\text{lat}} = \frac{v^2 \cdot \kappa}{g}$$

Where:
- $v$ = velocity in m/s (convert from km/h: $v = \text{speed} \times \frac{1}{3.6}$)
- $\kappa$ = path curvature (1/radius) computed from sequential $(X, Y)$ coordinates
- $g$ = 9.81 m/s² (gravitational acceleration)

**Curvature Calculation** from discrete points:

Given three consecutive telemetry points $P_{i-1}(x_1, y_1)$, $P_i(x_2, y_2)$, $P_{i+1}(x_3, y_3)$:

$$\kappa = \frac{2 \cdot |A_{\text{triangle}}|}{d_{12} \cdot d_{23} \cdot d_{13}}$$

Where:
- $A_{\text{triangle}} = \frac{1}{2} |x_1(y_2 - y_3) + x_2(y_3 - y_1) + x_3(y_1 - y_2)|$
- $d_{ij}$ = Euclidean distance between points $i$ and $j$

**Implementation**:
```python
# backend/pipelines/cognitive_gforce.py

def compute_lateral_g(
    telemetry_points: list[TelemetryPoint],
    window_size: int = 5
) -> list[float]:
    """
    Compute lateral G-force at each telemetry point using 
    path curvature derived from (X, Y) coordinates.
    
    Uses a sliding window of `window_size` points for smoothing.
    """
    g_lat_values = [0.0]  # First point has no curvature
    
    for i in range(1, len(telemetry_points) - 1):
        # Get windowed neighbors
        i_start = max(0, i - window_size // 2)
        i_end = min(len(telemetry_points), i + window_size // 2 + 1)
        
        p1 = telemetry_points[i_start]
        p2 = telemetry_points[i]
        p3 = telemetry_points[i_end - 1]
        
        # Triangle area (Shoelace formula)
        area = abs(
            p1.x * (p2.y - p3.y) +
            p2.x * (p3.y - p1.y) +
            p3.x * (p1.y - p2.y)
        ) / 2.0
        
        # Side lengths
        d12 = math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2)
        d23 = math.sqrt((p3.x - p2.x)**2 + (p3.y - p2.y)**2)
        d13 = math.sqrt((p3.x - p1.x)**2 + (p3.y - p1.y)**2)
        
        denom = d12 * d23 * d13
        kappa = (2.0 * area / denom) if denom > 1e-6 else 0.0
        
        # Convert speed km/h → m/s
        v = p2.speed / 3.6
        
        # G_lat = v² · κ / g
        g_lat = (v ** 2 * kappa) / 9.81
        g_lat_values.append(round(g_lat, 3))
    
    g_lat_values.append(0.0)  # Last point
    return g_lat_values
```

### 6.2 Psychological Frustration Index (S_psych) — Normalization

**Purpose**: Separate genuine psychological frustration from physical strain caused by high-G cornering. A driver screaming in a 5G corner is under physical duress, not necessarily frustrated.

**Formula**:

$$S_{\text{psych}} = \max\left(0, \; S_{\text{raw}} - \alpha \cdot G_{\text{lat}}\right)$$

Where:
- $S_{\text{raw}}$ = raw Cognitive Load Index from Wav2Vec2 (0-100)
- $\alpha$ = tunable coefficient (default 0.3) — how much 1G of lateral force "explains away" raw stress
- $G_{\text{lat}}$ = lateral G-force at the radio message timestamp

**Normalization to 0-100**:

$$S_{\text{psych\_norm}} = \min\left(100, \; \frac{S_{\text{psych}}}{\max(S_{\text{psych\_all}})} \times 100\right)$$

**Implementation**:
```python
# backend/pipelines/cognitive_gforce.py

def compute_psychological_frustration(
    raw_cl: float,
    g_lat: float,
    alpha: float = None
) -> float:
    """
    Separate psychological frustration from physical G-force strain.
    
    S_psych = max(0, S_raw - α · G_lat)
    
    Args:
        raw_cl: Raw cognitive load index (0-100)
        g_lat: Lateral G-force at this moment
        alpha: Coefficient (default from settings)
    
    Returns:
        Psychological frustration score (0-100 range, pre-normalization)
    """
    if alpha is None:
        alpha = settings.gforce_alpha
    
    s_psych = max(0.0, raw_cl - alpha * g_lat * 20)  # Scale G to CL range
    return round(s_psych, 1)
```

### 6.3 Active Intercept Rule Engine

**Purpose**: Automatically flash a lockout state when cognitive load is dangerously high AND the driver is entering a heavy braking zone — the most safety-critical combination.

**Rule Logic**:
```
IF  cognitive_load > 80  (CL_THRESHOLD)
AND current_sector.is_heavy_braking == true
AND speed > 200 km/h  (high-speed approach to braking zone)
THEN
    trigger INTERCEPT state
    message = "CHANNEL LOCKED: HIGH COGNITIVE LOAD / CRITICAL TRACK SECTOR"
    duration = 5 seconds (auto-dismiss)
    action = pause radio playback, flash dashboard overlay
```

**Implementation**:
```python
# backend/pipelines/intercept_engine.py

class InterceptEngine:
    @staticmethod
    def evaluate(
        cognitive_load: float,
        telemetry_point: TelemetryPoint,
        circuit_point: CircuitCoordinate
    ) -> InterceptStatus:
        """
        Evaluate whether the Active Intercept should trigger.
        
        Conditions (ALL must be true):
        1. CL > 80
        2. Driver is in or approaching a heavy braking zone
        3. Speed > 200 km/h (high-energy approach)
        """
        cl_exceeded = cognitive_load > settings.intercept_cl_threshold
        in_braking_zone = circuit_point.is_heavy_braking
        high_speed = telemetry_point.speed > 200
        
        should_intercept = cl_exceeded and in_braking_zone and high_speed
        
        return InterceptStatus(
            active=should_intercept,
            cognitive_load=round(cognitive_load, 1),
            speed=telemetry_point.speed,
            sector=circuit_point.sector,
            message=(
                f"CHANNEL LOCKED: HIGH COGNITIVE LOAD ({cognitive_load:.0f}%) "
                f"/ CRITICAL TRACK SECTOR S{circuit_point.sector}"
            ) if should_intercept else None,
            triggered_at=datetime.utcnow() if should_intercept else None,
        )
```

### 6.4 Predictive Lap-Time Penalty — Random Forest Regressor

**Purpose**: Predict how much time a driver will lose in the next sector based on current stress markers and acoustic features.

**Feature Vector** (per radio event):

| Feature | Source | Description |
|---|---|---|
| `cognitive_load` | Wav2Vec2 pipeline | CL index 0-100 |
| `s_psych` | Normalization formula | Psychological frustration 0-100 |
| `g_lat` | Curvature calculation | Lateral G-force |
| `speed_at_radio` | FastF1 telemetry | Speed when radio was triggered |
| `throttle_at_radio` | FastF1 telemetry | Throttle position 0-100 |
| `brake_at_radio` | FastF1 telemetry | Boolean → 0/1 |
| `emotion_angry` | Wav2Vec2 | P(angry) score |
| `emotion_fearful` | Wav2Vec2 | P(fearful) score |
| `sector` | FastF1 | Current sector (1/2/3) |
| `lap_progress` | Derived | Fraction of lap completed |
| `jitter` | Audio feature (librosa) | Fundamental frequency variation |
| `shimmer` | Audio feature (librosa) | Amplitude variation |

**Target Variable**: `sector_time_delta` = (actual sector time) - (driver's best sector time in the session). Positive values indicate slower sectors.

**Training Data Construction**:
```python
# backend/pipelines/lap_penalty_predictor.py

class LapPenaltyPredictor:
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=8,
            min_samples_leaf=5,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.is_trained = False
    
    async def train_on_session(self, year: int, gp_name: str, driver: str):
        """
        Train on all radio events from a session, using the next sector's 
        time delta as the target variable.
        
        This is trained per-session — not a global model.
        Each session provides 20-60 radio events as training samples.
        """
        # 1. Load all radio events for this driver/session
        radio_events = await radio_service.get_events(driver, gp_name, year)
        
        # 2. Load telemetry + lap data
        laps = await telemetry_service.get_laps(year, gp_name, driver)
        telemetry = await telemetry_service.get_telemetry_stream(
            year, gp_name, driver, 1, len(laps)
        )
        
        # 3. Compute G_lat for all telemetry points
        g_lat_values = compute_lateral_g(telemetry)
        
        # 4. Build feature matrix
        X, y = [], []
        best_sectors = self._compute_best_sectors(laps)
        
        for event in radio_events:
            # Find matched telemetry
            tel_idx = self._find_nearest_telemetry(event.timestamp, telemetry)
            tel = telemetry[tel_idx]
            
            # Determine which sector comes next
            next_sector = (event.sector % 3) + 1
            next_lap = event.lap_number if next_sector > event.sector else event.lap_number + 1
            
            # Get actual sector time for target
            actual_sector_time = self._get_sector_time(laps, next_lap, next_sector)
            if actual_sector_time is None:
                continue
            
            delta = actual_sector_time - best_sectors.get(next_sector, actual_sector_time)
            
            features = [
                event.cognitive_load,
                event.s_psych or 0,
                g_lat_values[tel_idx],
                tel.speed,
                tel.throttle,
                1.0 if tel.brake else 0.0,
                event.emotions.angry,
                event.emotions.fearful,
                event.sector,
                event.lap_progress,
                event.jitter or 0,
                event.shimmer or 0,
            ]
            
            X.append(features)
            y.append(delta)
        
        if len(X) >= 10:  # Minimum samples for meaningful training
            X = np.array(X)
            y = np.array(y)
            X_scaled = self.scaler.fit_transform(X)
            self.model.fit(X_scaled, y)
            self.is_trained = True
    
    def predict(self, features: dict) -> LapPenalty:
        """Predict sector time penalty from current stress markers."""
        if not self.is_trained:
            return LapPenalty(sector=features["sector"], probability=0, delta_seconds=0, confidence=0, features=[])
        
        X = np.array([[
            features["cognitive_load"],
            features["s_psych"],
            features["g_lat"],
            features["speed"],
            features["throttle"],
            features["brake"],
            features["emotion_angry"],
            features["emotion_fearful"],
            features["sector"],
            features["lap_progress"],
            features["jitter"],
            features["shimmer"],
        ]])
        
        X_scaled = self.scaler.transform(X)
        
        # Point prediction
        delta = self.model.predict(X_scaled)[0]
        
        # Estimate probability via tree vote distribution
        tree_predictions = np.array([tree.predict(X_scaled)[0] for tree in self.model.estimators_])
        probability = np.mean(tree_predictions > 0.05)  # % of trees predicting >50ms penalty
        confidence = 1.0 - np.std(tree_predictions) / (np.mean(np.abs(tree_predictions)) + 1e-6)
        
        # Feature importance for explainability
        importances = self.model.feature_importances_
        feature_names = [
            "cognitive_load", "s_psych", "g_lat", "speed", "throttle",
            "brake", "angry", "fearful", "sector", "lap_progress", "jitter", "shimmer"
        ]
        top_features = sorted(zip(feature_names, importances), key=lambda x: -x[1])[:3]
        
        return LapPenalty(
            sector=int((features["sector"] % 3) + 1),
            probability=round(float(probability), 2),
            delta_seconds=round(float(max(0, delta)), 3),
            confidence=round(float(max(0, min(1, confidence))), 2),
            features=[f[0] for f in top_features],
        )
```

**Audio Feature Extraction (Jitter/Shimmer)**:
```python
# backend/pipelines/stress_analysis.py (additions)

def extract_acoustic_features(audio_array: np.ndarray, sr: int = 16000) -> dict:
    """Extract jitter and shimmer from audio for the penalty predictor."""
    # Fundamental frequency (F0) via librosa
    f0 = librosa.yin(audio_array, fmin=80, fmax=400, sr=sr)
    f0_voiced = f0[f0 > 0]
    
    # Jitter: variation in F0 period
    if len(f0_voiced) > 1:
        periods = 1.0 / f0_voiced
        jitter = np.mean(np.abs(np.diff(periods))) / np.mean(periods)
    else:
        jitter = 0.0
    
    # Shimmer: variation in amplitude
    rms = librosa.feature.rms(y=audio_array, frame_length=512, hop_length=256)[0]
    if len(rms) > 1:
        shimmer = np.mean(np.abs(np.diff(rms))) / (np.mean(rms) + 1e-6)
    else:
        shimmer = 0.0
    
    return {"jitter": round(float(jitter), 6), "shimmer": round(float(shimmer), 6)}
```

---

## 7. Pydantic Schemas & REST Endpoint Contracts

### 7.1 Schemas

```python
# backend/schemas/radio.py
from pydantic import BaseModel
from datetime import datetime

class EmotionScores(BaseModel):
    angry: float = 0.0
    disgust: float = 0.0
    fearful: float = 0.0
    happy: float = 0.0
    neutral: float = 0.0
    sad: float = 0.0
    surprised: float = 0.0

class WordTimestamp(BaseModel):
    word: str
    start: float | None
    end: float | None

class Transcript(BaseModel):
    text: str
    confidence: float
    words: list[WordTimestamp] = []

class RadioEvent(BaseModel):
    id: str
    utc_timestamp: datetime
    session_time: float          # seconds from session start
    driver_id: str
    gp_name: str
    lap_number: int
    sector: int                  # 1, 2, or 3
    transcript: Transcript
    emotions: EmotionScores
    cognitive_load: float        # 0-100
    audio_url: str
    jitter: float | None = None
    shimmer: float | None = None

class RadioEventListResponse(BaseModel):
    events: list[RadioEvent]
    total: int
    driver_id: str
    gp_name: str
```

```python
# backend/schemas/telemetry.py

class TelemetryPoint(BaseModel):
    session_time: float
    speed: float
    throttle: float
    brake: bool
    rpm: int
    gear: int
    drs: bool
    x: float
    y: float

class LapData(BaseModel):
    lap_number: int
    lap_time: float | None      # seconds
    sector1: float | None
    sector2: float | None
    sector3: float | None
    compound: str
    stint: int

class SessionInfo(BaseModel):
    year: int
    gp_name: str
    session_type: str
    session_start_utc: datetime
    total_laps: int
    drivers: list[str]

class TelemetryStreamResponse(BaseModel):
    points: list[TelemetryPoint]
    lap_from: int
    lap_until: int
    driver_id: str
```

```python
# backend/schemas/analysis.py

class CorrelationResult(BaseModel):
    event_id: str
    timestamp: float
    speed: float
    throttle: float
    brake: bool
    rpm: int
    gear: int
    x: float
    y: float
    cognitive_load: float
    g_lat: float | None
    s_psych: float | None
    lap_progress: float

class CognitiveSummary(BaseModel):
    driver_id: str
    gp_name: str
    total_events: int
    avg_cognitive_load: float
    max_cognitive_load: float
    avg_s_psych: float | None
    sector_breakdown: dict[str, float]  # {"S1": avg_cl, "S2": avg_cl, "S3": avg_cl}
    stress_zone_distribution: dict[str, int]  # {"optimal": N, "elevated": N, "overload": N}

class CorrelationResponse(BaseModel):
    results: list[CorrelationResult]
    summary: CognitiveSummary
```

```python
# backend/schemas/circuit.py

class CircuitCoordinate(BaseModel):
    x: float
    y: float
    sector: int
    is_heavy_braking: bool

class StressMapPoint(BaseModel):
    x: float
    y: float
    stress_level: float  # 0-100

class CircuitResponse(BaseModel):
    coordinates: list[CircuitCoordinate]
    stress_map: list[StressMapPoint]
    gp_name: str
    total_points: int
```

```python
# backend/schemas/prediction.py

class LapPenalty(BaseModel):
    sector: int
    probability: float           # 0-1
    delta_seconds: float         # predicted penalty in seconds
    confidence: float            # 0-1
    features: list[str]          # top contributing features

class InterceptStatus(BaseModel):
    active: bool
    cognitive_load: float
    speed: float
    sector: int
    message: str | None
    triggered_at: datetime | None

class PredictionResponse(BaseModel):
    lap_penalty: LapPenalty
    intercept: InterceptStatus
```

### 7.2 REST Endpoint Contracts

#### Radio Endpoints (`/api/v1/radio/`)

| Method | Path | Query Params | Response | Description |
|--------|------|-------------|----------|-------------|
| GET | `/events` | `driver_id`, `gp_name`, `year`, `lap_from?`, `lap_until?` | `RadioEventListResponse` | List radio events with filters |
| GET | `/audio/{event_id}` | — | `StreamingResponse` (audio/wav) | Stream raw audio bytes |
| POST | `/transcribe/{event_id}` | — | `Transcript` | Run Whisper on-demand (re-transcribe) |

#### Telemetry Endpoints (`/api/v1/telemetry/`)

| Method | Path | Query Params | Response | Description |
|--------|------|-------------|----------|-------------|
| GET | `/sessions` | `year`, `gp_name?` | `list[SessionInfo]` | Available sessions |
| GET | `/laps` | `year`, `gp_name`, `driver_id` | `list[LapData]` | Lap times for a driver |
| GET | `/stream` | `year`, `gp_name`, `driver_id`, `lap_from`, `lap_until` | `TelemetryStreamResponse` | Telemetry data points |

#### Analysis Endpoints (`/api/v1/analysis/`)

| Method | Path | Query Params | Response | Description |
|--------|------|-------------|----------|-------------|
| GET | `/correlation` | `year`, `gp_name`, `driver_id`, `lap_from`, `lap_until` | `CorrelationResponse` | Combined stress + telemetry series |
| GET | `/summary` | `year`, `gp_name`, `driver_id` | `CognitiveSummary` | Aggregate session statistics |

#### Circuit Endpoints (`/api/v1/circuit/`)

| Method | Path | Query Params | Response | Description |
|--------|------|-------------|----------|-------------|
| GET | `/path` | `year`, `gp_name`, `driver_id?` | `CircuitResponse` | SVG-ready circuit coordinates |
| GET | `/stress-map` | `year`, `gp_name`, `driver_id` | `CircuitResponse` | Circuit with stress overlay data |

#### Prediction Endpoints (`/api/v1/prediction/`)

| Method | Path | Query Params / Body | Response | Description |
|--------|------|-------------|----------|-------------|
| POST | `/train` | `year`, `gp_name`, `driver_id` | `{"status": "trained", "samples": N}` | Train Random Forest on session |
| POST | `/predict` | `PredictionRequest` body | `PredictionResponse` | Predict penalty + intercept check |

---

## 8. Application Lifespan & Startup

```python
# backend/main.py

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup & shutdown lifecycle."""
    # ─── Startup ───
    print("🏎️  Loading Whisper model...")
    WhisperModel.get_instance()          # Warm up (first load ~30s)
    
    print("🎙️  Loading Wav2Vec2 emotion model...")
    EmotionModel.get_instance()          # Warm up
    
    print("📡  Enabling FastF1 cache...")
    fastf1.Cache.enable_cache(str(settings.fastf1_cache_dir))
    
    print("✅  The Silent Co-Driver backend is ready.")
    
    yield
    
    # ─── Shutdown ───
    print("🛑  Shutting down...")

app = FastAPI(
    title="The Silent Co-Driver",
    description="F1 Driver Stress Analysis API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
from routes import radio, telemetry, analysis, circuit, prediction
app.include_router(radio.router, prefix="/api/v1/radio", tags=["Radio"])
app.include_router(telemetry.router, prefix="/api/v1/telemetry", tags=["Telemetry"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["Analysis"])
app.include_router(circuit.router, prefix="/api/v1/circuit", tags=["Circuit"])
app.include_router(prediction.router, prefix="/api/v1/prediction", tags=["Prediction"])
```

---

## 9. Phase Breakdown

### Phase 1: Scaffold + Data Sources
- Create directory structure
- `config.py` with pydantic-settings
- `requirements.txt` with all dependencies
- `services/radio_service.py`: Load HF dataset with streaming/filtering
- `services/telemetry_service.py`: Load FastF1 sessions, lap data
- All Pydantic schemas (§7.1)
- `main.py` with lifespan, CORS, router registration
- Route stubs returning mock data (all endpoints return hardcoded responses)

### Phase 2: AI Pipelines + API
- `models/whisper.py`: Singleton Whisper loader
- `models/wav2vec2_emotion.py`: Singleton Wav2Vec2 loader
- `pipelines/transcription.py`: Whisper ASR pipeline
- `pipelines/stress_analysis.py`: Emotion classification + CL Index
- `pipelines/correlation.py`: Timestamp alignment
- `services/circuit_service.py`: Track map coordinate extraction
- Wire all routes to real services (replace mocks)
- Test with curl/Postman: full audio → transcript → emotion → telemetry flow

### Phase 3: Advanced ML
- `pipelines/cognitive_gforce.py`: G_lat calculation + S_psych normalization
- `pipelines/intercept_engine.py`: Active Intercept rule engine
- `pipelines/lap_penalty_predictor.py`: Random Forest regressor
- `pipelines/stress_analysis.py` additions: jitter/shimmer extraction
- Prediction routes: `/train` and `/predict`
- End-to-end test: full pipeline from audio → prediction

---

## 10. Python Dependencies (`requirements.txt`)

```
# ─── Core Framework ───
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
pydantic>=2.0
pydantic-settings>=2.0

# ─── Hugging Face ───
transformers>=4.40.0
torch>=2.2.0
datasets>=2.19.0
huggingface-hub>=0.23.0

# ─── Audio Processing ───
soundfile>=0.12.0
librosa>=0.10.0
numpy>=1.26.0

# ─── Telemetry ───
fastf1>=3.3.0
pandas>=2.2.0

# ─── ML (Phase 3) ───
scikit-learn>=1.4.0

# ─── Utilities ───
python-dotenv>=1.0.0
python-multipart>=0.0.9
```
