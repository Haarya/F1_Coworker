# Frontend Architecture Plan — The Silent Co-Driver

> **Status**: Draft — Awaiting Review  
> **Last Updated**: 2026-08-08  
> **Phases**: 3 (Phase-gated — each phase requires approval before implementation)

---

## 1. Web Journey — Full User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  LANDING PAGE  (route: "/")                                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Ferrari Canvas Scrollytelling (Framer Motion — existing) │  │
│  │  → Autoplay on load → Scroll-linked replay               │  │
│  │  → Text overlays fade in/out with scroll progress         │  │
│  │  → "Enter Command Center" CTA at bottom                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          │                                      │
│                    CTA click → navigate("/dashboard")           │
│                          ▼                                      │
│  PIT WALL COMMAND DASHBOARD  (route: "/dashboard")             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  GSAP staggered reveal animation on mount                 │  │
│  │  ┌─────────┐ ┌─────────────────┐ ┌───────────────────┐   │  │
│  │  │ Radio   │ │ Stress Gauges   │ │ Telemetry Chart   │   │  │
│  │  │ Events  │ │ + Transcript    │ │ + Track Map       │   │  │
│  │  │ Panel   │ │                 │ │                   │   │  │
│  │  ├─────────┤ ├─────────────────┤ ├───────────────────┤   │  │
│  │  │ Audio   │ │ Cognitive       │ │ 3D Car / Penalty  │   │  │
│  │  │ Player  │ │ G-Force Gauge   │ │ Prediction Card   │   │  │
│  │  └─────────┘ └─────────────────┘ └───────────────────┘   │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              Summary / Sector Stats Bar              │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          │                                      │
│              Optional: Click stint → Stint Deep-Dive View       │
│                          ▼                                      │
│  STINT DEEP-DIVE  (route: "/dashboard/stint/:stintId")         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Full-width telemetry timeline                            │  │
│  │  Lap-by-lap stress heatmap                                │  │
│  │  All radio clips for the stint in chronological order     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture & Hierarchy

### 2.1 Complete Component Tree

