/**
 * siigoAdapters.js
 * 
 * Adaptadores para transformar datos entre el formato de la aplicación
 * y el formato requerido por Siigo API
 * 
 * Capa: Negocio
 */

/**
 * Adaptador para transformar paciente a cliente de Siigo
 * @param {Object} paciente - Datos del paciente
 * @param {Object} ipsConfig - Configuración de la IPS
 * @returns {Object} Cliente en formato Siigo
 */
export const adaptPacienteToSiigoCustomer = (paciente, ipsConfig) => {
  const nombres = paciente.nombres?.split(' ') || [''];
  const apellidos = paciente.apellidos?.split(' ') || [''];
  
  // Determinar tipo de persona
  const personType = paciente.tipoDocumento === '31' ? 'Company' : 'Person';
  
  // Nombre según tipo de persona
  const name = personType === 'Company' 
    ? [paciente.nombreCompleto || `${paciente.nombres} ${paciente.apellidos}`]
    : [paciente.nombres || '', paciente.apellidos || ''];

  return {
    type: 'Customer', // Cliente
    person_type: personType,
    id_type: paciente.tipoDocumento || '13', // 13: CC, 31: NIT
    identification: paciente.numeroDocumento,
    check_digit: paciente.digitoVerificacion || undefined,
    name: name.filter(n => n), // Remover vacíos
    commercial_name: paciente.nombreComercial || undefined,
    branch_office: 0,
    active: true,
    vat_responsible: false, // Pacientes generalmente no son responsables de IVA
    fiscal_responsibilities: [
      {
        code: 'R-99-PN' // No aplica - Otros
      }
    ],
    address: {
      address: paciente.direccion || 'No especificada',
      city: {
        country_code: ipsConfig?.pais || 'CO',
        state_code: ipsConfig?.departamento || '11',
        city_code: ipsConfig?.ciudad || '11001'
      },
      postal_code: paciente.codigoPostal || undefined
    },
    phones: paciente.telefono ? [
      {
        indicative: paciente.indicativo || '57',
        number: paciente.telefono,
        extension: paciente.extension || undefined
      }
    ] : [],
    contacts: [
      {
        first_name: paciente.nombres || 'Paciente',
        last_name: paciente.apellidos || '',
        email: paciente.email || undefined,
        phone: paciente.telefono ? {
          indicative: paciente.indicativo || '57',
          number: paciente.telefono
        } : undefined
      }
    ],
    comments: paciente.observaciones || undefined
  };
};

/**
 * Adaptador para transformar servicio/procedimiento a producto de Siigo
 * @param {Object} servicio - Datos del servicio
 * @param {number} accountGroupId - ID del grupo de inventario en Siigo
 * @returns {Object} Producto en formato Siigo
 */
export const adaptServicioToSiigoProduct = (servicio, accountGroupId) => {
  return {
    code: servicio.codigoCups || servicio.codigo,
    name: servicio.nombre || servicio.procedimiento,
    account_group: accountGroupId,
    type: 'Service', // Servicios médicos
    stock_control: false, // Servicios no manejan inventario
    active: true,
    tax_classification: 'Exempt', // Servicios de salud generalmente exentos
    tax_included: false,
    prices: [
      {
        currency_code: 'COP',
        price_list: [
          {
            position: 1,
            value: parseFloat(servicio.valor || 0)
          }
        ]
      }
    ],
    unit: '94', // Unidad
    unit_label: 'Unidad',
    reference: servicio.codigoCups || undefined,
    description: servicio.descripcion || servicio.nombre,
    barcode: servicio.codigoBarras || undefined
  };
};

/**
 * Adaptador para transformar factura de la aplicación a factura de Siigo
 * @param {Object} factura - Datos de la factura
 * @param {Object} config - Configuración adicional
 * @returns {Object} Factura en formato Siigo
 */
