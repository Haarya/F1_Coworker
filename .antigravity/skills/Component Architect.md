---
name: Component Architect
version: 1.0.0
role: React Component Strategist & Modularity Enforcer
domain: Frontend Component Engineering
context: AeroFlow Master Project (TrackShift Mphasis F1 Hackathon) & Formula 1 Premium Web Platform[cite: 2]
---

# Antigravity Skill: Component Architect

## Description
The Component Architect is responsible for dissecting complex page layouts and data requirements into highly modular, reusable, and performant React components[cite: 2]. Acting as the bridge between global architecture (Frontend Architect) and visual design (UI/UX Design System), this skill determines the React component hierarchy, state localization, and API contracts (Props) required to build the F1-inspired AeroFlow dashboard[cite: 1, 2]. 

## Activation Criteria
Activate this skill when:
*   Breaking down the AeroFlow dashboard layout into a nested React component tree[cite: 1].
*   Defining the TypeScript interfaces (Props) for specific UI modules (e.g., `AudioStreamController`, `CognitiveLoadGauge`, `TelemetryPlotter`)[cite: 1].
*   Deciding whether a component should be "Smart" (connected to the global telemetry state) or "Dumb" (purely presentational relying on passed props).
*   Structuring component-level folders to co-locate logic, types, and sub-components.
*   Implementing React-specific performance optimizations (`React.memo`, `useMemo`, `useCallback`) to handle high-frequency FastF1 data streams without unnecessary re-renders[cite: 1].

## When NOT to Activate
Do NOT activate this skill when:
*   Setting up overarching project routing, Vite configuration, or global state stores (delegate to **Frontend Architect**)[cite: 2].
*   Defining typography scales, CSS utility classes, or spacing tokens (delegate to **UI/UX Design System**)[cite: 2].
*   Building Three.js/R3F 3D meshes for the Track Map (delegate to **Three.js & React Three Fiber**)[cite: 1, 2].
*   Creating GSAP timelines or ScrollTrigger logic (delegate to **GSAP Motion System**)[cite: 2].

## Responsibilities
*   **Component Hierarchy:** Design a logical, composable tree of React components to support the F1 pit-wall command center requirements[cite: 1, 2].
*   **API Design (Props):** Create strict, predictable TypeScript interfaces for all components.
*   **State Localization:** Determine what state lives locally within a component versus what is pulled from the global telemetry store.
*   **Re-render Optimization:** Implement rendering safeguards to ensure that a spike in the Wav2Vec2 Stress Index only updates the `CognitiveLoadGauge` and doesn't trigger a re-render of the `LiveTeleprompter`[cite: 1].
*   **Modularity Enforcement:** Prevent the creation of monolithic, thousands-of-lines-long components by enforcing the Single Responsibility Principle[cite: 2].

## Scope
*   React component architecture within DOM-based directories (`src/components/UI`, `src/components/Hero`)[cite: 2].
*   Container (Smart) vs. Presentational (Dumb) component mapping.
*   React component lifecycle and hook optimization at the module level.
*   Error Boundary implementation for fragile telemetry UI segments.

## Non-goals
*   Writing the actual CSS/Tailwind rules (handled by UI/UX Design System).
*   Fetching data from Hugging Face or FastF1 endpoints (handled by Frontend Architect).
*   Choreographing entry/exit animations (handled by Motion Designer & GSAP Motion System).

## Inputs
*   AeroFlow UI Module Requirements (Audio Stream Controller, Live Teleprompter, Cognitive Load Gauge, Divergence Alert Banner, Telemetry Plotter, Track Map Hotspot, Cognitive Firewall Overlay)[cite: 1].
*   Figma layouts or wireframes.
*   Global state hooks provided by the Frontend Architect.

## Outputs
*   `.tsx` files containing modular React components.
*   Clearly defined `interface [ComponentName]Props` definitions.
*   Optimized component trees utilizing `React.memo` for high-frequency telemetry nodes.

## Dependencies
*   **Frontend Architect:** For the global data hooks (`useTelemetrySync`, `useAcousticStress`)[cite: 1].
*   **UI/UX Design System:** For structural design tokens (padding, colors, F1 typography)[cite: 2].

## Related Skills
*   **Frontend Architect (Upstream):** Defines the global constraints that the Component Architect builds within.
*   **UI/UX Design System (Lateral):** Provides the visual "skin" to the Component Architect's structural "skeleton".
*   **Accessibility (Downstream):** Will audit the component structures designed here for semantic HTML and ARIA compliance[cite: 2].

## Folder Ownership
Governs the internal structure of component directories defined by the Frontend Architect[cite: 2]:
*   `/src/components/Hero/` (Composition of hero elements)[cite: 2]
*   `/src/components/UI/` (Standard dashboard panels, buttons, cards)[cite: 2]
*   *Component-Level Pattern:* Co-locate component pieces. 
    *   `src/components/UI/CognitiveLoadGauge/index.tsx`
    *   `src/components/UI/CognitiveLoadGauge/CognitiveLoadGauge.tsx`
    *   `src/components/UI/CognitiveLoadGauge/CognitiveLoadGauge.types.ts`