```
App
├── LandingPage                          (existing — Framer Motion canvas)
│   ├── <canvas>                         (Ferrari image sequence renderer)
│   ├── TextOverlay × 3                  (scroll-synced text blocks)
│   └── CTAButton → Link to /dashboard
│
├── RaceSessionProvider                  (Context wrapper — wraps all dashboard routes)
│   ├── Dashboard                        (main dashboard layout)
│   │   ├── TopBar
│   │   │   ├── BackLink                 (← arrow to landing)
│   │   │   ├── BrandLogo                (Activity icon + "Command Center")
│   │   │   ├── DriverSelector           (<select> — populates from API)
│   │   │   ├── GPSelector               (<select> — populates from API)
│   │   │   ├── LapSelector              (<select> — populates from API)
│   │   │   └── PlaybackControls         (Play/Pause/Speed for simulated real-time)
│   │   │
│   │   ├── MainGrid                     (CSS Grid: 3 cols × 2 rows)
│   │   │   │
│   │   │   ├── [Col 1, Row 1-2] RadioPanel (full height left column)
│   │   │   │   ├── RadioEventList
│   │   │   │   │   └── RadioEventCard × N   (timestamp, stress badge, mini waveform)
│   │   │   │   └── AudioPlayer
│   │   │   │       ├── PlayButton
│   │   │   │       ├── ProgressBar
│   │   │   │       ├── TimeDisplay
│   │   │   │       └── VolumeSlider
│   │   │   │
│   │   │   ├── [Col 2, Row 1] StressGaugePanel
│   │   │   │   ├── CognitiveLoadTachometer    (SVG + GSAP needle)
│   │   │   │   │   ├── ArcBackground         (conic gradient: green→yellow→red)
│   │   │   │   │   ├── Needle                 (GSAP physics-eased rotation)
│   │   │   │   │   ├── CenterDot
│   │   │   │   │   └── ValueDisplay           (numeric CL index)
│   │   │   │   └── CognitiveGForceSeparator   (dual mini-gauges)
│   │   │   │       ├── PhysicalStrainGauge     (G_lat visualization)
│   │   │   │       └── PsychFrustrationGauge   (S_psych visualization)
│   │   │   │
│   │   │   ├── [Col 2, Row 2] TranscriptPanel
│   │   │   │   ├── LiveTranscript             (auto-scrolling message feed)
│   │   │   │   │   └── TranscriptLine × N     (speaker, text, emotion badge)
│   │   │   │   └── EmotionBreakdownBar        (horizontal stacked bar of emotions)
│   │   │   │
│   │   │   ├── [Col 3, Row 1] TelemetryPanel
│   │   │   │   ├── TelemetryChart             (Chart.js dual-axis line chart)
│   │   │   │   │   ├── SpeedLine              (Y1 — solid, gradient fill)
│   │   │   │   │   ├── StressLine             (Y2 — dashed red)
│   │   │   │   │   └── RadioMarkers           (vertical lines at radio timestamps)
│   │   │   │   └── DynamicStressTrackMap      (Visx/D3 SVG circuit map)
│   │   │   │       ├── TrackPath              (SVG <path> from FastF1 X,Y coords)
│   │   │   │       ├── StressColorSegments    (green→yellow→red gradient stops)
│   │   │   │       ├── DriverPositionDot      (animated current position)
│   │   │   │       └── SectorLabels           (S1, S2, S3 text markers)
│   │   │   │
│   │   │   └── [Col 3, Row 2] CarPredictionPanel
│   │   │       ├── CarViewport                (Three.js — if .glb provided)
│   │   │       │   ├── GLBModel               (loaded via useGLTF)
│   │   │       │   ├── EmissiveLighting       (color mapped to CL index)
│   │   │       │   ├── OrbitControls          (user can rotate)
│   │   │       │   └── EnvironmentMap         (dark studio HDRI)
│   │   │       ├── CarPlaceholder             (fallback if no .glb)
│   │   │       └── LapPenaltyCard             (predictive penalty display)
│   │   │           ├── PenaltyProbability     ("82% probability")
│   │   │           ├── PenaltyDelta           ("+0.15s in Sector 3")
│   │   │           └── ConfidenceBadge        (model confidence indicator)
│   │   │
│   │   ├── ActiveInterceptOverlay             (GSAP flash overlay — conditional)
│   │   │   ├── LockoutBanner                  ("CHANNEL LOCKED: HIGH COGNITIVE LOAD")
│   │   │   ├── SectorIndicator                ("CRITICAL TRACK SECTOR")
│   │   │   └── DismissTimer                   (auto-dismiss after 5s or manual)
│   │   │
│   │   └── SummaryBar                         (bottom bar — sector times + status)
│   │       ├── SectorTime × 3
│   │       ├── TotalLapTime
│   │       └── LiveStatusIndicator
│   │
│   └── StintDeepDive                          (route: /dashboard/stint/:stintId)
│       ├── StintHeader                        (stint number, tyre compound, lap range)
│       ├── FullWidthTelemetryTimeline         (expanded Chart.js view)
│       ├── LapStressHeatmap                   (grid: laps × sectors, color-coded)
│       └── StintRadioFeed                     (all radio clips chronologically)
│
└── Shared Components
    ├── LoadingSpinner
    ├── SkeletonCard
    ├── ErrorBoundary
    ├── StatusBadge                            (reusable stress level badge)
    └── GlowCard                              (card with dynamic border glow)
```

### 2.2 State Management — `RaceSessionContext`