export const adaptFacturaToSiigoInvoice = (factura, config = {}) => {
  const {
    documentTypeId,
    sellerId,
    paymentMethodId,
    electronicInvoice = false,
    sendByEmail = false
  } = config;

  // Transformar items
  const items = factura.servicios.map(servicio => ({
    code: servicio.codigoCups || servicio.codigo,
    description: servicio.descripcion || servicio.nombre,
    quantity: servicio.cantidad || 1,
    price: parseFloat(servicio.valorUnitario || servicio.valor || 0),
    discount: parseFloat(servicio.descuento || 0),
    taxes: servicio.impuestos?.map(imp => ({
      id: imp.id
    })) || []
  }));

  // Calcular total
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.price - item.discount);
  }, 0);

  // Payments (formas de pago)
  const payments = [
    {
      id: paymentMethodId,
      value: subtotal,
      due_date: factura.fechaVencimiento || undefined
    }
  ];

  // Estructura base de la factura
  const invoiceData = {
    document: {
      id: documentTypeId
    },
    date: factura.fecha || new Date().toISOString().split('T')[0],
    customer: {
      identification: factura.paciente.numeroDocumento,
      branch_office: 0
    },
    seller: sellerId,
    items: items,
    payments: payments,
    observations: factura.observaciones || undefined,
    stamp: {
      send: electronicInvoice
    },
    mail: {
      send: sendByEmail
    }
  };

  // Si es factura del sector salud, agregar campos específicos
  if (factura.sectorSalud) {
    invoiceData.healthcare_company = {
      operation_type: 'SS-Recaudo', // Por defecto recaudo
      period_start: factura.periodoInicio || undefined,
      period_end: factura.periodoFin || undefined,
      copayment: parseFloat(factura.copago || 0) || undefined,
      coinsurance: parseFloat(factura.cuotaModeradora || 0) || undefined
    };
  }

  return invoiceData;
};

/**
 * Adaptador para transformar factura de Siigo a formato de la aplicación
 * @param {Object} siigoInvoice - Factura de Siigo
 * @returns {Object} Factura en formato de la aplicación
 */
export const adaptSiigoInvoiceToFactura = (siigoInvoice) => {
  return {
    id: siigoInvoice.id,
    numeroFactura: siigoInvoice.name,
    prefijo: siigoInvoice.prefix || '',
    consecutivo: siigoInvoice.number,
    fecha: siigoInvoice.date,
    paciente: {
      id: siigoInvoice.customer.id,
      numeroDocumento: siigoInvoice.customer.identification,
      sucursal: siigoInvoice.customer.branch_office
    },
    total: parseFloat(siigoInvoice.total || 0),
    saldo: parseFloat(siigoInvoice.balance || 0),
    servicios: siigoInvoice.items?.map(item => ({
      id: item.id,
      codigo: item.code,
      descripcion: item.description,
      cantidad: item.quantity,
      valorUnitario: item.price,
      descuento: item.discount?.value || 0,
      impuestos: item.taxes?.map(tax => ({
        id: tax.id,
        nombre: tax.name,
        porcentaje: tax.percentage,
        valor: tax.value
      })) || [],
      total: item.total
    })) || [],
    formasPago: siigoInvoice.payments?.map(payment => ({
      id: payment.id,
      nombre: payment.name,
      valor: payment.value,
      fechaVencimiento: payment.due_date
    })) || [],
    observaciones: siigoInvoice.observations || '',
    estado: siigoInvoice.stamp?.status || 'Draft',
    cufe: siigoInvoice.stamp?.cufe || null,
    urlPublica: siigoInvoice.public_url || null,
    fechaCreacion: siigoInvoice.metadata?.created || siigoInvoice.created,
    fechaActualizacion: siigoInvoice.last_updated
  };
};

/**
 * Adaptador para transformar cliente de Siigo a paciente
 * @param {Object} siigoCustomer - Cliente de Siigo
 * @returns {Object} Paciente en formato de la aplicación
 */
