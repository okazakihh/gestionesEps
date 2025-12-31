/**
 * siigoMockService.js
 * 
 * Servicio MOCK de Siigo para pruebas en desarrollo
 * Simula todas las operaciones de la API real sin hacer llamadas HTTP
 * 
 * Capa: Data (Mock)
 */

// Simular latencia de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generar CUFE falso pero realista
const generateMockCUFE = () => {
  const chars = 'ABCDEF0123456789';
  let cufe = '';
  for (let i = 0; i < 96; i++) {
    cufe += chars[Math.floor(Math.random() * chars.length)];
  }
  return cufe;
};

// Generar número de factura mock
const generateMockInvoiceNumber = () => {
  const prefix = 'FE';
  const number = Math.floor(Math.random() * 900000) + 100000;
  return `${prefix}-${number}`;
};

// Datos mock de catálogos
const MOCK_DOCUMENT_TYPES = [
  { id: 24834, name: 'Factura Electrónica', code: 'FE' },
  { id: 24835, name: 'Nota Crédito', code: 'NC' },
  { id: 24836, name: 'Nota Débito', code: 'ND' }
];

const MOCK_PAYMENT_TYPES = [
  { id: 1, name: 'Contado', code: 'CONTADO' },
  { id: 2, name: 'Crédito', code: 'CREDITO' },
  { id: 3, name: 'Transferencia', code: 'TRANSFER' }
];

const MOCK_TAXES = [
  { id: 13156, name: 'IVA 0%', percentage: 0, type: 'IVA' },
  { id: 13157, name: 'IVA 5%', percentage: 5, type: 'IVA' },
  { id: 13158, name: 'IVA 19%', percentage: 19, type: 'IVA' }
];

const MOCK_COST_CENTERS = [
  { id: 235, name: 'Centro Principal', code: 'PRINCIPAL' },
  { id: 236, name: 'Sucursal Norte', code: 'NORTE' },
  { id: 237, name: 'Sucursal Sur', code: 'SUR' }
];

const MOCK_WAREHOUSES = [
  { id: 1, name: 'Bodega Principal', code: 'PRINCIPAL' },
  { id: 2, name: 'Bodega Secundaria', code: 'SECUNDARIA' }
];

const MOCK_USERS = [
  { id: 1, name: 'Juan Pérez', username: 'jperez', email: 'juan.perez@ips.com', active: true },
  { id: 2, name: 'María García', username: 'mgarcia', email: 'maria.garcia@ips.com', active: true },
  { id: 3, name: 'Carlos López', username: 'clopez', email: 'carlos.lopez@ips.com', active: true }
];

/**
 * Servicio Mock de Siigo
 */
