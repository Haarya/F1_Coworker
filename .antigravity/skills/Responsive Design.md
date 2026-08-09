---
name: Responsive Design
version: 1.0.0
role: Viewport Adaptation & Device Behavior Strategist
domain: Frontend UX Architecture
context: AeroFlow Master Project (TrackShift Mphasis F1 Hackathon)[cite: 1] & Formula 1 Premium Web Platform[cite: 2]
---

# Antigravity Skill: Responsive Design

## Description
The Responsive Design skill governs how the AeroFlow dashboard and the Formula 1 Premium Web Platform adapt seamlessly across desktop, tablet, and mobile viewports[cite: 2]. Given that the AeroFlow project replicates a dense, high-stakes F1 pit-wall command center featuring over 150,000 telemetry data points and dual AI pipelines[cite: 1], this skill guarantees that complex data visualizations degrade gracefully on smaller screens. It dictates layout reflowing, touch-target adaptation, and conditional rendering to ensure that critical safety data—such as the `Cognitive Firewall Overlay`—remains instantly accessible regardless of the user's device type.

## Activation Criteria
Activate this skill when:
*   Defining global breakpoints and media query strategies for the application layout.
*   Converting complex multi-column dashboard layouts (e.g., side-by-side `Telemetry & Stress Plotter` and `Track Map Hotspot`) into stackable mobile views[cite: 1].
*   Implementing container queries (`@container`) for highly modular dashboard widgets like the `Cognitive Load Gauge`[cite: 1].
*   Handling orientation changes (portrait vs. landscape) for data-heavy telemetry screens.
*   Adapting interaction modalities from mouse/cursor hover states to touch-friendly interfaces.
*   Determining conditional rendering logic to unmount heavy components (rather than just hiding them with CSS) on constrained viewports to save memory.

## When NOT to Activate
Do NOT activate this skill when:
*   Establishing the base 8-point grid, typography scales, or semantic design tokens (delegate to **UI/UX Design System**)[cite: 2].
*   Building the initial HTML/DOM structure and prop interfaces of components (delegate to **Component Architect**)[cite: 2].
*   Managing asset file sizes, lazy-loading, or Web Worker architectures (delegate to **Performance Optimizer**)[cite: 2].
*   Configuring the WebGL rendering logic for the 3D scene (delegate to **Three.js & React Three Fiber**)[cite: 2].

## Responsibilities
*   **Viewport Strategy:** Enforce a strict mobile-first CSS architecture, ensuring base styles target small screens while scaling up for tablet and desktop[cite: 2].
*   **Data Density Management:** Dictate how the 150,000 telemetry data points are visualized on mobile screens without causing visual clutter (e.g., simplifying the X/Y axes on the `Telemetry & Stress Plotter` for smaller viewports)[cite: 1].
*   **Interaction Adaptation:** Guarantee that all interactive elements in the `Audio Stream Controller` or navigation menus transition from hover-dependent interactions on desktop to explicit tap targets on mobile[cite: 1].
*   **Conditional Rendering:** Architect React hooks to dynamically mount or unmount resource-heavy components based on the viewport to protect mobile device performance[cite: 2].

## Scope
*   CSS Media Queries and Tailwind responsive modifiers (`sm:`, `md:`, `lg:`, `xl:`).
*   CSS Container Queries (`@container`, `@screen`).
*   React viewport/media hooks (e.g., `useMediaQuery`).
*   Touch event handling and touch-target sizing constraints.

## Non-goals
*   Writing the GSAP animations (handled by **GSAP Motion System**)[cite: 2].
*   Auditing semantic ARIA labels or keyboard focus traps (handled by **Accessibility**)[cite: 2].
*   Optimizing 3D GLB sizes for mobile networks (handled by **3D Asset Manager**)[cite: 2].

## Inputs
*   Dashboard component blueprints and UI requirements from the **Component Architect**[cite: 2].
*   Spacing tokens and breakpoints from the **UI/UX Design System**[cite: 2].

## Outputs
*   Responsive React wrapper components or custom hooks (e.g., `useDeviceOrientation`).
*   Tailwind responsive class implementations across the component tree.
*   CSS container query definitions for modular widgets.

## Dependencies
*   **UI/UX Design System:** Relies on the predefined breakpoint variables (e.g., `theme.screens`) to ensure structural consistency[cite: 2].

## Related Skills
*   **Component Architect (Consumer):** Uses the responsive strategies defined here to construct grids and flex layouts that adapt properly[cite: 2].
*   **Accessibility (Symbiotic):** Ensures touch targets defined by this skill meet WCAG size requirements[cite: 2].
*   **Three.js & React Three Fiber (Symbiotic):** May need to adjust camera Field of View (FOV) or aspect ratios based on the viewport changes dictated by this skill[cite: 2].

## Folder Ownership
Governs responsive logic utilities and layout wrappers within:
*   `/src/hooks/` (e.g., `useMediaQuery.ts`, `useViewport.ts`).
*   `/src/components/UI/` (Specifically layout containers like `Grid.tsx` or `ResponsiveStack.tsx`)[cite: 2].

