import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Tipos de vistas disponibles en la aplicación
 * @typedef {'login' | 'dashboard' | 'usuarios' | 'pacientes' | 'empleados' | 'nomina' | 'reportes' | 'configuracion'} ViewType
 */

/**
 * Estado de navegación
 * @typedef {Object} NavigationState
 * @property {ViewType} currentView - Vista actual
 * @property {ViewType | null} previousView - Vista anterior
 * @property {(view: ViewType) => void} setView - Establece la vista actual
 * @property {() => void} goBack - Regresa a la vista anterior
 * @property {() => void} reset - Reinicia el estado de navegación
 */

/**
 * Store de navegación con Zustand
 */
export const useNavigationStore = create(
  persist(
    (set, get) => ({
      currentView: 'dashboard',
      previousView: null,
      
      setView: (view) => {
        set({ currentView: view });
      },
      
      goBack: () => {
        const { previousView } = get();
        if (previousView) {
          set({
            currentView: previousView,
            previousView: null,
          });
        }
      },
      
      reset: () => {
        set({
          currentView: 'login',
          previousView: null,
        });
      },
    }),
    {
      name: 'navigation-store',
      partialize: (state) => ({ currentView: state.currentView }),
    }
  )
);
