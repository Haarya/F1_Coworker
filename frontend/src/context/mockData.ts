import type { TelemetryPoint, RadioEvent, CircuitCoordinate, StressMapPoint } from '../types';

// Generate 200 telemetry points simulating a lap
export const MOCK_TELEMETRY: TelemetryPoint[] = Array.from({ length: 200 }).map((_, i) => {
  const lapProgress = i / 200;
  // Simulate speed curve (fast straights, slow corners)
  const speed = 100 + 180 * Math.abs(Math.sin(lapProgress * Math.PI * 4)); 
  return {
    sessionTime: i * 0.5,
    speed,
    throttle: speed > 200 ? 100 : 0,
    brake: speed < 150,
    rpm: 8000 + (speed / 300) * 4000,
    gear: Math.floor(speed / 40) + 1,
    drs: speed > 250 && lapProgress > 0.5 && lapProgress < 0.7,
    x: 0, 
    y: 0
  };
});

// Generate 5 realistic radio events
export const MOCK_RADIO_EVENTS: RadioEvent[] = [
  {
    id: 'evt-1',
    timestamp: 15.0,
    driverId: 'VER',
    transcript: "Yeah, the rears are getting a bit warm in turn 3.",
    emotions: { angry: 0.1, fearful: 0.0, sad: 0.0, happy: 0.0, surprised: 0.1, neutral: 0.8, disgust: 0.0 },
    cognitiveLoad: 35,
    audioUrl: '',
    lapNumber: 1,
    sector: 1
  },
  {
    id: 'evt-2',
    timestamp: 35.5,
    driverId: 'VER',
    transcript: "Mate, I have absolutely no grip! What is going on?",
    emotions: { angry: 0.7, fearful: 0.1, sad: 0.0, happy: 0.0, surprised: 0.1, neutral: 0.1, disgust: 0.0 },
    cognitiveLoad: 78,
    audioUrl: '',
    lapNumber: 1,
    sector: 2
  },
  {
    id: 'evt-3',
    timestamp: 45.0,
    driverId: 'GP',
    transcript: "Understood Max. Strat 5, switch strat 5.",
    emotions: { angry: 0.0, fearful: 0.0, sad: 0.0, happy: 0.0, surprised: 0.0, neutral: 1.0, disgust: 0.0 },
    cognitiveLoad: 10,
    audioUrl: '',
    lapNumber: 1,
    sector: 2
  },
  {
    id: 'evt-4',
    timestamp: 70.2,
    driverId: 'VER',
    transcript: "I can't keep this pace up, the tyres are done!",
    emotions: { angry: 0.8, fearful: 0.2, sad: 0.0, happy: 0.0, surprised: 0.0, neutral: 0.0, disgust: 0.0 },
    cognitiveLoad: 88,
    audioUrl: '',
    lapNumber: 1,
    sector: 3
  },
  {
    id: 'evt-5',
    timestamp: 95.0,
    driverId: 'VER',
    transcript: "Okay, balancing is a bit better now.",
    emotions: { angry: 0.0, fearful: 0.0, sad: 0.0, happy: 0.2, surprised: 0.0, neutral: 0.8, disgust: 0.0 },
    cognitiveLoad: 25,
    audioUrl: '',
    lapNumber: 2,
    sector: 1
  }
];

// Generate a layout representing Monza Circuit
// Scaled roughly to fit a bounding box
const MONZA_BASE_POINTS = [
  { x: 300, y: 550, sector: 1 as const, brake: false }, // Start/Finish
  { x: 450, y: 550, sector: 1 as const, brake: true },  // Turn 1/2 Chicane
  { x: 500, y: 480, sector: 1 as const, brake: false }, // Curva Grande
  { x: 600, y: 350, sector: 1 as const, brake: true },  // Della Roggia Chicane
  { x: 550, y: 250, sector: 2 as const, brake: false }, // Lesmo 1
  { x: 500, y: 200, sector: 2 as const, brake: false }, // Lesmo 2
  { x: 400, y: 150, sector: 2 as const, brake: false }, // Serraglio
  { x: 300, y: 100, sector: 2 as const, brake: true },  // Ascari
  { x: 200, y: 120, sector: 2 as const, brake: false }, // Exit Ascari
  { x: 100, y: 300, sector: 3 as const, brake: false }, // Straight to Parabolica
  { x: 120, y: 480, sector: 3 as const, brake: true },  // Parabolica Entry
  { x: 200, y: 550, sector: 3 as const, brake: false }  // Parabolica Exit
];

// Interpolate the base points to create ~100 points for the track map
export const MOCK_CIRCUIT: CircuitCoordinate[] = [];
const TOTAL_TRACK_POINTS = 100;
for (let i = 0; i < TOTAL_TRACK_POINTS; i++) {
  const percent = i / TOTAL_TRACK_POINTS;
  const indexFloat = percent * MONZA_BASE_POINTS.length;
  const index1 = Math.floor(indexFloat);
  const index2 = (index1 + 1) % MONZA_BASE_POINTS.length;
  const t = indexFloat - index1;
  
  const p1 = MONZA_BASE_POINTS[index1];
  const p2 = MONZA_BASE_POINTS[index2];
  
  MOCK_CIRCUIT.push({
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
    sector: p1.sector,
    isHeavyBraking: p1.brake || p2.brake
  });
}

// Generate stress map points along the circuit
export const MOCK_STRESS_MAP: StressMapPoint[] = MOCK_CIRCUIT.map((c) => {
  // Simulate high stress in sector 3
  const stressLevel = c.sector === 3 ? 80 : (c.sector === 2 ? 50 : 20);
  return {
    x: c.x,
    y: c.y,
    stressLevel: stressLevel + (Math.random() * 10 - 5) // Add some noise
  };
});
