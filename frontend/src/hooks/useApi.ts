import { useQuery, useMutation } from '@tanstack/react-query';
import { ApiClient } from '../api/client';
import { MOCK_TELEMETRY, MOCK_CIRCUIT, getMockRadioEvents } from '../context/mockData';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Telemetry Hooks
export const useDriverStress = (driverId: string) => {
  return useQuery({
    queryKey: ['driver-stress', driverId],
    queryFn: () => ApiClient.getDriverStress(driverId),
  });
};

export const useRadioEvents = (driverId: string, gp: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['radio-events', driverId, gp],
    queryFn: async () => {
      const driverAbbr = driverId.split('/').pop()?.split('_')[0] || 'Max';
      return getMockRadioEvents(driverAbbr);
    },
    enabled: enabled && !!driverId && !!gp,
  });
};

export const useTelemetryLaps = (year: number, gp: string, driver: string) => {
  return useQuery({
    queryKey: ['telemetry-laps', year, gp, driver],
    queryFn: () => ApiClient.getTelemetryLaps(year, gp, driver),
    enabled: !!year && !!gp && !!driver,
  });
};

export const useTelemetryStream = (year: number, gp: string, driver: string, session: string = 'Race', enabled: boolean = true) => {
  return useQuery({
    queryKey: ['telemetry-stream', year, gp, driver, session],
    queryFn: async () => {
      return { data: MOCK_TELEMETRY, total_points: MOCK_TELEMETRY.length, session_time_start: 0, session_time_end: 100 };
    },
    enabled: enabled && !!year && !!gp && !!driver,
  });
};

// Circuit Hooks
export const useCircuitMap = (year: number, gp: string) => {
  return useQuery({
    queryKey: ['circuit-map', year, gp],
    queryFn: async () => {
      return MOCK_CIRCUIT;
    },
    enabled: !!year && !!gp,
  });
};

// Prediction Hooks
export const useLapPenaltyMutation = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      await delay(1000);
      const isHighStress = data.cognitive_load > 60;
      return {
        probability: isHighStress ? 0.85 : 0.15,
        delta_seconds: isHighStress ? 2.45 : 0.1,
        sector: data.sector
      };
    },
  });
};

export const useInterceptMutation = () => {
  return useMutation({
    mutationFn: (data: any) => ApiClient.postIntercept(data),
  });
};
