import { apiClient } from '../api/apiClient.js';
import {
  PacienteDTO,
  HistoriaClinicaDTO,
  ConsultaMedicaDTO,
  DocumentoMedicoDTO,
  PacienteSearchParams,
  HistoriaClinicaSearchParams,
  ConsultaSearchParams,
  PageResponse,
  ApiResponse
} from '../types/pacientes.js';

// Base URL for pacientes service - using Gateway (apiClient handles the base URL)
const PACIENTES_BASE_URL = '/api/pacientes';
const HISTORIAS_BASE_URL = '/api/historias-clinicas';
const CONSULTAS_BASE_URL = '/api/consultas';
const DOCUMENTOS_BASE_URL = '/api/documentos';

// Pacientes API Service
export const pacientesApiService = {
  // Get all patients with pagination and search
  getPacientes: async (params) => {
    const response = await apiClient.get(PACIENTES_BASE_URL, { params });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener pacientes');
    }
    return response.data;
  },

  // Get patient by ID
  getPacienteById: async (id) => {
    const response = await apiClient.get(`${PACIENTES_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener paciente');
    }
    return response.data;
  },

  // Create new patient from JSON (simplified approach)
  createPaciente: async (datosJson) => {
    const response = await apiClient.post(PACIENTES_BASE_URL, datosJson, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al crear paciente desde JSON');
    }
    return response.data;
  },

  // Update patient from JSON (simplified approach)
  updatePaciente: async (id, datosJson) => {
    const response = await apiClient.put(`${PACIENTES_BASE_URL}/${id}`, datosJson, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar paciente desde JSON');
    }
    return response.data;
  },

  // Update patient
  updatePaciente: async (id, paciente) => {
    const response = await apiClient.put(`${PACIENTES_BASE_URL}/${id}`, paciente);
    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar paciente');
    }
    return response.data;
  },

  // Delete patient
  deletePaciente: async (id) => {
    const response = await apiClient.delete(`${PACIENTES_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al eliminar paciente');
    }
  },

  // Search patients by document number
  searchByDocumento: async (numeroDocumento) => {
    const response = await apiClient.get(`${PACIENTES_BASE_URL}/search`, {
      params: { numeroDocumento }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al buscar pacientes');
    }
    return response.data;
  },

  // Get patient's medical history
  getHistoriaClinicaByPaciente: async (pacienteId) => {
    const response = await apiClient.get(`${PACIENTES_BASE_URL}/${pacienteId}/historia-clinica`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener historia clínica');
    }
    return response.data;
  }
};

// Historias Clínicas API Service
export const historiasClinicasApiService = {
  // Get all medical histories
  getHistoriasClinicas: async (params) => {
    const response = await apiClient.get(HISTORIAS_BASE_URL, { params });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener historias clínicas');
    }
    return response.data;
  },

  // Get medical history by ID
  getHistoriaClinicaById: async (id) => {
    const response = await apiClient.get(`${HISTORIAS_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener historia clínica');
    }
    return response.data;
  },

  // Get medical history by patient ID
  getHistoriaClinicaByPaciente: async (pacienteId) => {
    const response = await apiClient.get(`${HISTORIAS_BASE_URL}/paciente/${pacienteId}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener historia clínica del paciente');
    }
    return response.data;
  },

  // Get medical history by number
  getHistoriaClinicaByNumero: async (numeroHistoria) => {
    const response = await apiClient.get(`${HISTORIAS_BASE_URL}/numero/${numeroHistoria}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener historia clínica por número');
    }
    return response.data;
  },

  // Create new medical history from JSON (simplified approach)
  createHistoriaClinica: async (pacienteId, historiaJson) => {
    const response = await apiClient.post(`${HISTORIAS_BASE_URL}/paciente/${pacienteId}`, historiaJson, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al crear historia clínica');
    }
    return response.data;
  },

  // Update medical history
  updateHistoriaClinica: async (id, historia) => {
    const response = await apiClient.put(`${HISTORIAS_BASE_URL}/${id}`, historia);
    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar historia clínica');
    }
    return response.data;
  },

  // Search by diagnosis
  searchByDiagnostico: async (diagnostico, params) => {
    const response = await apiClient.get(`${HISTORIAS_BASE_URL}/search/diagnostico`, {
      params: { diagnostico, ...params }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al buscar por diagnóstico');
    }
    return response.data;
  },

  // Get active medical histories
  getHistoriasActivas: async (params) => {
    const response = await apiClient.get(`${HISTORIAS_BASE_URL}/activas`, { params });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener historias activas');
    }
    return response.data;
  },

  // Get medical histories by date range
  getHistoriasByFechas: async (
    fechaInicio,
    fechaFin,
    params
  ) => {
    const response = await apiClient.get(`${HISTORIAS_BASE_URL}/fechas`, {
      params: { fechaInicio, fechaFin, ...params }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener historias por fechas');
    }
    return response.data;
  },

  // Deactivate medical history
  deactivateHistoriaClinica: async (id) => {
    const response = await apiClient.patch(`${HISTORIAS_BASE_URL}/${id}/deactivate`);
    if (!response.success) {
      throw new Error(response.error || 'Error al desactivar historia clínica');
    }
  },

  // Medical consultations management
  // Create consultation from JSON (simplified approach)
  crearConsulta: async (historiaId, jsonData) => {
    const response = await apiClient.post(`${CONSULTAS_BASE_URL}/historia/${historiaId}`, jsonData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al crear consulta médica');
    }
    return response.data;
  },

  obtenerConsultasPorHistoria: async (historiaId, page = 0, size = 20) => {
    const response = await apiClient.get(`${CONSULTAS_BASE_URL}/historia/${historiaId}?page=${page}&size=${size}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener consultas');
    }
    return response.data;
  },

  obtenerConsultaPorId: async (id) => {
    const response = await apiClient.get(`${CONSULTAS_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener consulta');
    }
    return response.data;
  },

  actualizarConsulta: async (id, consultaData) => {
    const response = await apiClient.put(`${CONSULTAS_BASE_URL}/${id}`, consultaData);
    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar consulta');
    }
    return response.data;
  },

  eliminarConsulta: async (id) => {
    const response = await apiClient.delete(`${CONSULTAS_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al eliminar consulta');
    }
    return response.data;
  },

  // Medical documents management
  crearDocumento: async (historiaId, documentoData) => {
    const response = await apiClient.post(`${DOCUMENTOS_BASE_URL}/historia/${historiaId}`, documentoData);
    if (!response.success) {
      throw new Error(response.error || 'Error al crear documento médico');
    }
    return response.data;
  },

  obtenerDocumentosPorHistoria: async (historiaId, page = 0, size = 20) => {
    const response = await apiClient.get(`${DOCUMENTOS_BASE_URL}/historia/${historiaId}?page=${page}&size=${size}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener documentos');
    }
    return response.data;
  },

  obtenerDocumentoPorId: async (id) => {
    const response = await apiClient.get(`${DOCUMENTOS_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener documento');
    }
    return response.data;
  },

  actualizarDocumento: async (id, documentoData) => {
    const response = await apiClient.put(`${DOCUMENTOS_BASE_URL}/${id}`, documentoData);
    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar documento');
    }
    return response.data;
  },

  eliminarDocumento: async (id) => {
    const response = await apiClient.delete(`${DOCUMENTOS_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al eliminar documento');
    }
    return response.data;
  }
};

// Consultas Médicas API Service
export const consultasApiService = {
  // Get all medical consultations
  getConsultas: async (params) => {
    const response = await apiClient.get(CONSULTAS_BASE_URL, { params });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener consultas');
    }
    return response.data;
  },

  // Get consultation by ID
  getConsultaById: async (id) => {
    const response = await apiClient.get(`${CONSULTAS_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener consulta');
    }
    return response.data;
  },

  // Get consultations by medical history
  getConsultasByHistoria: async (historiaClinicaId, params) => {
    const response = await apiClient.get(`${CONSULTAS_BASE_URL}/historia/${historiaClinicaId}`, { params });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener consultas de la historia');
    }
    return response.data;
  },

  // Create new consultation
  createConsulta: async (consulta) => {
    const response = await apiClient.post(CONSULTAS_BASE_URL, consulta);
    if (!response.success) {
      throw new Error(response.error || 'Error al crear consulta');
    }
    return response.data;
  },

  // Update consultation
  updateConsulta: async (id, consulta) => {
    const response = await apiClient.put(`${CONSULTAS_BASE_URL}/${id}`, consulta);
    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar consulta');
    }
    return response.data;
  },

  // Get consultations by date range
  getConsultasByFechas: async (
    fechaInicio,
    fechaFin,
    params
  ) => {
    const response = await apiClient.get(`${CONSULTAS_BASE_URL}/fechas`, {
      params: { fechaInicio, fechaFin, ...params }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener consultas por fechas');
    }
    return response.data;
  },

  // Get consultations by doctor
  getConsultasByMedico: async (medicoTratante, params) => {
    const response = await apiClient.get(`${CONSULTAS_BASE_URL}/medico`, {
      params: { medicoTratante, ...params }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener consultas por médico');
    }
    return response.data;
  }
};

// Documentos Médicos API Service
export const documentosApiService = {
  // Get all medical documents
  getDocumentos: async (params) => {
    const response = await apiClient.get(DOCUMENTOS_BASE_URL, { params });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener documentos');
    }
    return response.data;
  },

  // Get document by ID
  getDocumentoById: async (id) => {
    const response = await apiClient.get(`${DOCUMENTOS_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener documento');
    }
    return response.data;
  },

  // Get documents by medical history
  getDocumentosByHistoria: async (historiaClinicaId) => {
    const response = await apiClient.get(`${DOCUMENTOS_BASE_URL}/historia/${historiaClinicaId}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener documentos de la historia');
    }
    return response.data;
  },

  // Upload new document
  uploadDocumento: async (documento) => {
    const formData = new FormData();
    formData.append('historiaClinicaId', documento.historiaClinicaId.toString());
    formData.append('nombre', documento.nombre);
    formData.append('tipo', documento.tipo);
    if (documento.descripcion) {
      formData.append('descripcion', documento.descripcion);
    }
    formData.append('archivo', documento.archivo);

    const response = await apiClient.post(DOCUMENTOS_BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al subir documento');
    }
    return response.data;
  },

  // Download document
  downloadDocumento: async (id) => {
    const response = await apiClient.get(`${DOCUMENTOS_BASE_URL}/${id}/download`, {
      responseType: 'blob'
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al descargar documento');
    }
    return response.data;
  },

  // Delete document
  deleteDocumento: async (id) => {
    const response = await apiClient.delete(`${DOCUMENTOS_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al eliminar documento');
    }
  }
};