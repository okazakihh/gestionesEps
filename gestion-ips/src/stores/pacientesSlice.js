import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { pacientesApiService } from '../services/pacientesApiService';

interface PacienteDTO {
  id?: number;
  numeroDocumento: string;
  tipoDocumento: string;
  informacionPersonal?: {
    primerNombre: string;
    primerApellido: string;
    fechaNacimiento?: string;
  };
  informacionContacto?: {
    telefono?: string;
    email?: string;
  };
  informacionMedica?: {
    alergias?: string;
    medicamentosActuales?: string;
  };
  contactoEmergencia?: {
    nombreContacto?: string;
    telefonoContacto?: string;
  };
  activo: boolean;
  edad?: number;
}

interface PacientesState {
  pacientes: PacienteDTO[];
  loading: boolean;
  error: string | null;
  connectionError: boolean;
  searchParams: {
    page: number;
    size: number;
    search?: string;
  };
  totalPages: number;
  totalElements: number;
}

const initialState: PacientesState = {
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
  async (searchParams: { page: number; size: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await pacientesApiService.getPacientes(searchParams);
      return {
        data: response.content || [],
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0,
      };
    } catch (error: any) {
      if (error.name === 'JWT_CONFIG_ERROR') {
        return rejectWithValue({
          type: 'JWT_CONFIG_ERROR',
          message: 'Error de configuración del servicio. Contacte al administrador.',
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
    setSearchParams: (state, action: PayloadAction<{ page?: number; size?: number; search?: string }>) => {
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
        const payload = action.payload as any;
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