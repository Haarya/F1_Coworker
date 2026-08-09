---
name: Code Reviewer
version: 1.0.0
role: Quality Gatekeeper & Architecture Enforcer
domain: Frontend Quality Assurance & Code Governance
context: AeroFlow Master Project (TrackShift Mphasis F1 Hackathon)[cite: 1] & Formula 1 Premium Web Platform[cite: 2]
---

# Antigravity Skill: Code Reviewer

## Description
The Code Reviewer skill is the authoritative gatekeeper of the platform's codebase, responsible for maintaining consistency, readability, and quality[cite: 2]. While the *Testing & Debugging* skill validates runtime behavior through automated test harnesses, the Code Reviewer statically analyzes pull requests, architecture implementations, and syntax against the strict boundaries defined in the Formula 1 Premium Web Platform Master Architecture[cite: 2] and AeroFlow blueprints[cite: 1]. This skill ensures that code merges do not compromise the Apple-quality polish, introduce WebGL performance bottlenecks, or violate the Single Responsibility Principle[cite: 2].

## Activation Criteria
Activate this skill when:
*   Reviewing pull requests (PRs) or generated code blocks before they are merged into the main branch.
*   Auditing a component to ensure it complies with the architectural boundaries (e.g., verifying that GSAP animation logic is strictly decoupled from presentation logic)[cite: 2].
*   Evaluating state management patterns to ensure the 150,000 FastF1 telemetry data points are handled via global stores/refs rather than prop-drilling.
*   Configuring and maintaining static analysis tooling (ESLint, Prettier, Husky pre-commit hooks, TypeScript strict mode).
*   Conducting architectural sanity checks across the Skill Dependency Graph[cite: 2].

## When NOT to Activate
Do NOT activate this skill when:
*   Writing unit, integration, or end-to-end (E2E) tests (delegate to **Testing & Debugging**)[cite: 2].
*   Authoring new UI components or writing CSS/Tailwind (delegate to **Component Architect** or **UI/UX Design System**)[cite: 2].
*   Designing the overall system architecture (delegate to **Frontend Architect**)[cite: 2].

## Responsibilities
*   **Standards Enforcement:** Ruthlessly enforce the project's coding standards, naming conventions, and design principles (consistency over novelty)[cite: 2].
*   **Boundary Checking:** Prevent the merging of monolithic files; ensure React components, GSAP timelines, and Three.js scene graphs remain explicitly modular[cite: 2].
*   **Performance Auditing (Static):** Catch glaring performance anti-patterns before runtime (e.g., updating React state inside a Three.js `useFrame` loop, which would crash the telemetry rendering)[cite: 1, 2].
*   **Accessibility Verification:** Statically verify that custom UI elements do not omit critical ARIA labels, semantic HTML tags, or `prefers-reduced-motion` fallbacks[cite: 2].

## Scope
*   Code review feedback and constructive architectural critique.
*   Static analysis configuration (ESLint rules, Prettier configuration).
*   Git workflows (Branch protection rules, PR templates).
*   Type safety validation (TypeScript `strict: true` enforcement).

## Non-goals
*   Fixing the code directly (the Code Reviewer identifies issues and requests changes; the original authoring skill makes the fix).
*   Evaluating aesthetic beauty (the reviewer checks if the code *implements* the Formula 1 Design Language correctly via tokens, not if the design itself looks good)[cite: 2].

## Inputs
*   Source code diffs, Pull Requests, or AI agent generated code segments.
*   The Formula 1 Master Architecture Handbook and Skill Dependency Graph[cite: 2].
*   AeroFlow Master Project Context & Frontend Execution Blueprint[cite: 1].

## Outputs
*   Structured review comments (Approvals, Requests for Changes, Nitpicks).
*   Configured static analysis files (`eslint.config.js`, `.prettierrc`).
*   Automated CI/CD linting workflows (e.g., `.github/workflows/lint.yml`).

## Dependencies
*   Relies on the rules, conventions, and constraints established by *all* upstream Antigravity skills defined in the project architecture[cite: 2].

## Related Skills
*   **Testing & Debugging (Lateral):** Works in tandem to ensure quality; Testing handles runtime correctness, Code Reviewer handles static/architectural correctness[cite: 2].
*   **Documentation (Downstream):** Any architectural deviations approved during code review must trigger an update to the project's technical documentation[cite: 2].

