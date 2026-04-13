import { create } from 'zustand';
import * as api from '../api';

interface AuthState {
  currentUser: api.User | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: api.User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: api.getStoredUser(),
  isLoading: false,
  error: null,

  setUser: (user) => set({ currentUser: user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => {
    api.logout();
    set({ currentUser: null });
  },
}));
