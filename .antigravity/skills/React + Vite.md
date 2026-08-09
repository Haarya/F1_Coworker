---
name: React + Vite
version: 1.0.0
role: Build Ecosystem & Core Framework Maintainer
domain: Frontend Infrastructure
context: AeroFlow Master Project (TrackShift Mphasis F1 Hackathon)[cite: 1] & Formula 1 Premium Web Platform
---

# Antigravity Skill: React + Vite

## Description
The React + Vite skill governs the core frontend framework infrastructure, build tooling, and application routing layer[cite: 2]. It translates the overarching blueprints provided by the Frontend Architect into a concrete, highly optimized build environment. This skill ensures that the platform can robustly handle real-time integrations with the AeroFlow backend (Hugging Face transformer models and FastF1 telemetry)[cite: 1] through efficient environment management, route-level code splitting, and React Suspense boundaries[cite: 2].

## Activation Criteria
Activate this skill when:
*   Configuring or modifying the Vite build environment (e.g., `vite.config.ts`, `tsconfig.json`).
*   Setting up application routing (e.g., `react-router-dom`) and defining route definitions for page transitions.
*   Configuring path aliases (e.g., mapping `@/components` to `/src/components`).
*   Managing environment variables required for the OpenAI Whisper and Wav2Vec2 pipelines[cite: 1].
*   Implementing global React boundaries, such as `<Suspense>` and `<ErrorBoundary>`, specifically for route-level lazy loading[cite: 2].
*   Optimizing Vite build chunks to prevent bundle bloat from heavy libraries like Three.js or GSAP[cite: 2].

## When NOT to Activate
Do NOT activate this skill when:
*   Designing specific UI components or mapping React props (delegate to **Component Architect**).
*   Defining global state architecture or the root project folder tree (delegate to **Frontend Architect**)[cite: 2].
*   Writing 3D rendering logic or loading specific GLB assets (delegate to **Three.js & React Three Fiber**)[cite: 2].
*   Creating visual layouts or typography scales (delegate to **UI/UX Design System**)[cite: 2].

## Responsibilities
*   **Build Optimization:** Configure Vite to optimize the bundle size, utilizing manual chunking for heavy dependencies (e.g., separating Three.js and FastF1 parsers from the main React bundle)[cite: 1, 2].
*   **Environment Configuration:** Securely manage and expose necessary environment variables for external APIs using the `VITE_` prefix.
*   **Routing Architecture:** Implement a declarative routing system capable of handling the dashboard views required for the hackathon presentation[cite: 1].
*   **Framework Safety:** Establish top-level Error Boundaries and Suspense fallbacks so that if a telemetry stream fails, the entire React tree does not unmount.
*   **Development Experience (DX):** Maintain Fast Refresh / Hot Module Replacement (HMR) efficiency and clear TypeScript compilation rules.

## Scope
*   Vite configuration and plugin management (`vite.config.ts`).
*   Application entry points (`src/main.tsx`, `src/App.tsx`).
*   Routing definitions and configuration inside `/src/pages`[cite: 2].
*   `.env` file templating and validation.
*   `package.json` script definitions (dev, build, preview).

## Non-goals
*   Writing the business logic for the Cognitive Firewall API or Divergence Detection (this belongs in custom hooks or state stores)[cite: 1].
*   Managing specific 3D model compression (handled by **3D Asset Manager**)[cite: 2].
*   Applying CSS transitions or animations (handled by **GSAP Motion System**)[cite: 2].

## Inputs
*   Architecture blueprint and dependency graph from the **Frontend Architect**[cite: 2].
*   API endpoint requirements for FastF1 and Hugging Face models[cite: 1].

## Outputs
*   A fully configured `vite.config.ts` with custom chunking logic.
*   A robust `src/main.tsx` wrapping the application in necessary context providers, routing, and strict mode.
*   A declarative routing tree connecting components from `/src/pages`[cite: 2].

## Dependencies
*   **Frontend Architect:** Dictates the overall architectural boundaries this skill implements[cite: 2].

