---
name: Performance Optimizer
version: 1.0.0
role: Frame-Rate Governor & Computational Strategist
domain: Frontend Performance Engineering
context: AeroFlow Master Project (TrackShift Mphasis F1 Hackathon)[cite: 1] & Formula 1 Premium Web Platform[cite: 2]
---

# Antigravity Skill: Performance Optimizer

## Description
The Performance Optimizer skill acts as the computational governor and architectural auditor of the platform[cite: 2]. In the context of the AeroFlow dashboard, the frontend must ingest, parse, and render up to 150,000 FastF1 telemetry data points per second alongside real-time AI tensors from the Whisper and Wav2Vec2 pipelines[cite: 1]. This skill guarantees that the application maintains a liquid-smooth 60+ FPS, strictly enforcing asset budgets, implementing lazy-loading strategies, and offloading heavy computational correlation engines to Web Workers to prevent main-thread blocking.

## Activation Criteria
Activate this skill when:
*   Designing data-parsing pipelines for the high-frequency FastF1 telemetry streams and Wav2Vec2 tensors[cite: 1].
*   Implementing Web Workers to offload heavy JSON/Array parsing, preventing UI freezes[cite: 1].
*   Auditing React render cycles to identify unnecessary re-renders, layout thrashing, or memory leaks using the React Profiler.
*   Enforcing asset budgets (e.g., ensuring no route loads more than its designated initial payload limits)[cite: 2].
*   Implementing strategic `IntersectionObserver` logic to pause GSAP animations or WebGL rendering when specific dashboard panels are off-screen.
*   Dynamically scaling the 3D scene resolution or pixel ratio based on the client device's GPU capabilities.

## When NOT to Activate
Do NOT activate this skill when:
*   Configuring Vite build chunking or tree-shaking rules (delegate to **React + Vite**)[cite: 2].
*   Compressing GLB models or optimizing texture files (delegate to **3D Asset Manager**)[cite: 2].
*   Applying `React.memo` to standard UI components (delegate to **Component Architect**)[cite: 2].
*   Writing the actual WebGL draw calls (delegate to **Three.js & React Three Fiber**)[cite: 2].

## Responsibilities
*   **Main-Thread Protection:** Isolate the FastF1 Telemetry Correlation Engine's mathematical operations (calculating lateral G-forces, synchronizing UTC timestamps) from the main DOM/React thread[cite: 1].
*   **Budget Enforcement:** Continuously monitor and enforce the project's performance budgets (lazy-loading non-critical assets to maintain rapid Time-to-Interactive)[cite: 2].
*   **Adaptive Degradation:** Implement logic to detect low-tier hardware and gracefully degrade visual fidelity (e.g., lowering R3F pixel ratios, disabling heavy CSS backdrop filters) without sacrificing the core AeroFlow AI data[cite: 1, 2].
*   **Memory Management:** Ensure high-frequency data streams (like the audio waveform arrays) are garbage-collected properly, avoiding heap size bloat over the course of an F1 race.

## Scope
*   Web Worker architecture and cross-thread communication.
*   React Profiler audits and macro-level memoization strategies.
*   Hardware capability detection hooks.
*   Render throttling and debounce algorithms for high-frequency WebSocket feeds.

## Non-goals
*   Writing feature business logic or AI prompt engineering[cite: 1].
*   Designing CSS layouts or typography[cite: 2].
*   Writing GSAP animation sequences[cite: 2].

## Inputs
*   Performance budgets mandated by the master architecture[cite: 2].
*   High-frequency data streams (150,000 points/sec) from the AeroFlow backend[cite: 1].
*   Component structures from the **Component Architect**[cite: 2].

## Outputs
*   Web Worker scripts (`*.worker.ts`) for data correlation.
*   Adaptive performance hooks (e.g., `useAdaptivePerformance`).
*   Actionable profiling reports guiding refactors in downstream components.

## Dependencies
*   **Frontend Architect:** Defines the data ingestion architecture that this skill must optimize[cite: 2].

## Related Skills
*   **Component Architect (Consumer):** Implements the optimized data structures provided by this skill's Web Workers into their localized state.
*   **React + Vite (Lateral):** Configures the bundler to support the Web Worker files established here[cite: 2].
*   **Three.js & React Three Fiber (Lateral):** Consumes the adaptive degradation hooks to adjust `<Canvas>` settings dynamically[cite: 2].

## Folder Ownership
Governs computational optimization utilities and thread management within:
*   `/src/workers/` (Houses all Web Worker scripts for telemetry parsing).
*   `/src/utils/performance/` (Houses throttling, debouncing, and hardware detection algorithms).

