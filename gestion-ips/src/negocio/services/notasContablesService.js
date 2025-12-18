/**
 * notasContablesService.js
 * 
 * Servicio para gestión de notas crédito y débito
 * Maneja la lógica de negocio, validaciones y formateo
 * 
 * Capa: Negocio
 */

import siigoApiService from '../../data/services/siigoApiService';
import { facturacionApiService } from '../../data/services/pacientesApiService';
import Swal from 'sweetalert2';

/**
 * Motivos DIAN válidos para notas crédito
 */
export const MOTIVOS_CREDITO_DIAN = [
  { value: '1', label: 'Devolución parcial de bienes y/o servicios', description: 'Cuando el cliente devuelve parte del servicio' },
  { value: '2', label: 'Anulación de factura electrónica', description: 'Cancelación total de la factura' },
  { value: '3', label: 'Rebaja o descuento parcial o total', description: 'Aplicar descuento posterior' },
  { value: '4', label: 'Ajuste de precio', description: 'Corrección de valor facturado' },
  { value: '5', label: 'Otros', description: 'Otros motivos justificados' }
];

/**
 * Motivos DIAN válidos para notas débito
 */
export const MOTIVOS_DEBITO_DIAN = [
  { value: '1', label: 'Intereses', description: 'Intereses de mora por pago tardío' },
  { value: '2', label: 'Gastos por cobrar', description: 'Gastos adicionales no incluidos' },
  { value: '3', label: 'Cambio del valor', description: 'Ajuste de precio por aumento' },
  { value: '4', label: 'Otros', description: 'Otros motivos justificados' }
];

/**
 * Valida que los datos de una nota crédito sean correctos
 */
export const validarNotaCredito = (nota, facturaOriginal) => {
  const errores = [];

  // Validar que existe factura original
  if (!facturaOriginal || !facturaOriginal.id) {
    errores.push('Debe proporcionar una factura válida');
  }

  // Validar que la factura tenga ID de Siigo
  const facturaData = facturaOriginal.jsonData ? JSON.parse(facturaOriginal.jsonData) : {};
  if (!facturaData.siigoId) {
    errores.push('La factura original no tiene ID de Siigo. No se pueden crear notas sobre facturas no sincronizadas.');
  }

  // Validar motivo
  if (!nota.motivo || nota.motivo.trim() === '') {
    errores.push('El motivo de la nota es requerido');
  }

  // Validar motivo DIAN
  if (!nota.motivoDian) {
    errores.push('Debe seleccionar un motivo DIAN válido');
  }

  // Validar servicios
  if (!nota.serviciosAfectados || nota.serviciosAfectados.length === 0) {
    errores.push('Debe seleccionar al menos un servicio');
  }

  // Validar montos
  if (nota.total <= 0) {
    errores.push('El total de la nota debe ser mayor a cero');
  }

  // Validar que el total de la nota no exceda el total de la factura
  const totalFactura = facturaData.total || 0;
  if (nota.total > totalFactura) {
    errores.push(`El total de la nota ($${nota.total.toLocaleString()}) no puede ser mayor al total de la factura ($${totalFactura.toLocaleString()})`);
  }

  return errores;
};

/**
 * Valida que los datos de una nota débito sean correctos
 */
export const validarNotaDebito = (nota, facturaOriginal) => {
  const errores = [];

  // Validar que existe factura original
  if (!facturaOriginal || !facturaOriginal.id) {
    errores.push('Debe proporcionar una factura válida');
  }

  // Validar que la factura tenga ID de Siigo
  const facturaData = facturaOriginal.jsonData ? JSON.parse(facturaOriginal.jsonData) : {};
  if (!facturaData.siigoId) {
    errores.push('La factura original no tiene ID de Siigo');
  }

  // Validar motivo
  if (!nota.motivo || nota.motivo.trim() === '') {
    errores.push('El motivo de la nota es requerido');
  }

  // Validar motivo DIAN
  if (!nota.motivoDian) {
    errores.push('Debe seleccionar un motivo DIAN válido');
  }

  // Validar servicios
  if (!nota.serviciosAfectados || nota.serviciosAfectados.length === 0) {
    errores.push('Debe especificar los conceptos de la nota débito');
  }

  // Validar montos
  if (nota.total <= 0) {
    errores.push('El total de la nota debe ser mayor a cero');
  }

  return errores;
};