```typescript
// frontend/src/context/RaceSessionContext.tsx

interface RaceSessionState {
  // ─── Selection ───
  driverId: string | null;
  gpName: string | null;
  sessionType: 'Race' | 'Qualifying' | 'Practice';
  currentLap: number | null;
  availableLaps: number[];

  // ─── Data (fetched from backend) ───
  radioEvents: RadioEvent[];
  telemetryStream: TelemetryPoint[];
  correlationData: CorrelationSeries[];
  circuitPath: CircuitCoordinate[];        // FastF1 (X,Y) for track map
  stressMap: StressMapPoint[];             // per-position stress color data

  // ─── Playback (simulated real-time) ───
  activeEventId: string | null;
  currentTranscript: Transcript | null;
  currentCLIndex: number;                  // 0-100
  currentGLat: number;                     // lateral G-force
  currentSPsych: number;                   // psychological frustration index
  playbackState: 'idle' | 'playing' | 'paused';
  playbackSpeed: 1 | 2 | 4;               // multiplier
  playbackTimestamp: number;               // current simulated UTC seconds

  // ─── Predictions ───
  lapPenaltyPrediction: LapPenalty | null;
  interceptActive: boolean;                // Active Intercept lockout state

  // ─── UI ───
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
}

// Action types for useReducer
type RaceSessionAction =
  | { type: 'SET_DRIVER'; payload: string }
  | { type: 'SET_GP'; payload: string }
  | { type: 'SET_LAP'; payload: number }
  | { type: 'LOAD_RADIO_EVENTS'; payload: RadioEvent[] }
  | { type: 'LOAD_TELEMETRY'; payload: TelemetryPoint[] }
  | { type: 'LOAD_CORRELATION'; payload: CorrelationSeries[] }
  | { type: 'LOAD_CIRCUIT'; payload: CircuitCoordinate[] }
  | { type: 'SET_ACTIVE_EVENT'; payload: string }
  | { type: 'UPDATE_STRESS'; payload: { cl: number; gLat: number; sPsych: number } }
  | { type: 'UPDATE_PLAYBACK'; payload: Partial<PlaybackState> }
  | { type: 'SET_PREDICTION'; payload: LapPenalty }
  | { type: 'TRIGGER_INTERCEPT'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean };
```

### 2.3 TypeScript Interfaces (Frontend Models)

```typescript
// frontend/src/types/index.ts

interface RadioEvent {
  id: string;
  timestamp: number;            // UTC seconds from session start
  driverId: string;
  transcript: string;
  emotions: EmotionScores;
  cognitiveLoad: number;        // 0-100
  audioUrl: string;             // backend endpoint for audio stream
  lapNumber: number;
  sector: 1 | 2 | 3;
}

interface EmotionScores {
  angry: number;
  fearful: number;
  sad: number;
  happy: number;
  surprised: number;
  neutral: number;
  disgust: number;
}

interface TelemetryPoint {
  sessionTime: number;          // seconds from session start
  speed: number;                // km/h
  throttle: number;             // 0-100%
  brake: boolean;
  rpm: number;
  gear: number;
  drs: boolean;
  x: number;                    // track position X
  y: number;                    // track position Y
}

interface CircuitCoordinate {
  x: number;
  y: number;
  sector: 1 | 2 | 3;
  isHeavyBraking: boolean;      // for Active Intercept zones
}

interface StressMapPoint {
  x: number;
  y: number;
  stressLevel: number;          // 0-100 mapped to green→yellow→red
}

interface CorrelationSeries {
  timestamp: number;
  speed: number;
  cognitiveLoad: number;
  gLat: number;
  sPsych: number;
  lapProgress: number;          // 0-1 fraction of lap
}

interface LapPenalty {
  sector: 1 | 2 | 3;
  probability: number;          // 0-1
  deltaSeconds: number;         // predicted time penalty in seconds
  confidence: number;           // model confidence 0-1
  features: string[];           // contributing factors
}

interface Transcript {
  text: string;
  speaker: 'driver' | 'engineer';
  confidence: number;
  words: { word: string; start: number; end: number }[];
}
```

---

## 3. Visualization Stack

### 3.1 Dynamic Stress Track Map — Visx / D3.js

