---
name: Testing & Debugging
version: 1.0.0
role: Quality Assurance Architect & Systems Validator
domain: Frontend Automated Testing & Reliability
context: AeroFlow Master Project (TrackShift Mphasis F1 Hackathon)[cite: 1] & Formula 1 Premium Web Platform
---

# Antigravity Skill: Testing & Debugging

## Description
The Testing & Debugging skill governs the systematic validation and debugging of the platform[cite: 2]. In the high-stakes environment of the AeroFlow pit-wall dashboard, the frontend cannot afford to fail when processing 150,000 telemetry data points per second or when interpreting critical Hugging Face AI tensors[cite: 1]. This skill is responsible for establishing the automated test harnesses (Unit, Integration, End-to-End), defining mocking strategies for complex asynchronous data streams, and ensuring that automated safety features—like the Cognitive Firewall—fire reliably under simulated stress conditions[cite: 1].

## Activation Criteria
Activate this skill when:
*   Setting up the frontend testing framework (e.g., Vitest, Jest, React Testing Library, Cypress, or Playwright)[cite: 2].
*   Writing unit tests for pure utility functions (e.g., math helpers calculating lateral G-forces from FastF1 coordinates)[cite: 1].
*   Writing integration tests to verify that the `Telemetry Correlation Engine` properly syncs the Whisper semantic transcripts with Wav2Vec2 stress indices[cite: 1].
*   Developing End-to-End (E2E) scripts to programmatically validate the 3-minute Hackathon Presentation Strategy[cite: 1].
*   Integrating accessibility validation tools (e.g., `axe-core`) into the test runner[cite: 2].
*   Debugging race conditions, state synchronization errors, or WebSocket ingestion failures.

## When NOT to Activate
Do NOT activate this skill when:
*   Conducting runtime performance profiling or Web Worker optimization (delegate to **Performance Optimizer**)[cite: 2].
*   Building the actual UI components or dashboard panels (delegate to **Component Architect**)[cite: 2].
*   Configuring the Vite build tooling or routing architecture (delegate to **React + Vite**)[cite: 2].
*   Handling WebGL scene lighting or 3D asset loading (delegate to **Three.js & React Three Fiber**)[cite: 2].

## Responsibilities
*   **Test Harness Architecture:** Configure a fast, deterministic testing environment capable of mocking time-series data and high-frequency WebSocket streams.
*   **Data Stream Mocking:** Create reliable test doubles (mocks/stubs) for the FastF1 Pandas DataFrames and Hugging Face (openai/whisper-large-v3, ehcalabres/wav2vec2) API payloads[cite: 1].
*   **Behavioral Verification:** Ensure that critical UI states, such as the `Divergence Warning` or `Cognitive Firewall`, trigger exactly when the mock stress index exceeds 85% during heavy braking[cite: 1].
*   **Systematic Debugging:** Provide structured methodologies for isolating bugs across the complex boundary of React DOM, Three.js WebGL Canvas, and GSAP animation timelines[cite: 2].

## Scope
*   Unit Testing (Testing isolated hooks and utility functions).
*   Component Integration Testing (React Testing Library).
*   End-to-End (E2E) Testing.
*   Mock Data Generators and Factory patterns.
*   Test coverage reporting and CI/CD pipeline integration scripts.

## Non-goals
*   Testing the backend Python infrastructure (FastF1 or Hugging Face instances themselves). This skill only tests the frontend's *reaction* to those services[cite: 1].
*   Visual regression testing for 3D GLB assets (handled via manual visual QA or specialized WebGL tools, outside standard DOM testing scope).

## Inputs
*   Component structures and prop interfaces defined by the **Component Architect**[cite: 2].
*   The AeroFlow hackathon demo script (Baseline, High Stress, Firewall Save) for E2E scenario mapping[cite: 1].
*   Expected data schemas for the AI pipelines and telemetry engine[cite: 1].

## Outputs
*   Test files (`*.test.tsx`, `*.spec.ts`).
*   Mock data fixtures representing clean and distorted F1 telemetry states.
*   Setup files for the test runner (e.g., `setupTests.ts`, `cypress.config.ts`).

## Dependencies
*   **React + Vite:** Relies on the Vite configuration to establish a compatible Vitest/Jest environment[cite: 2].

## Related Skills
*   **Component Architect (Upstream):** Provides the components that this skill validates[cite: 2].
*   **Accessibility (Lateral):** This skill automates the WCAG constraints defined by the Accessibility skill using libraries like `jest-axe`[cite: 2].

## Folder Ownership
Governs all testing-related files and directories:
*   `/src/__tests__/` or co-located component tests (`ComponentName.test.tsx`).
*   `/src/__mocks__/` (Mock implementations of external modules or APIs).
*   `/cypress/` or `/tests/e2e/` (End-to-End testing suites).
*   `/src/utils/test-utils.tsx` (Custom renderers wrapping components in necessary state providers).

