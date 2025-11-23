import { useMemo } from 'react';

/**
 * Hook para parsear y memoizar los datos de un paciente.
 * @param {object} patient - El objeto paciente principal de la API.
 * @param {object} patientData - Datos adicionales o ya parseados del paciente.
 * @returns {object} - Los datos del paciente parseados y listos para usar.
 */
export const usePatientParser = (patient, patientData) => {
  return useMemo(() => {
    // Si patientData ya tiene la estructura correcta, lo usamos.
    if (patientData?.informacionPersonal && typeof patientData.informacionPersonal === 'object') {
      return {
        ...patientData,
        tipoDocumento: patient?.tipoDocumento || patientData.tipoDocumento,
        numeroDocumento: patient?.numeroDocumento || patientData.numeroDocumento
      };
    }

    // Si no, intentamos parsear desde patient.datosJson
    if (patient?.datosJson) {
      try {
        const datosJson = typeof patient.datosJson === 'string'
          ? JSON.parse(patient.datosJson)
          : patient.datosJson;

        const getJsonField = (field) => {
          if (!datosJson[field]) return {};
          return typeof datosJson[field] === 'string' ? JSON.parse(datosJson[field]) : datosJson[field];
        };

        const informacionPersonal = getJsonField('informacionPersonalJson');
        const informacionContacto = getJsonField('informacionContactoJson');
        const informacionMedica = getJsonField('informacionMedicaJson');

        const combinedInfo = {
          ...informacionPersonal,
          ...informacionContacto,
          eps: informacionMedica?.eps,
          regimenAfiliacion: informacionMedica?.regimenAfiliacion
        };

        return {
          tipoDocumento: patient.tipoDocumento,
          numeroDocumento: patient.numeroDocumento,
          informacionPersonal: combinedInfo
        };
      } catch (e) {
        console.error('Error parsing patient datosJson:', e);
      }
    }

    // Fallback si todo lo demás falla
    return {
      tipoDocumento: patient?.tipoDocumento || 'N/A',
      numeroDocumento: patient?.numeroDocumento || 'N/A',
      informacionPersonal: patientData?.informacionPersonal || {}
    };
  }, [patient, patientData]);
};