**Purpose**: Render an SVG circuit map using FastF1 `(X, Y)` telemetry coordinates, with each segment color-coded by driver stress level at that position.

**Implementation**:
```
Data Flow:
  FastF1 (X,Y) coords → Backend normalizes to SVG viewBox → 
  Frontend receives CircuitCoordinate[] → 
  Visx LinePath renders SVG <path> → 
  Each micro-segment gets stroke color from stress interpolation
```

**Key Visx Components**:
- `@visx/shape` → `LinePath` for the track outline
- `@visx/scale` → `scaleLinear` for mapping X,Y to SVG viewport
- `@visx/gradient` → Dynamic gradient stops mapped to stress levels
- `@visx/tooltip` → Hover tooltips showing speed/stress at position

**Color Mapping**:
```
Stress 0-30   → #22C55E (green)   — Optimal
Stress 30-60  → #EAB308 (yellow)  — Elevated
Stress 60-80  → #F97316 (orange)  — High
Stress 80-100 → #EF4444 (red)     — Critical
```

**Rendering Strategy**: The track path is split into ~200 micro-segments. Each segment's stroke color is determined by interpolating the nearest stress data point. An animated dot shows the driver's current position, synced to the playback timer.

### 3.2 Telemetry Charts — Chart.js (`react-chartjs-2`)

**Purpose**: High-performance dual-axis line chart showing speed vs. cognitive load over lap progress.

**Configuration**:
- **X-axis**: Lap progress (0% → 100%) or session time
- **Y1-axis** (left): Speed in km/h — solid line, blue-white gradient fill
- **Y2-axis** (right): Cognitive Load Index (0-100) — dashed red line
- **Annotations**: Vertical lines at radio event timestamps with tooltip on hover
- **Plugin**: `chartjs-plugin-annotation` for radio markers

**Performance**: Chart.js handles up to 5,000 data points at 60fps. Telemetry data is downsampled to ~500 points per lap for smooth rendering.

### 3.3 Cognitive Load Tachometer — Pure SVG + GSAP

**Purpose**: An F1-style rev counter dial that displays the current Cognitive Load Index.

**Structure**:
```
<svg viewBox="0 0 200 200">
  <!-- Background arc: conic gradient green→yellow→red -->
  <path d="..." class="arc-bg" />
  
  <!-- Tick marks: 10 major + 50 minor -->
  <line class="tick-major" /> × 10
  <line class="tick-minor" /> × 50
  
  <!-- Labels: 0, 10, 20, ..., 100 -->
  <text class="tick-label" /> × 11
  
  <!-- Needle: rotated via GSAP -->
  <line id="cl-needle" x1="100" y1="100" x2="100" y2="25" />
  
  <!-- Center hub -->
  <circle cx="100" cy="100" r="8" />
  
  <!-- Digital readout -->
  <text id="cl-value" x="100" y="140">78</text>
  <text x="100" y="155" class="label">CL INDEX</text>
</svg>
```

**GSAP Needle Animation**: See Section 4.

### 3.4 3D Car Viewport — `@react-three/fiber`

**Purpose**: Display a 3D Ferrari F1 car model that glows based on stress level.

**Architecture**:
```typescript
// CarViewport.tsx
<Canvas camera={{ position: [3, 2, 5], fov: 50 }}>
  <Environment preset="night" />
  <ambientLight intensity={0.3} />
  
  {/* Dynamic point light — color mapped to CL index */}
  <pointLight
    color={stressToColor(clIndex)}
    intensity={clIndex / 50}
    position={[0, 3, 0]}
  />
  
  {/* GLB Model or Fallback */}
  <Suspense fallback={<CarPlaceholderMesh />}>
    {glbUrl ? <GLBCar url={glbUrl} clIndex={clIndex} /> : <CarPlaceholderMesh />}
  </Suspense>
  
  <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
</Canvas>
```