## Naming Conventions
*   **Web Workers:** Suffix with `.worker.ts` (e.g., `telemetryParser.worker.ts`, `gForceCalculator.worker.ts`).
*   **Performance Hooks:** Prefix with `use` and suffix with `Performance` or `Observer` (e.g., `useAdaptivePerformance`, `useVisibilityObserver`).
*   **Data Structures:** Use typed arrays where applicable (e.g., `Float32Array`) and name them clearly for their memory constraints (e.g., `stressIndexBuffer`).

## Coding Standards
*   **Typed Arrays:** For handling the 150,000 telemetry points and Wav2Vec2 tensors, enforce the use of Javascript Typed Arrays (`Float32Array`, `Uint8Array`) to guarantee memory stability and speed[cite: 1].
*   **Worker Messaging:** Use transferable objects when passing large datasets between Web Workers and the main thread to avoid expensive, blocking object cloning algorithms.
*   **Garbage Collection Awareness:** Avoid creating new object references or closures inside tight loops (like `useFrame` or data polling intervals).

## Design Standards
*   **Performance is UX:** The user experience is intrinsically tied to the platform's responsiveness. A stuttering dashboard during a critical Cognitive Firewall activation ruins the premium, Apple-quality illusion[cite: 1, 2].

## Performance Standards
*   **Interaction to Next Paint (INP):** Must remain strictly under 200ms, targeting < 100ms, ensuring dashboard controls remain responsive even during heavy data spikes.
*   **Frame Rate:** 60 FPS is mandatory[cite: 2]. If telemetry processing threatens the frame rate, data visualization must be throttled (not the data ingestion itself).
*   **Asset Load Budgets:** Target smooth interaction on modern hardware; lazy-load non-critical dashboard views until explicitly requested[cite: 2].

## Accessibility Considerations
*   **Battery and Power Savings:** Over-taxing the device GPU/CPU drains batteries rapidly. The Performance Optimizer must ensure that if the dashboard is minimized or hidden, telemetry parsing is throttled, and WebGL rendering pauses (`dpr` drops or `frameloop="demand"`)[cite: 2].

## Best Practices
*   **Stale-While-Revalidate:** When fetching historical race data to compare against live streams, utilize caching strategies to prevent redundant network requests.
*   **Virtualization:** If rendering large lists of historical lap times or transcript logs from the Whisper pipeline, enforce the use of list virtualization (e.g., `@tanstack/react-virtual`) to only render visible DOM nodes[cite: 1].

## Anti-patterns
*   **Parsing JSON on the Main Thread:** Running `JSON.parse()` on a 5MB FastF1 telemetry payload directly in a React component, causing the browser to lock up[cite: 1].
*   **Premature Optimization:** Wasting time memoizing a static component that renders once, while ignoring a 3D scene rendering a million polygons out of view.
*   **Over-Polling:** Firing React state updates for every single micro-change in telemetry. State updates should be batched or synced to the display refresh rate (e.g., via `requestAnimationFrame`).

## Quality Checklist
*   [ ] Are massive data arrays handled by Web Workers using Transferable Objects?
*   [ ] Is list virtualization used for long logs (like the Live Teleprompter history)?[cite: 1]
*   [ ] Are complex correlation calculations (like the Cognitive G-Force Decoupler) isolated from UI render cycles?[cite: 1]

## Validation Checklist
*   [ ] Can the application ingest the simulated 150,000 data points per second without dropping below 55 FPS during the Minute 2 "High Stress" hackathon demo?[cite: 1]
*   [ ] Are non-critical 3D models and layout images lazy-loaded successfully without blocking the primary AeroFlow interface?[cite: 2]
*   [ ] Has performance been measured and validated using Chrome DevTools Performance tab and React Profiler?[cite: 2]

## Examples

```typescript
// src/workers/telemetryParser.worker.ts
// Offloading the Telemetry Correlation Engine calculations from the main thread
self.onmessage = (event: MessageEvent) => {
  const { rawTelemetryBuffer, timestamp } = event.data;
  
  // Assume rawTelemetryBuffer is a Float32Array to avoid serialization overhead
  const telemetryData = new Float32Array(rawTelemetryBuffer);
  
  // Perform heavy calculations: Synchronizing FastF1 and isolating G-Force from Stress[cite: 1]
  const processedData = processTelemetryCorrelation(telemetryData, timestamp);
  
  // Transfer the buffer back to the main thread without copying (zero-copy transfer)
  self.postMessage(
    { processedData: processedData.buffer }, 
    [processedData.buffer]
  );
};

function processTelemetryCorrelation(data: Float32Array, timestamp: number): Float32Array {
  // Execute the "Cognitive G-Force Decoupler" algorithm here[cite: 1]
  // ... math intensive operations ...
  return data;
}