export const siigoMockService = {
  /**
   * Mock de operaciones de clientes
   */
  customers: {
    /**
     * Crear cliente (mock)
     */
    create: async (clienteData) => {
      await delay(800); // Simular latencia de red
      
      const mockId = `MOCK-CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      return {
        id: mockId,
        identification: clienteData.identification,
        check_digit: clienteData.check_digit || '',
        name: clienteData.name,
        commercial_name: clienteData.commercial_name || '',
        person_type: clienteData.person_type || 'Person',
        id_type: clienteData.id_type || 'CC',
        branch_office: clienteData.branch_office || 0,
        status: 'Active',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    },

    /**
     * Obtener cliente por ID (mock)
     */
    get: async (customerId) => {
      await delay(500);
      
      return {
        id: customerId,
        identification: '1234567890',
        name: ['Cliente', 'Mock'],
        status: 'Active',
        active: true
      };
    },

    /**
     * Listar clientes (mock)
     */
    list: async () => {
      await delay(600);
      
      return {
        results: [
          {
            id: 'MOCK-CUST-001',
            identification: '1234567890',
            name: ['Juan', 'Pérez'],
            status: 'Active'
          },
          {
            id: 'MOCK-CUST-002',
            identification: '9876543210',
            name: ['María', 'García'],
            status: 'Active'
          }
        ],
        pagination: {
          page: 1,
          page_size: 25,
          total_results: 2
        }
      };
    }
  },

  /**
   * Mock de operaciones de facturas
   */
  invoices: {
    /**
     * Crear factura (mock)
     */
    create: async (facturaData) => {
      await delay(1500); // Simular proceso DIAN
      
      const mockId = `MOCK-INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const mockNumber = generateMockInvoiceNumber();
      const mockCUFE = generateMockCUFE();
      
      // Calcular total
      const total = facturaData.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity) - (item.discount || 0);
      }, 0);
      
      return {
        id: mockId,
        number: mockNumber,
        name: mockNumber,
        document: {
          id: facturaData.document.id
        },
        date: facturaData.date,
        customer: facturaData.customer,
        cost_center: facturaData.cost_center,
        seller: facturaData.seller,
        observations: facturaData.observations || '',
        items: facturaData.items,
        payments: facturaData.payments,
        total: total,
        balance: 0,
        status: 'active',
        stamp: {
          cufe: mockCUFE,
          status: 'Aceptada',
          qr_code: `https://catalogo-vpfe.dian.gov.co/Document/FindDocument?documentKey=${mockCUFE}`,
          uuid: mockCUFE.substring(0, 36),
          issue_date: new Date().toISOString(),
          electronic_document: {
            cufe: mockCUFE
          }
        },
        pdf: {
          url: `https://api.siigo.com/mock/invoices/${mockId}/pdf`,
          base64: 'JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9UeXBlL1...' // Mock base64
        },
        mail: {
          sent: false
        },
        metadata: {
          created: new Date().toISOString(),
          last_updated: new Date().toISOString()
        }
      };
    },

    /**
     * Crear nota crédito (mock)
     */
    createCreditNote: async (notaData) => {
      await delay(1200);
      
      const mockId = `MOCK-NC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const mockNumber = `NC-${Math.floor(Math.random() * 900000) + 100000}`;
      const mockCUFE = generateMockCUFE();
      
      return {
        id: mockId,
        number: mockNumber,
        name: mockNumber,
        type: 'credit-note',
        document: {
          id: 24835
        },
        date: new Date().toISOString().split('T')[0],
        invoice_id: notaData.invoice_id,
        customer: notaData.customer,
        reason: notaData.reason || 'Devolución',
        items: notaData.items,
        total: notaData.total || 0,
        status: 'active',
        stamp: {
          cufe: mockCUFE,
          status: 'Aceptada',
          qr_code: `https://catalogo-vpfe.dian.gov.co/Document/FindDocument?documentKey=${mockCUFE}`,
          uuid: mockCUFE.substring(0, 36),
          issue_date: new Date().toISOString(),
          electronic_document: {
            cufe: mockCUFE
          }
        },
        pdf: {
          url: `https://api.siigo.com/mock/credit-notes/${mockId}/pdf`
        },
        metadata: {
          created: new Date().toISOString()
        }
      };
    },

    /**
     * Crear nota débito (mock)
     */
    createDebitNote: async (notaData) => {
      await delay(1200);
      
      const mockId = `MOCK-ND-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const mockNumber = `ND-${Math.floor(Math.random() * 900000) + 100000}`;
      const mockCUFE = generateMockCUFE();
      
      return {
        id: mockId,
        number: mockNumber,
        name: mockNumber,
        type: 'debit-note',
        document: {
          id: 24836
        },
        date: new Date().toISOString().split('T')[0],
        invoice_id: notaData.invoice_id,
        customer: notaData.customer,
        reason: notaData.reason || 'Intereses',
        items: notaData.items,
        total: notaData.total || 0,
        status: 'active',
        stamp: {
          cufe: mockCUFE,
          status: 'Aceptada',
          qr_code: `https://catalogo-vpfe.dian.gov.co/Document/FindDocument?documentKey=${mockCUFE}`,
          uuid: mockCUFE.substring(0, 36),
          issue_date: new Date().toISOString(),
          electronic_document: {
            cufe: mockCUFE
          }
        },
        pdf: {
          url: `https://api.siigo.com/mock/debit-notes/${mockId}/pdf`
        },
        metadata: {
          created: new Date().toISOString()
        }
      };
    },

    /**
     * Obtener factura por ID (mock)
     */
    get: async (invoiceId) => {
      await delay(500);
      
      return {
        id: invoiceId,
        number: generateMockInvoiceNumber(),
        status: 'active',
        total: 150000,
        stamp: {
          cufe: generateMockCUFE(),
          status: 'Aceptada'
        }
      };
    },

    /**
     * Descargar PDF (mock)
     */
    getPDF: async (invoiceId) => {
      await delay(800);
      
      return {
        url: `https://api.siigo.com/mock/invoices/${invoiceId}/pdf`,
        base64: 'JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9UeXBlL1...',
        filename: `factura-mock-${invoiceId}.pdf`
      };
    },

    /**
     * Enviar email (mock)
     */
    sendEmail: async (invoiceId, emailData) => {
      await delay(1000);
      
      return {
        success: true,
        sent: true,
        email: emailData.mail_to,
        sent_at: new Date().toISOString(),
        message: 'Email enviado exitosamente (simulado)'
      };
    }
  },

  /**
   * Mock de operaciones de productos
   */
  products: {
    /**
     * Crear producto (mock)
     */
    createProduct: async (productData) => {
      await delay(700);
      
      const mockId = `MOCK-PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      return {
        id: mockId,
        code: productData.code,
        name: productData.name,
        description: productData.description || '',
        type: productData.type || 'Product',
        status: 'active',
        prices: productData.prices || [],
        created_at: new Date().toISOString()
      };
    },

    /**
     * Listar productos (mock)
     */
    list: async () => {
      await delay(600);
      
      return {
        results: [
          {
            id: 'MOCK-PROD-001',
            code: 'SERV001',
            name: 'Consulta Médica General',
            type: 'Service'
          },
          {
            id: 'MOCK-PROD-002',
            code: 'SERV002',
            name: 'Consulta Especializada',
            type: 'Service'
          }
        ],
        pagination: {
          page: 1,
          page_size: 25,
          total_results: 2
        }
      };
    }
  },

  /**
   * Mock de catálogos
   */
  catalogs: {
    /**
     * Tipos de documento (mock)
     */
    getDocumentTypes: async () => {
      await delay(300);
      return MOCK_DOCUMENT_TYPES;
    },

    /**
     * Tipos de pago (mock)
     */
    getPaymentTypes: async () => {
      await delay(300);
      return MOCK_PAYMENT_TYPES;
    },

    /**
     * Impuestos (mock)
     */
    getTaxes: async () => {
      await delay(300);
      return MOCK_TAXES;
    },

    /**
     * Centros de costo (mock)
     */
    getCostCenters: async () => {
      await delay(300);
      return MOCK_COST_CENTERS;
    },

    /**
     * Usuarios/vendedores (mock)
     */
    getUsers: async () => {
      await delay(300);
      return MOCK_USERS;
    },

    /**
     * Bodegas (mock)
     */
    getWarehouses: async () => {
      await delay(300);
      return MOCK_WAREHOUSES;
    }
  },

  /**
   * Mock de autenticación
   */
  auth: {
    /**
     * Obtener token (mock)
     */
    getToken: async () => {
      await delay(400);
      
      return {
        access_token: `MOCK_TOKEN_${Date.now()}`,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'all'
      };
    },

    /**
     * Renovar token (mock)
     */
    refreshToken: async () => {
      await delay(300);
      
      return {
        access_token: `MOCK_TOKEN_${Date.now()}`,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'all'
      };
    },

    /**
     * Verificar si el token es válido (mock)
     * En modo DEV siempre retorna true
     */
    isTokenValid: () => {
      return true;
    }
  }
};

export default siigoMockService;
