# The Silent Co-Driver — Architectural Design Specification

> **Date**: 2026-08-08  
> **Status**: Awaiting User Review  
> **Scope**: Full-stack F1 driver stress analysis platform — 3 phased cycles

---

## Design Decisions (Approved via Brainstorming)

| Decision | Choice |
|---|---|
| **Scoping** | Phased cycles — full architecture now, phase-gated implementation |
| **Animation Engine** | Hybrid: Framer Motion (landing canvas) + GSAP (dashboard gauges/reveals/alerts) |
| **Data Flow** | Simulated real-time with playback timer over historical HF dataset |
| **3D Car** | GLB-based viewport with fallback placeholder — deferred to Phase 3 |

## Deliverables

Three architectural plan files have been written:

1. **[FRONTEND_PLAN.md](file:///C:/Users/aarya/Desktop/F1/FRONTEND_PLAN.md)** — Complete frontend architecture
   - Component tree (40+ components across 8 directories)
   - `RaceSessionContext` state management with `useReducer`
   - Visualization stack: Visx (track map), Chart.js (telemetry), SVG+GSAP (gauges), Three.js (3D car)
   - GSAP motion strategy: dashboard reveals, physics-based needle easing, Active Intercept flash, clip sync orchestration
   - Grid layout specs for desktop, tablet, and mobile
   - Simulated real-time playback system
   - NPM dependency list per phase

2. **[BACKEND_PLAN.md](file:///C:/Users/aarya/Desktop/F1/BACKEND_PLAN.md)** — Complete backend architecture
   - FastAPI modular design (routes → services → pipelines → models)
   - Whisper ASR pipeline with singleton loader and word-level timestamps
   - Wav2Vec2 SER pipeline with 7-class emotion → CL Index calculation
   - FastF1 integration: session caching, lap data, telemetry streams, circuit coordinates
   - Mathematical specifications:
     - G_lat = v² × κ / g (lateral acceleration from curvature)
     - S_psych = max(0, S_raw - α × G_lat) (psychological frustration normalization)
   - Active Intercept rule engine (CL > 80 + heavy braking + speed > 200)
   - Random Forest lap penalty predictor (12-feature vector, per-session training)
   - Complete Pydantic schemas and REST endpoint contracts (18 endpoints across 5 route groups)

3. **[EXPLANATION_GUIDE.md](file:///C:/Users/aarya/Desktop/F1/EXPLANATION_GUIDE.md)** — Developer guide
   - End-to-end data flow walkthrough (audio → ASR → SER → FastF1 → math → dashboard)
   - Tech stack justification table (what + why + alternatives)
   - Developer setup checklist: HF token, Python env, Node env, .env, FastF1 caching
   - Key concepts explained (scrollytelling, cognitive load, G-force separator, Active Intercept)

## Phase Boundaries

| Phase | Frontend | Backend | Milestone |
|---|---|---|---|
| **1** | Dashboard shell + GSAP reveals + skeleton cards + context | Scaffold + schemas + route stubs + mock data | Frontend calls backend mock endpoints |
| **2** | Gauges + charts + track map + transcript + audio + playback | Whisper + Wav2Vec2 + FastF1 + correlation + real endpoints | Full stress analysis flow working |
| **3** | G-Force dual gauges + Intercept overlay + 3D car + penalty card | G_lat math + S_psych + rule engine + Random Forest + jitter/shimmer | All advanced features live |

## Next Steps

After user approval:
1. Invoke `writing-plans` skill to create detailed implementation plan for Phase 1
2. Each subsequent phase gets its own plan → approval → build cycle
