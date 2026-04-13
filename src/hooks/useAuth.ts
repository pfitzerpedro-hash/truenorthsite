import { useState, useEffect, useCallback } from 'react';
import * as api from '../api';

export interface UseAuthReturn {
  // User state
  currentUser: api.User | null;
  isAuthenticated: boolean;

  // Auth modal state
  showAuthModal: boolean;
  authMode: 'login' | 'register';
  authLoading: boolean;
  authError: string | null;
  authTransition: boolean;

  // Actions
  openAuth: (mode: 'login' | 'register') => void;
  closeAuth: () => void;
  setAuthMode: (mode: 'login' | 'register') => void;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleRegister: (email: string, password: string, confirmPassword: string, name?: string) => Promise<void>;
  handleLogout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [currentUser, setCurrentUser] = useState<api.User | null>(() => api.getStoredUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authTransition, setAuthTransition] = useState(false);

  const openAuth = useCallback((mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthError(null);
    setShowAuthModal(true);
  }, []);

  const closeAuth = useCallback(() => {
    setShowAuthModal(false);
    setAuthError(null);
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { user, token } = await api.login(email, password);
      api.setStoredToken(token);
      api.setStoredUser(user);
      setCurrentUser(user);
      setShowAuthModal(false);
      setAuthTransition(true);
      setTimeout(() => setAuthTransition(false), 2000);
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleRegister = useCallback(async (
    email: string,
    password: string,
    confirmPassword: string,
    name?: string
  ) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { user, token } = await api.register(email, password, confirmPassword, name);
      api.setStoredToken(token);
      api.setStoredUser(user);
      setCurrentUser(user);
      setShowAuthModal(false);
      setAuthTransition(true);
      setTimeout(() => setAuthTransition(false), 2000);
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    api.logout();
    setCurrentUser(null);
  }, []);

  // Verify stored token on mount
  useEffect(() => {
    const token = api.getStoredToken();
    if (token && !currentUser) {
      api.getCurrentUser(token)
        .then(({ user }) => {
          setCurrentUser(user);
          api.setStoredUser(user);
        })
        .catch(() => {
          api.logout();
          setCurrentUser(null);
        });
    }
  }, [currentUser]);

  return {
    currentUser,
    isAuthenticated: !!currentUser,
    showAuthModal,
    authMode,
    authLoading,
    authError,
    authTransition,
    openAuth,
    closeAuth,
    setAuthMode,
    handleLogin,
    handleRegister,
    handleLogout,
  };
}

export default useAuth;
