import { useState, useEffect } from 'react';

interface UseAsyncResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAsync<T>(fetcher: () => Promise<T>, initialValue: T, deps: unknown[] = []): UseAsyncResult<T> {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then(result => { if (!cancelled) setData(result); })
      .catch(err => { if (!cancelled) setError(err.message || 'Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, loading, error, refetch: () => setTick(t => t + 1) };
}