**Fallback**: When no `.glb` file is provided, render a stylized placeholder card with a dark gradient background and "3D Car Model Ready" text (current behavior).

**GLB Loading**: Use `useGLTF` from `@react-three/drei`. The model file path is configurable via an environment variable or a file drop zone in the UI.

---

## 4. GSAP Motion Strategy

### 4.1 Dashboard Entry Reveal

When navigating from Landing → Dashboard, GSAP orchestrates a cinematic staggered reveal:

```typescript
// useDashboardReveal.ts — custom hook
useLayoutEffect(() => {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  
  tl.from(".topbar", { y: -60, opacity: 0, duration: 0.6 })
    .from(".grid-card", { 
      y: 40, opacity: 0, scale: 0.95, 
      stagger: 0.1, duration: 0.5 
    }, "-=0.3")
    .from(".summary-bar", { y: 30, opacity: 0, duration: 0.4 }, "-=0.2")
    .from("#cl-needle", { rotation: -135, duration: 1.2, ease: "elastic.out(1, 0.5)" }, "-=0.6");
  
  return () => tl.kill();
}, []);
```

### 4.2 Tachometer Needle — Physics-Based Easing

```typescript
// useNeedleAnimation.ts
useEffect(() => {
  // Map CL index (0-100) to rotation angle (-135° to +135°)
  const targetAngle = -135 + (clIndex / 100) * 270;
  
  gsap.to("#cl-needle", {
    rotation: targetAngle,
    transformOrigin: "50% 100%",
    duration: 1.2,
    ease: "elastic.out(1, 0.4)",     // bounce overshoot
    overwrite: true
  });
  
  // Simultaneous value counter animation
  gsap.to("#cl-value", {
    textContent: clIndex,
    duration: 0.8,
    snap: { textContent: 1 },        // integer snap
    ease: "power2.out"
  });
}, [clIndex]);
```

### 4.3 Active Intercept Flash

When `interceptActive === true`, GSAP triggers a full-screen lockout overlay:

```typescript
// useActiveIntercept.ts
useEffect(() => {
  if (!interceptActive) return;
  
  const tl = gsap.timeline();
  
  // Red flash border
  tl.fromTo(".intercept-overlay", 
    { opacity: 0, scale: 1.05 },
    { opacity: 1, scale: 1, duration: 0.3, ease: "power4.out" }
  )
  // Pulsing glow
  .to(".intercept-overlay", {
    boxShadow: "inset 0 0 60px rgba(225, 6, 0, 0.6)",
    repeat: 3,
    yoyo: true,
    duration: 0.5
  })
  // Auto-dismiss after 5 seconds
  .to(".intercept-overlay", {
    opacity: 0,
    duration: 0.5,
    delay: 3
  });
  
  return () => tl.kill();
}, [interceptActive]);
```

### 4.4 Audio Clip Sync

When a radio clip plays, GSAP coordinates:
1. Highlight the active `RadioEventCard` (border glow pulse)
2. Scroll the transcript panel to the matching line
3. Animate the stress gauge needle to the clip's CL index
4. Move the driver position dot on the track map

```typescript
// useClipSync.ts — orchestration hook
const playClip = (event: RadioEvent) => {
  const master = gsap.timeline();
  
  // 1. Highlight card
  master.to(`#event-${event.id}`, {
    borderColor: "#E31D2B",
    boxShadow: "0 0 15px rgba(225, 6, 0, 0.3)",
    duration: 0.3
  });
  
  // 2. Update gauge
  master.add(() => dispatch({ type: 'UPDATE_STRESS', payload: { 
    cl: event.cognitiveLoad, 
    gLat: event.gLat, 
    sPsych: event.sPsych 
  }}), 0.1);
  
  // 3. Scroll transcript
  master.add(() => scrollTranscriptTo(event.id), 0.2);
  
  // 4. Move driver dot on track map
  master.to("#driver-dot", {
    attr: { cx: event.trackX, cy: event.trackY },
    duration: 0.5,
    ease: "power2.inOut"
  }, 0);
};
```

---

## 5. Grid Layout Specification

### 5.1 Desktop (≥1280px) — Primary Target

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: 300px 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  height: calc(100vh - 64px - 48px);  /* minus topbar and summary bar */
}

/* Col 1 spans both rows */
.radio-panel   { grid-column: 1; grid-row: 1 / 3; }
.stress-gauge  { grid-column: 2; grid-row: 1; }
.transcript    { grid-column: 2; grid-row: 2; }
.telemetry     { grid-column: 3; grid-row: 1; }
.car-prediction { grid-column: 3; grid-row: 2; }
```