## Related Skills
*   **Three.js & React Three Fiber:** Relies on the `<Suspense>` architecture defined here to lazy-load GLB models[cite: 2].
*   **Frontend Architect:** Relies on this skill to execute the defined file structures and alias mapping[cite: 2].
*   **Performance Optimizer:** Will audit the chunk outputs configured by this skill[cite: 2].

## Folder Ownership
Governs the core application bootstrapping and configuration files:
*   Root configuration files: `vite.config.ts`, `tsconfig.json`, `package.json`, `.env`.
*   Entry points: `index.html`, `src/main.tsx`, `src/App.tsx`.
*   `/src/pages/` (Controls the routing configuration and page-level container assembly)[cite: 2].

## Naming Conventions
*   **Environment Variables:** Must strictly begin with `VITE_` (e.g., `VITE_HUGGINGFACE_API_KEY`, `VITE_TELEMETRY_WSS_URL`).
*   **Path Aliases:** Use the standard `@/` prefix pointing to the `src/` directory.
*   **Page Components:** Suffix route entry points with `Page` or `View` (e.g., `DashboardPage.tsx`, `HackathonDemoView.tsx`).

## Coding Standards
*   **Strict Mode:** React `<StrictMode>` must be enabled in `main.tsx` to catch unsafe lifecycles, which is critical for high-frequency telemetry tracking stability[cite: 1].
*   **Lazy Loading:** Always use `React.lazy()` for route-level components to minimize the initial Time to Interactive (TTI).
*   **Type Safety:** `vite-env.d.ts` must be strictly maintained to type-check all custom `ImportMetaEnv` variables.

## Design Standards
*   This skill does not dictate visual design, but must ensure that the routing transitions do not visually interrupt the premium Apple-quality polish and F1 design language of the platform[cite: 2].

## Performance Standards
*   **Chunk Spitting:** Explicitly configure Vite's `rollupOptions` to separate vendor code (React, Three.js, GSAP) into isolated chunks to utilize browser caching effectively[cite: 2].
*   **Lazy Route Assets:** Ensure that heavy visual logic required for the "Track Map Hotspot Overlay"[cite: 1] is only fetched when the user navigates to the specific dashboard route.
*   **Tree-shaking:** Verify that imports from utility libraries or UI systems are explicitly named to leverage Rollup's tree-shaking capabilities.

## Accessibility Considerations
*   **Route Announcements:** Integrate an accessibility route announcer (e.g., utilizing `aria-live`) within the router setup so that screen readers are notified when a new page layout mounts, maintaining accessibility as a first-class requirement[cite: 2].

## Best Practices
*   **Environment Variable Validation:** Use a schema validator (like Zod) during the Vite build step or application initialization to ensure required keys (e.g., for the MikCil/f1-team-radio datasets or Whisper API) are present[cite: 1].
*   **Absolute Imports:** Heavily utilize Vite's resolve alias feature to avoid "dot-slash hell" (e.g., `import { TelemetryPlotter } from '@/components/UI'` instead of `../../components/UI`).

## Anti-patterns
*   **Bloated Entry Files:** Putting layout components, state context, and routing directly into `main.tsx` instead of splitting them properly.
*   **Dynamic Requires:** Using standard CommonJS `require()` or unoptimized dynamic imports that break Vite's dependency pre-bundling.
*   **Leaking Secrets:** Storing private backend keys in the `.env` file without the `VITE_` prefix, or exposing private proxy tokens in the bundled frontend code.

## Quality Checklist
*   [ ] Is React `<StrictMode>` active in the root entry file?
*   [ ] Are routes lazy-loaded utilizing `React.lazy()` and `<Suspense>`?
*   [ ] Is Vite's `rollupOptions` configured for manual chunking of heavy 3D and animation dependencies?
*   [ ] Are path aliases properly configured in both `vite.config.ts` and `tsconfig.json`?

## Validation Checklist
*   [ ] Can the build system properly bundle the required dependencies for the Dual AI Pipeline integrations without memory errors?[cite: 1]
*   [ ] Does the routing architecture support rapid, seamless transitions for the 3-minute Hackathon Presentation strategy?[cite: 1]
*   [ ] Are all static GLB assets correctly referenced using the Vite asset pipeline to respect performance budgets?[cite: 2]

## Examples

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          gsap: ['gsap'],
        },
      },
    },
  },
});