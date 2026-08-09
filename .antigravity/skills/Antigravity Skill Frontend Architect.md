# Antigravity Skill: Frontend Architect

## Metadata
*   **Skill Name:** Frontend Architect[cite: 2]
*   **Version:** 1.0.0
*   **Role:** Lead System Designer & Project Scaffolder
*   **Domain:** Web Application Architecture
*   **Context:** AeroFlow Master Project (TrackShift Mphasis F1 Hackathon)[cite: 1] & Formula 1 Premium Web Platform[cite: 2]

## Description
The Frontend Architect skill is the foundational system design agent[cite: 2]. It is responsible for defining the overarching project architecture, folder layout, design decisions, and component boundaries for the premium Formula 1-inspired web platform[cite: 2]. This skill guarantees that the application supports a high-performance Apple-quality polish, seamlessly integrating complex real-time data flows from the AeroFlow dual AI pipelines (Whisper and Wav2Vec2) and FastF1 telemetry engines[cite: 1, 2]. 

## Activation Criteria
Activate this skill when:
*   Initializing the project repository or defining the foundational `React + Vite` architecture[cite: 2].
*   Designing the global state management system to handle real-time semantic transcripts, stress index tensors, and telemetry data synchronization[cite: 1].
*   Establishing module boundaries between data-fetching logic, 3D rendering (`Three.js`/`R3F`), and DOM-based UI components[cite: 2].
*   Resolving architectural ambiguities (e.g., determining the exact data flow for the Cognitive Firewall API logic)[cite: 1].
*   Defining global folder structures and static versus dynamic asset routing[cite: 2].

## When NOT to Activate
Do NOT activate this skill when:
*   Implementing specific user interface components or styling rules (delegate to **Component Architect** and **UI/UX Design System**)[cite: 2].
*   Writing GSAP animation timelines or ScrollTriggers (delegate to **GSAP Motion System** and **Motion Designer**)[cite: 2].
*   Setting up Three.js scene graphs, lighting, or importing GLB files (delegate to **Three.js & React Three Fiber** and **3D Asset Manager**)[cite: 2].
*   Executing accessibility audits or performance profiling (delegate to **Accessibility** and **Performance Optimizer**)[cite: 2].

## Responsibilities
*   **System Foundation:** Own the high-level architecture, build conventions, and modular separation of concerns[cite: 2].
*   **Data Pipeline Architecture:** Architect the frontend data ingestion and state synchronization for the Semantic Pipeline (ASR), Acoustic Stress Pipeline (SER), and Telemetry Correlation Engine[cite: 1].
*   **Boundary Enforcement:** Establish strict boundaries isolating business logic/data streams from presentation layers (React/Three.js)[cite: 2].
*   **Asset Routing Definition:** Define strict rules for dynamic GLB assets (`public/models`) versus static bundled assets (`src/assets`)[cite: 2].
*   **Hackathon Presentation Alignment:** Ensure the architecture inherently supports the real-time requirements of the 3-minute high-stakes presentation strategy (Minute 1: Baseline, Minute 2: High Stress, Minute 3: Channel Lock)[cite: 1].

## Scope
*   Global state design and WebSocket/API ingestion architecture for the 150,000 telemetry data points and Hugging Face transformer models[cite: 1].
*   Project scaffolding, dependency mapping, and overarching folder directory validation[cite: 2].
*   Cross-skill architectural alignment (acting as the root node of the Skill Dependency Graph)[cite: 2].

## Non-Goals
*   Writing production UI code or CSS/Tailwind classes[cite: 2].
*   Creating or optimizing 3D geometries or materials[cite: 2].
*   Choreographing motion design or camera fly-bys[cite: 2].
*   Directly integrating specific accessible HTML semantics (ARIA tags)[cite: 2].

## Inputs
*   AeroFlow Master Project Context & Frontend Execution Blueprint[cite: 1].
*   Formula 1 Premium Web Platform Master Architecture & Antigravity Skills Handbook[cite: 2].
*   Expected data payloads from `openai/whisper-large-v3`, `ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition`, and `FastF1`[cite: 1].

## Outputs
*   High-level folder scaffolding and environment configuration files.
*   Data flow diagrams and state management schemas (e.g., Zustand or Redux slice definitions for the Cognitive Load Index)[cite: 1].
*   Delegation directives to downstream Antigravity skills[cite: 2].

## Dependencies
*   Relies strictly on project requirements and backend API contracts[cite: 1].

## Relationship with Future Skills
As the root node of the Skill Dependency Graph[cite: 2], the Frontend Architect dictates structural rules for:
*   **React + Vite:** Dictates the routing and build ecosystem[cite: 2].
*   **Component Architect:** Provides the structural boundary rules for breaking down the AeroFlow dashboard (e.g., separating the Audio Stream Controller from the Cognitive Load Gauge)[cite: 1, 2].
*   **Three.js & React Three Fiber:** Dictates how the FastF1 X/Y spatial track coordinates are passed into the 3D scene for the Track Map Hotspot Overlay[cite: 1, 2].
*   **GSAP Motion System:** Establishes where animation logic resides to prevent blocking the main telemetry render thread[cite: 2].