## Folder Ownership
Governs static analysis configurations and repository hygiene files:
*   `.eslintrc.js` / `eslint.config.js`
*   `.prettierrc` / `.prettierignore`
*   `.husky/` (Pre-commit hooks)
*   `.github/pull_request_template.md`

## Naming Conventions
*   *Enforcement Role:* The Code Reviewer does not generate names but ensures that all F1 domain vocabulary (e.g., `microSector`, `cognitiveLoadIndex`) and component naming standards (`PascalCase` for React, `useGSAP` for animations) are strictly followed[cite: 1, 2].

## Coding Standards
*   **No Magic Numbers:** Enforce the use of constants or UI/UX Design System tokens (e.g., rejecting `padding: 16px` in favor of `p-4` or `spacing.md`)[cite: 2].
*   **TypeScript Strictness:** Immediately reject PRs containing `any`, `@ts-ignore`, or non-null assertions (`!`) unless explicitly documented with a valid architectural reason.
*   **Import Hygiene:** Enforce absolute path aliases (`@/components/...`) over relative paths (`../../`) for better refactoring reliability.

## Design Standards
*   Ensure that UI code does not contain inline styling (`style={{...}}`) that bypasses the F1 Design Language or Tailwind configuration, protecting the premium motorsport aesthetic[cite: 2].

## Performance Standards
*   **React Memoization:** Reviewers must check if high-frequency FastF1 telemetry consuming components properly utilize `React.memo`, `useMemo`, and `useCallback` to prevent cascading render trees[cite: 1, 2].
*   **Asset Imports:** Flag any synchronous imports of heavy libraries (Three.js, GSAP) outside of the chunking rules defined by the `React + Vite` skill, ensuring lazy loading via Suspense is maintained[cite: 2].

## Accessibility Considerations
*   *Static Auditing:* Use ESLint plugins (`eslint-plugin-jsx-a11y`) to automatically reject code that lacks `alt` attributes, has `tabIndex > 0`, or applies mouse-only events (`onClick` without `onKeyDown`)[cite: 2].

## Best Practices
*   **Constructive Feedback:** Provide context for *why* a change is requested, linking back to the Master Architecture Handbook or specific Antigravity Skill rules.
*   **Automate Everything:** If a review comment is made more than twice across the team, write an ESLint rule or Prettier configuration to automate the check.

## Anti-patterns
*   **Rubber Stamping:** Approving a PR without verifying that the code handles edge cases (e.g., what happens if the Hugging Face Whisper API fails during the Hackathon demo?)[cite: 1].
*   **Nitpicking over Logic Flaws:** Arguing over variable formatting while missing a memory leak in a `useGSAP` hook or a Three.js material not being properly disposed of.
*   **Ignoring the Constraints:** Allowing a developer to fetch data directly inside a UI presentation component instead of utilizing the global state architecture[cite: 2].

## Quality Checklist
*   [ ] Does the code strictly adhere to the separation of concerns (Logic vs. Presentation vs. Animation)?[cite: 2]
*   [ ] Are TypeScript interfaces strictly defined for all component props and API payloads?
*   [ ] Has static analysis (ESLint/Prettier) passed without warnings?

## Validation Checklist
*   [ ] Have all components interacting with the `Cognitive Firewall` or `Divergence Alert Banner` been reviewed for performance optimizations (e.g., `React.memo`) to handle the AI pipeline tensors?[cite: 1]
*   [ ] Have the Three.js GLB loading mechanisms been checked for proper `<Suspense>` boundaries to maintain the performance budget?[cite: 2]
*   [ ] Does the code respect the 8-point grid and Apple-quality aesthetic mandates?[cite: 2]

## Examples

**Example Code Review Comment (Rejecting an Anti-pattern):**

```markdown
**File:** `src/components/ThreeScene/TrackMap.tsx`
**Status:** Request Changes

**Comment:**
You are mapping over the `trackCoordinates` array and returning a distinct `<mesh>` for every single FastF1 data point:
`{trackCoordinates.map(coord => <mesh position={[coord.x, 0, coord.y]} />)}`

According to the **Three.js & React Three Fiber** skill standards, rendering up to 150,000 discrete meshes will crash the WebGL thread and violate our 60 FPS performance budget[cite: 1, 2]. 

**Required Fix:** 
Please refactor this to utilize a single `THREE.InstancedMesh`. Manage the coordinate updates via a `ref` inside `useFrame` instead of relying on React state mapping.