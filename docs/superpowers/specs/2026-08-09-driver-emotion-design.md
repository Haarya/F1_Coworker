# Driver Emotion Dashboard Component Design

## Goal
Redesign the `DriverEmotion.tsx` component into a premium, high-density telemetry widget with a machined-metal aesthetic, featuring a data visualization area and segmented track-bars.

## Integration & Layout
- **Location:** `frontend/src/components/stress/DriverEmotion.tsx`
- **Grid Integration:** Will take `w-full` of its column, allowing natural height growth to match adjacent portrait cards.
- **Internal Layout:** A flexible 2-column layout (flex-row or CSS Grid).
  - Left column: Radar chart (Data Visualization).
  - Right column: Detailed linear metrics.

## Component Specifications

### 1. Header & Status Badge
- **Header:** "EMOTION OF THE DRIVER" in small, muted slate-grey, uppercase tracking font (`tracking-[0.2em]`).
- **Status Badge:** A pill-shaped dark grey background with white text ("LOCKED IN") and a live animating pulse dot using `framer-motion`.
- **Confidence metric:** "CONF. 91%" next to the badge in muted monospace font.

### 2. Data Metrics (Right Side)
- **Metrics:** Focus, Aggression, Frustration, Calm.
- **Track-bars:** Custom-built segmented bars (10 individual block divs per metric). The filled blocks will light up in a deep crimson (`#990000` or similar non-neon red) or crisp white. Empty blocks will be a dark translucent grey.
- **Typography:** Labels uppercase and muted. Values right-aligned, bold monospace (`font-mono text-xl`).

### 3. Container Styling
- **Background:** Sleek dark `#1A1A1E`.
- **Border:** Subtle 1px border `border-gray-800`.
- **Shadows:** Inner shadow (`shadow-inner`) and a faint top highlight (e.g. `border-t-white/10`) to simulate machined-metal depth.

## Implementation Strategy
We will use Custom SVG + Framer Motion for the radar chart instead of `recharts`. Since we only have 4 specific data points (Focus, Aggression, Frustration, Calm), an SVG diamond radar is lightweight and allows absolute styling control over the glowing/metallic paths without adding external dependencies.
