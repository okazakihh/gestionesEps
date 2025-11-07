import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { ipsConfig, getEncabezadoDocumento, getPieDocumento } from '../utils/ipsConfig';

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
 * Genera el encabezado HTML reutilizable para facturas
 * @param {string} numeroFactura - Número de la factura
 * @returns {string} HTML del encabezado
 */
const getFacturaHeaderHTML = (numeroFactura) => {
  return `
    <!-- Institutional Header -->
    <div class="header">
      <div class="institution-info">
        <h1 style="color: ${ipsConfig.colores.primario}; margin: 0; font-size: 20px; font-weight: bold;">${ipsConfig.nombre}</h1>
        <p style="margin: 5px 0; color: #374151; font-size: 14px;">Institución Prestadora de Servicios de Salud</p>
        <p style="margin: 2px 0; color: #6b7280;">NIT: ${ipsConfig.nit} • ${ipsConfig.direccion}, ${ipsConfig.ciudad}</p>
        <p style="margin: 2px 0; color: #6b7280;">Tel: ${ipsConfig.telefono} • Email: ${ipsConfig.email}</p>
        <p style="margin: 2px 0; color: #6b7280; font-size: 9px;">${ipsConfig.resolucionHabilitacion} • Código: ${ipsConfig.codigoHabilitacion}</p>
      </div>
      <h2 style="margin: 10px 0; color: #1f2937; font-size: 16px;">FACTURA DE SERVICIOS MÉDICOS</h2>
      <p style="margin: 5px 0; color: #6b7280; font-weight: bold;">Factura No: ${numeroFactura}</p>
      <p style="margin: 2px 0; color: #6b7280;">Fecha de Emisión: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}</p>
    </div>
  `;
};

/**
 * Genera el pie de página HTML reutilizable para facturas
 * @returns {string} HTML del footer
 */
const getFacturaFooterHTML = () => {
  return `
    <!-- Footer Legal -->
    <div class="footer">
      <div style="border-top: 2px solid ${ipsConfig.colores.primario}; padding-top: 10px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 11px; text-align: center;">INFORMACIÓN LEGAL Y NORMATIVA</h4>
      </div>

      <div style="background: #f0f9ff; padding: 8px; border-radius: 3px; margin-bottom: 10px; border: 1px solid #bae6fd;">
        <h5 style="margin: 0 0 5px 0; color: #0369a1; font-size: 10px;">🏥 INSTITUCIÓN PRESTADORA DE SERVICIOS</h5>
        <p style="margin: 0; font-size: 8px; line-height: 1.2;">
          <strong>${ipsConfig.nombre}</strong> - NIT: ${ipsConfig.nit}<br>
          ${ipsConfig.resolucionHabilitacion} • ${ipsConfig.nivelAtencion}<br>
          ${ipsConfig.direccion}, ${ipsConfig.ciudad}, ${ipsConfig.departamento}<br>
          Tel: ${ipsConfig.telefono} • Email: ${ipsConfig.email}
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
        <div>
          <p style="margin: 0; font-size: 9px;"><strong>Documento generado por:</strong></p>
          <p style="margin: 2px 0; font-size: 9px;">Sistema ${ipsConfig.nombre}</p>
          <p style="margin: 2px 0; font-size: 9px;">${ipsConfig.sitioWeb}</p>
        </div>
        <div>
          <p style="margin: 0; font-size: 9px;"><strong>Información de contacto:</strong></p>
          <p style="margin: 2px 0; font-size: 9px;">${new Date().toLocaleString('es-ES')}</p>
          <p style="margin: 2px 0; font-size: 9px;">Horario: ${ipsConfig.horarioAtencion}</p>
        </div>
      </div>

      <div style="background: #fefce8; padding: 8px; border-radius: 3px; border: 1px solid #fde68a;">
        <h5 style="margin: 0 0 5px 0; color: #92400e; font-size: 10px;">⚖️ NORMATIVA APLICABLE</h5>
        <p style="margin: 0; font-size: 8px; line-height: 1.2;">
          <strong>Ley 100 de 1993:</strong> Sistema General de Seguridad Social en Salud<br>
          <strong>Ley 1122 de 2007:</strong> Régimen de Compensación<br>
          <strong>Decreto 4747 de 2007:</strong> Manual de Tarifas SOAT<br>
          <strong>Resolución 3047 de 2008:</strong> Clasificación CUPS
        </p>
      </div>

      <div style="margin-top: 15px; text-align: center; padding-top: 10px; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 8px; color: #9ca3af;">
          ${ipsConfig.notasLegales.factura}<br>
          Cualquier reclamación debe presentarse por escrito dentro de los 30 días siguientes a la fecha de emisión.
        </p>
      </div>
    </div>
  `;
};

