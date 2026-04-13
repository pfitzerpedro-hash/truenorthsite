import { create } from 'zustand';
import * as api from '../api';

interface OperationsState {
  operations: api.Operation[];
  stats: api.OperationsStats | null;
  isLoading: boolean;
  hasMore: boolean;
  offset: number;

  setOperations: (operations: api.Operation[]) => void;
  appendOperations: (operations: api.Operation[]) => void;
  setStats: (stats: api.OperationsStats | null) => void;
  setLoading: (isLoading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  incrementOffset: (by: number) => void;
  reset: () => void;
}

const PAGE_SIZE = 10;

export const useOperationsStore = create<OperationsState>((set) => ({
  operations: [],
  stats: null,
  isLoading: false,
  hasMore: true,
  offset: 0,

  setOperations: (operations) => set({ operations }),
  appendOperations: (newOps) =>
    set((state) => ({ operations: [...state.operations, ...newOps] })),
  setStats: (stats) => set({ stats }),
  setLoading: (isLoading) => set({ isLoading }),
  setHasMore: (hasMore) => set({ hasMore }),
  incrementOffset: (by) => set((state) => ({ offset: state.offset + by })),
  reset: () =>
    set({ operations: [], stats: null, isLoading: false, hasMore: true, offset: 0 }),
}));

export { PAGE_SIZE };
