import { useState, useEffect } from 'react';
import { ApiClient } from '../api/client';
import type { TelemetryPoint } from '../types';

export function useTelemetry(driverId: string | null, gpName: string | null, lap: number | null) {
  const [stream, setStream] = useState<TelemetryPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!driverId || !gpName || !lap) return;
    setLoading(true);
    ApiClient.getTelemetryStream(driverId, gpName, lap)
      .then(setStream)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [driverId, gpName, lap]);

  return { stream, loading };
}
