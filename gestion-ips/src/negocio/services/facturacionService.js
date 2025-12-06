import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { ipsConfig, getEncabezadoDocumento, getPieDocumento } from '../utils/ipsConfig';
import { generarFacturaHTML } from '../../presentacion/components/facturacion/FacturaHTML.js';
import { configuracionApiService } from '../../data/services/configuracionApiService.js';
import { 
  enviarFacturaDian, 
  validarFacturaPreEnvio, 
  consultarEstadoFactura,
  generarCodigoQR,
  getDianEnvironmentInfo 
} from './dianService.js';

// Cache de configuración IPS
let cachedIpsConfig = null;
let cachedFacturacionConfig = null;

// Obtener configuración IPS (con cache)
export const getIpsConfig = async () => {
  if (cachedIpsConfig) return cachedIpsConfig;
  
  try {
    const config = await configuracionApiService.getConfiguracionByClave('IPS_INFO');
    if (config && config.jsonData) {
      cachedIpsConfig = config.jsonData;
      return cachedIpsConfig;
    }
  } catch (error) {
    console.warn('No se pudo cargar IPS_INFO, usando configuración por defecto');
  }
  
  // Fallback a configuración estática
  return ipsConfig;
};

// Obtener configuración de facturación (con cache)
export const getFacturacionConfig = async () => {
  if (cachedFacturacionConfig) return cachedFacturacionConfig;
  
  try {
    const config = await configuracionApiService.getConfiguracionByClave('FACTURACION');
    if (config && config.jsonData) {
      cachedFacturacionConfig = config.jsonData;
      return cachedFacturacionConfig;
    }
  } catch (error) {
    console.warn('No se pudo cargar FACTURACION, usando configuración por defecto');
  }
  
  // Configuración por defecto
  return {
    prefijoFactura: 'FM',
    consecutivoInicial: 1000,
    iva: 0,
    retencionFuente: 0,
    diasVencimientoFactura: 30,
    notasLegales: '',
    incluirFirmaDigital: false,
    formatoNumeroFactura: '{PREFIJO}-{CONSECUTIVO}'
  };
};

// Generar número de factura según configuración
export const generateInvoiceNumber = async () => {
  const config = await getFacturacionConfig();
  
  // Inicializar contador si es necesario
  if (invoiceCounter === null) {
    invoiceCounter = config.consecutivoInicial || 1000;
  }
  
  const consecutivo = invoiceCounter++;
  const formato = config.formatoNumeroFactura || '{prefijo}-{consecutivo}';
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  
  return formato
    .replace('{prefijo}', config.prefijoFactura || 'FM')
    .replace('{PREFIJO}', config.prefijoFactura || 'FM')
    .replace('{consecutivo}', consecutivo.toString().padStart(6, '0'))
    .replace('{CONSECUTIVO}', consecutivo.toString().padStart(6, '0'))
    .replace('{year}', currentYear.toString())
    .replace('{YEAR}', currentYear.toString())
    .replace('{mes}', currentMonth)
    .replace('{MES}', currentMonth)
    .replace('{MONTH}', currentMonth);
};

// Calcular totales con IVA y retención
export const calculateInvoiceTotals = async (subtotal) => {
  const config = await getFacturacionConfig();
  
  const iva = (subtotal * (config.iva || 0)) / 100;
  const retencionFuente = (subtotal * (config.retencionFuente || 0)) / 100;
  const total = subtotal + iva - retencionFuente;
  
  return {
    subtotal,
    iva,
    ivaPercent: config.iva || 0,
    retencionFuente,
    retencionPercent: config.retencionFuente || 0,
    total
  };
};

// Limpiar cache (útil cuando se actualiza la configuración)
export const clearIpsConfigCache = () => {
  cachedIpsConfig = null;
};

export const clearFacturacionConfigCache = () => {
  cachedFacturacionConfig = null;
};

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
 * @returns {Promise<string>} Contenido HTML listo para imprimir
 */
export const createFacturaContent = async (cita) => {
  // Obtener configuración de IPS
  const ipsData = await getIpsConfig();
  
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

  // Usar el nuevo módulo profesional con configuración de IPS
  return generarFacturaHTML({ id: cita.id }, facturaData, ipsData);
};

/**
 * Crea el contenido HTML completo para una factura guardada (con múltiples citas)
 * @param {Object} facturaData - Datos de la factura guardada (parseados del jsonData)
 * @returns {Promise<string>} Contenido HTML listo para imprimir
 */
