import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pacientesApiService } from '@/data/services/pacientesApiService';

const initialState = {
  pacientes: [],
  loading: false,
  error: null,
  connectionError: false,
  searchParams: {
    page: 0,
    size: 10,
  },
  totalPages: 0,
  totalElements: 0,
};

// Thunk para cargar pacientes
export const fetchPacientes = createAsyncThunk(
  'pacientes/fetchPacientes',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await pacientesApiService.getPacientes(searchParams);
      return {
        data: response.content || [],
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0,
      };
    } catch (error) {
      if (error.name === 'JWT_CONFIG_ERROR') {
        return rejectWithValue({
          type: 'JWT_CONFIG_ERROR',
          message: 'Error de configuraci�n del servicio. Contacte al administrador.',
        });
      }
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        return rejectWithValue({
          type: 'CONNECTION_ERROR',
          message: 'No se pudo conectar con el servicio de pacientes.',
        });
      }
      return rejectWithValue({
        type: 'GENERAL_ERROR',
        message: error.message || 'Error al cargar pacientes',
      });
    }
  }
);

const pacientesSlice = createSlice({
  name: 'pacientes',
  initialState,
  reducers: {
    setSearchParams: (state, action) => {
      state.searchParams = { ...state.searchParams, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
      state.connectionError = false;
    },
    resetPacientes: (state) => {
      state.pacientes = [];
      state.error = null;
      state.connectionError = false;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPacientes.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.connectionError = false;
      })
      .addCase(fetchPacientes.fulfilled, (state, action) => {
        state.loading = false;
        state.pacientes = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.error = null;
        state.connectionError = false;
      })
      .addCase(fetchPacientes.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (payload?.type === 'CONNECTION_ERROR') {
          state.connectionError = true;
          state.error = payload.message;
        } else if (payload?.type === 'JWT_CONFIG_ERROR') {
          state.connectionError = true;
          state.error = payload.message;
        } else {
          state.error = payload?.message || 'Error desconocido';
        }
      });
  },
});

export const { setSearchParams, clearError, resetPacientes } = pacientesSlice.actions;
export default pacientesSlice.reducer;