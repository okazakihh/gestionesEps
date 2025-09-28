import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  rol: string;
  ips?: string;
  activo: boolean;
  ultimoAcceso?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenExpiryAt: number | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  tokenExpiryAt: null,
};

// Thunks para operaciones asíncronas
export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en login');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async ({ username, password, email }: { username: string; password: string; email: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8081/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en registro');
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.tokenExpiryAt = null;

      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiryAt');
    },
    initializeAuth: (state) => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const refreshToken = localStorage.getItem('refreshToken');
      const tokenExpiryAt = localStorage.getItem('tokenExpiryAt');

      if (token && user) {
        try {
          state.token = token;
          state.user = JSON.parse(user);
          state.refreshToken = refreshToken;
          state.isAuthenticated = true;
          state.tokenExpiryAt = tokenExpiryAt ? Number(tokenExpiryAt) : null;
        } catch (error) {
          // Datos inválidos, limpiar
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('tokenExpiryAt');
        }
      }
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        const { token, user } = action.payload.data;

        state.token = token;
        state.user = user;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;

        // Calcular expiración del token
        try {
          const payload = token.split('.')?.[1];
          if (payload) {
            const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            const decoded = JSON.parse(json);
            if (decoded?.exp) {
              state.tokenExpiryAt = (decoded.exp * 1000) - 60000; // 1 min antes
              localStorage.setItem('tokenExpiryAt', state.tokenExpiryAt.toString());
            }
          }
        } catch (e) {
          console.warn('No se pudo parsear exp del JWT', e);
        }

        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        const { token, user } = action.payload.data;

        state.token = token;
        state.user = user;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;

        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
  },
});

export const { setLoading, setError, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;