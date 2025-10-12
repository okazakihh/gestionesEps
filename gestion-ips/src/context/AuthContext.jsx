import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AuthService from '@/services/authService.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(null);
  const [tokenExpiryAt, setTokenExpiryAt] = useState(null);

  // Verificar token almacenado al cargar la aplicación
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRefresh = localStorage.getItem('refreshToken');
    const storedExpiry = localStorage.getItem('tokenExpiryAt');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    if (storedRefresh) setRefreshToken(storedRefresh);
    if (storedExpiry) setTokenExpiryAt(Number(storedExpiry));
    setIsLoading(false);
  }, []);

  // Proactive refresh: refrescar 1 minuto antes de expirar
  useEffect(() => {
    if (!tokenExpiryAt || !refreshToken) return;
    const now = Date.now();
    const msUntilRefresh = tokenExpiryAt - now;
    if (msUntilRefresh <= 0) {
      // intentar refresh inmediato
      refresh();
      return;
    }
    const timer = setTimeout(() => {
      refresh();
    }, msUntilRefresh);
    return () => clearTimeout(timer);
  }, [tokenExpiryAt, refreshToken]);

  const login = useCallback(async (loginData) => {
    try {
      setIsLoading(true);
      const authResponse = await AuthService.login(loginData);
      // authResponse expected to be { token: string, user: any }
      const tokenFromBackend = authResponse.token;
      const userData = authResponse.user;

      // Mapear la estructura de usuario del backend a nuestro User interno
      const mappedUser = {
        id: String(userData?.id ?? userData?.userId ?? ''),
        nombres: userData?.personalInfo?.nombres ?? userData?.nombres ?? '',
        apellidos: userData?.personalInfo?.apellidos ?? userData?.apellidos ?? '',
        email: userData?.email ?? '',
        documento: userData?.personalInfo?.documento ?? userData?.documento ?? '',
        rol: Array.isArray(userData?.roles) ? (userData.roles[0] ?? '') : (userData?.rol ?? ''),
        ips: userData?.ips ?? undefined,
        activo: userData?.enabled ?? userData?.activo ?? true,
        ultimoAcceso: userData?.lastLogin ?? userData?.ultimoAcceso ?? undefined,
      };

      // Guardar en localStorage el usuario MAPEADO
      localStorage.setItem('token', tokenFromBackend);
      localStorage.setItem('user', JSON.stringify(mappedUser));

      // Intentar extraer expiración del JWT (campo exp en payload)
      try {
        const payload = tokenFromBackend.split('.')?.[1];
        if (payload) {
          const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
          const decoded = JSON.parse(json);
          if (decoded?.exp) {
            const expiryAt = (decoded.exp * 1000) - 60000; // 1 min antes
            localStorage.setItem('tokenExpiryAt', expiryAt.toString());
            setTokenExpiryAt(expiryAt);
          }
        }
      } catch (e) {
        // no critical, seguimos sin expiry
        console.warn('No se pudo parsear exp del JWT', e);
      }

      console.log('Usuario autenticado:', mappedUser);

      // Actualizar estado
      setToken(tokenFromBackend);
      setUser(mappedUser);

      return {
        success: true,
        data: {
          user: mappedUser,
          token: tokenFromBackend,
        }
      };
    } catch (error) {
      console.error('Error en login', error);
      throw error; // re-lanzar para UI
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // intentar logout backend (si falla igual limpiamos)
      await AuthService.logout();
    } catch (e) {
      console.warn('Logout backend falló (continuando)', e);
    }
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiryAt');
    // Limpiar estado
    setToken(null);
    setUser(null);
    setRefreshToken(null);
    setTokenExpiryAt(null);
    // Redirigir al login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  const refresh = useCallback(async () => {
    const rt = refreshToken || localStorage.getItem('refreshToken');
    if (!rt) return false;
    try {
      const tokens = await AuthService.refreshToken(rt);
      const { accessToken, refreshToken: newRT, expiresIn } = tokens;
      
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
      if (newRT) {
        localStorage.setItem('refreshToken', newRT);
        setRefreshToken(newRT);
      }
      if (expiresIn) {
        const expiryAt = Date.now() + (expiresIn * 1000) - 60000;
        localStorage.setItem('tokenExpiryAt', expiryAt.toString());
        setTokenExpiryAt(expiryAt);
      }
      return true;
    } catch (e) {
      console.error('Error refreshing token', e);
      // si falla, forzar logout suave
      await logout();
      return false;
    }
  }, [logout, refreshToken]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    token,
    refresh
  }), [user, token, isLoading, login, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
