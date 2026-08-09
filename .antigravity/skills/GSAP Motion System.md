---
name: GSAP Motion System
version: 1.0.0
role: Animation Engine & Timeline Architect
domain: Frontend Motion Engineering
context: AeroFlow Master Project (TrackShift Mphasis F1 Hackathon)[cite: 1] & Formula 1 Premium Web Platform[cite: 2]
---

# Antigravity Skill: GSAP Motion System

## Description
The GSAP Motion System skill serves as the central engineering backbone for performance-driven DOM and WebGL animations across the platform[cite: 2]. It translates products' behavioral designs into robust GreenSock Animation Platform (GSAP) timelines, leveraging `ScrollTrigger`, `CustomEase`, `Flip`, and `TextPlugin`[cite: 2]. By standardizing animation hooks, timeline orchestration, and teardown lifecycles through React's `@gsap/react` integration, this skill ensures liquid-smooth 60+ FPS motion that evokes Formula 1 acceleration, telemetry sweeps, and high-stakes pit-wall urgency without causing layout thrashing or memory leaks.

## Activation Criteria
Activate this skill when:
*   Configuring global GSAP plugins (`ScrollTrigger`, `CustomEase`, `TextPlugin`, `Flip`) and registering licenses or global defaults.
*   Building reusable GSAP timeline hooks (e.g., `useGSAPTimeline`, `useScrollStory`) inside `/src/components/Animations/`[cite: 2].
*   Engineering scroll-driven storytelling sequences using `ScrollTrigger`[cite: 2].
*   Animating DOM overlays, such as triggering the flashing state for the `Divergence Alert Banner` or sliding in the `Cognitive Firewall Overlay`[cite: 1].
*   Controlling complex UI transitions like tachometer needle sweeps on the `Cognitive Load Gauge` or line-drawing reveals on the `Telemetry & Stress Plotter`[cite: 1].
*   Managing GSAP timeline cleanup, context scoping, and resize invalidations.

## When NOT to Activate
Do NOT activate this skill when:
*   Defining high-level cinematic motion choreography, velocity curves, or artistic storytelling direction (delegate to **Motion Designer**)[cite: 2].
*   Defining CSS transitions, hover tokens, or base static UI styles (delegate to **UI/UX Design System**)[cite: 2].
*   Building Three.js scene graphs, lighting, or mesh geometries (delegate to **Three.js & React Three Fiber**)[cite: 2].
*   Structuring React component hierarchies or prop interfaces (delegate to **Component Architect**)[cite: 2].

## Responsibilities
*   **Timeline Orchestration:** Prefer master timelines over isolated, floating tweens to guarantee synchronized, deterministic multi-element animations[cite: 2].
*   **Decoupled Animation Architecture:** Strictly isolate animation logic from presentation components, referencing React `refs` rather than hardcoded query selectors[cite: 2].
*   **Scroll-Driven Storytelling:** Build robust `ScrollTrigger` instances that synchronize page scroll positions with telemetry reveals and 3D camera tracks[cite: 1, 2].
*   **Lifecycle Sanitation:** Guarantee zero memory leaks by utilizing `@gsap/react` (`useGSAP`) or explicitly invoking `gsap.context()` for automatic cleanup on component unmounts.
*   **Hardware Acceleration:** Enforce GPU-accelerated properties (`x`, `y`, `scale`, `rotation`, `opacity`, `force3D`) to avoid layout recalculations and maintain 60 FPS performance budgets[cite: 2].

## Scope
*   GSAP core configuration, plugin registration, and custom ease creation.
*   Animation hook factory and utilities within `/src/components/Animations/`[cite: 2].
*   DOM-based ScrollTrigger configurations, timelines, and batch triggers.
*   Property tweening targeting R3F refs (e.g., camera coordinates, light intensities) in coordination with R3F render loops[cite: 2].

