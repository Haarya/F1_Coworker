import { useState, useEffect } from 'react';
import { ApiClient } from '../api/client';
import type { CorrelationSeries } from '../types';

export function useCorrelation(driverId: string | null, gpName: string | null, lap: number | null) {
  const [correlation, setCorrelation] = useState<CorrelationSeries[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!driverId || !gpName || !lap) return;
    setLoading(true);
    ApiClient.getCorrelation(driverId, gpName, lap)
      .then(setCorrelation)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [driverId, gpName, lap]);

  return { correlation, loading };
}
