import { useState, useEffect } from 'react';
import { pacientesApiService } from '../../data/services/pacientesApiService';

/**
 * Hook para cargar datos de pacientes de forma lazy
 */
export const usePatientData = (citas = []) => {
  const [patientData, setPatientData] = useState({});
  const [loadingPatients, setLoadingPatients] = useState({});

  useEffect(() => {
    if (citas.length > 0) {
      citas.forEach(cita => {
        if (cita.pacienteId && !patientData[cita.pacienteId] && !loadingPatients[cita.pacienteId]) {
          loadPatientData(cita.pacienteId);
        }
      });
    }
  }, [citas]);

  const loadPatientData = async (pacienteId) => {
    if (patientData[pacienteId] || loadingPatients[pacienteId]) {
      return;
    }

    try {
      setLoadingPatients(prev => ({ ...prev, [pacienteId]: true }));
      const response = await pacientesApiService.getPacienteById(pacienteId);
      if (response) {
        setPatientData(prev => ({
          ...prev,
          [pacienteId]: response
        }));
      }
    } catch (error) {
      console.error(`Error loading patient ${pacienteId}:`, error);
    } finally {
      setLoadingPatients(prev => ({ ...prev, [pacienteId]: false }));
    }
  };

  const getPatientById = (pacienteId) => {
    return patientData[pacienteId] || null;
  };

  const isLoadingPatient = (pacienteId) => {
    return loadingPatients[pacienteId] || false;
  };

  return {
    patientData,
    loadingPatients,
    loadPatientData,
    getPatientById,
    isLoadingPatient
  };
};
