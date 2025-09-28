import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ClinicalHistoryContext = createContext(undefined);

export const ClinicalHistoryProvider = ({ children }) => {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [currentHistoriaClinica, setCurrentHistoriaClinica] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Establecer paciente actual y su historia clínica
  const setPatientData = useCallback((patient, historiaClinica = null, consultasList = [], documentosList = []) => {
    setCurrentPatient(patient);
    setCurrentHistoriaClinica(historiaClinica);
    setConsultas(consultasList);
    setDocumentos(documentosList);
  }, []);

  // Actualizar historia clínica
  const updateHistoriaClinica = useCallback((historiaClinica) => {
    setCurrentHistoriaClinica(historiaClinica);
  }, []);

  // Agregar nueva consulta
  const addConsulta = useCallback((consulta) => {
    setConsultas(prev => [...prev, consulta]);
  }, []);

  // Actualizar consulta existente
  const updateConsulta = useCallback((consultaId, updatedConsulta) => {
    setConsultas(prev => prev.map(c => c.id === consultaId ? updatedConsulta : c));
  }, []);

  // Eliminar consulta
  const removeConsulta = useCallback((consultaId) => {
    setConsultas(prev => prev.filter(c => c.id !== consultaId));
  }, []);

  // Agregar documento
  const addDocumento = useCallback((documento) => {
    setDocumentos(prev => [...prev, documento]);
  }, []);

  // Actualizar documento
  const updateDocumento = useCallback((documentoId, updatedDocumento) => {
    setDocumentos(prev => prev.map(d => d.id === documentoId ? updatedDocumento : d));
  }, []);

  // Eliminar documento
  const removeDocumento = useCallback((documentoId) => {
    setDocumentos(prev => prev.filter(d => d.id !== documentoId));
  }, []);

  // Limpiar todos los datos
  const clearData = useCallback(() => {
    setCurrentPatient(null);
    setCurrentHistoriaClinica(null);
    setConsultas([]);
    setDocumentos([]);
  }, []);

  // Cargar datos desde la API
  const loadPatientData = useCallback(async (pacienteId) => {
    try {
      setIsLoading(true);

      // Importar servicios dinámicamente para evitar dependencias circulares
      const { pacientesApiService, historiasClinicasApiService } = await import('../services/pacientesApiService.js');

      // Cargar datos del paciente
      const paciente = await pacientesApiService.getPacienteById(pacienteId);

      // Intentar cargar historia clínica
      let historiaClinica = null;
      let consultasList = [];
      let documentosList = [];

      try {
        historiaClinica = await historiasClinicasApiService.getHistoriaClinicaByPaciente(pacienteId);

        // Si hay historia clínica, cargar consultas y documentos
        if (historiaClinica) {
          consultasList = await historiasClinicasApiService.obtenerConsultasPorHistoria(historiaClinica.id);
          documentosList = await historiasClinicasApiService.obtenerDocumentosPorHistoria(historiaClinica.id);
        }
      } catch (error) {
        console.log('Paciente no tiene historia clínica registrada:', error.message);
      }

      // Establecer datos en el contexto
      setPatientData(paciente, historiaClinica, consultasList.content || [], documentosList.content || []);

      return {
        paciente,
        historiaClinica,
        consultas: consultasList.content || [],
        documentos: documentosList.content || []
      };
    } catch (error) {
      console.error('Error cargando datos del paciente:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setPatientData]);

  const value = useMemo(() => ({
    // Estado
    currentPatient,
    currentHistoriaClinica,
    consultas,
    documentos,
    isLoading,

    // Acciones
    setPatientData,
    updateHistoriaClinica,
    addConsulta,
    updateConsulta,
    removeConsulta,
    addDocumento,
    updateDocumento,
    removeDocumento,
    clearData,
    loadPatientData
  }), [
    currentPatient,
    currentHistoriaClinica,
    consultas,
    documentos,
    isLoading,
    setPatientData,
    updateHistoriaClinica,
    addConsulta,
    updateConsulta,
    removeConsulta,
    addDocumento,
    updateDocumento,
    removeDocumento,
    clearData,
    loadPatientData
  ]);

  return (
    <ClinicalHistoryContext.Provider value={value}>
      {children}
    </ClinicalHistoryContext.Provider>
  );
};

export const useClinicalHistory = () => {
  const context = useContext(ClinicalHistoryContext);
  if (context === undefined) {
    throw new Error('useClinicalHistory must be used within a ClinicalHistoryProvider');
  }
  return context;
};