## Non-goals
*   Writing raw CSS styles or Tailwind classes (handled by **UI/UX Design System** and **F1 Design Language**)[cite: 2].
*   Modifying 3D model geometries or texture files (handled by **3D Asset Manager**)[cite: 2].
*   Handling WebSocket data streaming or parsing FastF1 pandas dataframes (handled by **Frontend Architect**)[cite: 1, 2].

## Inputs
*   Motion choreography, direction, and timing parameters provided by the **Motion Designer**[cite: 2].
*   DOM element references (`React.RefObject`) provided by the **Component Architect**[cite: 2].
*   R3F mesh and camera refs provided by **Three.js & React Three Fiber**[cite: 2].

## Outputs
*   Reusable GSAP timelines, custom hooks, and utility functions in `/src/components/Animations/`[cite: 2].
*   Registered GSAP custom eases mirroring F1 telemetry dynamics (e.g., hard braking, rapid downshifts).
*   Safe, garbage-collected animation drivers powering the AeroFlow 3-minute demo strategy[cite: 1].

## Dependencies
*   **Component Architect:** Provides the stable DOM element refs and component structures required for GSAP targeting[cite: 2].
*   **React + Vite:** Provides the build setup for bundling GSAP ESM modules and `@gsap/react`[cite: 2].

## Related Skills
*   **Motion Designer (Upstream Director):** Dictates *what* needs to move, *when*, and *why*; GSAP Motion System executes *how* it moves in code[cite: 2].
*   **Three.js & React Three Fiber (Lateral):** Shares refs so GSAP timelines can smoothly interpolate 3D camera properties or material emissive colors alongside DOM elements[cite: 2].
*   **Accessibility (Auditor):** Ensures GSAP instances respect `prefers-reduced-motion` settings[cite: 2].

## Folder Ownership
Governs animation utilities and timeline builders within[cite: 2]:
*   `/src/components/Animations/` (Primary owner of timeline hooks, `ScrollTrigger` drivers, and custom ease definitions)[cite: 2].

## Naming Conventions
*   **Animation Hooks:** Prefix with `useGSAP` or `useAnimation` (e.g., `useGSAPTelemetryReveal.ts`, `useGSAPFirewallLock.ts`).
*   **Timelines:** Name variables according to their role, suffixed with `Tl` or `Timeline` (e.g., `divergenceAlertTl`, `heroIntroTimeline`).
*   **Custom Eases:** Use F1 motorsport terminology prefixed with `f1-` (e.g., `f1-hard-brake`, `f1-turbo-accel`, `f1-gear-shift`).

## Coding Standards
*   **Use `@gsap/react`:** Always wrap component animation logic inside the official `useGSAP()` hook to ensure automatic timeline reverting upon unmount or state change.
*   **Ref-Based Selectors:** Always pass a `scope` ref to `useGSAP` and use scoped selectors (e.g., `gsap.utils.toArray('.telemetry-card')`) or explicit `ref.current` references. Never use global `document.querySelector`.
*   **Timeline Modularity:** Break large animation sequences into master and child timelines using `timeline.add()`.

## Design Standards
*   **Motorsport Motion Curves:** Avoid generic `power1.out` or `linear` eases for key UI elements. Use dramatic, asymmetric eases that mimic motorsport physics—fast explosive starts (acceleration) followed by rapid deceleration (hard braking)[cite: 2].
*   **Telemetry Micro-Interactions:** Animate numeric readouts (using `TextPlugin`) and gauge hands smoothly to reflect live telemetry updates without jitter[cite: 1].

## Performance Standards
*   **Hardware Acceleration:** Only animate GPU-friendly transform properties (`transform: translate3d()`, `scale()`, `rotate()`) and `opacity`. Never animate `top`, `left`, `width`, `height`, or `margin`[cite: 2].
*   **`will-change` Management:** Apply `will-change: transform` dynamically during active timelines and clear it on completion (`onComplete`) to preserve GPU memory.
*   **ScrollTrigger Optimization:** Always use `fastScrollEnd: true` and `preventOverlaps: true` on critical `ScrollTrigger` instances to prevent flickering during rapid user scrolling[cite: 2].