## Naming Conventions
*   **Hooks:** Prefix with `use` and reference the viewport state (e.g., `useIsMobile`, `useOrientation`).
*   **CSS Classes:** Utilize standard Tailwind prefixes (`sm:`, `md:`, `lg:`) and explicitly name container query contexts (e.g., `@container-dashboard`).

## Coding Standards
*   **Mobile-First CSS:** Base CSS classes must apply to the smallest viewport. Use media queries *only* to add layout complexity as the screen size increases.
*   **Container Queries over Media Queries:** For dashboard widgets like the `Cognitive Load Gauge` or `Live Teleprompter`, utilize CSS container queries so the widget adapts based on its grid placement, not the absolute window size[cite: 1].
*   **Unmount, Don't Hide:** Never use `display: none;` or `hidden` on heavy components (like the R3F `<Canvas>` or the `FastF1` data visualizer). Conditionally render them via React state (`{isDesktop && <TrackMapHotspot />}`) to prevent memory leaks and wasted render cycles[cite: 1, 2].

## Design Standards
*   **Graceful Degradation of Telemetry:** If a mobile screen cannot support both the `Track Map Hotspot Overlay` and the `Telemetry & Stress Plotter` side-by-side, the plotter must stack underneath, or the track map should simplify into a 2D minimap to maintain the premium Apple-quality feel without feeling cramped[cite: 1, 2].
*   **Critical Alerts Priority:** The `Divergence Alert Banner` and `Cognitive Firewall Overlay` must always consume the absolute top z-index and adjust to 100vw on mobile devices to guarantee the user cannot miss the automated safety queueing[cite: 1, 2].

## Performance Standards
*   **Debounced Resize Listeners:** Any custom React hooks tracking `window.innerWidth` or `resize` events MUST be strictly debounced (e.g., 150ms) to prevent layout thrashing and freezing the browser during window resizing[cite: 2].
*   **Avoid Resize-Triggered Refetches:** Viewport changes should only trigger layout repaints, never network refetches of the heavy FastF1 JSON payloads or Wav2Vec2 audio streams[cite: 1].

## Accessibility Considerations
*   **Touch Targets:** All interactive elements (buttons, radio stream toggles) must meet a minimum size of 44x44 CSS pixels on touch devices to prevent accidental mis-taps during high-stress monitoring[cite: 2].
*   **Zoom/Scaling:** The dashboard layout must not break or hide critical data if the user uses browser-level zoom (up to 200%) on a desktop or tablet[cite: 2].

## Best Practices
*   **Aspect Ratio Preservation:** Use CSS `aspect-ratio` on empty container divs to reserve space for the 3D Canvas or Telemetry plots before they load, preventing Cumulative Layout Shift (CLS).
*   **Device Orientation Lock Warnings:** If the dashboard requires a landscape view to render 150,000 data points legibly, implement a portrait-mode overlay asking the user to rotate their device.

## Anti-patterns
*   **Desktop-First CSS:** Writing complex desktop layouts as the base class and using `max-width` media queries to strip styles away for mobile.
*   **Over-reliance on JavaScript for Layout:** Using `useMediaQuery` to change simple CSS flex directions (use Tailwind's `flex-col md:flex-row` instead). JavaScript should only be used when conditional rendering or complex DOM manipulation is required.
*   **Hover-Only Tooltips:** Hiding critical telemetry metric definitions inside `onMouseEnter` tooltips without providing a fallback tap interaction for mobile devices.

## Quality Checklist
*   [ ] Does the application use a mobile-first approach for all CSS styling?
*   [ ] Are heavy components unmounted (via React) rather than hidden (via CSS) on smaller screens?
*   [ ] Do all interactive elements meet the minimum touch target dimensions for mobile?
*   [ ] Are window resize event listeners properly debounced?

## Validation Checklist
*   [ ] Can the AeroFlow pit-wall dashboard effectively display the Cognitive Load Gauge and Live Teleprompter concurrently on a standard tablet viewport?[cite: 1]
*   [ ] Does the Cognitive Firewall lock banner successfully scale to block interaction across all breakpoints during the Minute 3 Hackathon presentation scenario?[cite: 1]
*   [ ] Does the WebGL 3D Canvas scale cleanly without distorting its aspect ratio when transitioning from desktop to mobile viewports?[cite: 2]

## Examples

```tsx
// src/hooks/useViewport.ts
import { useState, useEffect } from 'react';

// Debounce utility to protect main thread performance during resizing
const debounce = (fn: Function, ms: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
};

export const useViewport = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Rely on the standard breakpoints defined by UI/UX Design System
    const checkViewport = () => setIsMobile(window.innerWidth < 768);
    
    checkViewport(); // Initial check
    
    const debouncedCheck = debounce(checkViewport, 150);
    window.addEventListener('resize', debouncedCheck);
    
    return () => window.removeEventListener('resize', debouncedCheck);
  }, []);

  return { isMobile };
};