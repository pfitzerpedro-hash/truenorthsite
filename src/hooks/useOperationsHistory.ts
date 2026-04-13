import { useState, useCallback } from 'react';
import * as api from '../api';

export interface UseOperationsHistoryReturn {
  operations: api.Operation[];
  stats: api.OperationsStats | null;
  loading: boolean;
  error: string | null;
  loadHistory: () => Promise<void>;
  loadMore: (limit?: number, offset?: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useOperationsHistory(): UseOperationsHistoryReturn {
  const [operations, setOperations] = useState<api.Operation[]>([]);
  const [stats, setStats] = useState<api.OperationsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [historyRes, statsRes] = await Promise.all([
        api.listOperations(5, 0),
        api.getOperationsStats()
      ]);
      setOperations(historyRes.operations);
      setStats(statsRes);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar histórico');
      console.warn('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async (limit = 10, offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const historyRes = await api.listOperations(limit, offset);
      if (offset === 0) {
        setOperations(historyRes.operations);
      } else {
        setOperations(prev => [...prev, ...historyRes.operations]);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar mais operações');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadHistory();
  }, [loadHistory]);

  return {
    operations,
    stats,
    loading,
    error,
    loadHistory,
    loadMore,
    refresh,
  };
}

export default useOperationsHistory;