### 5.2 Tablet (768px–1279px)

```css
@media (max-width: 1279px) {
  .dashboard-grid {
    grid-template-columns: 280px 1fr;
    grid-template-rows: repeat(3, 1fr);
  }
  .radio-panel    { grid-column: 1; grid-row: 1 / 4; }
  .stress-gauge   { grid-column: 2; grid-row: 1; }
  .transcript     { grid-column: 2; grid-row: 2; }
  .telemetry      { grid-column: 2; grid-row: 3; }
  /* car-prediction hidden on tablet, accessible via tab */
}
```

### 5.3 Mobile (< 768px) — Vertical Stack

Single column, scrollable. Radio panel collapses to a horizontal scrollable strip at the top.

---

## 6. Simulated Real-Time Playback System

The dashboard includes a **PlaybackControls** component in the TopBar that simulates a live race feed:

```
┌──────────────────────────────────────────────┐
│  ▶ Play   ⏸ Pause   ×1  ×2  ×4   00:14:32  │
└──────────────────────────────────────────────┘
```

**Behavior**:
1. When the user clicks **Play**, a `setInterval` advances `playbackTimestamp` by `playbackSpeed` seconds per real second.
2. As the timestamp advances, radio events whose `timestamp ≤ playbackTimestamp` are "activated" — triggering the transcript, gauge, and track map updates via the GSAP orchestration described in §4.4.
3. Telemetry data is streamed progressively — the Chart.js dataset grows as the playback timestamp advances, creating a "live drawing" effect.
4. Active Intercept checks run on each tick: if `CL > 80 && currentSector.isHeavyBraking`, trigger the lockout overlay.

---

## 7. Phase Breakdown

### Phase 1: Landing + Dashboard Shell
- Keep existing `LandingPage.tsx` (Framer Motion canvas) as-is
- Install GSAP (`gsap`) — no ScrollTrigger needed yet
- Rebuild `Dashboard.tsx` with the full grid layout (§5)
- Create skeleton versions of all panel components (empty cards with headers)
- Implement `RaceSessionContext` with the full state shape but stub data
- GSAP dashboard entry reveal animation (§4.1)
- Create `TopBar` with driver/GP/lap selectors (populated with static mock data)
- Create `SummaryBar` with mock sector times

### Phase 2: Visualization + Backend Wiring
- Install Chart.js, react-chartjs-2, @visx/shape, @visx/scale, @visx/gradient
- Build `CognitiveLoadTachometer` (SVG + GSAP needle — §3.3, §4.2)
- Build `CognitiveGForceSeparator` (dual mini-gauges)
- Build `TelemetryChart` (Chart.js dual-axis — §3.2)
- Build `DynamicStressTrackMap` (Visx — §3.1)
- Build `LiveTranscript` with auto-scrolling
- Build `AudioPlayer` with HTML5 Audio API
- Build `RadioEventList` + `RadioEventCard`
- Wire `api/client.ts` to backend endpoints
- Connect all hooks (`useRadioData`, `useTelemetry`, `useCorrelation`)
- Implement simulated real-time playback system (§6)

