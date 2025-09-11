import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigationStore } from '@/stores/navigationStore';
import AuthService from '@/services/authService';

interface LoginData {
  username: string;
  password: string;
}

interface User {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  rol: string;
  ips: string;
  activo: boolean;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  error?: string;
}

export const useAuth = () => {
  const {
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    setAuth,
    clearAuth,
    setLoading,
    updateToken,
  } = useAuthStore();

  const { setView, reset: resetNavigation } = useNavigationStore();

  // Inicializar autenticación al cargar
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Si hay token y usuario, verificar validez
      if (token && user) {
        // Aquí podrías verificar el token con el backend si es necesario
        // Por ahora, confiamos en que si existe, es válido
        setLoading(false);
        return;
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (loginData: LoginData): Promise<AuthResponse> => {
    try {
      setLoading(true);
      
      const authResponse = await AuthService.login(loginData);
      
      // Mapear datos del usuario del backend al formato esperado
      const mappedUser: User = {
        id: authResponse.user.id.toString(),
        nombres: authResponse.user.nombres,
        apellidos: authResponse.user.apellidos,
        email: authResponse.user.email,
        rol: authResponse.user.rol,
        ips: authResponse.user.ips,
        activo: authResponse.user.activo,
      };

      // Guardar en el store
      setAuth(mappedUser, authResponse.token);

      // Navegar al dashboard
      setView('dashboard');
      
      return {
        success: true,
        user: mappedUser,
        token: authResponse.token,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error de autenticación',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Intentar logout en el backend
      await AuthService.logout();
    } catch (e) {
      // Continuar aunque falle el logout del backend
    }
    
    // Limpiar stores
    clearAuth();
    resetNavigation();
    
    // Navegar al login
    setView('login');
  };

  const refresh = async (): Promise<boolean> => {
    if (!refreshToken) return false;
    
    try {
      const tokens = await AuthService.refreshToken(refreshToken);
      const { accessToken } = tokens;
      
      updateToken(accessToken);
      return true;
    } catch (e) {
      console.error('Error refreshing token', e);
      await logout();
      return false;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refresh,
  };
};
