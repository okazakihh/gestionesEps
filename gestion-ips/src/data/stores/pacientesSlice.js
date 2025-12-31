import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pacientesApiService } from '../services/pacientesApiService';

/**
 * DTO de Paciente
 * @typedef {Object} PacienteDTO
 * @property {number} [id] - ID del paciente
 * @property {string} numeroDocumento - Número de documento
 * @property {string} tipoDocumento - Tipo de documento
 * @property {Object} [informacionPersonal] - Información personal
 * @property {string} informacionPersonal.primerNombre - Primer nombre
 * @property {string} informacionPersonal.primerApellido - Primer apellido
 * @property {string} [informacionPersonal.fechaNacimiento] - Fecha de nacimiento
 * @property {Object} [informacionContacto] - Información de contacto
 * @property {string} [informacionContacto.telefono] - Teléfono
 * @property {string} [informacionContacto.email] - Email
 * @property {Object} [informacionMedica] - Información médica
 * @property {string} [informacionMedica.alergias] - Alergias
 * @property {string} [informacionMedica.medicamentosActuales] - Medicamentos actuales
 * @property {Object} [contactoEmergencia] - Contacto de emergencia
 * @property {string} [contactoEmergencia.nombreContacto] - Nombre del contacto
 * @property {string} [contactoEmergencia.telefonoContacto] - Teléfono del contacto
 * @property {boolean} activo - Si está activo
 * @property {number} [edad] - Edad
 */

/**
 * Estado de pacientes
 * @typedef {Object} PacientesState
 * @property {PacienteDTO[]} pacientes - Lista de pacientes
 * @property {boolean} loading - Si está cargando
 * @property {string | null} error - Error actual
 * @property {boolean} connectionError - Si hay error de conexión
 * @property {Object} searchParams - Parámetros de búsqueda
 * @property {number} searchParams.page - Página actual
 * @property {number} searchParams.size - Tamaño de página
 * @property {string} [searchParams.search] - Término de búsqueda
 * @property {number} totalPages - Total de páginas
 * @property {number} totalElements - Total de elementos
 */

/** @type {PacientesState} */
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
