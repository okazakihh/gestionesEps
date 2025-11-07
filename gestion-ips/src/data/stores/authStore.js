import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Usuario autenticado
 * @typedef {Object} User
 * @property {string} id - ID del usuario
 * @property {string} nombres - Nombres del usuario
 * @property {string} apellidos - Apellidos del usuario
 * @property {string} email - Email del usuario
 * @property {string} rol - Rol del usuario
 * @property {string} [ips] - IPS del usuario
 * @property {boolean} activo - Si el usuario está activo
 * @property {string} [ultimoAcceso] - Fecha del último acceso
 */

/**
 * Estado de autenticación
 * @typedef {Object} AuthState
 * @property {User | null} user - Usuario actual
 * @property {string | null} token - Token de autenticación
 * @property {string | null} refreshToken - Token de refresco
 * @property {boolean} isAuthenticated - Si está autenticado
 * @property {boolean} isLoading - Si está cargando
 * @property {(user: User, token: string, refreshToken?: string) => void} setAuth - Establece la autenticación
 * @property {() => void} clearAuth - Limpia la autenticación
 * @property {(loading: boolean) => void} setLoading - Establece el estado de carga
 * @property {(token: string) => void} updateToken - Actualiza el token
 */

/**
 * Store de autenticación con Zustand
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      updateToken: (token) => {
        set({ token });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
          // Verificar si hay datos válidos para mantener autenticación
          if (state.user && state.token) {
            state.isAuthenticated = true;
          } else {
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);
