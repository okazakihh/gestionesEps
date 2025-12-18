/**
 * siigoApiService.js
 * 
 * Servicio PROXY para la integración con Siigo API
 * Delega a siigoMockService (DEV) o siigoRealService (PROD) según configuración
 * 
 * Documentación: https://siigoapi.docs.apiary.io/
 * 
 * Capa: Datos
 */

import siigoMockService from './siigoMockService';
import siigoRealService from './siigoRealService';

/**
 * Obtener el modo actual de Siigo desde configuración
 * @returns {'DEV' | 'PROD'}
 */
function getSiigoMode() {
  try {
    // Intentar obtener desde localStorage (IPS_INFO es la clave usada por useIpsConfig)
    const config = localStorage.getItem('IPS_INFO');
    if (config) {
      const parsedConfig = JSON.parse(config);
      // El hook useIpsConfig guarda el jsonData directamente o como string
      const configData = typeof parsedConfig.jsonData === 'string' 
        ? JSON.parse(parsedConfig.jsonData) 
        : parsedConfig.jsonData || parsedConfig;
      
      return configData.siigoMode || 'DEV'; // Por defecto DEV (seguro)
    }
  } catch (error) {
    console.error('Error leyendo configuración de Siigo:', error);
  }
  return 'DEV'; // Fallback seguro
}

/**
 * Obtener el servicio activo según el modo
 * @returns {Object} - siigoMockService o siigoRealService
 */
function getActiveService() {
  const mode = getSiigoMode();
  const service = mode === 'PROD' ? siigoRealService : siigoMockService;
  
  console.log(`📡 Siigo API Mode: ${mode} ${mode === 'DEV' ? '🧪' : '🚀'}`);
  
  return service;
}

/**
 * Servicio de autenticación con Siigo (PROXY)
 */
export const siigoAuthService = {
  async generateToken(credentials) {
    return getActiveService().auth.getToken(credentials);
  },

  async refreshToken() {
    return getActiveService().auth.refreshToken();
  },

  isTokenValid() {
    return getActiveService().auth.isTokenValid();
  }
};

/**
 * Servicio para gestión de clientes/terceros (PROXY)
 */
export const siigoCustomersService = {
  async createCustomer(customerData) {
    return getActiveService().customers.create(customerData);
  },

  async getCustomer(customerId) {
    return getActiveService().customers.get(customerId);
  },

  async listCustomers(filters = {}) {
    return getActiveService().customers.list(filters);
  },

  async updateCustomer(customerId, customerData) {
    return getActiveService().customers.update(customerId, customerData);
  }
};

/**
 * Servicio para gestión de facturas de venta (PROXY)
 */
export const siigoInvoicesService = {
  async createInvoice(invoiceData) {
    return getActiveService().invoices.create(invoiceData);
  },

  async getInvoice(invoiceId) {
    return getActiveService().invoices.get(invoiceId);
  },

  async listInvoices(filters = {}) {
    return getActiveService().invoices.list(filters);
  },

  async updateInvoice(invoiceId, invoiceData) {
    return getActiveService().invoices.update(invoiceId, invoiceData);
  },

  async voidInvoice(invoiceId) {
    return getActiveService().invoices.void(invoiceId);
  },

  async deleteInvoice(invoiceId) {
    return getActiveService().invoices.delete(invoiceId);
  },

  async getInvoicePDF(invoiceId) {
    return getActiveService().invoices.getPDF(invoiceId);
  },

  async getInvoiceXML(invoiceId) {
    return getActiveService().invoices.getXML(invoiceId);
  },

  async sendInvoiceEmail(invoiceId, emails) {
    return getActiveService().invoices.sendEmail(invoiceId, emails);
  },

  async getInvoiceErrors(invoiceId) {
    return getActiveService().invoices.getErrors(invoiceId);
  },

  async createCreditNote(creditNoteData) {
    return getActiveService().invoices.createCreditNote(creditNoteData);
  },

  async createDebitNote(debitNoteData) {
    return getActiveService().invoices.createDebitNote(debitNoteData);
  },

  async getCreditNote(creditNoteId) {
    return getActiveService().invoices.getCreditNote(creditNoteId);
  },

  async getDebitNote(debitNoteId) {
    return getActiveService().invoices.getDebitNote(debitNoteId);
  },

  async getCreditNotePDF(creditNoteId) {
    return getActiveService().invoices.getCreditNotePDF(creditNoteId);
  },

  async getDebitNotePDF(debitNoteId) {
    return getActiveService().invoices.getDebitNotePDF(debitNoteId);
  }
};

/**
 * Servicio para gestión de productos (PROXY)
 */
export const siigoProductsService = {
  async createProduct(productData) {
    return getActiveService().products.createProduct(productData);
  },

  async getProduct(productId) {
    return getActiveService().products.get(productId);
  },

  async listProducts(filters = {}) {
    return getActiveService().products.list(filters);
  },

  async updateProduct(productId, productData) {
    return getActiveService().products.update(productId, productData);
  },

  async deleteProduct(productId) {
    return getActiveService().products.delete(productId);
  }
};

/**
 * Servicio para catálogos y configuración (PROXY)
 */
export const siigoCatalogsService = {
  async getDocumentTypes(type = null) {
    return getActiveService().catalogs.getDocumentTypes(type);
  },

  async getPaymentTypes(documentType = null) {
    return getActiveService().catalogs.getPaymentTypes(documentType);
  },

  async getTaxes() {
    return getActiveService().catalogs.getTaxes();
  },

  async getCostCenters() {
    return getActiveService().catalogs.getCostCenters();
  },

  async getUsers() {
    return getActiveService().catalogs.getUsers();
  },

  async getAccountGroups() {
    return getActiveService().catalogs.getAccountGroups();
  },

  async getWarehouses() {
    return getActiveService().catalogs.getWarehouses();
  }
};

export default {
  auth: siigoAuthService,
  customers: siigoCustomersService,
  invoices: siigoInvoicesService,
  products: siigoProductsService,
  catalogs: siigoCatalogsService,
  // Utilidades
  getSiigoMode,
  getActiveService
};