/**
 * Crea el contenido HTML completo para una factura a partir de una cita individual
 * @param {Object} cita - Objeto de cita con información completa
 * @returns {string} Contenido HTML listo para imprimir
 */
export const createFacturaContent = (cita) => {
  const html = `
    <html>
      <head>
        <title>Factura Médica - ${cita.nombrePaciente}</title>
        <style>
          @media print {
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 11px; line-height: 1.4; }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; text-align: center; }
            .institution-info { background: #f0f9ff; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
            .factura-info { background: #f8fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 2px solid #e5e7eb; }
            .patient-info { background: #fef3c7; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #f59e0b; }
            .service-detail { border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
            .section { margin-bottom: 10px; }
            .section-title { font-weight: bold; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; font-size: 12px; }
            .field { margin-bottom: 5px; }
            .field-label { font-weight: bold; display: inline-block; min-width: 120px; color: #6b7280; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #e5e7eb; font-size: 9px; color: #6b7280; }
            .signature { margin-top: 40px; text-align: center; }
            .signature-line { border-top: 1px solid #000; width: 200px; margin: 0 auto; margin-top: 40px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
            .important-note { background: #fee2e2; border: 1px solid #fecaca; padding: 8px; border-radius: 3px; margin: 5px 0; }
            @page { margin: 1.5cm; size: A4; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .total-row { background-color: #f0f9ff; font-weight: bold; }
            .total-amount { color: #2563eb; font-size: 14px; }
          }
        </style>
      </head>
      <body>
        ${getFacturaHeaderHTML(`FM-${cita.id}`)}

        <!-- Patient Information -->
        <div class="patient-info">
          <h3 style="margin-top: 0; color: #92400e; font-size: 14px; border-bottom: 2px solid #f59e0b; padding-bottom: 5px;">INFORMACIÓN DEL PACIENTE</h3>
          <div class="grid-2">
            <div><strong>Nombre Completo:</strong> ${cita.nombrePaciente}</div>
            <div><strong>Tipo y Número de Documento:</strong> ${cita.documentoPaciente}</div>
          </div>
        </div>

        <!-- Service Information -->
        <div class="factura-info">
          <h3 style="margin-top: 0; color: #1f2937; font-size: 14px; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">INFORMACIÓN DEL SERVICIO MÉDICO</h3>
          <div class="grid-3">
            <div><strong>Fecha del Servicio:</strong> ${formatDate(cita.fechaAtencion)}</div>
            <div><strong>Médico Tratante:</strong> ${cita.nombreMedico}</div>
            <div><strong>Código CUPS:</strong> ${cita.codigoCups}</div>
          </div>
        </div>

        <!-- Service Detail -->
        <div class="service-detail">
          <h3 style="margin-top: 0; color: #1f2937; font-size: 14px; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">DETALLE DE SERVICIOS PRESTADOS</h3>

          <table>
            <thead>
              <tr>
                <th>Código CUPS</th>
                <th>Descripción del Servicio</th>
                <th style="text-align: center;">Cantidad</th>
                <th style="text-align: right;">Valor Unitario</th>
                <th style="text-align: right;">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${cita.codigoCups}</td>
                <td>${cita.nombreProcedimiento}</td>
                <td style="text-align: center;">1</td>
                <td style="text-align: right;">${formatCurrency(cita.valorCita)}</td>
                <td style="text-align: right; font-weight: bold;">${formatCurrency(cita.valorCita)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="4" style="text-align: right; font-weight: bold;">TOTAL:</td>
                <td style="text-align: right;" class="total-amount">${formatCurrency(cita.valorCita)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Legal Information -->
        <div class="important-note">
          <h4 style="margin: 0 0 10px 0; color: #dc2626; font-size: 12px;">💰 INFORMACIÓN DE PAGO</h4>
          <p style="margin: 5px 0; font-size: 10px;">
            • Esta factura tiene una vigencia de 30 días calendario para su cancelación.<br>
            • Los pagos deben realizarse en las cuentas autorizadas por ${ipsConfig.nombre}.<br>
            • Para consultas sobre esta factura, contactar al ${ipsConfig.telefono}.
          </p>
        </div>

        ${getFacturaFooterHTML()}
      </body>
    </html>
  `;

  return html;
};