export const createFacturaContentFromFactura = async (facturaData) => {
  // Obtener configuración de IPS
  const ipsData = await getIpsConfig();
  
  // Usar el nuevo módulo profesional con configuración de IPS
  return generarFacturaHTML({ id: facturaData.id || 0 }, facturaData, ipsData);
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
export const generarFacturaPDF = async (cita) => {
  const contenidoHTML = await createFacturaContent(cita);
  printFactura(contenidoHTML);
};

/**
 * Genera e imprime PDF de una factura guardada (con múltiples citas)
 * @param {Object} factura - Objeto de factura guardada
 */
export const generarFacturaPDFFactura = async (factura) => {
  try {
    const facturaData = JSON.parse(factura.jsonData || '{}');
    const contenidoHTML = await createFacturaContentFromFactura(facturaData);
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
  
  // Calcular subtotal (suma de valores de citas)
  const subtotal = citasSeleccionadas.reduce((sum, cita) => sum + (cita.valorCita || 0), 0);
  
  // Servicios de salud generalmente tienen IVA 0%
  const ivaPercent = 0;
  const iva = subtotal * (ivaPercent / 100);
  const total = subtotal + iva;

  // Obtener datos del primer paciente para pre-poblar el formulario
  const primeraCita = citasSeleccionadas[0];
  let datosPaciente = {};
  
  try {
    if (primeraCita && primeraCita.datosJson) {
      const datosJson = typeof primeraCita.datosJson === 'string' 
        ? JSON.parse(primeraCita.datosJson) 
        : primeraCita.datosJson;
      
      // Intentar obtener datos completos del paciente del datosJson
      datosPaciente = datosJson.paciente || {};
    }
  } catch (error) {
    console.error('Error parseando datos del paciente:', error);
  }

  return {
    numeroFactura,
    fechaEmision,
    estado: 'PENDIENTE',
    subtotal,
    iva,
    ivaPercent,
    total,
    citas: citasSeleccionadas.map(cita => ({
      id: cita.id,
      paciente: {
        nombre: cita.nombrePaciente || primeraCita.nombrePaciente,
        apellido: datosPaciente.apellido || '',
        documento: cita.documentoPaciente,
        numeroDocumento: cita.documentoPaciente,
        tipoDocumento: datosPaciente.tipoDocumento || 'CC',
        telefono: datosPaciente.telefono || '',
        email: datosPaciente.email || '',
        direccion: datosPaciente.direccion || '',
        ciudad: datosPaciente.ciudad || '',
        departamento: datosPaciente.departamento || ''
      },
      medico: {
        nombre: cita.nombreMedico
      },
      procedimiento: cita.nombreProcedimiento,
      codigoCups: cita.codigoCups,
      fechaAtencion: cita.fechaAtencion,
      valor: cita.valorCita || 0
    }))
  };
};

// ============================================================================
// INTEGRACIÓN FACTURACIÓN ELECTRÓNICA DIAN
// ============================================================================

/**
 * Preparar datos de factura en formato DIAN
 * @param {Object} facturaData - Datos de factura interna
 * @param {Object} ipsData - Configuración de la IPS
 * @returns {Object} Datos formateados para DIAN
 */
export const prepararDatosParaDian = async (facturaData, ipsData) => {
  const config = await getFacturacionConfig();
  
  // Usar datos del cliente si fueron proporcionados por el modal, sino usar del paciente
  let clienteInfo;
  if (facturaData.cliente) {
    // Datos capturados desde el modal FacturaDianModal
    clienteInfo = {
      nombreCompleto: facturaData.cliente.nombreCompleto,
      tipoDocumento: facturaData.cliente.tipoDocumento,
      numeroDocumento: facturaData.cliente.numeroDocumento,
      direccion: facturaData.cliente.direccion,
      ciudad: facturaData.cliente.ciudad,
      departamento: facturaData.cliente.departamento,
      telefono: facturaData.cliente.telefono,
      email: facturaData.cliente.email,
      // Campos adicionales (si es entidad)
      razonSocial: facturaData.cliente.razonSocial,
      digitoVerificacion: facturaData.cliente.digitoVerificacion,
      tipoPersona: facturaData.cliente.tipoPersona,
      nombreContacto: facturaData.cliente.nombreContacto,
      cargoContacto: facturaData.cliente.cargoContacto
    };
  } else {
    // Fallback: obtener del primer paciente de las citas
    const primeraCita = facturaData.citas[0];
    const cliente = primeraCita.paciente;
    clienteInfo = {
      nombreCompleto: `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim(),
      tipoDocumento: cliente.tipoDocumento || 'CC',
      numeroDocumento: cliente.numeroDocumento || cliente.documento,
      direccion: cliente.direccion || 'N/A',
      ciudad: cliente.ciudad || 'Bogotá',
      departamento: cliente.departamento || 'Bogotá',
      telefono: cliente.telefono || '',
      email: cliente.email || ''
    };
  }
  
  // Calcular totales
  const subtotal = facturaData.citas.reduce((sum, cita) => {
    const valor = cita.codigoCups?.valor || cita.valor || 0;
    return sum + valor;
  }, 0);
  const totales = await calculateInvoiceTotals(subtotal);
  
  // Calcular fecha de vencimiento
  const fechaEmision = new Date(facturaData.fechaEmision);
  const fechaVencimiento = new Date(fechaEmision);
  fechaVencimiento.setDate(fechaVencimiento.getDate() + (config.diasVencimientoFactura || 30));
  
  // Mapear medio de pago a código DIAN
  const mapMedioPagoDian = {
    'EFECTIVO': '10',
    'TARJETA_CREDITO': '48',
    'TARJETA_DEBITO': '49',
    'TRANSFERENCIA': '42',
    'CHEQUE': '20'
  };
  
  return {
    numeroFactura: facturaData.numeroFactura,
    fechaEmision: fechaEmision.toISOString(),
    fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
    
    // Datos del emisor (IPS)
    emisor: {
      nit: ipsData.nit || '',
      razonSocial: ipsData.nombre || ipsData.razonSocial || '',
      direccion: ipsData.direccion || '',
      ciudad: ipsData.ciudad || 'Bogotá',
      departamento: ipsData.departamento || 'Bogotá',
      codigoMunicipio: ipsData.codigoMunicipio || '11001',
      codigoDepartamento: ipsData.codigoDepartamento || '11',
      codigoPostal: ipsData.codigoPostal || '110111',
      telefono: ipsData.telefono || '',
      email: ipsData.email || ''
    },
    
    // Datos del cliente (con información completa capturada)
    cliente: {
      nombreCompleto: clienteInfo.nombreCompleto,
      // Campos adicionales para validación DIAN
      nombres: clienteInfo.nombreCompleto, // Para persona natural
      razonSocial: clienteInfo.razonSocial || clienteInfo.nombreCompleto, // Para persona jurídica
      tipoDocumento: clienteInfo.tipoDocumento,
      numeroDocumento: clienteInfo.numeroDocumento,
      direccion: clienteInfo.direccion,
      ciudad: clienteInfo.ciudad,
      departamento: clienteInfo.departamento,
      telefono: clienteInfo.telefono,
      email: clienteInfo.email,
      // Campos adicionales de entidad si existen
      digitoVerificacion: clienteInfo.digitoVerificacion || '',
      tipoPersona: clienteInfo.tipoPersona || 'NATURAL',
      nombreContacto: clienteInfo.nombreContacto || '',
      cargoContacto: clienteInfo.cargoContacto || ''
    },
    
    // Items de la factura (servicios médicos)
    items: facturaData.citas.map((cita, index) => {
      const valor = cita.codigoCups?.valor || cita.valor || 0;
      const codigoCups = cita.codigoCups?.codigo || cita.codigoCups || 'N/A';
      const descripcion = cita.codigoCups?.descripcion || cita.procedimiento || 'Servicio Médico';
      
      return {
        numero: index + 1,
        descripcion: descripcion,
        codigoCups: codigoCups,
        cantidad: 1,
        unidadMedida: 'EA', // Each (unidad)
        valorUnitario: valor,
        valorTotal: valor,
        iva: 0, // Servicios de salud generalmente no tienen IVA
        ivaPercent: 0
      };
    }),
    
    // Totales
    subtotal: totales.subtotal,
    iva: totales.iva,
    ivaPercent: totales.ivaPercent,
    retencion: totales.retencionFuente || 0,
    retencionPercent: totales.retencionPercent || 0,
    total: totales.total,
    
    // Información adicional
    formaPago: facturaData.formaPago || 'CONTADO',
    medioPago: mapMedioPagoDian[facturaData.medioPago] || '10', // Por defecto efectivo
    tipoServicio: 'SALUD',
    observaciones: facturaData.observaciones || config.notasLegales || 'Factura de servicios médicos'
  };
};

/**
 * Generar y enviar factura electrónica a la DIAN
 * @param {Object} facturaData - Datos de la factura
 * @param {boolean} enviarAutomaticamente - Si debe enviar a DIAN automáticamente
 * @returns {Promise<Object>} Resultado del proceso
 */
export const generarFacturaElectronica = async (facturaData, enviarAutomaticamente = false) => {
  try {
    // Obtener configuración IPS
    const ipsData = await getIpsConfig();
    
    // Preparar datos en formato DIAN
    const datosDian = await prepararDatosParaDian(facturaData, ipsData);
    
    // Validar factura antes de generar XML
    const validacion = validarFacturaPreEnvio(datosDian);
    if (!validacion.valida) {
      return {
        success: false,
        error: 'Validación fallida',
        errores: validacion.errores,
        advertencias: validacion.advertencias
      };
    }
    
    // FacturaTech genera el XML automáticamente, no necesitamos generarlo aquí
    // const xmlFactura = await generarFacturaXML(datosDian);
    
    // Si se debe enviar automáticamente
    if (enviarAutomaticamente) {
      const resultado = await enviarFacturaDian(datosDian);
      
      if (resultado.success) {
        // FacturaTech ya incluye el QR, no necesitamos generarlo
        // const qrCode = await generarCodigoQR(resultado.cufe, datosDian);
        
        return {
          success: true,
          cufe: resultado.cufe,
          numeroFactura: resultado.numeroFactura,
          qrCode: resultado.qrCode,
          pdfUrl: resultado.pdfUrl,
          xmlUrl: resultado.xmlUrl,
          estadoDian: resultado.statusDescription,
          ambiente: resultado.environment,
          advertencias: validacion.advertencias
        };
      } else {
        return {
          success: false,
          error: 'Error enviando a DIAN',
          detalles: resultado.validationErrors,
          xmlFactura: xmlFactura
        };
      }
    }
    
    // Si no se envía, solo retornar el XML generado
    return {
      success: true,
      xmlFactura: xmlFactura,
      advertencias: validacion.advertencias,
      message: 'XML generado correctamente. Enviar manualmente a DIAN.'
    };
    
  } catch (error) {
    console.error('Error generando factura electrónica:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido'
    };
  }
};

/**
 * Enviar factura existente a la DIAN
 * @param {Object} factura - Objeto de factura guardada
 * @returns {Promise<Object>} Resultado del envío
 */
export const enviarFacturaExistenteADian = async (factura) => {
  try {
    const facturaData = JSON.parse(factura.jsonData || '{}');
    
    // Verificar si ya tiene CUFE (ya fue enviada)
    if (facturaData.cufe) {
      // Consultar estado actual en DIAN
      const estado = await consultarEstadoFactura(facturaData.cufe);
      return {
        success: true,
        yaEnviada: true,
        cufe: facturaData.cufe,
        estado: estado
      };
    }
    
    // Generar y enviar
    const resultado = await generarFacturaElectronica(facturaData, true);
    
    if (resultado.success) {
      // Mostrar mensaje de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Factura Enviada a DIAN!',
        html: `
          <p><strong>CUFE:</strong> ${resultado.cufe}</p>
          <p><strong>Estado:</strong> ${resultado.estadoDian}</p>
          <p><strong>Ambiente:</strong> ${resultado.ambiente}</p>
        `,
        confirmButtonColor: '#10B981'
      });
    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Error al Enviar',
        text: resultado.error,
        confirmButtonColor: '#EF4444'
      });
    }
    
    return resultado;
    
  } catch (error) {
    console.error('Error enviando factura a DIAN:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo enviar la factura a la DIAN',
      confirmButtonColor: '#EF4444'
    });
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Consultar estado de factura en la DIAN por CUFE
 * @param {string} cufe - Código Único de Factura Electrónica
 * @returns {Promise<Object>} Estado de la factura
 */
export const consultarEstadoFacturaDian = async (cufe) => {
  try {
    const resultado = await consultarEstadoFactura(cufe);
    
    if (resultado.success) {
      await Swal.fire({
        icon: 'info',
        title: 'Estado de Factura',
        html: `
          <p><strong>CUFE:</strong> ${cufe}</p>
          <p><strong>Estado:</strong> ${resultado.estado}</p>
        `,
        confirmButtonColor: '#3B82F6'
      });
    } else {
      await Swal.fire({
        icon: 'warning',
        title: 'No se pudo consultar',
        text: resultado.error,
        confirmButtonColor: '#F59E0B'
      });
    }
    
    return resultado;
    
  } catch (error) {
    console.error('Error consultando estado:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtener información del ambiente DIAN actual
 * @returns {Promise<Object>} Información del ambiente
 */
export const obtenerInfoAmbienteDian = async () => {
  try {
    const info = await getDianEnvironmentInfo();
    return info;
  } catch (error) {
    console.error('Error obteniendo info de ambiente DIAN:', error);
    return null;
  }
};
