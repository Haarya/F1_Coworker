import type { RadioEvent, TelemetryPoint, CorrelationSeries } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Standard fetch wrapper that handles errors and JSON parsing.
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // In this phase, the backend is not yet fully running, so we wrap calls
  // but they will likely fail if no backend is on port 8000. 
  // We log the attempt.
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
    // Rethrow to let components handle loading states/errors
    throw error;
  }
}

export const ApiClient = {
  // Radio
  getRadioEvents: (driverId: string, gp: string) => 
    fetchApi<RadioEvent[]>(`/radio/events?driver_id=${driverId}&gp=${gp}`),
    
  getRadioTranscript: (eventId: string) => 
    fetchApi<{ transcript: string; confidence: number; cognitiveLoad: number }>(`/radio/transcript/${eventId}`),

  // Telemetry
  getTelemetryStream: (driver: string, session: string, lap: number) => 
    fetchApi<TelemetryPoint[]>(`/telemetry/stream?driver=${driver}&session=${session}&lap=${lap}`),

  // Analysis
  getCorrelation: (driver: string, gp: string, lap: number) => 
    fetchApi<CorrelationSeries[]>(`/analysis/correlation?driver=${driver}&gp=${gp}&lapNum=${lap}`),
};