/**
 * Formatea una nota crédito para enviar a Siigo API
 */
export const formatearNotaCreditoParaSiigo = (nota, facturaOriginal) => {
  const facturaData = JSON.parse(facturaOriginal.jsonData || '{}');
  
  // Formatear items/servicios
  const items = nota.serviciosAfectados.map((servicio, index) => ({
    code: servicio.codigoCups || `SERV-${index + 1}`,
    description: servicio.descripcion,
    quantity: servicio.cantidad || 1,
    price: servicio.valorNota,
    discount: 0,
    taxes: []
  }));

  // Construir objeto para Siigo
  const siigoData = {
    document: {
      id: facturaData.tipoDocumentoSiigo || 29078 // ID tipo documento "Nota Crédito"
    },
    date: new Date().toISOString().split('T')[0],
    customer: {
      identification: facturaData.cliente?.numeroDocumento,
      branch_office: 0
    },
    cost_center: facturaData.centro_costo || 235, // Centro de costo default
    seller: facturaData.vendedor_id,
    observations: nota.motivo,
    invoice: {
      id: facturaData.siigoId // ID de la factura original en Siigo
    },
    reason: {
      id: parseInt(nota.motivoDian) // Motivo DIAN
    },
    items: items,
    payments: [
      {
        id: facturaData.formaPagoSiigoId || 5636, // Forma de pago
        value: nota.total,
        due_date: new Date().toISOString().split('T')[0]
      }
    ],
    idempotency_key: `CN-${facturaOriginal.id}-${Date.now()}`
  };

  return siigoData;
};

/**
 * Formatea una nota débito para enviar a Siigo API
 */
export const formatearNotaDebitoParaSiigo = (nota, facturaOriginal) => {
  const facturaData = JSON.parse(facturaOriginal.jsonData || '{}');
  
  // Formatear items/conceptos
  const items = nota.serviciosAfectados.map((concepto, index) => ({
    code: concepto.codigo || `CONC-${index + 1}`,
    description: concepto.descripcion,
    quantity: 1,
    price: concepto.valor,
    discount: 0,
    taxes: []
  }));

  // Construir objeto para Siigo
  const siigoData = {
    document: {
      id: facturaData.tipoDocumentoSiigo || 29079 // ID tipo documento "Nota Débito"
    },
    date: new Date().toISOString().split('T')[0],
    customer: {
      identification: facturaData.cliente?.numeroDocumento,
      branch_office: 0
    },
    cost_center: facturaData.centro_costo || 235,
    seller: facturaData.vendedor_id,
    observations: nota.motivo,
    invoice: {
      id: facturaData.siigoId // ID de la factura original
    },
    reason: {
      id: parseInt(nota.motivoDian)
    },
    items: items,
    payments: [
      {
        id: facturaData.formaPagoSiigoId || 5636,
        value: nota.total,
        due_date: new Date().toISOString().split('T')[0]
      }
    ],
    idempotency_key: `DN-${facturaOriginal.id}-${Date.now()}`
  };

  return siigoData;
};

/**
 * Crea una nota crédito
 */
