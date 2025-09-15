import { apiClient } from '../api/apiClient';
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
} from '../types/pacientes';

// Base URL for pacientes service - pointing directly to pacientes service
const PACIENTES_BASE_URL = 'http://localhost:8082/api/pacientes';
const HISTORIAS_BASE_URL = 'http://localhost:8082/api/historias-clinicas';
const CONSULTAS_BASE_URL = 'http://localhost:8082/api/consultas';
const DOCUMENTOS_BASE_URL = 'http://localhost:8082/api/documentos';

// Pacientes API Service
export const pacientesApiService = {
  // Get all patients with pagination and search
  getPacientes: async (params?: PacienteSearchParams): Promise<PageResponse<PacienteDTO>> => {
    const response = await apiClient.get<PageResponse<PacienteDTO>>(PACIENTES_BASE_URL, { params });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener pacientes');
    }
    return response.data!;
  },

  // Get patient by ID
  getPacienteById: async (id: number): Promise<PacienteDTO> => {
    const response = await apiClient.get<PacienteDTO>(`${PACIENTES_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener paciente');
    }
    return response.data!;
  },

  // Create new patient
  createPaciente: async (paciente: PacienteDTO): Promise<PacienteDTO> => {
    const response = await apiClient.post<PacienteDTO>(PACIENTES_BASE_URL, paciente);
    if (!response.success) {
      throw new Error(response.error || 'Error al crear paciente');
    }
    return response.data!;
  },

  // Update patient
  updatePaciente: async (id: number, paciente: PacienteDTO): Promise<PacienteDTO> => {
    const response = await apiClient.put<PacienteDTO>(`${PACIENTES_BASE_URL}/${id}`, paciente);
    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar paciente');
    }
    return response.data!;
  },

  // Delete patient
  deletePaciente: async (id: number): Promise<void> => {
    const response = await apiClient.delete(`${PACIENTES_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al eliminar paciente');
    }
  },

  // Search patients by document number
  searchByDocumento: async (numeroDocumento: string): Promise<PacienteDTO[]> => {
    const response = await apiClient.get<PacienteDTO[]>(`${PACIENTES_BASE_URL}/search`, {
      params: { numeroDocumento }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al buscar pacientes');
    }
    return response.data!;
  },

  // Get patient's medical history
  getHistoriaClinicaByPaciente: async (pacienteId: number): Promise<HistoriaClinicaDTO> => {
    const response = await apiClient.get<HistoriaClinicaDTO>(`${PACIENTES_BASE_URL}/${pacienteId}/historia-clinica`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener historia clínica');
    }
    return response.data!;
  }
};

// Historias Clínicas API Service
export const historiasClinicasApiService = {
  // Get all medical histories
  getHistoriasClinicas: async (params?: HistoriaClinicaSearchParams): Promise<PageResponse<HistoriaClinicaDTO>> => {
    const response = await apiClient.get<PageResponse<HistoriaClinicaDTO>>(HISTORIAS_BASE_URL, { params });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener historias clínicas');
    }
    return response.data!;
  },

  // Get medical history by ID
  getHistoriaClinicaById: async (id: number): Promise<HistoriaClinicaDTO> => {
    const response = await apiClient.get<HistoriaClinicaDTO>(`${HISTORIAS_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener historia clínica');
    }
    return response.data!;
  },

  // Get medical history by patient ID
  getHistoriaClinicaByPaciente: async (pacienteId: number): Promise<HistoriaClinicaDTO> => {
    const response = await apiClient.get<HistoriaClinicaDTO>(`${HISTORIAS_BASE_URL}/paciente/${pacienteId}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener historia clínica del paciente');
    }
    return response.data!;
  },

  // Get medical history by number
  getHistoriaClinicaByNumero: async (numeroHistoria: string): Promise<HistoriaClinicaDTO> => {
    const response = await apiClient.get<HistoriaClinicaDTO>(`${HISTORIAS_BASE_URL}/numero/${numeroHistoria}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener historia clínica por número');
    }
    return response.data!;
  },

  // Create new medical history
  createHistoriaClinica: async (historia: HistoriaClinicaDTO): Promise<HistoriaClinicaDTO> => {
    const response = await apiClient.post<HistoriaClinicaDTO>(HISTORIAS_BASE_URL, historia);
    if (!response.success) {
      throw new Error(response.error || 'Error al crear historia clínica');
    }
    return response.data!;
  },

  // Update medical history
  updateHistoriaClinica: async (id: number, historia: HistoriaClinicaDTO): Promise<HistoriaClinicaDTO> => {
    const response = await apiClient.put<HistoriaClinicaDTO>(`${HISTORIAS_BASE_URL}/${id}`, historia);
    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar historia clínica');
    }
    return response.data!;
  },

  // Search by diagnosis
  searchByDiagnostico: async (diagnostico: string, params?: { page?: number; size?: number }): Promise<PageResponse<HistoriaClinicaDTO>> => {
    const response = await apiClient.get<PageResponse<HistoriaClinicaDTO>>(`${HISTORIAS_BASE_URL}/search/diagnostico`, {
      params: { diagnostico, ...params }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al buscar por diagnóstico');
    }
    return response.data!;
  },

  // Get active medical histories
  getHistoriasActivas: async (params?: { page?: number; size?: number }): Promise<PageResponse<HistoriaClinicaDTO>> => {
    const response = await apiClient.get<PageResponse<HistoriaClinicaDTO>>(`${HISTORIAS_BASE_URL}/activas`, { params });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener historias activas');
    }
    return response.data!;
  },

  // Get medical histories by date range
  getHistoriasByFechas: async (
    fechaInicio: string,
    fechaFin: string,
    params?: { page?: number; size?: number }
  ): Promise<PageResponse<HistoriaClinicaDTO>> => {
    const response = await apiClient.get<PageResponse<HistoriaClinicaDTO>>(`${HISTORIAS_BASE_URL}/fechas`, {
      params: { fechaInicio, fechaFin, ...params }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener historias por fechas');
    }
    return response.data!;
  },

  // Deactivate medical history
  deactivateHistoriaClinica: async (id: number): Promise<void> => {
    const response = await apiClient.patch(`${HISTORIAS_BASE_URL}/${id}/deactivate`);
    if (!response.success) {
      throw new Error(response.error || 'Error al desactivar historia clínica');
    }
  }
};

// Consultas Médicas API Service
export const consultasApiService = {
  // Get all medical consultations
  getConsultas: async (params?: ConsultaSearchParams): Promise<PageResponse<ConsultaMedicaDTO>> => {
    const response = await apiClient.get<PageResponse<ConsultaMedicaDTO>>(CONSULTAS_BASE_URL, { params });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener consultas');
    }
    return response.data!;
  },

  // Get consultation by ID
  getConsultaById: async (id: number): Promise<ConsultaMedicaDTO> => {
    const response = await apiClient.get<ConsultaMedicaDTO>(`${CONSULTAS_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener consulta');
    }
    return response.data!;
  },

  // Get consultations by medical history
  getConsultasByHistoria: async (historiaClinicaId: number, params?: { page?: number; size?: number }): Promise<PageResponse<ConsultaMedicaDTO>> => {
    const response = await apiClient.get<PageResponse<ConsultaMedicaDTO>>(`${CONSULTAS_BASE_URL}/historia/${historiaClinicaId}`, { params });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener consultas de la historia');
    }
    return response.data!;
  },

  // Create new consultation
  createConsulta: async (consulta: ConsultaMedicaDTO): Promise<ConsultaMedicaDTO> => {
    const response = await apiClient.post<ConsultaMedicaDTO>(CONSULTAS_BASE_URL, consulta);
    if (!response.success) {
      throw new Error(response.error || 'Error al crear consulta');
    }
    return response.data!;
  },

  // Update consultation
  updateConsulta: async (id: number, consulta: ConsultaMedicaDTO): Promise<ConsultaMedicaDTO> => {
    const response = await apiClient.put<ConsultaMedicaDTO>(`${CONSULTAS_BASE_URL}/${id}`, consulta);
    if (!response.success) {
      throw new Error(response.error || 'Error al actualizar consulta');
    }
    return response.data!;
  },

  // Get consultations by date range
  getConsultasByFechas: async (
    fechaInicio: string,
    fechaFin: string,
    params?: { page?: number; size?: number }
  ): Promise<PageResponse<ConsultaMedicaDTO>> => {
    const response = await apiClient.get<PageResponse<ConsultaMedicaDTO>>(`${CONSULTAS_BASE_URL}/fechas`, {
      params: { fechaInicio, fechaFin, ...params }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener consultas por fechas');
    }
    return response.data!;
  },

  // Get consultations by doctor
  getConsultasByMedico: async (medicoTratante: string, params?: { page?: number; size?: number }): Promise<PageResponse<ConsultaMedicaDTO>> => {
    const response = await apiClient.get<PageResponse<ConsultaMedicaDTO>>(`${CONSULTAS_BASE_URL}/medico`, {
      params: { medicoTratante, ...params }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener consultas por médico');
    }
    return response.data!;
  }
};

// Documentos Médicos API Service
export const documentosApiService = {
  // Get all medical documents
  getDocumentos: async (params?: { historiaClinicaId?: number; page?: number; size?: number }): Promise<PageResponse<DocumentoMedicoDTO>> => {
    const response = await apiClient.get<PageResponse<DocumentoMedicoDTO>>(DOCUMENTOS_BASE_URL, { params });
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener documentos');
    }
    return response.data!;
  },

  // Get document by ID
  getDocumentoById: async (id: number): Promise<DocumentoMedicoDTO> => {
    const response = await apiClient.get<DocumentoMedicoDTO>(`${DOCUMENTOS_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener documento');
    }
    return response.data!;
  },

  // Get documents by medical history
  getDocumentosByHistoria: async (historiaClinicaId: number): Promise<DocumentoMedicoDTO[]> => {
    const response = await apiClient.get<DocumentoMedicoDTO[]>(`${DOCUMENTOS_BASE_URL}/historia/${historiaClinicaId}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener documentos de la historia');
    }
    return response.data!;
  },

  // Upload new document
  uploadDocumento: async (documento: Omit<DocumentoMedicoDTO, 'id' | 'fechaCreacion'>): Promise<DocumentoMedicoDTO> => {
    const formData = new FormData();
    formData.append('historiaClinicaId', documento.historiaClinicaId.toString());
    formData.append('nombre', documento.nombre);
    formData.append('tipo', documento.tipo);
    if (documento.descripcion) {
      formData.append('descripcion', documento.descripcion);
    }
    formData.append('archivo', documento.archivo);

    const response = await apiClient.post<DocumentoMedicoDTO>(DOCUMENTOS_BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al subir documento');
    }
    return response.data!;
  },

  // Download document
  downloadDocumento: async (id: number): Promise<Blob> => {
    const response = await apiClient.get<Blob>(`${DOCUMENTOS_BASE_URL}/${id}/download`, {
      responseType: 'blob'
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al descargar documento');
    }
    return response.data!;
  },

  // Delete document
  deleteDocumento: async (id: number): Promise<void> => {
    const response = await apiClient.delete(`${DOCUMENTOS_BASE_URL}/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al eliminar documento');
    }
  }
};