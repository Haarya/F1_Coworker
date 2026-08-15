import { useQuery, useMutation } from '@tanstack/react-query';
import { ApiClient } from '../api/client';

// Telemetry Hooks
export const useDriverStress = (audioId: string = "sample_radio") => {
  return useQuery({
    queryKey: ['driver-stress', audioId],
    queryFn: () => ApiClient.getDriverStress(audioId),
  });
};

export const useRadioEvents = (driverId: string, gp: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['radio-events', driverId, gp],
    queryFn: () => ApiClient.getRadioEvents(driverId, gp),
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
    queryFn: () => ApiClient.getTelemetryStream(year, gp, driver, session),
    enabled: enabled && !!year && !!gp && !!driver,
    refetchInterval: 1000, // Poll every second to simulate a stream
  });
};

// Circuit Hooks
export const useCircuitMap = (year: number, gp: string) => {
  return useQuery({
    queryKey: ['circuit-map', year, gp],
    queryFn: () => ApiClient.getCircuitMap(year, gp),
    enabled: !!year && !!gp,
  });
};

// Prediction Hooks
export const useLapPenaltyMutation = () => {
  return useMutation({
    mutationFn: (data: any) => ApiClient.postLapPenalty(data),
  });
};

export const useInterceptMutation = () => {
  return useMutation({
    mutationFn: (data: any) => ApiClient.postIntercept(data),
  });
};
