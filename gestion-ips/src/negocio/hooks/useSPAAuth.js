import { useEffect } from 'react';
import { useAuth } from '@/negocio/context/AuthContext.jsx';
import { useNavigationStore } from '@/presentacion/stores/navigationStore.js';

export const useSPAAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { currentView, setView, reset } = useNavigationStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && currentView !== 'login') {
        // Si no está autenticado y no está en login, ir a login
        setView('login');
      } else if (isAuthenticated && currentView === 'login') {
        // Si está autenticado y está en login, ir a dashboard
        setView('dashboard');
      } else if (isAuthenticated && currentView !== 'login') {
        // Si está autenticado y no está en login, mantener la vista actual
        // Esto preserva la navegación al recargar
        return;
      }
    }
  }, [isAuthenticated, isLoading, currentView, setView]);

  // Reset navigation store cuando se hace logout
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      reset();
    }
  }, [isAuthenticated, isLoading, reset]);

  return {
    isAuthenticated,
    isLoading,
    currentView,
  };
};
