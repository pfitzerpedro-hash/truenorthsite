import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import * as api from './api';
import { ToastProvider } from './components/ui/Toast';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { LandingPage } from './pages/LandingPage';
import { PlatformSimulationPage } from './pages/SimulationPage';

function AppRoutes() {
  const navigate = useNavigate();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authTransition, setAuthTransition] = useState(false);
  const [currentUser, setCurrentUser] = useState<api.User | null>(() => api.getStoredUser());
  const [showProfile, setShowProfile] = useState(false);
  const [operationsHistory, setOperationsHistory] = useState<api.Operation[]>([]);
  const [operationsStats, setOperationsStats] = useState<api.OperationsStats | null>(null);

  const navigateToSimulation = () => {
    navigate('/simulation');
    window.scrollTo(0, 0);
  };

  const navigateHome = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthError(null);
    setShowAuthModal(true);
  };

  const loadOperationsHistory = async () => {
    if (!currentUser) return;
    try {
      const [historyRes, statsRes] = await Promise.all([
        api.listOperations(5, 0),
        api.getOperationsStats(),
      ]);
      setOperationsHistory(historyRes.operations);
      setOperationsStats(statsRes);
    } catch (error) {
      console.warn('Erro ao carregar histórico:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
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
  };

  const handleRegister = async (
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
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

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

  useEffect(() => {
    if (showProfile && currentUser) {
      loadOperationsHistory();
    }
  }, [showProfile, currentUser]);

  return (
    <>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        setMode={setAuthMode}
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={authLoading}
        error={authError}
      />

      {authTransition && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-slate-950 via-primary-900/80 to-slate-950">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary-400/40 border-t-primary-400 rounded-full animate-spin mx-auto"></div>
            <div className="text-lg font-semibold text-white">Entrando na sua conta</div>
            <div className="text-sm text-slate-300">Sincronizando preferências e histórico...</div>
          </div>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onNavigateToSimulation={navigateToSimulation}
              onOpenAuth={() => openAuth('login')}
              onOpenProfile={() => setShowProfile(true)}
              currentUser={currentUser}
              onNavigateHome={navigateHome}
            />
          }
        />
        <Route
          path="/simulation"
          element={
            <PlatformSimulationPage
              onNavigateHome={navigateHome}
              currentUser={currentUser}
              onLogout={handleLogout}
              onOpenAuth={openAuth}
            />
          }
        />
      </Routes>

      <UserProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        currentUser={currentUser}
        operations={operationsHistory}
        stats={operationsStats}
        onLoadMore={loadOperationsHistory}
        onLogout={handleLogout}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}