## Naming Conventions
*   **Components:** `PascalCase` (e.g., `DivergenceAlertBanner`, `TelemetryPlotter`)[cite: 1].
*   **Prop Interfaces:** `[ComponentName]Props` (e.g., `LiveTeleprompterProps`).
*   **Event Handlers:** `on[EventName]` for props (e.g., `onAudioSelect`), `handle[EventName]` for internal functions (e.g., `handleStreamPlay`).
*   **Boolean Props:** Prefix with `is`, `has`, or `should` (e.g., `isChannelLocked`, `hasHighCognitiveLoad`).

## Coding Standards
*   **Composition over Inheritance:** Use `children` and render props to build flexible layouts rather than deeply nested configurations.
*   **Strict Types:** Every component must have a declared TypeScript interface for its props. `any` is strictly prohibited.
*   **Destructuring:** Always destructure props in the function signature for immediate visibility of dependencies.
*   **Default Props:** Handle default values via ES6 default parameters in the destructuring assignment.

## Design Standards
*   **Telemetry Aesthetics:** Components should structurally support F1 HUD layouts (e.g., absolute positioning wrappers, grid alignments for tachometer-style stress meters)[cite: 1, 2].
*   **Slot Pattern:** Use the "slot" or "layout" component pattern for the pit-wall command center to ensure panels align perfectly without hardcoding margins within the child components themselves.

## Performance Standards
*   **Targeting 60 FPS:** High-frequency components (like the `CognitiveLoadGauge` responding to a 0.0-1.0 tensor stream) must be wrapped in `React.memo`[cite: 1, 2].
*   **Prop Stability:** Never pass inline anonymous functions or unmemoized objects as props to complex children, as this breaks memoization and triggers unnecessary F1 telemetry re-renders.
*   **Smart/Dumb Split:** Isolate the context/store subscriptions in a parent "Container" component and pass primitives (numbers/strings) to the "Presenter" component.

## Accessibility Considerations
*   Ensure components accept and properly forward standard HTML attributes (like `aria-label` and `tabIndex`) to support keyboard navigation and screen readers[cite: 2].
*   Support dynamic `aria-live` regions specifically for the `DivergenceAlertBanner` and `CognitiveFirewallOverlay` so that critical safety interruptions are immediately read out[cite: 1, 2].

## Best Practices
*   **The "Storybook" Mental Model:** Build every UI component as if it needs to be documented in isolation. It should not secretly rely on a parent's DOM structure.
*   **Early Returns:** Use early returns for conditional rendering (e.g., `if (!telemetryData) return <SkeletonLoader />;`) to keep the main return statement clean.

## Anti-patterns
*   **The God Component:** A single `Dashboard.tsx` file containing 1,500 lines of code, inline SVGs, and state hooks[cite: 2].
*   **Prop Drilling:** Passing `wav2vec2StressIndex` through 5 layers of layout components instead of utilizing the global state hook directly in the `CognitiveLoadGauge` container[cite: 1].
*   **Hardcoded Styles:** Adding inline `style={{ backgroundColor: 'red' }}` instead of utilizing the UI/UX Design System's token classes.

## Quality Checklist
*   [ ] Does the component follow the Single Responsibility Principle?
*   [ ] Are all props strictly typed using TypeScript interfaces?
*   [ ] Are complex computational values memoized via `useMemo`?
*   [ ] Is the component completely decoupled from GSAP animation instances (animations applied via wrappers/refs)?[cite: 2]

## Validation Checklist
*   [ ] Has the AeroFlow dashboard been broken down into granular pieces (e.g., separating the Audio Player from the Transcript Box)?[cite: 1]
*   [ ] Are high-frequency data consumers (Telemetry & Stress Plotter) isolated to prevent global app re-renders?[cite: 1]
*   [ ] Is the folder structure modular and scalable?[cite: 2]

## Examples

```tsx
// src/components/UI/CognitiveLoadGauge/CognitiveLoadGauge.types.ts
export interface CognitiveLoadGaugeProps {
  /** Stress Index tensor score (0.0 - 1.0) from Wav2Vec2 */
  stressIndex: number;
  /** Whether the driver is experiencing > 5G cornering */
  isUnderHighGForce: boolean;
  /** Optional class overrides for F1 Design System */
  className?: string;
}

// src/components/UI/CognitiveLoadGauge/CognitiveLoadGauge.tsx
import React from 'react';
import { CognitiveLoadGaugeProps } from './CognitiveLoadGauge.types';
import { calculateGaugeColor } from '@/utils/gaugeHelpers';

export const CognitiveLoadGauge: React.FC<CognitiveLoadGaugeProps> = React.memo(
  ({ stressIndex, isUnderHighGForce, className = '' }) => {
    // Component acts as a pure presentation layer
    const gaugeColor = calculateGaugeColor(stressIndex, isUnderHighGForce);

    return (
      <div className={`f1-gauge-container ${className}`}>
        {/* Render Tachometer UI utilizing F1 Design Language */}
        <div className="tachometer-dial" style={{ stroke: gaugeColor }} />
        <span className="sr-only">Current Cognitive Load: {stressIndex * 100}%</span>
      </div>
    );
  }
);