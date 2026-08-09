# Driver Stress Meter Design Specification

## Overview
A fully interactive, responsive "Driver Stress Level" gauge component built with React, Tailwind CSS, and Framer Motion. It replicates a futuristic, high-end telemetry styling with glowing chevron meters, a dynamic ECG pulse, and an F1 car stage.

## Architecture
- **Tech Stack**: React, Tailwind CSS (styling, layout, static colors), Framer Motion (dynamic animations, glowing transitions).
- **Component Path**: `frontend/src/components/stress/DriverStressMeter.tsx`
- **Props**: 
  - `stressScore: number` (0 - 100)
  - `animated?: boolean` (Defaults to true)

## Visual Components

### 1. Container & Header
- **Layout**: Fixed aspect ratio dark card, mimicking a brushed-metal frame with metallic outer bevels and an inner grid texture.
- **Header**: Absolute positioned at the top center. "DRIVER STRESS LEVEL" in a muted silver font with wide tracking (`tracking-widest`).

### 2. Chevron Gauges (Left & Right)
- **Geometry**: SVG-based stacked horizontal segments forming an inward-pointing chevron (`<` on left, `>` on right).
- **Segments**: 10-12 discrete paths.
- **State mapping**: Based on `stressScore`, calculate how many segments are "active".
- **Styling**: 
  - Active: Bright red/orange fill with strong SVG `drop-shadow`.
  - Inactive: Translucent dark gray with faint outlines.
- **Scale Markers**: Vertical ticks with labels (0, 25, 50, 75, 100) placed outside the chevrons.

### 3. Center Digital Readout
- **Reticle**: Thin, translucent circular SVG lines forming a radar ring.
- **Typography**: Large, bold digital readout for the score, with a smaller `/100` beneath.

### 4. 3D F1 Car Stage
- **Asset**: A 3D `.glb` model (currently `ferrari.glb` located in `/models/`).
- **Technology**: React Three Fiber (`@react-three/fiber`) and Drei (`@react-three/drei`).
- **Positioning**: A `<Canvas>` element placed at the bottom center.
- **Stage Lighting**: The 3D model will be lit with an environment map. A red radial gradient div will be placed behind the canvas to simulate a glowing floor stage.

## Data Flow & Animation
- `stressScore` acts as the single source of truth.
- Framer Motion's `animate` prop will declaratively handle transitions when `stressScore` changes (e.g., segments glowing on/off smoothly).

## Ambiguities Resolved
- **Implementation Strategy**: Verified to use SVG paths combined with Framer Motion for precise geometry and buttery smooth animations.