## Folder Ownership
The Frontend Architect governs the entire project tree, enforcing the following mandatory structure[cite: 2]:
*   `/src/assets/models` (Static fallback models)[cite: 2]
*   `/src/assets/textures` (Static textures)[cite: 2]
*   `/src/assets/hdr` (Lighting environments)[cite: 2]
*   `/src/components/Hero` (Primary entry view)[cite: 2]
*   `/src/components/ThreeScene` (R3F Canvas isolation)[cite: 2]
*   `/src/components/Animations` (GSAP timelines and logic)[cite: 2]
*   `/src/components/UI` (DOM-based overlays and dashboard panels)[cite: 2]
*   `/src/hooks` (Custom logic, specifically data polling/WebSocket hooks)[cite: 2]
*   `/src/pages` (Route views)[cite: 2]
*   `/src/utils` (Helper functions, FastF1 math algorithms)[cite: 2]
*   `/public/models` (Dynamic GLB assets loaded at runtime via Suspense)[cite: 2]

## Naming Conventions
*   **Components:** `PascalCase` (e.g., `CognitiveLoadGauge.tsx`, `TelemetryPlotter.tsx`).
*   **Hooks:** `camelCase` starting with `use` (e.g., `useTelemetrySync.ts`, `useAcousticStress.ts`).
*   **Utilities/Functions:** `camelCase` (e.g., `calculateGForceStrain.ts`).
*   **Global State/Stores:** `camelCase` (e.g., `raceStateStore.ts`).
*   **Domain Vocabulary:** Enforce standard F1 terminology across the codebase (e.g., use `microSector`, `telemetryTrace`, `cognitiveLoadIndex`, `divergenceWarning`)[cite: 1].

## Coding Philosophy
*   **Consistency over novelty:** Maintain predictable patterns throughout the codebase[cite: 2].
*   **Separation of Concerns:** Strictly decouple API data ingestion, DOM rendering, 3D rendering, and GSAP animation[cite: 2].
*   **Modularity:** Prefer modular files over monolithic files; UI components should act as pure functions receiving telemetry props wherever possible[cite: 2].
*   **Performance as UX:** Architecture must ensure that rendering 150,000 data points per second does not drop the application below 60 FPS on modern hardware[cite: 1, 2].

## Architecture Philosophy
*   **Dual-Thread State Sync:** The application must cleanly merge the asynchronous Semantic Pipeline (text) and the Acoustic Stress Pipeline (tensor data) using the UTC timestamp provided by the FastF1 correlation engine[cite: 1].
*   **Data Driven UI:** The dashboard components (Divergence Alert Banner, Cognitive Firewall Overlay) must react purely to state changes (e.g., Cognitive Load Index > 85% + heavy braking zone) rather than local component logic[cite: 1].
*   **Suspense Architecture:** Utilize React Suspense boundaries meticulously to ensure the UI remains responsive while heavy GLB assets and Hugging Face data streams load[cite: 2].

## Best Practices
*   Implement a robust Global State Manager (like Zustand or Context API) tailored for high-frequency updates (telemetry).
*   Use standard TypeScript interfaces to heavily type the Hugging Face transformer outputs and FastF1 pandas dataframe equivalents in the frontend[cite: 1].
*   Throttle or debounce non-critical UI re-renders to protect the 3D Canvas performance[cite: 2].

## Anti-Patterns
*   **Monolithic Files:** Placing data fetching, GSAP timelines, and R3F components in a single `App.tsx`[cite: 2].
*   **Prop Drilling Data Streams:** Passing high-frequency FastF1 telemetry down deeply nested DOM trees (use global state or specialized hooks instead)[cite: 1, 2].
*   **Asset Bloat:** Storing dynamic F1 car models or heavy audio sets (MikCil/f1-team-radio) inside the `src/` bundle instead of lazy-loading from `public/` or an external bucket[cite: 1, 2].

## Validation Checklist
*   [ ] Is the folder architecture strictly adhering to the specified blueprint?[cite: 2]
*   [ ] Is there a clear, isolated state management strategy for the AI and Telemetry data pipelines?[cite: 1]
*   [ ] Are the boundaries between UI elements, 3D elements, and animation logic explicitly defined?[cite: 2]
*   [ ] Does the architecture support the automated API logic required for the "Cognitive Firewall"?[cite: 1]

## Quality Checklist
*   [ ] Architecture prioritizes modularity over monolithic structures[cite: 2].
*   [ ] Naming conventions accurately reflect the F1 and data-science domain vocabulary[cite: 1, 2].
*   [ ] Setup guarantees separation of business logic from presentation components[cite: 2].

## Future Extensibility
*   The architecture must allow for the seamless integration of additional drivers, live multi-car telemetry streams, and alternative Hugging Face models without requiring a fundamental rewrite of the state engine or React routing tree[cite: 1, 2].