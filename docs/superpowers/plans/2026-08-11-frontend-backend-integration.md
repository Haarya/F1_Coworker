# Frontend-Backend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the frontend React components to the backend FastAPI endpoints using React Query for robust data fetching and state management.

**Architecture:** We will install and configure TanStack React Query, refactor the `ApiClient` to match the FastAPI routes, create custom data fetching hooks, and update the new dashboard components to consume data directly from the backend.

**Tech Stack:** React, TypeScript, TanStack Query (`@tanstack/react-query`), Vite.

## Global Constraints

- Target backend base URL: `http://localhost:8000/api/v1`
- Do not visually alter the components beyond adding simple loading states if required.
- Maintain existing context usage where appropriate (e.g., `RaceSessionContext` for selecting drivers/years).

---

### Task 1: Setup React Query & Update API Client

**Files:**
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/src/api/client.ts`

**Interfaces:**
- Consumes: Existing `main.tsx` setup.
- Produces: Application wrapped in `QueryClientProvider`, updated `ApiClient` methods.

- [ ] **Step 1: Install React Query**

```bash
cd frontend
npm install @tanstack/react-query
```

- [ ] **Step 2: Wrap application in `QueryClientProvider`**

Modify `frontend/src/main.tsx`:
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Inside render:
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

- [ ] **Step 3: Update `ApiClient` to match backend routes**

Modify `frontend/src/api/client.ts` to expose the following endpoints:
- `getTelemetryLaps`: GET `/telemetry/laps`
- `getTelemetryStream`: GET `/telemetry/stream`
- `getCircuitMap`: GET `/circuit/map`
- `postLapPenalty`: POST `/prediction/lap-penalty`
- `postIntercept`: POST `/prediction/intercept`

- [ ] **Step 4: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/main.tsx frontend/src/api/client.ts
git commit -m "chore: setup react-query and map API client to backend routes"
```

---

### Task 2: Create Custom React Query Hooks

**Files:**
- Create: `frontend/src/hooks/useApi.ts`

**Interfaces:**
- Consumes: `ApiClient` from Task 1.
- Produces: `useTelemetryLaps`, `useTelemetryStream`, `useCircuitMap`, `useLapPenalty` hooks.

- [ ] **Step 1: Create hook file with queries**

Create `frontend/src/hooks/useApi.ts`:
```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { ApiClient } from '../api/client';

export const useTelemetryLaps = (driverId: string) => {
  return useQuery({
    queryKey: ['telemetry-laps', driverId],
    queryFn: () => ApiClient.getTelemetryLaps(driverId),
    enabled: !!driverId,
  });
};

export const useCircuitMap = (circuitId: string) => {
  return useQuery({
    queryKey: ['circuit-map', circuitId],
    queryFn: () => ApiClient.getCircuitMap(circuitId),
    enabled: !!circuitId,
  });
};

export const useTelemetryStream = (driverId: string, session: string) => {
  return useQuery({
    queryKey: ['telemetry-stream', driverId, session],
    queryFn: () => ApiClient.getTelemetryStream(driverId, session),
    enabled: !!driverId && !!session,
    refetchInterval: 1000, // Stream simulation
  });
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/hooks/useApi.ts
git commit -m "feat: add react-query hooks for backend endpoints"
```

---

### Task 3: Refactor UI Components to Consume Hooks

**Files:**
- Modify: `frontend/src/components/stress/DriverAnalyticsCard.tsx`
- Modify: `frontend/src/components/prediction/CircuitMapCard.tsx`
- Modify: `frontend/src/components/stress/DriverStressMeter.tsx`

**Interfaces:**
- Consumes: Hooks from Task 2.
- Produces: Fully integrated UI connected to the backend.

- [ ] **Step 1: Refactor DriverAnalyticsCard**

Modify `DriverAnalyticsCard.tsx` to import and use `useTelemetryLaps`:
```tsx
import { useTelemetryLaps } from '../../hooks/useApi';

// Inside component, use the hook and conditionally render loading/error states.
```

- [ ] **Step 2: Refactor CircuitMapCard**

Modify `CircuitMapCard.tsx` to import and use `useCircuitMap`.

- [ ] **Step 3: Refactor DriverStressMeter**

Modify `DriverStressMeter.tsx` to utilize `useTelemetryStream` to feed the `ChevronGauge` components real data instead of fake random data. (Remove the fake interval).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/stress/DriverAnalyticsCard.tsx frontend/src/components/prediction/CircuitMapCard.tsx frontend/src/components/stress/DriverStressMeter.tsx
git commit -m "feat: connect UI components to backend api via react-query"
```
