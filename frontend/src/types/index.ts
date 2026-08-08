// frontend/src/types/index.ts

export interface EmotionScores {
  angry: number;
  fearful: number;
  sad: number;
  happy: number;
  surprised: number;
  neutral: number;
  disgust: number;
}

export interface RadioEvent {
  id: string;
  timestamp: number;
  driverId: string;
  transcript: string;
  emotions: EmotionScores;
  cognitiveLoad: number;
  audioUrl: string;
  lapNumber: number;
  sector: 1 | 2 | 3;
}

export interface TelemetryPoint {
  sessionTime: number;
  speed: number;
  throttle: number;
  brake: boolean;
  rpm: number;
  gear: number;
  drs: boolean;
  x: number;
  y: number;
}

export interface CorrelationSeries {
  timestamp: number;
  speed: number;
  cognitiveLoad: number;
  gLat: number;
  sPsych: number;
  lapProgress: number;
}

export interface CircuitCoordinate {
  x: number;
  y: number;
  sector: 1 | 2 | 3;
  isHeavyBraking: boolean;
}

export interface StressMapPoint {
  x: number;
  y: number;
  stressLevel: number;
}

export interface LapPenalty {
  sector: 1 | 2 | 3;
  probability: number;
  deltaSeconds: number;
  confidence: number;
  features: string[];
}

export interface Transcript {
  text: string;
  speaker: 'driver' | 'engineer';
  confidence: number;
  words: { word: string; start: number; end: number }[];
}

export interface PlaybackState {
  state: 'idle' | 'playing' | 'paused';
  speed: 1 | 2 | 4;
  timestamp: number;
}
