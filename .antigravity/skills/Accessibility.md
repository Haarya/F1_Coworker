---
name: Accessibility
version: 1.0.0
role: Inclusive Design Guardian & WCAG Enforcer
domain: Frontend UX Architecture
context: AeroFlow Master Project (TrackShift Mphasis F1 Hackathon)[cite: 1] & Formula 1 Premium Web Platform
---

# Antigravity Skill: Accessibility

## Description
The Accessibility skill acts as the guardian of inclusive design, ensuring that the platform’s high-stakes telemetry dashboards and 3D experiences are usable by everyone[cite: 2]. Given that the AeroFlow project visualizes over 150,000 telemetry data points per second alongside complex AI transcripts[cite: 1], this skill guarantees that visual information is properly translated for assistive technologies without overwhelming them. It enforces semantic HTML, keyboard navigability, robust focus management, and WCAG-compliant color contrasts, treating accessibility not as an afterthought, but as a first-class requirement[cite: 2].

## Activation Criteria
Activate this skill when:
*   Structuring raw DOM elements to ensure proper semantic HTML (e.g., using `<button>` instead of `<div onClick>`).
*   Implementing ARIA (Accessible Rich Internet Applications) attributes for dynamic data streams, such as the `Live Teleprompter` or the `Cognitive Load Gauge`[cite: 1].
*   Designing and auditing focus management, especially focus traps for critical overlays like the `Cognitive Firewall Overlay`[cite: 1].
*   Defining interaction fallbacks for users with `prefers-reduced-motion` enabled[cite: 2].
*   Auditing color combinations from the Formula 1 Design Language for WCAG AA/AAA contrast compliance[cite: 2].
*   Constructing invisible, screen-reader-only text fallbacks for the Three.js WebGL `<Canvas>`[cite: 2].

## When NOT to Activate
Do NOT activate this skill when:
*   Writing the mathematical logic for the FastF1 Telemetry Correlation Engine (delegate to **Performance Optimizer**)[cite: 1, 2].
*   Writing GSAP animation timelines or configuring `useGSAP` hooks (delegate to **GSAP Motion System**, though this skill dictates the reduced-motion constraints)[cite: 2].
*   Building the visual CSS styling or layout grids (delegate to **UI/UX Design System** and **Component Architect**)[cite: 2].

## Responsibilities
*   **Semantic Architecture:** Enforce the use of native, semantically correct HTML elements to provide out-of-the-box keyboard support and screen reader context[cite: 2].
*   **Dynamic Alert Management:** Strategically deploy `aria-live` regions to announce critical AeroFlow events (e.g., a "Divergence Warning") without flooding the screen reader with the underlying 150,000-point telemetry feed[cite: 1].
*   **Focus Orchestration:** Guarantee logical DOM tab order and implement focus locking when critical safety modals take over the screen[cite: 1, 2].
*   **Contrast Auditing:** Ensure that the dark, neon-accented Formula 1 telemetry aesthetics do not compromise visual readability for visually impaired users[cite: 2].
*   **WebGL Fallbacks:** Mandate textual descriptions and `role="img"` or `role="application"` wrappers for the Track Map Hotspot Overlay[cite: 1, 2].

## Scope
*   HTML semantics (`<header>`, `<main>`, `<nav>`, `<aside>`, `<time>`, `<output>`).
*   ARIA roles, states, and properties (`role="alert"`, `aria-busy`, `aria-expanded`).
*   CSS focus states (`:focus-visible`).
*   Media queries (`prefers-reduced-motion`, `prefers-contrast`).

## Non-goals
*   Executing the 3D model compression (handled by **3D Asset Manager**)[cite: 2].
*   Dictating overall responsive breakpoints (handled by **Responsive Design**).
*   Writing end-to-end Cypress tests (handled by **Testing & Debugging**)[cite: 2].

## Inputs
*   Component DOM structures provided by the **Component Architect**[cite: 2].
*   Visual tokens provided by the **UI/UX Design System** and **Formula 1 Design Language**[cite: 2].
*   Telemetry event triggers defined by the AeroFlow context[cite: 1].

## Outputs
*   Accessible React component wrappers (e.g., `<VisuallyHidden>`, `<LiveAnnouncer>`).
*   ARIA-annotated JSX/TSX.
*   Accessibility audit feedback and constraint rules for other skills.

## Dependencies
*   **Component Architect:** Relies on this skill to provide the exact ARIA attributes required for custom interactive widgets[cite: 2].

## Related Skills
*   **GSAP Motion System (Auditor):** Ensures the animation engine respects `prefers-reduced-motion` queries[cite: 2].
*   **UI/UX Design System (Auditor):** Validates that all text colors meet contrast thresholds against F1 carbon fiber/dark backgrounds[cite: 2].
*   **Three.js & React Three Fiber (Symbiotic):** Provides DOM-level descriptions for the black-box `<Canvas>` element[cite: 2].