export const crearNotaCredito = async (nota, facturaOriginal) => {
  try {
    // Validar datos
    const errores = validarNotaCredito(nota, facturaOriginal);
    if (errores.length > 0) {
      throw new Error(errores.join(', '));
    }

    // Formatear para Siigo
    const siigoData = formatearNotaCreditoParaSiigo(nota, facturaOriginal);

    // Enviar a Siigo
    const siigoResponse = await siigoApiService.invoices.createCreditNote(siigoData);

    // Guardar nota en base de datos local
    const notaParaDB = {
      facturaId: facturaOriginal.id,
      numeroFacturaOriginal: JSON.parse(facturaOriginal.jsonData).numeroFactura,
      tipoNota: 'CREDITO',
      motivo: nota.motivo,
      motivoDian: nota.motivoDian,
      serviciosAfectados: nota.serviciosAfectados,
      subtotal: nota.subtotal,
      total: nota.total,
      fechaEmision: new Date().toISOString(),
      observaciones: nota.observaciones || '',
      // Datos de Siigo
      siigoId: siigoResponse.id,
      numeroNota: siigoResponse.number,
      cufe: siigoResponse.stamp?.electronic_document?.cufe,
      estadoDian: siigoResponse.stamp?.status
    };

    // TODO: Guardar en tabla de notas (pendiente crear endpoint en backend)
    console.log('📝 Nota crédito creada:', notaParaDB);

    return {
      success: true,
      nota: notaParaDB,
      siigoResponse
    };

  } catch (error) {
    console.error('Error creando nota crédito:', error);
    throw error;
  }
};

/**
 * Crea una nota débito
 */
export const crearNotaDebito = async (nota, facturaOriginal) => {
  try {
    // Validar datos
    const errores = validarNotaDebito(nota, facturaOriginal);
    if (errores.length > 0) {
      throw new Error(errores.join(', '));
    }

    // Formatear para Siigo
    const siigoData = formatearNotaDebitoParaSiigo(nota, facturaOriginal);

    // Enviar a Siigo
    const siigoResponse = await siigoApiService.invoices.createDebitNote(siigoData);

    // Guardar nota en base de datos local
    const notaParaDB = {
      facturaId: facturaOriginal.id,
      numeroFacturaOriginal: JSON.parse(facturaOriginal.jsonData).numeroFactura,
      tipoNota: 'DEBITO',
      motivo: nota.motivo,
      motivoDian: nota.motivoDian,
      serviciosAfectados: nota.serviciosAfectados,
      subtotal: nota.subtotal,
      total: nota.total,
      fechaEmision: new Date().toISOString(),
      observaciones: nota.observaciones || '',
      // Datos de Siigo
      siigoId: siigoResponse.id,
      numeroNota: siigoResponse.number,
      cufe: siigoResponse.stamp?.electronic_document?.cufe,
      estadoDian: siigoResponse.stamp?.status
    };

    // TODO: Guardar en tabla de notas
    console.log('📝 Nota débito creada:', notaParaDB);

    return {
      success: true,
      nota: notaParaDB,
      siigoResponse
    };

  } catch (error) {
    console.error('Error creando nota débito:', error);
    throw error;
  }
};

/**
 * Calcula el nuevo saldo de una factura después de aplicar notas
 */
export const calcularSaldoFactura = (factura, notasCredito = [], notasDebito = []) => {
  const facturaData = JSON.parse(factura.jsonData || '{}');
  const totalFactura = facturaData.total || 0;

  // Sumar total de notas crédito (restan)
  const totalNotasCredito = notasCredito.reduce((sum, nota) => sum + (nota.total || 0), 0);

  // Sumar total de notas débito (suman)
  const totalNotasDebito = notasDebito.reduce((sum, nota) => sum + (nota.total || 0), 0);

  const saldoActual = totalFactura - totalNotasCredito + totalNotasDebito;

  return {
    totalOriginal: totalFactura,
    totalNotasCredito,
    totalNotasDebito,
    saldoActual,
    ajustado: totalNotasCredito > 0 || totalNotasDebito > 0
  };
};

export default {
  MOTIVOS_CREDITO_DIAN,
  MOTIVOS_DEBITO_DIAN,
  validarNotaCredito,
  validarNotaDebito,
  formatearNotaCreditoParaSiigo,
  formatearNotaDebitoParaSiigo,
  crearNotaCredito,
  crearNotaDebito,
  calcularSaldoFactura
};
