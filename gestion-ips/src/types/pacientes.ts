// Types for Pacientes API

export interface InformacionPersonal {
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  fechaNacimiento: string;
  genero: string;
  estadoCivil: string;
  tipoSangre?: string;
}

export interface InformacionContacto {
  telefono: string;
  email?: string;
  direccion: string;
  ciudad: string;
  departamento: string;
}

export interface InformacionMedica {
  alergias?: string;
  medicamentosActuales?: string;
  observacionesMedicas?: string;
}

export interface ContactoEmergencia {
  nombreContacto: string;
  telefonoContacto: string;
  relacion: string;
}

export interface PacienteDTO {
  id?: number;
  numeroDocumento: string;
  tipoDocumento: string;
  informacionPersonal: InformacionPersonal;
  informacionContacto: InformacionContacto;
  informacionMedica: InformacionMedica;
  contactoEmergencia: ContactoEmergencia;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  nombreCompleto?: string;
  edad?: number;
  numeroHistoriasClinicas?: number;
}

export interface InformacionMedico {
  medicoResponsable: string;
  registroMedico: string;
  especialidad: string;
}

export interface InformacionConsulta {
  motivoConsulta: string;
  enfermedadActual: string;
  revisionSistemas?: string;
  medicamentosActuales?: string;
  observaciones?: string;
}

export interface AntecedentesClinico {
  antecedentesPersonales?: string;
  antecedentesFamiliares?: string;
  antecedentesQuirurgicos?: string;
  antecedentesAlergicos?: string;
}

export interface ExamenClinico {
  examenFisico: string;
  signosVitales: string;
}

export interface DiagnosticoTratamiento {
  diagnosticos: string;
  planTratamiento: string;
}

export interface HistoriaClinicaDTO {
  id?: number;
  numeroHistoria?: string;
  pacienteId: number;
  pacienteNombre?: string;
  pacienteDocumento?: string;
  fechaApertura: string;
  informacionMedico?: InformacionMedico;
  informacionConsulta?: InformacionConsulta;
  antecedentesClinico?: AntecedentesClinico;
  examenClinico?: ExamenClinico;
  diagnosticoTratamiento?: DiagnosticoTratamiento;
  activa: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  numeroConsultas?: number;
  numeroDocumentos?: number;
  ultimaConsulta?: string;
}

export interface InformacionMedicoConsulta {
  medicoTratante: string;
  especialidad: string;
  registroMedico?: string;
}

export interface DetalleConsulta {
  fechaConsulta: string;
  motivoConsulta: string;
  enfermedadActual: string;
  tipoConsulta: string;
}

export interface ExamenClinicoConsulta {
  examenFisico: string;
  signosVitales: string;
}

export interface DiagnosticoTratamientoConsulta {
  diagnosticoPrincipal: string;
  diagnosticosSecundarios?: string;
  planManejo: string;
  medicamentosFormulados?: string;
  examenesSolicitados?: string;
  recomendaciones?: string;
}

export interface SeguimientoConsulta {
  proximaCita?: string;
  observacionesSeguimiento?: string;
}

export interface ConsultaMedicaDTO {
  id?: number;
  historiaClinicaId: number;
  numeroHistoria?: string;
  pacienteNombre?: string;
  informacionMedico: InformacionMedicoConsulta;
  detalleConsulta: DetalleConsulta;
  examenClinico?: ExamenClinicoConsulta;
  diagnosticoTratamiento: DiagnosticoTratamientoConsulta;
  seguimiento?: SeguimientoConsulta;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface DocumentoMedicoDTO {
  id?: number;
  historiaClinicaId: number;
  nombre: string;
  tipo: string;
  descripcion?: string;
  archivo: File;
  fechaCreacion?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Search and filter types
export interface PacienteSearchParams {
  numeroDocumento?: string;
  nombre?: string;
  eps?: string;
  activo?: boolean;
  page?: number;
  size?: number;
}

export interface HistoriaClinicaSearchParams {
  pacienteId?: number;
  numeroHistoria?: string;
  diagnostico?: string;
  fechaInicio?: string;
  fechaFin?: string;
  activa?: boolean;
  page?: number;
  size?: number;
}

export interface ConsultaSearchParams {
  historiaClinicaId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  medicoTratante?: string;
  tipoConsulta?: string;
  page?: number;
  size?: number;
}