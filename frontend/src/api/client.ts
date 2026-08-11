import type { RadioEvent, CorrelationSeries } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Standard fetch wrapper that handles errors and JSON parsing.
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  console.log(`[API Client] Fetching ${API_BASE}${endpoint}`);
  
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.warn(`[API Client] Error calling ${endpoint}:`, error);
    throw error;
  }
}

export const ApiClient = {
  // Radio (Existing functionality, leaving intact for UI)
  getRadioEvents: (driverId: string, gp: string) => 
    fetchApi<RadioEvent[]>(`/radio/events?driver_id=${driverId}&gp=${gp}`),
    
  getRadioTranscript: (eventId: string) => 
    fetchApi<{ transcript: string; confidence: number; cognitiveLoad: number }>(`/radio/transcript/${eventId}`),

  getDriverStress: (audioId: string = "sample_radio") => 
    fetchApi<any>(`/radio/stress?audioId=${audioId}`),

  // Telemetry (Updated)
  getTelemetryLaps: (year: number, gp: string, driver: string) => 
    fetchApi<any[]>(`/telemetry/laps?year=${year}&gp=${gp}&driver=${driver}`),

  getTelemetryStream: (year: number, gp: string, driver: string, session: string = 'Race') => 
    fetchApi<any>(`/telemetry/stream?year=${year}&gp=${gp}&driver=${driver}&session=${session}`),

  // Prediction (Updated)
  postLapPenalty: (data: any) => 
    fetchApi<any>(`/prediction/lap-penalty`, { method: 'POST', body: JSON.stringify(data) }),

  postIntercept: (data: any) => 
    fetchApi<any>(`/prediction/intercept`, { method: 'POST', body: JSON.stringify(data) }),

  // Circuit (Updated)
  getCircuitMap: (year: number, gp: string) => 
    fetchApi<any>(`/circuit/map?year=${year}&gp=${gp}`),

  // Analysis
  getCorrelation: (driver: string, gp: string, lap: number) => 
    fetchApi<CorrelationSeries[]>(`/analysis/correlation?driver=${driver}&gp=${gp}&lapNum=${lap}`),
};
