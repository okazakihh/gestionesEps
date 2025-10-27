import { useState, useEffect } from 'react';
import { codigosCupsApiService } from '../../../../../data/services/pacientesApiService.js';
import { empleadosApiService } from '../../../../../data/services/empleadosApiService.js';

/**
 * Hook para manejar la carga de datos de citas médicas
 * Separa la lógica de acceso a datos del componente de presentación
 */
export const useAppointmentData = () => {
  const [codigosCups, setCodigosCups] = useState([]);
  const [loadingCodigosCups, setLoadingCodigosCups] = useState(false);
  const [medicos, setMedicos] = useState([]);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [dataError, setDataError] = useState(null);

  // Load CUPS codes
  const loadCodigosCups = async () => {
    try {
      setLoadingCodigosCups(true);
      setDataError(null);
      const response = await codigosCupsApiService.getCodigosCups({ size: 1000 });
      setCodigosCups(response.content || []);
    } catch (error) {
      console.error('Error loading CUPS codes:', error);
      setDataError('Error al cargar códigos CUPS');
    } finally {
      setLoadingCodigosCups(false);
    }
  };

  // Load doctors
  const loadMedicos = async () => {
    try {
      setLoadingMedicos(true);
      const response = await empleadosApiService.getEmpleados({ size: 1000 });
      const empleados = response.content || [];

      // Filter employees that are medical doctors
      const medicosFiltrados = empleados.filter(empleado => {
        try {
          const datosCompletos = JSON.parse(empleado.jsonData || '{}');
          if (datosCompletos.jsonData) {
            const datosInternos = JSON.parse(datosCompletos.jsonData);
            const informacionLaboral = datosInternos.informacionLaboral || {};
            return informacionLaboral.tipoPersonal === 'MEDICO' && informacionLaboral.tipoMedico === 'DOCTOR';
          }
          return false;
        } catch (error) {
          console.error('Error parsing employee data:', error);
          return false;
        }
      });

      setMedicos(medicosFiltrados);
    } catch (error) {
      console.error('Error loading doctors:', error);
      setDataError('Error al cargar médicos');
    } finally {
      setLoadingMedicos(false);
    }
  };

  // Get full name of a doctor
  const getNombreCompletoMedico = (medico) => {
    try {
      const datosCompletos = JSON.parse(medico.jsonData || '{}');
      if (datosCompletos.jsonData) {
        const datosInternos = JSON.parse(datosCompletos.jsonData);
        const informacionPersonal = datosInternos.informacionPersonal || {};
        const informacionLaboral = datosInternos.informacionLaboral || {};

        const primerNombre = informacionPersonal.primerNombre || '';
        const segundoNombre = informacionPersonal.segundoNombre || '';
        const primerApellido = informacionPersonal.primerApellido || '';
        const segundoApellido = informacionPersonal.segundoApellido || '';
        const especialidad = informacionLaboral.especialidad || '';

        const nombreCompleto = `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.trim();
        return especialidad ? `${nombreCompleto} - ${especialidad}` : nombreCompleto;
      }
      return `Doctor ID: ${medico.id}`;
    } catch (error) {
      console.error('Error getting doctor name:', error);
      return `Doctor ID: ${medico.id}`;
    }
  };

  // Load data when hook is initialized
  useEffect(() => {
    loadCodigosCups();
    loadMedicos();
  }, []);

  return {
    // Data
    codigosCups,
    medicos,
    getNombreCompletoMedico,

    // Loading states
    loadingCodigosCups,
    loadingMedicos,

    // Error handling
    dataError,

    // Actions
    reloadCodigosCups: loadCodigosCups,
    reloadMedicos: loadMedicos
  };
};