## Folder Ownership
Governs accessibility-specific utilities and wrapper components within:
*   `/src/components/UI/` (e.g., `ScreenReaderOnly.tsx`, `FocusTrap.tsx`)[cite: 2].
*   `/src/hooks/` (e.g., `useA11yAnnouncer.ts`, `usePrefersReducedMotion.ts`).

## Naming Conventions
*   **Screen Reader Classes:** Standardize on `.sr-only` for visually hidden but accessible text.
*   **ARIA Hooks:** Prefix custom accessibility logic with `useA11y` (e.g., `useA11yFocus`).
*   **Identifiers:** Ensure HTML `id` attributes are unique and descriptive for `aria-describedby` and `aria-labelledby` linkages.

## Coding Standards
*   **Native Elements First:** A custom `div` must never be used as a button unless it implements `role="button"`, `tabIndex={0}`, and handles both `onClick` and `onKeyDown` (Space/Enter). Prefer native `<button>` tags strictly.
*   **Tab Index:** Never use a `tabIndex` greater than `0`. Use `tabIndex={0}` to add elements to the natural tab order, and `tabIndex={-1}` to remove them or manage programmatic focus.
*   **Alt Text:** All informational imagery must have descriptive `alt` text. Decorative SVG HUD elements from the F1 Design Language must use `aria-hidden="true"`.

## Design Standards
*   **Focus Visibility:** Never globally set `outline: none`. All interactive elements must have a distinct, highly visible `:focus-visible` state that complements the Formula 1 aesthetic (e.g., a solid neon-accent outline) to support keyboard users[cite: 2].
*   **Contrast Ratios:** Text must have a minimum contrast ratio of 4.5:1 (AA) against its background, particularly crucial when rendering data over complex brushed metal or glassmorphic textures[cite: 2].

## Performance Standards
*   **Auditory Throttling:** High-frequency data (like the live FastF1 telemetry traces or 0.0-1.0 stress index) must NEVER be directly piped into an `aria-live` region. It will crash or severely lag the screen reader. Only threshold-based events (e.g., "Stress Index Critical") should trigger auditory updates[cite: 1, 2].

## Accessibility Considerations
*   *Universal Considerations:* This entire skill defines the accessibility considerations for the project.

## Best Practices
*   **Polite vs. Assertive:** Use `aria-live="polite"` for standard updates (like a lap time completing). Use `aria-live="assertive"` ONLY for critical, immediate safety alerts like the `Divergence Alert Banner`[cite: 1].
*   **Landmark Roles:** Wrap the main dashboard in `<main>`, the side controls in `<aside>`, and the telemetry plots in `<section>` tags with descriptive `aria-label` attributes to allow fast navigation via screen reader shortcuts.

## Anti-patterns
*   **Focus Loss:** Opening or closing the `Cognitive Firewall Overlay` without moving the user's keyboard focus into the modal, or failing to return focus to the triggering element when the modal closes[cite: 1].
*   **Color as Sole Indicator:** Using *only* red to indicate a critical stress state on the `Cognitive Load Gauge`. A textual or iconographic indicator (e.g., a warning triangle or the text "CRITICAL") must accompany the color shift[cite: 1, 2].
*   **Empty Links/Buttons:** Using icon-only buttons (like a play button on the Audio Stream Controller) without an `aria-label` or inner `.sr-only` text[cite: 1].

## Quality Checklist
*   [ ] Do all interactive elements use semantic HTML or proper ARIA roles/keyboard listeners?
*   [ ] Does the application support full navigation via the `Tab` key without getting trapped?
*   [ ] Is `:focus-visible` styled prominently?
*   [ ] Do color combinations pass WCAG 2.1 AA (4.5:1) minimum contrast?

## Validation Checklist
*   [ ] Does the `Cognitive Firewall Overlay` trap keyboard focus and announce its locked status via an assertive live region when activated?[cite: 1]
*   [ ] Does the WebGL Track Map have an `aria-label` and visually hidden fallback text describing the current driver position?[cite: 1, 2]
*   [ ] Are animations disabled or replaced with simple fades when the operating system requests reduced motion?[cite: 2]

## Examples

```tsx
// src/components/UI/LiveAnnouncer/LiveAnnouncer.tsx
import React, { useEffect, useState } from 'react';

interface LiveAnnouncerProps {
  message: string;
  urgency?: 'polite' | 'assertive'; // 'assertive' for Divergence Alerts, 'polite' for lap times
}

export const LiveAnnouncer: React.FC<LiveAnnouncerProps> = ({ message, urgency = 'polite' }) => {
  const [announcedMessage, setAnnouncedMessage] = useState('');

  useEffect(() => {
    // Debounce rapid telemetry updates to prevent screen reader flooding
    const timer = setTimeout(() => setAnnouncedMessage(message), 300);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div 
      className="sr-only" 
      aria-live={urgency} 
      aria-atomic="true"
    >
      {announcedMessage}
    </div>
  );
};