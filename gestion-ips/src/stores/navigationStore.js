import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewType = 
  | 'login'
  | 'dashboard'
  | 'usuarios'
  | 'pacientes'
  | 'citas'
  | 'reportes'
  | 'configuracion';

interface NavigationState {
  currentView: ViewType;
  previousView: ViewType | null;
  setView: (view: ViewType) => void;
  goBack: () => void;
  reset: () => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      currentView: 'dashboard',
      previousView: null,
      
      setView: (view: ViewType) => {
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
