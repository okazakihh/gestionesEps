import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import pacientesReducer from './pacientesSlice';

/**
 * Store principal de Redux
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    pacientes: pacientesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

/**
 * Tipos para TypeScript (compatibilidad)
 * @typedef {ReturnType<typeof store.getState>} RootState
 * @typedef {typeof store.dispatch} AppDispatch
 * @typedef {RootState} AppState
 */
