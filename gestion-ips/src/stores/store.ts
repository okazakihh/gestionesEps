import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import pacientesReducer from './pacientesSlice';

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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export para facilitar el uso
export type { RootState as AppState };