## Accessibility Considerations
*   **Reduced Motion Fallbacks:** Every GSAP timeline MUST evaluate `window.matchMedia('(prefers-reduced-motion: reduce)')` or utilize GSAP's `gsap.matchMedia()`[cite: 2]. When reduced motion is preferred, jump timelines directly to their final state (`timeline.progress(1)`) or fade opacity linearly without spatial displacement[cite: 2].

## Best Practices
*   **Master Control Objects:** Export timeline creation functions that return the timeline instance, allowing parent components or presentation handlers to call `.play()`, `.pause()`, `.reverse()`, or `.kill()`.
*   **Refresh Hazards:** Call `ScrollTrigger.refresh()` only after 3D models or heavy lazy-loaded React components have completely mounted and updated the page height[cite: 2].

## Anti-patterns
*   **Orphaned Tweens:** Creating `gsap.to()` calls inside `useEffect` without returning a cleanup function (`ctx.revert()`), causing memory leaks and duplicated animations on re-renders.
*   **State-Driven Frame Loops:** Updating React state inside a GSAP `onUpdate` callback, triggering 60 React re-renders per second and destroying platform performance[cite: 1, 2].
*   **Layout Thrashing:** Animating non-composite properties (e.g., CSS `border-width` or `padding`) that force browser layout recalculations on every frame[cite: 2].

## Quality Checklist
*   [ ] Are all GSAP timelines wrapped inside `@gsap/react` (`useGSAP`) with proper scoping?
*   [ ] Does the implementation completely avoid animating layout properties (`top`, `left`, `width`, `height`)?[cite: 2]
*   [ ] Is `prefers-reduced-motion` explicitly handled for every animation sequence?[cite: 2]
*   [ ] Are `ScrollTrigger` instances safely killed and garbage collected on unmount?[cite: 2]

## Validation Checklist
*   [ ] Does the `Cognitive Firewall Overlay` lock sequence enter cleanly without causing frame drops on the main thread?[cite: 1]
*   [ ] Are the gauge needle sweeps and divergence alert flashes synchronized cleanly during the 3-minute Hackathon presentation strategy?[cite: 1]
*   [ ] Does the animation system maintain rock-solid 60 FPS while heavy WebGL rendering occurs simultaneously in R3F?[cite: 2]

## Examples

```typescript
// src/components/Animations/useGSAPFirewallLock.ts
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import React, { useRef } from 'react';

gsap.registerPlugin(CustomEase);

// Register F1-inspired motorsport deceleration curve
CustomEase.create('f1-hard-brake', 'M0,0 C0.05,0.7 0.1,1 1,1');

interface UseGSAPFirewallLockProps {
  containerRef: React.RefObject<HTMLDivElement>;
  isLocked: boolean;
}

export const useGSAPFirewallLock = ({ containerRef, isLocked }: UseGSAPFirewallLockProps) => {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Create master timeline for Cognitive Firewall lock reveal
    timelineRef.current = gsap.timeline({ paused: true })
      .to('.firewall-backdrop', {
        opacity: 1,
        duration: prefersReducedMotion ? 0.1 : 0.3,
        ease: 'power2.inOut',
      })
      .fromTo('.firewall-banner', 
        { 
          scale: prefersReducedMotion ? 1 : 1.2, 
          y: prefersReducedMotion ? 0 : -50, 
          opacity: 0 
        },
        { 
          scale: 1, 
          y: 0, 
          opacity: 1, 
          duration: prefersReducedMotion ? 0.1 : 0.4, 
          ease: 'f1-hard-brake' 
        },
        "-=0.1"
      );
  }, { scope: containerRef });

  // Control playback based on state without re-creating timeline
  React.useEffect(() => {
    if (isLocked) {
      timelineRef.current?.play();
    } else {
      timelineRef.current?.reverse();
    }
  }, [isLocked]);
};