/**
 * Crea el contenido HTML completo para una factura guardada (con múltiples citas)
 * @param {Object} facturaData - Datos de la factura guardada (parseados del jsonData)
 * @returns {string} Contenido HTML listo para imprimir
 */
export const createFacturaContentFromFactura = (facturaData) => {
  const html = `
    <html>
      <head>
        <title>Factura Médica - ${facturaData.numeroFactura}</title>
        <style>
          @media print {
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 11px; line-height: 1.4; }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; text-align: center; }
            .institution-info { background: #f0f9ff; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
            .factura-info { background: #f8fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 2px solid #e5e7eb; }
            .patient-info { background: #fef3c7; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #f59e0b; }
            .service-detail { border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
            .section { margin-bottom: 10px; }
            .section-title { font-weight: bold; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; font-size: 12px; }
            .field { margin-bottom: 5px; }
            .field-label { font-weight: bold; display: inline-block; min-width: 120px; color: #6b7280; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #e5e7eb; font-size: 9px; color: #6b7280; }
            .signature { margin-top: 40px; text-align: center; }
            .signature-line { border-top: 1px solid #000; width: 200px; margin: 0 auto; margin-top: 40px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
            .important-note { background: #fee2e2; border: 1px solid #fecaca; padding: 8px; border-radius: 3px; margin: 5px 0; }
            @page { margin: 1.5cm; size: A4; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .total-row { background-color: #f0f9ff; font-weight: bold; }
            .total-amount { color: #2563eb; font-size: 14px; }
          }
        </style>
      </head>
      <body>
        ${getFacturaHeaderHTML(facturaData.numeroFactura)}

        <!-- Estado de la Factura -->
        <div class="factura-info">
          <h3 style="margin-top: 0; color: #1f2937; font-size: 14px; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">ESTADO DE LA FACTURA</h3>
          <div class="grid-2">
            <div><strong>Estado:</strong> <span style="color: ${facturaData.estado === 'PAGADA' ? '#10B981' : '#F59E0B'}; font-weight: bold;">${facturaData.estado}</span></div>
            <div><strong>Total:</strong> <span style="color: #2563eb; font-weight: bold; font-size: 14px;">${formatCurrency(facturaData.total)}</span></div>
          </div>
        </div>

        <!-- Service Detail -->
        <div class="service-detail">
          <h3 style="margin-top: 0; color: #1f2937; font-size: 14px; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">DETALLE DE SERVICIOS PRESTADOS</h3>

          <table>
            <thead>
              <tr>
                <th style="font-size: 10px;">Paciente</th>
                <th style="font-size: 10px;">Médico</th>
                <th style="font-size: 10px;">Procedimiento</th>
                <th style="font-size: 10px;">Código CUPS</th>
                <th style="font-size: 10px;">Fecha Atención</th>
                <th style="text-align: right; font-size: 10px;">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${facturaData.citas.map(cita => `
                <tr>
                  <td style="font-size: 10px;">${cita.paciente.nombre}<br><small style="color: #6b7280; font-size: 9px;">Doc: ${cita.paciente.documento}</small></td>
                  <td style="font-size: 10px;">${cita.medico.nombre}</td>
                  <td style="font-size: 10px;">${cita.procedimiento}</td>
                  <td style="font-size: 10px; font-family: monospace;">${cita.codigoCups}</td>
                  <td style="font-size: 10px;">${formatDate(cita.fechaAtencion)}</td>
                  <td style="text-align: right; font-size: 10px;">${formatCurrency(cita.valor)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="5" style="text-align: right; font-weight: bold; font-size: 11px;">TOTAL:</td>
                <td style="text-align: right; font-size: 11px;" class="total-amount">${formatCurrency(facturaData.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        ${getFacturaFooterHTML()}
      </body>
    </html>
  `;

  return html;
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
