import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { RadioEvent, TelemetryPoint, CorrelationSeries, CircuitCoordinate, StressMapPoint, LapPenalty, Transcript } from '../types';
import { MOCK_TELEMETRY, MOCK_RADIO_EVENTS, MOCK_CIRCUIT, MOCK_STRESS_MAP } from './mockData';

interface RaceSessionState {
  driverId: string | null;
  gpName: string | null;
  sessionType: 'Race' | 'Qualifying' | 'Practice';
  currentLap: number | null;
  availableLaps: number[];
  radioEvents: RadioEvent[];
  telemetryStream: TelemetryPoint[];
  correlationData: CorrelationSeries[];
  circuitPath: CircuitCoordinate[];
  stressMap: StressMapPoint[];
  activeEventId: string | null;
  currentTranscript: Transcript | null;
  currentCLIndex: number;
  currentGLat: number;
  currentSPsych: number;
  playbackState: 'idle' | 'playing' | 'paused';
  playbackSpeed: 1 | 2 | 4;
  playbackTimestamp: number;
  lapPenaltyPrediction: LapPenalty | null;
  interceptActive: boolean;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
}

type RaceSessionAction =
  | { type: 'SET_DRIVER'; payload: string }
  | { type: 'SET_GP'; payload: string }
  | { type: 'SET_LAP'; payload: number }
  | { type: 'TOGGLE_PLAYBACK' }
  | { type: 'SET_SPEED'; payload: 1 | 2 | 4 }
  | { type: 'TICK_PLAYBACK'; payload: number };

const initialState: RaceSessionState = {
  driverId: 'VER',
  gpName: '2024 Australian GP',
  sessionType: 'Race',
  currentLap: 1,
  availableLaps: [1, 2, 3],
  radioEvents: MOCK_RADIO_EVENTS,
  telemetryStream: MOCK_TELEMETRY,
  correlationData: [],
  circuitPath: MOCK_CIRCUIT,
  stressMap: MOCK_STRESS_MAP,
  activeEventId: null,
  currentTranscript: null,
  currentCLIndex: 0,
  currentGLat: 0,
  currentSPsych: 0,
  playbackState: 'idle',
  playbackSpeed: 1,
  playbackTimestamp: 0,
  lapPenaltyPrediction: null,
  interceptActive: false,
  isLoading: false,
  isAnalyzing: false,
  error: null,
};

const RaceSessionContext = createContext<{
  state: RaceSessionState;
  dispatch: React.Dispatch<RaceSessionAction>;
} | undefined>(undefined);

function reducer(state: RaceSessionState, action: RaceSessionAction): RaceSessionState {
  switch (action.type) {
    case 'SET_DRIVER': return { ...state, driverId: action.payload };
    case 'SET_GP': return { ...state, gpName: action.payload };
    case 'SET_LAP': return { ...state, currentLap: action.payload };
    case 'TOGGLE_PLAYBACK': 
      return { 
        ...state, 
        playbackState: state.playbackState === 'playing' ? 'paused' : 'playing' 
      };
    case 'SET_SPEED':
      return { ...state, playbackSpeed: action.payload };
    case 'TICK_PLAYBACK': {
      const newTimestamp = state.playbackTimestamp + action.payload;
      
      // Calculate current CL Index based on the active telemetry point
      const activeTelemetry = state.telemetryStream.findLast(t => t.sessionTime <= newTimestamp);
      // Determine active radio event
      const activeRadio = state.radioEvents.findLast(r => r.timestamp <= newTimestamp);
      
      // If we're playing a radio event, bump up the stress
      let clIndex = state.currentCLIndex;
      if (activeRadio && (newTimestamp - activeRadio.timestamp) < 5) {
        clIndex = activeRadio.cognitiveLoad;
      } else if (activeTelemetry) {
        // Base CL on speed + some noise
        clIndex = Math.min(100, Math.max(0, (activeTelemetry.speed / 350) * 80 + Math.random() * 20));
      }

      // Determine if active intercept should fire (CL > 80 and heavy braking/sharp corner)
      // We can use the circuit data mapped to the current index
      const lapDuration = 100;
      const progress = (newTimestamp % lapDuration) / lapDuration;
      const circuitIndex = Math.floor(progress * state.circuitPath.length);
      const currentPos = state.circuitPath[Math.min(circuitIndex, Math.max(0, state.circuitPath.length - 1))];
      
      let interceptActive = state.interceptActive;
      if (clIndex > 80 && currentPos?.isHeavyBraking) {
        interceptActive = true;
      } else {
        // Just for demo, we let GSAP dismiss it, or we turn it off if cl drops
        if (clIndex < 70) interceptActive = false;
      }

      return { 
        ...state, 
        playbackTimestamp: newTimestamp,
        activeEventId: activeRadio && (newTimestamp - activeRadio.timestamp) < 5 ? activeRadio.id : null,
        currentCLIndex: clIndex,
        interceptActive
      };
    }
    default: return state;
  }
}

export const RaceSessionProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <RaceSessionContext.Provider value={{ state, dispatch }}>
      {children}
    </RaceSessionContext.Provider>
  );
};

export const useRaceSession = () => {
  const context = useContext(RaceSessionContext);
  if (context === undefined) {
    throw new Error('useRaceSession must be used within a RaceSessionProvider');
  }
  return context;
};
