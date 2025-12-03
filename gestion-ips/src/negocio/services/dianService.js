/**
 * dianService.js
 * 
 * Servicio de integración con la DIAN para facturación electrónica
 * Ambiente de Habilitación (Pruebas) y Producción
 * 
 * IMPORTANTE:
 * - Para desarrollo: usar credenciales de prueba (ya configuradas)
 * - Para cliente real: cambiar solo la configuración en dianConfig
 */

import axios from 'axios';
import { configuracionApiService } from '../../data/services/configuracionApiService';

/**
 * Configuración DIAN por ambiente
 * DESARROLLO: Usar estas credenciales públicas de prueba
 * PRODUCCIÓN: Reemplazar con datos del cliente (NIT, certificado, resolución)
 */
const DIAN_ENVIRONMENTS = {
  // Ambiente de Habilitación (Pruebas) - USAR AHORA
  habilitacion: {
    name: 'Habilitación (Pruebas)',
    endpoint: 'https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc',
    wsdl: 'https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc?wsdl',
    validacionEndpoint: 'https://catalogo-vpfe-hab.dian.gov.co/Document/FindDocument',
    
    // Credenciales de prueba públicas DIAN
    testCredentials: {
      nit: '900373115',
      nitDV: '2',
      razonSocial: 'EMPRESA DE PRUEBAS DIAN',
      softwareID: '4e8e6b5e-5e5c-4e5e-8e5e-5e5e5e5e5e5e', // Ejemplo, debes solicitar el tuyo
      softwareSecurityCode: '693ff6b1a553a1671e0b8b8e414663f0860f6b7bec684bb3ec37e5866d1c522e92f4e0896dd9f3d20320c818', // Ejemplo
      pin: '12345', // PIN de prueba
      testMode: true
    }
  },
  
  // Ambiente de Producción - USAR CON CLIENTE REAL
  produccion: {
    name: 'Producción',
    endpoint: 'https://vpfe.dian.gov.co/WcfDianCustomerServices.svc',
    wsdl: 'https://vpfe.dian.gov.co/WcfDianCustomerServices.svc?wsdl',
    validacionEndpoint: 'https://catalogo-vpfe.dian.gov.co/Document/FindDocument',
    
    // Estos datos los proporciona el cliente después del registro DIAN
    productionCredentials: {
      nit: '', // NIT del cliente (IPS)
      nitDV: '', // Dígito de verificación
      razonSocial: '', // Razón social del cliente
      softwareID: '', // ID asignado por DIAN al registrar el software
      softwareSecurityCode: '', // Código de seguridad del software
      pin: '', // PIN asignado por DIAN
      certificadoDigital: '', // Ruta al certificado .pfx o .p12
      certificadoPassword: '', // Contraseña del certificado
      resolucionFacturacion: {
        numero: '', // Número de resolución DIAN
        fechaInicio: '', // Fecha inicio autorización
        fechaFin: '', // Fecha fin autorización
        prefijo: '', // Prefijo autorizado (ej: FM)
        rangoDesde: 0, // Número inicial autorizado
        rangoHasta: 0, // Número final autorizado
        claveTecnica: '' // Clave técnica de la resolución
      },
      testMode: false
    }
  }
};

/**
 * Configuración activa (cambia según ambiente)
 * IMPORTANTE: En producción, cargar desde base de datos
 */
let currentEnvironment = 'habilitacion'; // Cambiar a 'produccion' cuando esté listo
let cachedDianConfig = null;

/**
 * Obtener configuración DIAN actual
 * En desarrollo: usa credenciales de prueba
 * En producción: carga desde BD la configuración del cliente
 */
export const getDianConfig = async () => {
  // Si estamos en habilitación, usar credenciales de prueba
  if (currentEnvironment === 'habilitacion') {
    return {
      ...DIAN_ENVIRONMENTS.habilitacion,
      credentials: DIAN_ENVIRONMENTS.habilitacion.testCredentials
    };
  }
  
  // En producción, intentar cargar desde BD
  if (cachedDianConfig) return cachedDianConfig;
  
  try {
    const config = await configuracionApiService.getConfiguracionByClave('DIAN_CONFIG');
    if (config && config.jsonData) {
      cachedDianConfig = {
        ...DIAN_ENVIRONMENTS.produccion,
        credentials: config.jsonData
      };
      return cachedDianConfig;
    }
  } catch (error) {
    console.error('Error cargando configuración DIAN:', error);
  }
  
  // Si no hay configuración en BD, retornar producción vacía
  return {
    ...DIAN_ENVIRONMENTS.produccion,
    credentials: DIAN_ENVIRONMENTS.produccion.productionCredentials
  };
};

/**
 * Cambiar ambiente (habilitacion/produccion)
 * @param {string} environment - 'habilitacion' o 'produccion'
 */
export const setDianEnvironment = (environment) => {
  if (!['habilitacion', 'produccion'].includes(environment)) {
    throw new Error('Ambiente inválido. Use "habilitacion" o "produccion"');
  }
  currentEnvironment = environment;
  cachedDianConfig = null; // Limpiar cache
};

/**
 * Obtener ambiente actual
 */
export const getCurrentEnvironment = () => currentEnvironment;

/**
 * Enviar factura electrónica a la DIAN
 * @param {Object} facturaData - Datos de la factura
 * @param {string} xmlContent - XML UBL 2.1 firmado
 * @returns {Promise<Object>} Respuesta de la DIAN
 */
