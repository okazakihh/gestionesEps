import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { ipsConfig, getEncabezadoDocumento, getPieDocumento } from '../utils/ipsConfig';
import { generarFacturaHTML } from '../../presentacion/components/facturacion/FacturaHTML.js';

/**
 * facturacionService.js
 * 
 * Servicio que contiene la lógica de negocio para:
 * - Formateo de fechas y monedas
 * - Generación de contenido HTML para facturas
 * - Exportación a Excel
 * - Generación de PDFs para impresión
 * 
 * Capa: Negocio (Business Logic)
 */

// ============================================================================
// FUNCIONES DE FORMATEO
// ============================================================================

/**
 * Formatea una fecha a formato legible en español
 * Maneja múltiples formatos: arrays de LocalDateTime, strings ISO, objetos Date
 * @param {Array|string|Date} dateString - Fecha en cualquier formato soportado
 * @returns {string} Fecha formateada o mensaje de error
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';

  try {
    let date;

    // Handle LocalDateTime serialized as array [year, month, day, hour, minute, second, nanosecond]
    if (Array.isArray(dateString) && dateString.length >= 6) {
      // LocalDateTime comes as [2024, 12, 15, 10, 30, 0, 0]
      date = new Date(dateString[0], dateString[1] - 1, dateString[2], dateString[3], dateString[4], dateString[5]);
    } else if (typeof dateString === 'string') {
      // Try different parsing strategies
      if (dateString.includes('T')) {
        // ISO format with time: "2024-12-15T10:30:00.000+00:00" or "2024-12-15T10:30"
        date = new Date(dateString);
      } else if (dateString.includes('-') && dateString.length === 10) {
        // Date only format: "2024-12-15"
        date = new Date(dateString + 'T00:00:00');
      } else {
        // Other string formats
        date = new Date(dateString);
      }
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      date = new Date(dateString);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Error en fecha';
  }
};

/**
 * Formatea un número como moneda colombiana (COP)
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada como moneda
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

// ============================================================================
// GENERACIÓN DE CONTENIDO HTML PARA FACTURAS
// ============================================================================

/**
 * Crea el contenido HTML completo para una factura a partir de una cita individual
 * @param {Object} cita - Objeto de cita con información completa
 * @returns {string} Contenido HTML listo para imprimir
 */
export const createFacturaContent = (cita) => {
  // Preparar datos en formato de factura
  const facturaData = {
    numeroFactura: `FM-${cita.id}`,
    fechaEmision: new Date().toISOString(),
    estado: 'PENDIENTE',
    total: cita.valorCita || 0,
    citas: [{
      paciente: {
        nombre: cita.nombrePaciente || 'N/A',
        documento: cita.documentoPaciente || 'N/A',
        tipoDocumento: 'CC',
        eps: cita.eps || 'PARTICULAR',
        tipoAtencion: 'Particular'
      },
      medico: {
        nombre: cita.nombreMedico || 'N/A'
      },
      procedimiento: cita.nombreProcedimiento || 'Consulta Médica',
      codigoCups: cita.codigoCups || 'N/A',
      fechaAtencion: cita.fechaAtencion,
      valor: cita.valorCita || 0
    }]
  };

  // Usar el nuevo módulo profesional
  return generarFacturaHTML({ id: cita.id }, facturaData);
};

/**
 * Crea el contenido HTML completo para una factura guardada (con múltiples citas)
 * @param {Object} facturaData - Datos de la factura guardada (parseados del jsonData)
 * @returns {string} Contenido HTML listo para imprimir
 */
export const createFacturaContentFromFactura = (facturaData) => {
  // Usar el nuevo módulo profesional
  return generarFacturaHTML({ id: facturaData.id || 0 }, facturaData);
};

// ============================================================================
// FUNCIONES DE IMPRESIÓN (PDF)
// ============================================================================

/**
 * Abre una ventana de impresión con el contenido HTML proporcionado
 * @param {string} content - Contenido HTML completo listo para imprimir
 */
export const printFactura = (content) => {
  const ventana = window.open('', '_blank', 'width=800,height=1000');
  
  if (ventana) {
    ventana.document.write(content);
    ventana.document.close();
  } else {
    alert('Por favor, permita las ventanas emergentes para imprimir la factura.');
  }
};

/**
 * Genera e imprime PDF de una cita individual
 * @param {Object} cita - Objeto de cita con información completa
 */
export const generarFacturaPDF = (cita) => {
  const contenidoHTML = createFacturaContent(cita);
  printFactura(contenidoHTML);
};

/**
 * Genera e imprime PDF de una factura guardada (con múltiples citas)
 * @param {Object} factura - Objeto de factura guardada
 */