export const adaptSiigoCustomerToPaciente = (siigoCustomer) => {
  const isCompany = siigoCustomer.person_type === 'Company';
  
  let nombres = '';
  let apellidos = '';
  
  if (isCompany) {
    nombres = siigoCustomer.name[0] || '';
  } else {
    nombres = siigoCustomer.name[0] || '';
    apellidos = siigoCustomer.name[1] || '';
  }

  return {
    id: siigoCustomer.id,
    tipoDocumento: siigoCustomer.id_type.code,
    numeroDocumento: siigoCustomer.identification,
    digitoVerificacion: siigoCustomer.check_digit,
    nombres: nombres,
    apellidos: apellidos,
    nombreCompleto: isCompany ? nombres : `${nombres} ${apellidos}`,
    nombreComercial: siigoCustomer.commercial_name,
    direccion: siigoCustomer.address?.address,
    ciudad: siigoCustomer.address?.city?.city_name,
    departamento: siigoCustomer.address?.city?.state_name,
    pais: siigoCustomer.address?.city?.country_name,
    codigoPostal: siigoCustomer.address?.postal_code,
    telefono: siigoCustomer.phones?.[0]?.number,
    indicativo: siigoCustomer.phones?.[0]?.indicative,
    email: siigoCustomer.contacts?.[0]?.email,
    activo: siigoCustomer.active,
    observaciones: siigoCustomer.comments,
    fechaCreacion: siigoCustomer.created,
    fechaActualizacion: siigoCustomer.last_updated
  };
};

/**
 * Adaptador para error de Siigo a mensaje amigable
 * @param {Error} error - Error de Siigo
 * @returns {Object} Mensaje de error formateado
 */
export const adaptSiigoErrorToMessage = (error) => {
  if (!error.isSiigoError) {
    return {
      titulo: 'Error',
      mensaje: error.message,
      detalles: []
    };
  }

  const errorMessages = {
    'already_exists': 'El registro ya existe en Siigo',
    'parameter_required': 'Faltan campos obligatorios',
    'invalid_value': 'Valor inválido en uno de los campos',
    'invalid_total_payments': 'El total de las formas de pago no coincide con el total de la factura',
    'customer_settings': 'El cliente no tiene contactos configurados',
    'document_settings': 'Configuración del documento inválida',
    'invalid_identification': 'Número de identificación inválido',
    'unauthorized': 'Token de acceso inválido o expirado',
    'requests_limit': 'Se ha excedido el límite de peticiones (100 por minuto)',
    'NETWORK_ERROR': 'No se pudo conectar con Siigo. Verifique su conexión a internet.'
  };

  const mensaje = errorMessages[error.code] || error.message;
  
  return {
    titulo: 'Error en Siigo',
    mensaje: mensaje,
    codigo: error.code,
    estado: error.status,
    detalles: error.errors || []
  };
};

/**
 * Validar estructura de factura antes de enviar a Siigo
 * @param {Object} factura - Factura a validar
 * @returns {Object} { valida: boolean, errores: Array }
 */
export const validateFacturaForSiigo = (factura) => {
  const errores = [];

  // Validar paciente
  if (!factura.paciente?.numeroDocumento) {
    errores.push('El paciente debe tener número de documento');
  }

  // Validar servicios
  if (!factura.servicios || factura.servicios.length === 0) {
    errores.push('La factura debe tener al menos un servicio');
  }

  // Validar servicios con código CUPS
  factura.servicios?.forEach((servicio, index) => {
    if (!servicio.codigoCups && !servicio.codigo) {
      errores.push(`El servicio ${index + 1} debe tener código CUPS`);
    }
    if (!servicio.valor && !servicio.valorUnitario) {
      errores.push(`El servicio ${index + 1} debe tener valor`);
    }
  });

  // Validar fecha
  if (!factura.fecha) {
    errores.push('La factura debe tener fecha');
  }

  return {
    valida: errores.length === 0,
    errores
  };
};

export default {
  adaptPacienteToSiigoCustomer,
  adaptServicioToSiigoProduct,
  adaptFacturaToSiigoInvoice,
  adaptSiigoInvoiceToFactura,
  adaptSiigoCustomerToPaciente,
  adaptSiigoErrorToMessage,
  validateFacturaForSiigo
};
