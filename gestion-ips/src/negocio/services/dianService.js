/**
 * dianService.js
 * 
 * Servicio de integración con Siigo para facturación electrónica
 * El backend maneja la comunicación con Siigo API
 * 
 * Modos disponibles:
 * - MOCK: Desarrollo sin credenciales (activado por defecto)
 * - SANDBOX: Pruebas con Siigo sandbox
 * - PRODUCTION: Facturación real
 */

import axios from 'axios';

/**
 * Enviar factura electrónica a través del backend (Siigo Mock/Real)
 * @param {Object} facturaData - Datos de la factura
 * @returns {Promise<Object>} Respuesta de Siigo/DIAN
 */
export const enviarFacturaDian = async (facturaData) => {
  try {
    // Preparar datos para el backend (formato JSON simple)
    const request = {
      cliente: {
        tipoDocumento: facturaData.cliente.tipoDocumento,
        numeroDocumento: facturaData.cliente.numeroDocumento,
        nombreCompleto: facturaData.cliente.nombreCompleto || facturaData.cliente.razonSocial,
        email: facturaData.cliente.email,
        telefono: facturaData.cliente.telefono,
        direccion: facturaData.cliente.direccion,
        ciudad: facturaData.cliente.ciudad
      },
      items: facturaData.items.map(item => ({
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        valorUnitario: item.valorUnitario
      })),
      formaPago: facturaData.formaPago,
      observaciones: facturaData.observaciones || ''
    };
    
    // Enviar al backend a través del gateway
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8081').replace(/\/api$/, '');
    const response = await axios.post(`${API_URL}/api/dian/enviar-factura`, request, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 segundos timeout
    });
    
    const result = response.data;
    
    return {
      success: result.success,
      cufe: result.cufe,
      numeroFactura: result.numeroFactura,
      qrCode: result.qrCode,
      pdfUrl: result.pdfUrl,
      xmlUrl: result.xmlUrl,
      statusCode: result.statusCode,
      statusDescription: result.statusDescription,
      environment: result.environment,
      provider: result.provider || 'Siigo'
    };
    
  } catch (error) {
    console.error('Error enviando factura:', error);
    console.error('Respuesta completa:', error.response?.data);
    throw {
      success: false,
      error: error.message,
      details: error.response?.data || null
    };
  }
};

/**
 * Consultar estado de una factura
 * @param {string} invoiceId - ID de la factura en Siigo
 * @returns {Promise<Object>} Estado de la factura
 */
export const consultarEstadoFactura = async (invoiceId) => {
  try {
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8081').replace(/\/api$/, '');
    const response = await axios.get(`${API_URL}/api/dian/consultar-estado/${invoiceId}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    return {
      success: true,
      estado: response.data.estado,
      cufe: response.data.cufe,
      detalles: response.data.detalles
    };
    
  } catch (error) {
    console.error('Error consultando estado:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Validar que una factura cumpla requisitos DIAN antes de enviar
 * @param {Object} facturaData - Datos de la factura
 * @returns {Object} Resultado de validación
 */
export const validarFacturaPreEnvio = (facturaData) => {
  const errores = [];
  const advertencias = [];
  
  // Validaciones obligatorias DIAN
  if (!facturaData.numeroFactura) {
    errores.push('Número de factura es obligatorio');
  }
  
  if (!facturaData.fechaEmision) {
    errores.push('Fecha de emisión es obligatoria');
  }
  
  if (!facturaData.cliente?.tipoDocumento || !facturaData.cliente?.numeroDocumento) {
    errores.push('Documento del cliente es obligatorio (tipo y número)');
  }
  
  if (!facturaData.cliente?.razonSocial && !facturaData.cliente?.nombres) {
    errores.push('Nombre o razón social del cliente es obligatorio');
  }
  
  if (!facturaData.items || facturaData.items.length === 0) {
    errores.push('La factura debe tener al menos un ítem');
  }
  
  // Validar ítems
  facturaData.items?.forEach((item, index) => {
    if (!item.descripcion) {
      errores.push(`Ítem ${index + 1}: descripción es obligatoria`);
    }
    if (!item.cantidad || item.cantidad <= 0) {
      errores.push(`Ítem ${index + 1}: cantidad debe ser mayor a 0`);
    }
    if (!item.valorUnitario || item.valorUnitario <= 0) {
      errores.push(`Ítem ${index + 1}: valor unitario debe ser mayor a 0`);
    }
  });
  
  // Validaciones específicas para sector salud
  if (facturaData.tipoServicio === 'SALUD') {
    if (!facturaData.codigoCUPS) {
      advertencias.push('Se recomienda incluir código CUPS para servicios de salud');
    }
  }
  
  return {
    valida: errores.length === 0,
    errores,
    advertencias
  };
};

/**
 * Generar código QR para la factura electrónica
 * @param {string} cufe - Código Único de Factura Electrónica
 * @param {Object} facturaData - Datos de la factura
 * @returns {string} URL del código QR
 */
export const generarCodigoQR = async (cufe, facturaData) => {
  // Datos para el QR según especificaciones DIAN
  const qrData = [
    `NumFac: ${facturaData.numeroFactura}`,
    `FecFac: ${facturaData.fechaEmision}`,
    `NitFac: ${facturaData.emisor?.nit || 'N/A'}`,
    `DocAdq: ${facturaData.cliente.numeroDocumento}`,
    `ValFac: ${facturaData.total}`,
    `ValIva: ${facturaData.iva}`,
    `ValOtroIm: 0.00`,
    `ValTotal: ${facturaData.total}`,
    `CUFE: ${cufe}`
  ].join('\n');
  
  // Usar servicio de QR (puedes usar qrcode library o API externa)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  
  return qrUrl;
};

/**
 * Obtener información del ambiente actual desde el backend
 */
export const getDianEnvironmentInfo = async () => {
  try {
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8081').replace(/\/api$/, '');
    const response = await axios.get(`${API_URL}/api/dian/environment-info`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo info del ambiente:', error);
    return {
      environment: 'mock',
      provider: 'Siigo (Mock)'
    };
  }
};