export const generarFacturaPDFFactura = async (factura) => {
  try {
    const facturaData = JSON.parse(factura.jsonData || '{}');
    const contenidoHTML = createFacturaContentFromFactura(facturaData);
    printFactura(contenidoHTML);
  } catch (error) {
    console.error('Error generando PDF de factura:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo generar el PDF de la factura',
      confirmButtonColor: '#EF4444'
    });
  }
};

// ============================================================================
// EXPORTACIÓN A EXCEL
// ============================================================================

/**
 * Exporta citas atendidas filtradas a un archivo Excel
 * Genera dos hojas: datos detallados y resumen
 * @param {Array} citasAtendidasFiltradas - Array de citas a exportar
 * @param {Object} filtros - Filtros aplicados (fechaInicio, fechaFin, documento, medico, procedimiento)
 */
export const exportarExcel = (citasAtendidasFiltradas, filtros) => {
  try {
    // Preparar datos para Excel
    const datosExcel = citasAtendidasFiltradas.map(cita => ({
      'Fecha': formatDate(cita.fechaAtencion),
      'Paciente': cita.nombrePaciente,
      'Documento Paciente': cita.documentoPaciente,
      'Médico': cita.nombreMedico,
      'Procedimiento': cita.nombreProcedimiento,
      'Código CUPS': cita.codigoCups,
      'Valor': cita.valorCita
    }));

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // Crear hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(datosExcel);

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 12 }, // Fecha
      { wch: 25 }, // Paciente
      { wch: 18 }, // Documento Paciente
      { wch: 30 }, // Médico
      { wch: 40 }, // Procedimiento
      { wch: 12 }, // Código CUPS
      { wch: 15 }  // Valor
    ];
    ws['!cols'] = colWidths;

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Citas Atendidas');

    // Crear hoja de resumen
    const resumenData = [
      { 'Concepto': 'Total Citas', 'Valor': citasAtendidasFiltradas.length },
      { 'Concepto': 'Total Facturado', 'Valor': citasAtendidasFiltradas.reduce((total, cita) => total + cita.valorCita, 0) }
    ];

    const wsResumen = XLSX.utils.json_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    // Generar nombre del archivo con fecha
    const fechaActual = new Date().toISOString().split('T')[0];
    const filtrosActivos = [];
    if (filtros.fechaInicio) filtrosActivos.push(`desde_${filtros.fechaInicio.replace(/-/g, '')}`);
    if (filtros.fechaFin) filtrosActivos.push(`hasta_${filtros.fechaFin.replace(/-/g, '')}`);
    if (filtros.filtroDocumentoPaciente) filtrosActivos.push('filtrado_paciente');
    if (filtros.filtroMedico) filtrosActivos.push('filtrado_medico');
    if (filtros.filtroProcedimiento) filtrosActivos.push('filtrado_procedimiento');

    const sufijoFiltros = filtrosActivos.length > 0 ? `_${filtrosActivos.join('_')}` : '';
    const nombreArchivo = `reporte_facturacion_${fechaActual}${sufijoFiltros}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(wb, nombreArchivo);

    // Mostrar mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: '¡Exportación Exitosa!',
      text: `El archivo Excel "${nombreArchivo}" ha sido generado y descargado.`,
      confirmButtonColor: '#10B981',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false
    });

  } catch (error) {
    console.error('Error exportando Excel:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al Exportar',
      text: 'Hubo un problema generando el archivo Excel. Por favor intenta nuevamente.',
      confirmButtonColor: '#EF4444'
    });
  }
};

// ============================================================================
// FUNCIONES AUXILIARES PARA GENERAR PREVISUALIZACIONES
// ============================================================================

/**
 * Genera objeto de previsualización de factura para mostrar en modal
 * @param {Array} citasSeleccionadas - Array de citas seleccionadas para la factura
 * @returns {Object} Objeto con datos estructurados para preview
 */
export const generarFacturaPreview = (citasSeleccionadas) => {
  const numeroFactura = `FM-${Date.now()}`;
  const fechaEmision = new Date().toISOString();
  const total = citasSeleccionadas.reduce((sum, cita) => sum + cita.valorCita, 0);

  return {
    numeroFactura,
    fechaEmision,
    estado: 'PENDIENTE',
    total,
    citas: citasSeleccionadas.map(cita => ({
      id: cita.id,
      paciente: {
        nombre: cita.nombrePaciente,
        documento: cita.documentoPaciente
      },
      medico: {
        nombre: cita.nombreMedico
      },
      procedimiento: cita.nombreProcedimiento,
      codigoCups: cita.codigoCups,
      fechaAtencion: cita.fechaAtencion,
      valor: cita.valorCita
    }))
  };
};
