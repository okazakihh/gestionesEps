import { useMemo } from 'react';

const safeJsonParse = (jsonString, fallback = null) => {
  if (!jsonString) return fallback;
  try {
    const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    // Manejar JSON anidado en un campo 'datosJson'
    if (data && data.datosJson && typeof data.datosJson === 'string') {
      return JSON.parse(data.datosJson);
    }
    return data;
  } catch (e) {
    console.error('Error parsing JSON:', e, jsonString);
    return fallback;
  }
};

/**
 * Hook para parsear y procesar los datos de la historia clínica y sus consultas.
 * @param {object} historiaClinica - El objeto de la historia clínica.
 * @param {Array} consultas - El array de consultas asociadas.
 * @returns {{parsedData: object, allConsultas: Array}} - Datos parseados y la lista completa de consultas.
 */
export const useClinicalHistoryParser = (historiaClinica, consultas) => {
  const parsedData = useMemo(() => safeJsonParse(historiaClinica?.datosJson, {}), [historiaClinica]);

  const allConsultas = useMemo(() => {
    const processedConsultas = [];

    // 1. Procesar la consulta inicial desde la historia clínica
    if (historiaClinica) {
      processedConsultas.push({
        id: `initial-${historiaClinica.id}`,
        numero: 1,
        tipo: 'Consulta Inicial',
        fecha: historiaClinica.fechaApertura,
        medico: (parsedData.procedimiento?.medicoResponsable || parsedData.informacionMedico?.medicoResponsable) || 'N/A',
        especialidad: (parsedData.procedimiento?.especialidad || parsedData.informacionMedico?.especialidad) || 'N/A',
        registroMedico: (parsedData.procedimiento?.registroMedico || parsedData.informacionMedico?.registroMedico) || 'N/A',
        motivo: (parsedData.consultaInicial?.motivoConsulta || parsedData.informacionConsulta?.motivoConsulta) || 'Apertura de historia clínica',
        enfermedadActual: (parsedData.consultaInicial?.enfermedadActual || parsedData.informacionConsulta?.enfermedadActual) || 'N/A',
        diagnosticos: (parsedData.diagnostico?.diagnosticos || parsedData.diagnosticoTratamiento?.diagnosticos || parsedData.diagnosticoPlan?.diagnosticos) || 'N/A',
        planTratamiento: (parsedData.diagnostico?.plan?.conducta || parsedData.diagnosticoTratamiento?.planTratamiento || parsedData.diagnosticoPlan?.planTratamiento) || 'N/A',
        examenFisico: (parsedData.examenFisico?.estadoGeneral || parsedData.examenClinico?.examenFisico) || 'N/A',
        signosVitales: (parsedData.examenFisico?.signosVitales || parsedData.examenClinico?.signosVitales) || 'N/A',
        dependenciaMedica: parsedData.examenFisico?.dependenciaMedica || null,
        sistemas: parsedData.examenFisico?.sistemas || null,
        camposEspecificos: parsedData.examenFisico?.camposEspecificos || null,
        formulaMedica: (parsedData.diagnostico?.medicamentos || parsedData.diagnosticoPlan?.medicamentos) || 'N/A',
        incapacidad: parsedData.diagnosticoPlan?.incapacidad || null,
        indicaciones: (parsedData.diagnostico?.plan?.recomendaciones || parsedData.diagnosticoPlan?.recomendaciones) || 'N/A',
        proximaCita: 'N/A',
        observaciones: (parsedData.consultaInicial?.observaciones || parsedData.informacionConsulta?.observaciones) || 'N/A'
      });
    }

    // 2. Procesar las consultas de seguimiento
    if (consultas && Array.isArray(consultas)) {
      consultas.forEach((consulta, index) => {
        const consultaData = safeJsonParse(consulta.datosJson, {});
        processedConsultas.push({
          id: consulta.id,
          numero: index + 2,
          tipo: 'Consulta Médica',
          fecha: consultaData.detalleConsulta?.fechaConsulta || consulta.fechaCreacion,
          medico: consultaData.detalleConsulta?.medicoTratante || consultaData.informacionMedico?.medicoTratante || 'N/A',
          especialidad: consultaData.detalleConsulta?.especialidad || consultaData.informacionMedico?.especialidad || 'N/A',
          registroMedico: consultaData.detalleConsulta?.registroMedico || consultaData.informacionMedico?.registroMedico || 'N/A',
          motivo: consultaData.informacionConsulta?.motivoConsulta || consultaData.detalleConsulta?.motivoConsulta || 'N/A',
          enfermedadActual: consultaData.informacionConsulta?.enfermedadActual || consultaData.detalleConsulta?.enfermedadActual || 'N/A',
          diagnosticos: consultaData.diagnosticoTratamiento?.diagnosticos || consultaData.diagnosticoTratamiento?.diagnosticoPrincipal || 'N/A',
          planTratamiento: consultaData.diagnosticoTratamiento?.planTratamiento || consultaData.diagnosticoTratamiento?.planManejo || 'N/A',
          examenFisico: consultaData.examenFisico?.estadoGeneral || consultaData.examenFisico?.hallazgos || consultaData.examenClinico?.examenFisico || 'N/A',
          signosVitales: consultaData.examenFisico?.signosVitales || consultaData.examenClinico?.signosVitales || 'N/A',
          dependenciaMedica: consultaData.examenFisico?.dependenciaMedica || null,
          sistemas: consultaData.examenFisico?.sistemas || null,
          camposEspecificos: consultaData.examenFisico?.camposEspecificos || null,
          formulaMedica: consultaData.diagnosticoTratamiento?.medicamentos || consultaData.formulaMedica?.medicamentos || 'N/A',
          incapacidad: consultaData.incapacidad || null,
          indicaciones: consultaData.seguimientoConsulta?.recomendaciones || consultaData.seguimientoConsulta?.indicaciones || 'N/A',
          proximaCita: consultaData.detalleConsulta?.proximaCita || consultaData.seguimientoConsulta?.proximaCita || 'N/A',
          observaciones: consultaData.informacionConsulta?.observaciones || consultaData.seguimientoConsulta?.recomendaciones || 'N/A'
        });
      });
    }

    return processedConsultas;
  }, [historiaClinica, consultas, parsedData]);

  return { parsedData, allConsultas };
};