## Naming Conventions
*   **Test Files:** Suffix with `.test.ts`, `.test.tsx`, or `.spec.ts` directly adjacent to the file they are testing.
*   **Mock Data:** Use the prefix `mock` (e.g., `mockTelemetryData.json`, `mockStressIndexTensor.ts`).
*   **Test Suites:** Use `describe` blocks named exactly after the component or hook being tested.

## Coding Standards
*   **Arrange, Act, Assert (AAA):** All tests must strictly follow the AAA pattern to maintain readability.
*   **Semantic Queries:** When using React Testing Library, prioritize accessibility queries (`getByRole`, `getByLabelText`) over `getByTestId` to simultaneously validate semantic HTML compliance[cite: 2].
*   **Mocking Boundaries:** Never make actual network requests to Hugging Face or FastF1 endpoints during automated tests. Intercept and mock all network calls (using MSW - Mock Service Worker) to ensure tests are fast and deterministic[cite: 1].

## Design Standards
*   *Not Applicable.* This skill governs code reliability and validation, not visual design.

## Performance Standards
*   **Test Execution Speed:** Unit and integration test suites must execute in under 30 seconds locally to support a fast iterative Developer Experience (DX).
*   **WebGL Isolation:** DOM tests should mock the Three.js `<Canvas>` completely. Rendering WebGL contexts inside JSDOM or Happy DOM environments is highly expensive and prone to failure[cite: 2].

## Accessibility Considerations
*   **Automated WCAG Auditing:** Integrate `axe-core` into both the unit testing (via `jest-axe`) and E2E testing pipelines to programmatically catch missing ARIA labels, contrast failures, and focus-trap violations[cite: 2].

## Best Practices
*   **Testing the Hackathon Demo:** Write a dedicated E2E script that strictly follows the 3-minute demo strategy[cite: 1]. This ensures the "Golden Path" for the judges is never broken by a late-stage commit.
*   **Deterministic Timers:** When testing GSAP timelines or delayed state updates, use `vi.useFakeTimers()` or `jest.useFakeTimers()` to instantly advance time rather than waiting for animations to complete[cite: 2].

## Anti-patterns
*   **Testing Implementation Details:** Asserting that a specific React internal state value changed, rather than asserting that the DOM updated correctly for the user.
*   **Flaky Tests:** Writing tests that rely on real-world network latency or un-mocked `setTimeout` calls, resulting in builds that pass/fail randomly.
*   **Over-Mocking:** Mocking a component's direct children instead of letting the component tree render, which defeats the purpose of integration testing.

## Quality Checklist
*   [ ] Are all network calls and WebSocket streams mocked using MSW or equivalent?
*   [ ] Do UI tests utilize semantic ARIA queries (`getByRole`) to enforce accessibility?
*   [ ] Is the WebGL Three.js context properly stubbed out during DOM-focused tests?
*   [ ] Are GSAP animations bypassed or accelerated using fake timers in the test environment?[cite: 2]

## Validation Checklist
*   [ ] Is there a dedicated test proving that the `Cognitive Firewall` locks the UI when the Cognitive Load Index hits 85%?[cite: 1]
*   [ ] Can the test suite validate the `Divergence Warning` logic when the semantic text (calm) conflicts with the acoustic stress (high jitter)?[cite: 1]
*   [ ] Does the test coverage provide confidence in the systematic validation and debugging of the platform?[cite: 2]

## Examples

```tsx
// src/components/UI/CognitiveLoadGauge/CognitiveLoadGauge.test.tsx
import { render, screen } from '@testing-library/react';
import { CognitiveLoadGauge } from './CognitiveLoadGauge';

describe('CognitiveLoadGauge', () => {
  it('renders green and normal when stress index is below threshold', () => {
    // Arrange: Provide calm baseline data[cite: 1]
    render(<CognitiveLoadGauge isUnderHighGForce="{false}" stressIndex="{0.3}"/>);
    
    // Assert: Check accessibility and visual state
    const gauge = screen.getByRole('meter', { name: /current cognitive load/i });
    expect(gauge).toBeInTheDocument();
    expect(gauge).toHaveAttribute('aria-valuenow', '30');
    expect(gauge).toHaveClass('f1-gauge-optimal');
  });

  it('triggers the Cognitive Firewall lock at 85% stress under high G-Force', () => {
    // Arrange: Provide critical track sector data (Minute 3 Strategy)[cite: 1]
    render(<CognitiveLoadGauge isUnderHighGForce="{true}" stressIndex="{0.88}"/>);
    
    // Assert: Verify the automated safety system activates
    const alertBanner = screen.getByText(/CHANNEL LOCKED/i);
    expect(alertBanner).toBeVisible();
    expect(alertBanner).toHaveClass('f1-glow-critical');
  });
});