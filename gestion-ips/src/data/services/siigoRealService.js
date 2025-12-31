/**
 * siigoRealService.js
 * 
 * Servicio REAL de integración con Siigo API
 * Realiza peticiones HTTP reales a los endpoints de Siigo
 * 
 * Este servicio se usa en modo PRODUCCI�"N
 * 
 * Documentación: https://siigoapi.docs.apiary.io/
 * 
 * Capa: Datos
 */

import axios from 'axios';

// Configuración base de Siigo API
const SIIGO_API_BASE_URL = import.meta.env.VITE_SIIGO_API_URL || 'https://api.siigo.com/v1';
const SIIGO_AUTH_URL = import.meta.env.VITE_SIIGO_AUTH_URL || 'https://api.siigo.com/auth';

/**
 * Cliente HTTP configurado para Siigo API
 */
const siigoClient = axios.create({
  baseURL: SIIGO_API_BASE_URL,
  timeout: 120000, // 2 minutos (recomendado por Siigo)
  headers: {
    'Content-Type': 'application/json',
    'Partner-Id': import.meta.env.VITE_SIIGO_PARTNER_ID || 'IPS-GESTION'
  }
});

/**
 * Interceptor para agregar el token de autenticación
 */
siigoClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('siigo_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor para manejar errores de autenticación
 */
siigoClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos reintentado, renovar token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await auth.refreshToken();
        return siigoClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Manejador central de errores de Siigo API
 * @param {Error} error - Error de axios
 * @returns {Error} Error formateado
 */
function handleSiigoError(error) {
  if (error.response) {
    // Error de respuesta del servidor
    const { status, data } = error.response;
    
    let errorMessage = 'Error en Siigo API';
    let errorCode = 'SIIGO_ERROR';
    let errors = [];

    if (data && data.Errors && Array.isArray(data.Errors)) {
      errors = data.Errors;
      errorMessage = errors.map(e => e.Message).join(', ');
      errorCode = errors[0]?.Code || errorCode;
    } else if (data && data.message) {
      errorMessage = data.message;
    }

    const customError = new Error(errorMessage);
    customError.code = errorCode;
    customError.status = status;
    customError.errors = errors;
    customError.isSiigoError = true;

    return customError;
  } else if (error.request) {
    // Error de red
    const customError = new Error('No se pudo conectar con Siigo API');
    customError.code = 'NETWORK_ERROR';
    customError.isSiigoError = true;
    return customError;
  } else {
    // Error de configuración
    return error;
  }
}

/**
 * Servicio de autenticación con Siigo
 */
export const auth = {
  /**
   * Generar token de acceso
   * @param {Object} credentials - { username, access_key }
   * @returns {Promise<Object>} Token de acceso
   */
  async getToken(credentials) {
    try {
      const response = await axios.post(`${SIIGO_AUTH_URL}`, {
        username: credentials.username,
        access_key: credentials.access_key
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Partner-Id': import.meta.env.VITE_SIIGO_PARTNER_ID || 'IPS-GESTION'
        }
      });

      const { access_token } = response.data;
      
      // Guardar token (válido por 24 horas)
      localStorage.setItem('siigo_access_token', access_token);
      localStorage.setItem('siigo_token_timestamp', Date.now().toString());

      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error generando token Siigo:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Renovar token si ha expirado
   */
  async refreshToken() {
    const timestamp = localStorage.getItem('siigo_token_timestamp');
    const now = Date.now();
    
    // Si han pasado más de 23 horas, renovar token
    if (!timestamp || (now - parseInt(timestamp)) > 23 * 60 * 60 * 1000) {
      const username = localStorage.getItem('siigo_username');
      const access_key = localStorage.getItem('siigo_access_key');
      
      if (username && access_key) {
        return await this.getToken({ username, access_key });
      }
      
      throw new Error('No hay credenciales guardadas para renovar el token');
    }
  },

  /**
   * Verificar si el token está válido
   */
  isTokenValid() {
    const token = localStorage.getItem('siigo_access_token');
    const timestamp = localStorage.getItem('siigo_token_timestamp');
    
    if (!token || !timestamp) return false;
    
    const now = Date.now();
    const tokenAge = now - parseInt(timestamp);
    
    // Token válido si tiene menos de 24 horas
    return tokenAge < 24 * 60 * 60 * 1000;
  }
};

/**
 * Servicio para gestión de clientes/terceros
 */
export const customers = {
  /**
   * Crear cliente
   * @param {Object} customerData - Datos del cliente
   * @returns {Promise<Object>}
   */
  async create(customerData) {
    try {
      const response = await siigoClient.post('/customers', customerData);
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error creando cliente:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Consultar cliente por ID
   * @param {string} customerId - ID del cliente
   * @returns {Promise<Object>}
   */
  async get(customerId) {
    try {
      const response = await siigoClient.get(`/customers/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error consultando cliente:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Listar clientes con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Array>}
   */
  async list(filters = {}) {
    try {
      const response = await siigoClient.get('/customers', { params: filters });
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error listando clientes:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Actualizar cliente
   * @param {string} customerId - ID del cliente
   * @param {Object} customerData - Datos actualizados
   * @returns {Promise<Object>}
   */
  async update(customerId, customerData) {
    try {
      const response = await siigoClient.put(`/customers/${customerId}`, customerData);
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error actualizando cliente:', error);
      throw handleSiigoError(error);
    }
  }
};

/**
 * Servicio para gestión de facturas de venta
 */
export const invoices = {
  /**
   * Crear factura de venta
   * @param {Object} invoiceData - Datos de la factura
   * @returns {Promise<Object>}
   */
  async create(invoiceData) {
    try {
      const response = await siigoClient.post('/invoices', invoiceData, {
        headers: {
          'Idempotency-Key': invoiceData.idempotency_key || `INV-${Date.now()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error creando factura:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Consultar factura por ID
   * @param {string} invoiceId - ID de la factura
   * @returns {Promise<Object>}
   */
  async get(invoiceId) {
    try {
      const response = await siigoClient.get(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error consultando factura:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Listar facturas con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Array>}
   */
  async list(filters = {}) {
    try {
      const response = await siigoClient.get('/invoices', { params: filters });
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error listando facturas:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Editar factura
   * @param {string} invoiceId - ID de la factura
   * @param {Object} invoiceData - Datos actualizados
   * @returns {Promise<Object>}
   */
  async update(invoiceId, invoiceData) {
    try {
      const response = await siigoClient.put(`/invoices/${invoiceId}`, invoiceData);
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error actualizando factura:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Anular factura
   * @param {string} invoiceId - ID de la factura
   * @returns {Promise<Object>}
   */
  async void(invoiceId) {
    try {
      const response = await siigoClient.delete(`/invoices/${invoiceId}/void`);
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error anulando factura:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Borrar factura (solo facturas no enviadas a DIAN)
   * @param {string} invoiceId - ID de la factura
   * @returns {Promise<Object>}
   */
  async delete(invoiceId) {
    try {
      const response = await siigoClient.delete(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error borrando factura:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Obtener PDF de factura
   * @param {string} invoiceId - ID de la factura
   * @returns {Promise<Blob>}
   */
  async getPDF(invoiceId) {
    try {
      const response = await siigoClient.get(`/invoices/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error obteniendo PDF:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Obtener XML de factura electrónica
   * @param {string} invoiceId - ID de la factura
   * @returns {Promise<string>}
   */
  async getXML(invoiceId) {
    try {
      const response = await siigoClient.get(`/invoices/${invoiceId}/xml`);
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error obteniendo XML:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Enviar factura por email
   * @param {string} invoiceId - ID de la factura
   * @param {Array<string>} emails - Lista de emails
   * @returns {Promise<Object>}
   */
  async sendEmail(invoiceId, emails) {
    try {
      const response = await siigoClient.post(`/invoices/${invoiceId}/mail`, {
        emails
      });
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error enviando email:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Consultar errores de factura rechazada por DIAN
   * @param {string} invoiceId - ID de la factura
   * @returns {Promise<Object>}
   */
  async getErrors(invoiceId) {
    try {
      const response = await siigoClient.get(`/invoices/${invoiceId}/stamp-errors`);
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error consultando errores:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Crear nota crédito
   * @param {Object} creditNoteData - Datos de la nota crédito
   * @returns {Promise<Object>}
   */
  async createCreditNote(creditNoteData) {
    try {
      const response = await siigoClient.post('/credit-notes', creditNoteData, {
        headers: {
          'Idempotency-Key': creditNoteData.idempotency_key || `CN-${Date.now()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error creando nota crédito:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Crear nota débito
   * @param {Object} debitNoteData - Datos de la nota débito
   * @returns {Promise<Object>}
   */
  async createDebitNote(debitNoteData) {
    try {
      const response = await siigoClient.post('/debit-notes', debitNoteData, {
        headers: {
          'Idempotency-Key': debitNoteData.idempotency_key || `DN-${Date.now()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error creando nota débito:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Consultar nota crédito por ID
   * @param {string} creditNoteId - ID de la nota crédito
   * @returns {Promise<Object>}
   */
  async getCreditNote(creditNoteId) {
    try {
      const response = await siigoClient.get(`/credit-notes/${creditNoteId}`);
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error consultando nota crédito:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Consultar nota débito por ID
   * @param {string} debitNoteId - ID de la nota débito
   * @returns {Promise<Object>}
   */
  async getDebitNote(debitNoteId) {
    try {
      const response = await siigoClient.get(`/debit-notes/${debitNoteId}`);
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error consultando nota débito:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Obtener PDF de nota crédito
   * @param {string} creditNoteId - ID de la nota crédito
   * @returns {Promise<Blob>}
   */
  async getCreditNotePDF(creditNoteId) {
    try {
      const response = await siigoClient.get(`/credit-notes/${creditNoteId}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error obteniendo PDF de nota crédito:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Obtener PDF de nota débito
   * @param {string} debitNoteId - ID de la nota débito
   * @returns {Promise<Blob>}
   */
  async getDebitNotePDF(debitNoteId) {
    try {
      const response = await siigoClient.get(`/debit-notes/${debitNoteId}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error obteniendo PDF de nota débito:', error);
      throw handleSiigoError(error);
    }
  }
};

/**
 * Servicio para gestión de productos
 */
export const products = {
  /**
   * Crear producto
   * @param {Object} productData - Datos del producto
   * @returns {Promise<Object>}
   */
  async createProduct(productData) {
    try {
      const response = await siigoClient.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error creando producto:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Consultar producto por ID
   * @param {string} productId - ID del producto
   * @returns {Promise<Object>}
   */
  async get(productId) {
    try {
      const response = await siigoClient.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error consultando producto:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Listar productos con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Array>}
   */
  async list(filters = {}) {
    try {
      const response = await siigoClient.get('/products', { params: filters });
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error listando productos:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Actualizar producto
   * @param {string} productId - ID del producto
   * @param {Object} productData - Datos actualizados
   * @returns {Promise<Object>}
   */
  async update(productId, productData) {
    try {
      const response = await siigoClient.put(`/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error actualizando producto:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Borrar producto
   * @param {string} productId - ID del producto
   * @returns {Promise<Object>}
   */
  async delete(productId) {
    try {
      const response = await siigoClient.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error borrando producto:', error);
      throw handleSiigoError(error);
    }
  }
};

/**
 * Servicio para catálogos y configuración
 */
export const catalogs = {
  /**
   * Consultar tipos de documento
   * @param {string} type - Tipo: FV, FC, NC, RC, etc.
   * @returns {Promise<Array>}
   */
  async getDocumentTypes(type = null) {
    try {
      const params = type ? { type } : {};
      const response = await siigoClient.get('/document-types', { params });
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error consultando tipos de documento:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Consultar formas de pago
   * @param {string} documentType - Tipo de documento
   * @returns {Promise<Array>}
   */
  async getPaymentTypes(documentType = null) {
    try {
      const params = documentType ? { document_type: documentType } : {};
      const response = await siigoClient.get('/payment-types', { params });
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error consultando formas de pago:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Consultar impuestos
   * @returns {Promise<Array>}
   */
  async getTaxes() {
    try {
      const response = await siigoClient.get('/taxes');
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error consultando impuestos:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Consultar centros de costo
   * @returns {Promise<Array>}
   */
  async getCostCenters() {
    try {
      const response = await siigoClient.get('/cost-centers');
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error consultando centros de costo:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Consultar usuarios/vendedores
   * @returns {Promise<Array>}
   */
  async getUsers() {
    try {
      const response = await siigoClient.get('/users');
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error consultando usuarios:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Consultar grupos de inventario
   * @returns {Promise<Array>}
   */
  async getAccountGroups() {
    try {
      const response = await siigoClient.get('/account-groups');
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error consultando grupos de inventario:', error);
      throw handleSiigoError(error);
    }
  },

  /**
   * Consultar bodegas
   * @returns {Promise<Array>}
   */
  async getWarehouses() {
    try {
      const response = await siigoClient.get('/warehouses');
      return response.data;
    } catch (error) {
      console.error('❌ [PROD] Error consultando bodegas:', error);
      throw handleSiigoError(error);
    }
  }
};

export default {
  auth,
  customers,
  invoices,
  products,
  catalogs
};