export const enviarFacturaDian = async (facturaData, xmlContent) => {
  try {
    const config = await getDianConfig();
    const { credentials, endpoint } = config;
    
    // Construir solicitud SOAP para DIAN
    const soapRequest = buildSoapRequest(facturaData, xmlContent, credentials);
    
    // Llamar a administrative en el servidor de desarrollo a través del gateway
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8081').replace(/\/api$/, '');
    const response = await axios.post(`${API_URL}/api/dian/enviar-factura`, soapRequest, {
      params: {
        ambiente: currentEnvironment
      },
      headers: {
        'Content-Type': 'text/xml; charset=utf-8'
      },
      timeout: 60000 // 60 segundos timeout
    });
    
    // Parsear respuesta
    const result = parseDianResponse(response.data);
    
    return {
      success: result.isValid,
      cufe: result.cufe, // Código Único de Factura Electrónica
      qrCode: result.qrCode,
      xmlResponse: result.xmlResponse,
      statusCode: result.statusCode,
      statusDescription: result.statusDescription,
      validationErrors: result.errors || [],
      environment: currentEnvironment
    };
    
  } catch (error) {
    console.error('Error enviando factura a DIAN:', error);
    throw {
      success: false,
      error: error.message,
      details: error.response?.data || null
    };
  }
};

/**
 * Consultar estado de una factura en la DIAN
 * @param {string} cufe - Código Único de Factura Electrónica
 * @returns {Promise<Object>} Estado de la factura
 */
export const consultarEstadoFactura = async (cufe) => {
  try {
    const config = await getDianConfig();
    const { credentials } = config;
    
    // Construir solicitud SOAP para consultar estado
    const soapRequest = buildStatusRequest(cufe, credentials);
    
    // Llamar a administrative en el servidor de desarrollo a través del gateway
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8081').replace(/\/api$/, '');
    const response = await axios.post(`${API_URL}/api/dian/consultar-estado`, soapRequest, {
      params: {
        ambiente: currentEnvironment
      },
      headers: {
        'Content-Type': 'text/xml; charset=utf-8'
      },
      timeout: 30000
    });
    
    return {
      success: true,
      estado: response.data.status,
      cufe: cufe,
      detalles: response.data
    };
    
  } catch (error) {
    console.error('Error consultando estado en DIAN:', error);
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
 * Construir solicitud SOAP para la DIAN
 * @private
 */
const buildSoapRequest = (facturaData, xmlContent, credentials) => {
  // Convertir XML a Base64 (compatible con navegador)
  const xmlBase64 = btoa(unescape(encodeURIComponent(xmlContent)));
  
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:wcf="http://wcf.dian.colombia">
  <soap:Header/>
  <soap:Body>
    <wcf:SendBillSync>
      <wcf:fileName>${facturaData.numeroFactura}.xml</wcf:fileName>
      <wcf:contentFile>${xmlBase64}</wcf:contentFile>
      <wcf:testSetId>${credentials.softwareID}</wcf:testSetId>
    </wcf:SendBillSync>
  </soap:Body>
</soap:Envelope>`;
};

/**
 * Construir solicitud SOAP para consultar estado
 * @private
 */
const buildStatusRequest = (cufe, credentials) => {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:wcf="http://wcf.dian.colombia">
  <soap:Header/>
  <soap:Body>
    <wcf:GetStatus>
      <wcf:trackId>${cufe}</wcf:trackId>
    </wcf:GetStatus>
  </soap:Body>
</soap:Envelope>`;
};

/**
 * Parsear respuesta XML de la DIAN
 * @private
 */
const parseDianResponse = (xmlResponse) => {
  // Aquí deberías usar un parser XML real (xml2js, fast-xml-parser, etc.)
  // Por ahora retorno estructura básica
  
  try {
    // Buscar código CUFE en la respuesta
    const cufeMatch = xmlResponse.match(/<cbc:UUID[^>]*>([^<]+)<\/cbc:UUID>/);
    const statusMatch = xmlResponse.match(/<StatusCode>([^<]+)<\/StatusCode>/);
    const descriptionMatch = xmlResponse.match(/<StatusDescription>([^<]+)<\/StatusDescription>/);
    
    return {
      isValid: statusMatch && statusMatch[1] === '00',
      cufe: cufeMatch ? cufeMatch[1] : null,
      statusCode: statusMatch ? statusMatch[1] : null,
      statusDescription: descriptionMatch ? descriptionMatch[1] : null,
      xmlResponse: xmlResponse,
      qrCode: null // Se genera después con el CUFE
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Error parseando respuesta DIAN',
      xmlResponse: xmlResponse
    };
  }
};

/**
 * Generar código QR para la factura electrónica
 * @param {string} cufe - Código Único de Factura Electrónica
 * @param {Object} facturaData - Datos de la factura
 * @returns {string} URL del código QR
 */
export const generarCodigoQR = async (cufe, facturaData) => {
  const config = await getDianConfig();
  const { credentials } = config;
  
  // Datos para el QR según especificaciones DIAN
  const qrData = [
    `NumFac: ${facturaData.numeroFactura}`,
    `FecFac: ${facturaData.fechaEmision}`,
    `NitFac: ${credentials.nit}`,
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
 * Limpiar cache de configuración
 */
export const clearDianCache = () => {
  cachedDianConfig = null;
};

/**
 * Obtener información del ambiente actual
 */
export const getDianEnvironmentInfo = async () => {
  const config = await getDianConfig();
  return {
    environment: currentEnvironment,
    name: config.name,
    endpoint: config.endpoint,
    isTestMode: config.credentials.testMode || false,
    nit: config.credentials.nit,
    razonSocial: config.credentials.razonSocial
  };
};

export default {
  getDianConfig,
  setDianEnvironment,
  getCurrentEnvironment,
  enviarFacturaDian,
  consultarEstadoFactura,
  validarFacturaPreEnvio,
  generarCodigoQR,
  clearDianCache,
  getDianEnvironmentInfo
};
