/**
 * useSiigoIntegration.js
 * 
 * Hook personalizado para integración con Siigo API
 * Maneja autenticación, sincronización y operaciones con Siigo
 * 
 * Capa: Negocio
 */

import { useState, useEffect, useCallback } from 'react';
import siigoApiService from '../../../data/services/siigoApiService.js';
import siigoAdapters from '../../adapters/siigoAdapters.js';
import { ThemedSwal } from '../../utils/themedSwal.js';

export const useSiigoIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const [catalogs, setCatalogs] = useState({
    documentTypes: [],
    paymentTypes: [],
    taxes: [],
    sellers: [],
    costCenters: [],
    warehouses: []
  });

  /**
   * Verificar si hay una conexión activa con Siigo
   */
  useEffect(() => {
    const checkConnection = () => {
      const isValid = siigoApiService.auth.isTokenValid();
      setIsConnected(isValid);
    };

    checkConnection();
    // Verificar cada 5 minutos
    const interval = setInterval(checkConnection, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Autenticar con Siigo API
   */
  const authenticate = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      await siigoApiService.auth.generateToken(credentials);
      
      // Guardar credenciales para renovación automática
      localStorage.setItem('siigo_username', credentials.username);
      localStorage.setItem('siigo_access_key', credentials.access_key);
      
      setIsConnected(true);
      
      // Cargar catálogos iniciales
      await loadCatalogs();
      
      await ThemedSwal.success(
        'Conexión exitosa',
        'Conectado con Siigo correctamente'
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error autenticando con Siigo:', error);
      const errorInfo = siigoAdapters.adaptSiigoErrorToMessage(error);
      
      await ThemedSwal.error(
        errorInfo.titulo,
        errorInfo.mensaje
      );
      
      setIsConnected(false);
      return { success: false, error: errorInfo };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Desconectar de Siigo
   */
  const disconnect = useCallback(() => {
    localStorage.removeItem('siigo_access_token');
    localStorage.removeItem('siigo_token_timestamp');
    localStorage.removeItem('siigo_username');
    localStorage.removeItem('siigo_access_key');
    setIsConnected(false);
    setCatalogs({
      documentTypes: [],
      paymentTypes: [],
      taxes: [],
      sellers: [],
      costCenters: [],
      warehouses: []
    });
  }, []);

  /**
   * Cargar catálogos de Siigo
   */
  const loadCatalogs = useCallback(async () => {
    try {
      const [
        documentTypes,
        paymentTypes,
        taxes,
        sellers,
        costCenters,
        warehouses
      ] = await Promise.all([
        siigoApiService.catalogs.getDocumentTypes('FV'),
        siigoApiService.catalogs.getPaymentTypes('FV'),
        siigoApiService.catalogs.getTaxes(),
        siigoApiService.catalogs.getUsers(),
        siigoApiService.catalogs.getCostCenters(),
        siigoApiService.catalogs.getWarehouses()
      ]);

      setCatalogs({
        documentTypes: documentTypes.filter(dt => dt.active),
        paymentTypes: paymentTypes.filter(pt => pt.active),
        taxes: taxes.filter(t => t.active),
        sellers: sellers.filter(s => s.active),
        costCenters: costCenters.filter(cc => cc.active),
        warehouses: warehouses.filter(w => w.active)
      });

      return true;
    } catch (error) {
      console.error('Error cargando catálogos:', error);
      return false;
    }
  }, []);

  /**
   * Sincronizar paciente con Siigo (crear o actualizar cliente)
   */
  const syncPaciente = useCallback(async (paciente, ipsConfig) => {
    if (!isConnected) {
      throw new Error('No hay conexión con Siigo');
    }

    setIsLoading(true);
    try {
      // Adaptar paciente a formato Siigo
      const customerData = siigoAdapters.adaptPacienteToSiigoCustomer(
        paciente,
        ipsConfig
      );

      // Intentar buscar si ya existe
      const existingCustomers = await siigoApiService.customers.listCustomers({
        identification: paciente.numeroDocumento,
        branch_office: 0
      });

      let result;
      if (existingCustomers && existingCustomers.length > 0) {
        // Actualizar cliente existente
        const customerId = existingCustomers[0].id;
        result = await siigoApiService.customers.updateCustomer(
          customerId,
          customerData
        );
      } else {
        // Crear nuevo cliente
        result = await siigoApiService.customers.createCustomer(customerData);
      }

      return {
        success: true,
        data: result,
        customerId: result.id
      };
    } catch (error) {
      console.error('Error sincronizando paciente:', error);
      const errorInfo = siigoAdapters.adaptSiigoErrorToMessage(error);
      return {
        success: false,
        error: errorInfo
      };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  /**
   * Crear factura electrónica en Siigo
   */
  const createInvoice = useCallback(async (facturaData, options = {}) => {
    if (!isConnected) {
      throw new Error('No hay conexión con Siigo');
    }

    setIsLoading(true);
    try {
      // Validar factura antes de enviar
      const validation = siigoAdapters.validateFacturaForSiigo(facturaData);
      if (!validation.valida) {
        return {
          success: false,
          error: {
            titulo: 'Validación fallida',
            mensaje: 'La factura tiene errores',
            detalles: validation.errores
          }
        };
      }

      // Configuración por defecto
      const config = {
        documentTypeId: options.documentTypeId || catalogs.documentTypes[0]?.id,
        sellerId: options.sellerId || catalogs.sellers[0]?.id,
        paymentMethodId: options.paymentMethodId || catalogs.paymentTypes[0]?.id,
        electronicInvoice: options.electronicInvoice !== false,
        sendByEmail: options.sendByEmail || false
      };

      // Adaptar factura a formato Siigo
      const invoiceData = siigoAdapters.adaptFacturaToSiigoInvoice(
        facturaData,
        config
      );

      // Agregar idempotency key para evitar duplicados
      invoiceData.idempotency_key = options.idempotencyKey || 
        `INV-${facturaData.paciente.numeroDocumento}-${Date.now()}`;

      // Crear factura en Siigo
      const result = await siigoApiService.invoices.createInvoice(invoiceData);

      // Adaptar respuesta a formato de la aplicación
      const factura = siigoAdapters.adaptSiigoInvoiceToFactura(result);

      return {
        success: true,
        data: factura,
        siigoInvoiceId: result.id,
        cufe: result.stamp?.cufe,
        status: result.stamp?.status
      };
    } catch (error) {
      console.error('Error creando factura en Siigo:', error);
      const errorInfo = siigoAdapters.adaptSiigoErrorToMessage(error);
      return {
        success: false,
        error: errorInfo
      };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, catalogs]);

  /**
   * Consultar estado de factura en Siigo
   */
  const getInvoiceStatus = useCallback(async (siigoInvoiceId) => {
    if (!isConnected) {
      throw new Error('No hay conexión con Siigo');
    }

    try {
      const invoice = await siigoApiService.invoices.getInvoice(siigoInvoiceId);
      
      return {
        success: true,
        status: invoice.stamp?.status || 'Draft',
        cufe: invoice.stamp?.cufe,
        balance: invoice.balance,
        total: invoice.total,
        pdfUrl: invoice.public_url
      };
    } catch (error) {
      console.error('Error consultando factura:', error);
      return {
        success: false,
        error: siigoAdapters.adaptSiigoErrorToMessage(error)
      };
    }
  }, [isConnected]);

  /**
   * Descargar PDF de factura
   */
  const downloadInvoicePDF = useCallback(async (siigoInvoiceId, fileName) => {
    if (!isConnected) {
      throw new Error('No hay conexión con Siigo');
    }

    try {
      const pdfBlob = await siigoApiService.invoices.getInvoicePDF(siigoInvoiceId);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `factura-${siigoInvoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error descargando PDF:', error);
      return {
        success: false,
        error: siigoAdapters.adaptSiigoErrorToMessage(error)
      };
    }
  }, [isConnected]);

  /**
   * Enviar factura por email
   */
  const sendInvoiceByEmail = useCallback(async (siigoInvoiceId, emails) => {
    if (!isConnected) {
      throw new Error('No hay conexión con Siigo');
    }

    try {
      await siigoApiService.invoices.sendInvoiceEmail(siigoInvoiceId, emails);
      
      await ThemedSwal.success(
        'Correo enviado',
        'La factura ha sido enviada por email correctamente'
      );

      return { success: true };
    } catch (error) {
      console.error('Error enviando email:', error);
      const errorInfo = siigoAdapters.adaptSiigoErrorToMessage(error);
      
      await ThemedSwal.error(
        errorInfo.titulo,
        errorInfo.mensaje
      );

      return { success: false, error: errorInfo };
    }
  }, [isConnected]);

  /**
   * Sincronizar servicio/producto con Siigo
   */
  const syncServicio = useCallback(async (servicio, accountGroupId) => {
    if (!isConnected) {
      throw new Error('No hay conexión con Siigo');
    }

    try {
      const productData = siigoAdapters.adaptServicioToSiigoProduct(
        servicio,
        accountGroupId
      );

      // Buscar si existe
      const existingProducts = await siigoApiService.products.listProducts({
        code: servicio.codigoCups || servicio.codigo
      });

      let result;
      if (existingProducts && existingProducts.length > 0) {
        const productId = existingProducts[0].id;
        result = await siigoApiService.products.updateProduct(
          productId,
          productData
        );
      } else {
        result = await siigoApiService.products.createProduct(productData);
      }

      return {
        success: true,
        data: result,
        productId: result.id
      };
    } catch (error) {
      console.error('Error sincronizando servicio:', error);
      return {
        success: false,
        error: siigoAdapters.adaptSiigoErrorToMessage(error)
      };
    }
  }, [isConnected]);

  return {
    // Estado
    isConnected,
    isLoading,
    config,
    catalogs,

    // Métodos de autenticación
    authenticate,
    disconnect,
    loadCatalogs,

    // Métodos de sincronización
    syncPaciente,
    syncServicio,

    // Métodos de facturación
    createInvoice,
    getInvoiceStatus,
    downloadInvoicePDF,
    sendInvoiceByEmail
  };
};

export default useSiigoIntegration;
