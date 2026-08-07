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

// Generate a simple circular/oval circuit path for Visx
export const MOCK_CIRCUIT: CircuitCoordinate[] = Array.from({ length: 100 }).map((_, i) => {
  const t = (i / 100) * 2 * Math.PI;
  // A peanut/oval shape
  const x = 500 * Math.cos(t);
  const y = 300 * Math.sin(t * 2);
  return {
    x,
    y,
    sector: (i < 33 ? 1 : i < 66 ? 2 : 3) as 1 | 2 | 3,
    isHeavyBraking: (i > 25 && i < 30) || (i > 75 && i < 80)
  };
});

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