### Phase 3: Advanced Features + 3D
- Install `@react-three/fiber`, `@react-three/drei`, `three`
- Build `CarViewport` with GLB loading + fallback (§3.4)
- Build `LapPenaltyCard` (displays predictive penalty data)
- Build `ActiveInterceptOverlay` (GSAP flash — §4.3)
- Build GSAP clip sync orchestration (§4.4)
- Build `StintDeepDive` route and components
- Polish: responsive breakpoints, loading states, error boundaries
- Performance: lazy load Three.js bundle, code-split stint view

---

## 8. NPM Dependencies (Cumulative)

### Phase 1
```json
{
  "gsap": "^3.12.0"
}
```

### Phase 2 (adds)
```json
{
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "chartjs-plugin-annotation": "^3.0.0",
  "@visx/shape": "^3.5.0",
  "@visx/scale": "^3.5.0",
  "@visx/gradient": "^3.3.0",
  "@visx/tooltip": "^3.3.0",
  "@visx/responsive": "^3.10.0"
}
```

### Phase 3 (adds)
```json
{
  "three": "^0.170.0",
  "@react-three/fiber": "^9.0.0",
  "@react-three/drei": "^10.0.0"
}
```

---

## 9. File Structure (Frontend — Final State)

```
frontend/src/
├── main.tsx
├── App.tsx
├── types/
│   └── index.ts                          # All TypeScript interfaces
├── context/
│   └── RaceSessionContext.tsx             # useReducer + Context Provider
├── hooks/
│   ├── useRadioData.ts                   # Fetch radio events from API
│   ├── useTelemetry.ts                   # Fetch telemetry stream
│   ├── useCorrelation.ts                 # Fetch correlation data
│   ├── useCircuitMap.ts                  # Fetch circuit coordinates
│   ├── usePlayback.ts                    # Simulated real-time playback logic
│   ├── useNeedleAnimation.ts             # GSAP needle controller
│   ├── useDashboardReveal.ts             # GSAP entry animation
│   ├── useActiveIntercept.ts             # Intercept rule check + GSAP flash
│   └── useClipSync.ts                    # GSAP orchestration for clip playback
├── api/
│   └── client.ts                         # Fetch wrappers for all backend endpoints
├── components/
│   ├── pages/
│   │   ├── LandingPage.tsx               # Existing Framer Motion canvas
│   │   ├── Dashboard.tsx                 # Main dashboard layout + grid
│   │   └── StintDeepDive.tsx             # Stint detail view
│   ├── layout/
│   │   ├── TopBar.tsx
│   │   ├── PlaybackControls.tsx
│   │   └── SummaryBar.tsx
│   ├── audio/
│   │   ├── AudioPlayer.tsx
│   │   └── RadioEventCard.tsx
│   ├── transcript/
│   │   ├── LiveTranscript.tsx
│   │   └── TranscriptLine.tsx
│   ├── stress/
│   │   ├── CognitiveLoadTachometer.tsx   # SVG + GSAP
│   │   ├── CognitiveGForceSeparator.tsx  # Dual gauges
│   │   └── ActiveInterceptOverlay.tsx    # GSAP flash lockout
│   ├── telemetry/
│   │   ├── TelemetryChart.tsx            # Chart.js dual-axis
│   │   └── DynamicStressTrackMap.tsx     # Visx SVG circuit
│   ├── car/
│   │   ├── CarViewport.tsx               # Three.js canvas
│   │   └── CarPlaceholder.tsx            # Fallback card
│   ├── prediction/
│   │   └── LapPenaltyCard.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── SkeletonCard.tsx
│       ├── ErrorBoundary.tsx
│       ├── StatusBadge.tsx
│       └── GlowCard.tsx
├── utils/
│   ├── timeFormat.ts
│   ├── colorScale.ts                     # stress → color interpolation
│   └── constants.ts                      # theme colors, breakpoints
└── styles/
    ├── index.css                         # Tailwind + CSS variables (existing)
    ├── tachometer.css                    # Gauge-specific styles
    └── dashboard.css                     # Grid layout overrides
```
