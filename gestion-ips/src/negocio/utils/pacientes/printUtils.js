// Utilidades para impresión de historias clínicas y consultas

// Importar módulo de generación HTML
import { generarHistoriaClinicaHTML } from '../../../presentacion/components/pacientes/HistoriaClinicaHTML.js';

// Importar servicio de configuración
import { getIpsConfig } from '../../../data/services/configuracionApiService.js';

/**
 * Imprime la historia clínica completa
 * @param {Array} consultas - Lista de consultas
 * @param {Object} historiaClinica - Objeto de historia clínica
 * @param {Object} patient - Datos del paciente
 * @param {Object} patientData - Datos parseados del paciente
 */
export const printHistoriaClinica = async (consultas, historiaClinica, patient, patientData) => {
  // Cargar configuración de IPS desde la base de datos
  const ipsData = await getIpsConfig();
  // Parsear datos JSON de la historia clínica
  let historiaData = null;
  try {
    const parsed = JSON.parse(historiaClinica.datosJson || '{}');
    // Handle nested structure if exists
    historiaData = parsed.datosJson ? JSON.parse(parsed.datosJson) : parsed;
  } catch (error) {
    console.error('Error parsing historia clinica JSON:', error);
    historiaData = null;
  }

  // Preparar consultas en formato estructurado
  const allConsultas = [];

  // Agregar consulta inicial
  allConsultas.push({
    id: `initial-${historiaClinica.id}`,
    numero: 1,
    tipo: 'Consulta Inicial',
    fecha: historiaClinica.fechaApertura,
    medico: (historiaData && historiaData.procedimiento?.medicoResponsable) || (historiaData && historiaData.informacionMedico?.medicoResponsable) || 'N/A',
    especialidad: (historiaData && historiaData.procedimiento?.especialidad) || (historiaData && historiaData.informacionMedico?.especialidad) || 'N/A',
    motivo: (historiaData && historiaData.consultaInicial?.motivoConsulta) || (historiaData && historiaData.informacionConsulta?.motivoConsulta) || 'Apertura de historia clínica',
    enfermedadActual: (historiaData && historiaData.consultaInicial?.enfermedadActual) || (historiaData && historiaData.informacionConsulta?.enfermedadActual) || 'N/A',
    diagnosticos: (historiaData && historiaData.diagnostico?.diagnosticos) || (historiaData && historiaData.diagnosticoTratamiento?.diagnosticos) || 'N/A',
    planTratamiento: (historiaData && historiaData.diagnostico?.plan?.conducta) || (historiaData && historiaData.diagnosticoTratamiento?.planTratamiento) || 'N/A',
    examenFisico: (historiaData && historiaData.examenFisico?.estadoGeneral) || (historiaData && historiaData.examenClinico?.examenFisico) || 'N/A',
    signosVitales: (historiaData && historiaData.examenFisico?.signosVitales) || (historiaData && historiaData.examenClinico?.signosVitales) || 'N/A',
    dependenciaMedica: (historiaData && historiaData.examenFisico?.dependenciaMedica) || null,
    sistemas: (historiaData && historiaData.examenFisico?.sistemas) || null,
    camposEspecificos: (historiaData && historiaData.examenFisico?.camposEspecificos) || null,
    formulaMedica: (historiaData && historiaData.diagnostico?.medicamentos) || 'N/A',
    incapacidad: null,
    indicaciones: (historiaData && historiaData.diagnostico?.plan?.recomendaciones) || 'N/A',
    proximaCita: 'N/A',
    observaciones: (historiaData && historiaData.consultaInicial?.observaciones) || (historiaData && historiaData.informacionConsulta?.observaciones) || 'N/A'
  });

  // Agregar consultas posteriores
  if (consultas && Array.isArray(consultas)) {
    consultas.forEach((consulta, index) => {
      try {
        const consultaData = JSON.parse(consulta.datosJson || '{}');
        allConsultas.push({
          id: consulta.id,
          numero: index + 2,
          tipo: 'Consulta Médica',
          fecha: consultaData.detalleConsulta?.fechaConsulta || consulta.fechaCreacion,
          medico: consultaData.detalleConsulta?.medicoTratante || consultaData.informacionMedico?.medicoTratante || 'N/A',
          especialidad: consultaData.detalleConsulta?.especialidad || consultaData.informacionMedico?.especialidad || 'N/A',
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
      } catch (error) {
        console.error('Error parsing consulta JSON:', error);
      }
    });
  }

  // Generar HTML usando el módulo dedicado
  const htmlContent = generarHistoriaClinicaHTML(
    allConsultas,
    historiaClinica,
    patient,
    patientData,
    historiaData,
    ipsData
  );

  // Imprimir documento
  printDocument(htmlContent);
};

/**
 * Imprime una consulta específica
 * @param {Object} consulta - Objeto de consulta
 * @param {Object} historiaClinica - Objeto de historia clínica
 * @param {Object} patient - Datos del paciente
 * @param {Object} patientData - Datos parseados del paciente
 */
export const printConsulta = async (consulta, historiaClinica, patient, patientData) => {
  // Cargar configuración de IPS desde la base de datos
  const ipsData = await getIpsConfig();
  // Procesar la consulta individual
  let processedConsulta = null;
  try {
    const consultaData = JSON.parse(consulta.datosJson || '{}');
    processedConsulta = {
      id: consulta.id,
      numero: 1, // Para consulta individual, siempre es 1
      tipo: 'Consulta Médica Individual',
      fecha: consultaData.detalleConsulta?.fechaConsulta || consulta.fechaCreacion,
      medico: consultaData.detalleConsulta?.medicoTratante || consultaData.informacionMedico?.medicoTratante || 'N/A',
      especialidad: consultaData.detalleConsulta?.especialidad || consultaData.informacionMedico?.especialidad || 'N/A',
      motivo: consultaData.informacionConsulta?.motivoConsulta || consultaData.detalleConsulta?.motivoConsulta || 'N/A',
      enfermedadActual: consultaData.informacionConsulta?.enfermedadActual || consultaData.detalleConsulta?.enfermedadActual || 'N/A',
      diagnosticos: consultaData.diagnosticoTratamiento?.diagnosticos || consultaData.diagnosticoTratamiento?.diagnosticoPrincipal || 'N/A',
      planTratamiento: consultaData.diagnosticoTratamiento?.planTratamiento || consultaData.diagnosticoTratamiento?.planManejo || 'N/A',
      examenFisico: consultaData.examenFisico?.estadoGeneral || consultaData.examenFisico?.hallazgos || consultaData.examenClinico?.examenFisico || 'N/A',
      signosVitales: consultaData.examenFisico?.signosVitales || consultaData.examenClinico?.signosVitales || 'N/A',
      formulaMedica: consultaData.diagnosticoTratamiento?.medicamentos || consultaData.formulaMedica?.medicamentos || 'N/A',
      incapacidad: consultaData.incapacidad || null,
      indicaciones: consultaData.seguimientoConsulta?.recomendaciones || consultaData.seguimientoConsulta?.indicaciones || 'N/A',
      proximaCita: consultaData.detalleConsulta?.proximaCita || consultaData.seguimientoConsulta?.proximaCita || 'N/A',
      observaciones: consultaData.informacionConsulta?.observaciones || consultaData.seguimientoConsulta?.recomendaciones || 'N/A'
    };
  } catch (error) {
    console.error('Error parsing consulta JSON:', error);
    processedConsulta = {
      id: consulta.id,
      numero: 1,
      tipo: 'Consulta Médica Individual',
      fecha: consulta.fechaCreacion,
      medico: 'N/A',
      especialidad: 'N/A',
      motivo: 'N/A',
      enfermedadActual: 'N/A',
      diagnosticos: 'N/A',
      planTratamiento: 'N/A',
      examenFisico: 'N/A',
      signosVitales: 'N/A',
      formulaMedica: 'N/A',
      incapacidad: null,
      indicaciones: 'N/A',
      proximaCita: 'N/A',
      observaciones: 'N/A'
    };
  }

  // Generar HTML usando el módulo dedicado
  const htmlContent = generarHistoriaClinicaHTML(
    [processedConsulta],
    historiaClinica,
    patient,
    patientData,
    null,
    ipsData
  );

  // Imprimir documento
  printDocument(htmlContent);
};

/**
 * Imprime el documento en una nueva ventana
 * @param {string} content - Contenido HTML a imprimir
 */
export const printDocument = (content) => {
  const ventana = window.open('', '_blank', 'width=800,height=1000');
  
  if (ventana) {
    ventana.document.write(content);
    ventana.document.close();
    
    // Esperar a que se cargue el contenido antes de imprimir
    ventana.onload = function() {
      ventana.focus();
      ventana.print();
    };
    
    // Fallback si onload no se dispara
    setTimeout(() => {
      ventana.focus();
      ventana.print();
    }, 250);
  } else {
    alert('Por favor, permita las ventanas emergentes para imprimir el documento.');
  }
};
