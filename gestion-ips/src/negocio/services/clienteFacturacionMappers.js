/**
 * Helpers para mapear datos de clientes en facturación
 * Capa: Negocio
 */

/**
 * Mapear tipo de documento del cliente al código de Siigo
 */
export const mapearTipoDocumentoASiigo = (tipoDocumento) => {
  const mapa = {
    'CC': '13',
    'NIT': '31',
    'CE': '22',
    'TI': '12',
    'PAS': '41'
  };
  return mapa[tipoDocumento] || '13';
};

/**
 * Mapear código de Siigo a tipo de documento del cliente
 */
export const mapearSiigoATipoDocumento = (codigoSiigo) => {
  const mapa = {
    '13': 'CC',
    '31': 'NIT',
    '22': 'CE',
    '12': 'TI',
    '41': 'PAS'
  };
  return mapa[codigoSiigo] || 'CC';
};

/**
 * Extraer datos del cliente para usar en factura
 */
export const extraerDatosCliente = (cliente) => {
  if (!cliente || !cliente.datos) return null;

  const datos = cliente.datos;
  
  return {
    tipoDestinatario: datos.tipoPersona === 'JURIDICA' ? 'ENTIDAD' : 'PACIENTE',
    tipoDocumento: mapearTipoDocumentoASiigo(datos.tipoDocumento),
    numeroDocumento: datos.numeroDocumento || '',
    digitoVerificacion: datos.digitoVerificacion || '',
    // Para PACIENTE
    nombres: datos.nombres || '',
    apellidos: datos.apellidos || '',
    // Para ENTIDAD
    razonSocial: datos.razonSocial || '',
    nombreContacto: datos.nombreContacto || '',
    cargoContacto: datos.cargoContacto || '',
    // Contacto
    email: datos.email || '',
    telefono: datos.telefono || '',
    direccion: datos.direccion?.calle || '',
    ciudad: datos.direccion?.ciudad || '',
    departamento: datos.direccion?.departamento || ''
  };
};

/**
 * Preparar datos iniciales para el formulario de nuevo cliente
 */
export const prepararDatosInicialCliente = (tipoDocumento, numeroDocumento, tipoDestinatario) => {
  return {
    datos: {
      tipoDocumento: mapearSiigoATipoDocumento(tipoDocumento),
      numeroDocumento: numeroDocumento,
      tipoPersona: tipoDestinatario === 'ENTIDAD' ? 'JURIDICA' : 'NATURAL',
      direccion: {
        calle: '',
        ciudad: '',
        departamento: '',
        codigoPostal: ''
      },
      informacionTributaria: {
        responsableIVA: false,
        granContribuyente: false,
        regimenFiscal: 'SIMPLIFICADO'
      }
    }
  };
};
