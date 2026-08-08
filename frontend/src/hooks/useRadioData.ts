import { useState, useEffect } from 'react';
import { ApiClient } from '../api/client';
import type { RadioEvent } from '../types';

export function useRadioData(driverId: string | null, gpName: string | null) {
  const [events, setEvents] = useState<RadioEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driverId || !gpName) return;
    setLoading(true);
    ApiClient.getRadioEvents(driverId, gpName)
      .then(setEvents)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [driverId, gpName]);

  return { events, loading, error };
}
