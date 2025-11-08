/**
 * FacturaHTML.js
 * 
 * Módulo para generar HTML de facturas médicas colombianas listas para imprimir.
 * Cumple con normativa colombiana de facturación en salud: Resolución 3047/2008, Ley 1122/2007
 * 
 * Exports:
 * - generarFacturaHTML(factura, facturaData, empresa)
 */

import { ipsConfig } from '../../../negocio/utils/ipsConfig.js';

/**
 * Formatea moneda en pesos colombianos
 * @param {number} value - Valor numérico
 * @returns {string} Valor formateado
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0);
};

/**
 * Formatea fecha en formato colombiano
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Formatea fecha corta
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada corta
 */
const formatDateShort = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('es-CO');
  } catch {
    return 'N/A';
  }
};

/**
 * Genera el encabezado HTML para facturas
 * @param {Object} empresa - Información de la empresa
 * @param {string} numeroFactura - Número de la factura
 * @returns {string} HTML del encabezado
 */
const generarEncabezadoHTML = (empresa, numeroFactura) => {
  return `
    <div class="header">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div class="company-info">
          <h1>${empresa.nombre}</h1>
          <p><strong>NIT:</strong> ${empresa.nit}</p>
          <p>${empresa.direccion}</p>
          <p><strong>Tel:</strong> ${empresa.telefono || 'N/A'} | <strong>Email:</strong> ${empresa.email || 'N/A'}</p>
        </div>
        <div class="invoice-info">
          <div class="invoice-badge">
            <h2>FACTURA</h2>
          </div>
          <p class="invoice-number">${numeroFactura}</p>
          <p style="margin: 2px 0; font-size: 10px; color: #868e96;">
            <strong>Fecha:</strong> ${formatDate(new Date())}
          </p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Genera tabla de servicios/procedimientos
 * @param {Array} citas - Lista de citas facturadas
 * @returns {string} HTML con tabla de servicios
 */
const generarTablaServiciosHTML = (citas) => {
  const filas = citas.map((cita, index) => {
    const valor = cita.valor || 0;
    const paciente = cita.paciente || {};
    
    return `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>
          <div style="font-weight: 600; font-size: 10px; margin-bottom: 2px;">${paciente.nombre || 'N/A'}</div>
          <div style="font-size: 9px; color: #868e96;">Doc: ${paciente.tipoDocumento || 'CC'} ${paciente.documento || 'N/A'}</div>
        </td>
        <td>
          <div class="service-desc">${cita.procedimiento || 'Consulta Médica'}</div>
          <div class="service-code">Código CUPS: ${cita.codigoCups || 'N/A'}</div>
        </td>
        <td>
          <div style="font-size: 10px;">${cita.medico?.nombre || 'N/A'}</div>
          <div class="service-code">${formatDateShort(cita.fechaAtencion)}</div>
        </td>
        <td style="text-align: center;">1</td>
        <td style="text-align: right; font-family: monospace;">${formatCurrency(valor)}</td>
        <td style="text-align: right; font-weight: 600; font-family: monospace;">${formatCurrency(valor)}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="services-table">
      <h3>DETALLE DE SERVICIOS</h3>
      <table>
        <thead>
          <tr>
            <th style="text-align: center; width: 40px;">Item</th>
            <th style="text-align: left; width: 160px;">Paciente</th>
            <th style="text-align: left;">Descripción del Servicio</th>
            <th style="text-align: left; width: 140px;">Profesional / Fecha</th>
            <th style="text-align: center; width: 50px;">Cant.</th>
            <th style="text-align: right; width: 90px;">Valor Unit.</th>
            <th style="text-align: right; width: 100px;">Valor Total</th>
          </tr>
        </thead>
        <tbody>
          ${filas}
        </tbody>
      </table>
    </div>
  `;
};

/**
 * Genera resumen de totales
 * @param {number} subtotal - Subtotal antes de impuestos
 * @param {number} total - Total de la factura
 * @returns {string} HTML con resumen de totales
 */
const generarTotalesHTML = (subtotal, total) => {
  return `
    <div style="margin-top: 15px;">
      <div class="totals-box">
        <div class="total-row">
          <span><strong>Subtotal:</strong></span>
          <span style="font-family: monospace;">${formatCurrency(subtotal)}</span>
        </div>
        <div class="total-row">
          <span><strong>IVA (0%):</strong></span>
          <span style="font-family: monospace;">${formatCurrency(0)}</span>
        </div>
        <div class="total-final">
          <span class="total-final-label">TOTAL A PAGAR:</span>
          <span class="total-final-amount">${formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  `;
};

/**
 * Genera notas y términos
 * @param {Object} facturaData - Datos de la factura
 * @returns {string} HTML con notas y términos
 */
const generarNotasHTML = (facturaData) => {
  const observaciones = facturaData.observaciones || '';
  
  return `
    <div class="notes">
      ${observaciones ? `
      <div class="note-box obs-box">
        <h4>OBSERVACIONES:</h4>
        <p>${observaciones}</p>
      </div>
      ` : ''}

      <div class="note-box payment-box">
        <h4>💳 INFORMACIÓN DE PAGO</h4>
        <p>
          <strong>Banco:</strong> Bancolombia | <strong>Cuenta Corriente:</strong> 123-456789-01<br>
          <strong>Nequi:</strong> 300 123 4567 | <strong>Daviplata:</strong> 301 234 5678
        </p>
      </div>

      <div class="note-box terms-box">
        <h4>📋 TÉRMINOS Y CONDICIONES</h4>
        <ul>
          <li>Los servicios médicos prestados están sujetos a la regulación colombiana en salud</li>
          <li>Esta factura es válida como soporte de gastos médicos ante EPS y entidades tributarias</li>
          <li>Los servicios particulares deben ser pagados en un plazo máximo de 30 días</li>
          <li>Resolución de facturación DIAN: FM-001 del 01/01/2024 al 31/12/2024</li>
          <li>Para reclamaciones o inquietudes contactar en los próximos 5 días hábiles</li>
        </ul>
      </div>
    </div>
  `;
};

/**
 * Genera firmas
 * @param {Object} empresa - Información de la empresa
 * @returns {string} HTML con sección de firmas
 */
const generarFirmasHTML = (empresa) => {
  return `
    <div class="signatures">
      <div class="signature-line">
        <div class="line"></div>
        <p class="signature-name">Firma Autorizada</p>
        <p class="signature-role">${empresa.nombre}</p>
        <p class="signature-role">Representante Legal</p>
      </div>
      <div class="signature-line">
        <div class="line"></div>
        <p class="signature-name">Recibido por</p>
        <p class="signature-role">Nombre y Firma</p>
        <p class="signature-role">Fecha: ______________</p>
      </div>
    </div>
  `;
};

/**
 * Genera pie de página con información legal
 * @param {Object} empresa - Información de la empresa
 * @returns {string} HTML del pie de página
 */
const generarPieHTML = (empresa) => {
  const fechaGeneracion = new Date().toLocaleString('es-CO');
  
  return `
    <div class="footer">
      <div class="legal-box">
        <h5>⚖️ INFORMACIÓN LEGAL Y TRIBUTARIA</h5>
        <p>
          <strong>Régimen Común - Responsable de IVA</strong><br>
          Esta factura se asimila en todos sus efectos a una letra de cambio según Art. 774 del Código de Comercio.<br>
          Factura electrónica válida según Resolución DIAN 000042 de 2020.<br>
          <strong>Normativa Aplicable:</strong> Ley 1122/2007 (Sistema General de Seguridad Social en Salud), 
          Resolución 3047/2008 (Facturación en Salud), Ley 1951/2019 (Factura Electrónica)
        </p>
      </div>

      <div class="footer-center">
        <p>${empresa.nombre} - ${empresa.nit} | Generado el ${fechaGeneracion}</p>
        <p style="margin-top: 4px;">Sistema de Gestión Médica - Versión 1.0</p>
      </div>
    </div>
  `;
};

/**
 * Genera HTML completo de la factura médica
 * @param {Object} factura - Objeto de la factura
 * @param {Object} facturaData - Datos parseados de la factura
 * @param {Object} empresa - Información de la empresa/IPS (opcional, usa ipsConfig por defecto)
 * @returns {string} HTML completo listo para imprimir
 */
export const generarFacturaHTML = (factura, facturaData = {}, empresa = null) => {
  // Usar configuración centralizada de la IPS si no se proporciona empresa
  const empresaInfo = empresa || {
    nombre: ipsConfig.nombre,
    nit: ipsConfig.nit,
    direccion: `${ipsConfig.direccion}, ${ipsConfig.ciudad}`,
    telefono: ipsConfig.telefono,
    email: ipsConfig.email
  };

  // Parsear datos si vienen como JSON string
  let datosFactura = facturaData;
  if (typeof facturaData === 'string') {
    try {
      datosFactura = JSON.parse(facturaData);
    } catch (error) {
      console.error('Error parsing factura data:', error);
      datosFactura = {};
    }
  }

  // Extraer datos
  const numeroFactura = datosFactura.numeroFactura || `FM-${factura.id || '0000'}`;
  const citas = datosFactura.citas || [];
  const total = datosFactura.total || 0;
  const subtotal = total; // En servicios de salud generalmente no hay IVA

  // Estilos CSS
  const styles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        padding: 15mm; 
        font-size: 11px;
        color: #212529;
        line-height: 1.4;
      }
      .header { 
        border-bottom: 3px solid #228BE6; 
        padding-bottom: 12px; 
        margin-bottom: 15px; 
      }
      .company-info h1 { 
        color: #228BE6; 
        font-size: 20px; 
        margin-bottom: 4px;
        font-weight: 600;
      }
      .company-info p {
        margin: 2px 0;
        font-size: 10px;
        color: #495057;
      }
      .invoice-info {
        text-align: right;
      }
      .invoice-badge {
        background: #228BE6;
        color: white;
        padding: 8px 15px;
        border-radius: 4px;
        margin-bottom: 8px;
        display: inline-block;
      }
      .invoice-badge h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      .invoice-number {
        font-size: 13px;
        font-weight: 600;
        color: #228BE6;
        margin: 4px 0;
      }
      .services-table {
        margin: 15px 0;
      }
      .services-table h3 {
        margin: 0 0 8px 0;
        color: #495057;
        font-size: 12px;
        font-weight: 600;
      }
      table { 
        width: 100%; 
        border-collapse: collapse; 
        margin-bottom: 15px;
        font-size: 10px;
      }
      th { 
        background: #f1f3f5; 
        padding: 8px; 
        text-align: left; 
        font-weight: 600;
        border: 1px solid #dee2e6;
        font-size: 10px;
      }
      td { 
        padding: 8px; 
        border: 1px solid #dee2e6;
        vertical-align: top;
      }
      .service-desc {
        font-weight: 600;
        margin-bottom: 2px;
      }
      .service-code {
        font-size: 9px;
        color: #868e96;
      }
      .totals-box { 
        width: 280px;
        border: 2px solid #dee2e6;
        border-radius: 4px;
        padding: 12px;
        background: #f8f9fa;
        margin-left: auto;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid #dee2e6;
        font-size: 11px;
      }
      .total-final {
        background: #228BE6;
        margin: 8px -12px -12px -12px;
        padding: 12px;
        border-radius: 0 0 3px 3px;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .total-final-label {
        font-size: 13px;
        font-weight: 600;
      }
      .total-final-amount {
        font-size: 16px;
        font-weight: 700;
        font-family: monospace;
      }
      .notes {
        margin-top: 20px;
      }
      .note-box {
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 12px;
        font-size: 10px;
      }
      .note-box h4 {
        margin: 0 0 6px 0;
        font-size: 11px;
        font-weight: 600;
      }
      .note-box p, .note-box ul {
        margin: 4px 0;
        line-height: 1.5;
      }
      .note-box ul {
        padding-left: 18px;
      }
      .note-box li {
        margin: 3px 0;
      }
      .obs-box {
        background: #fff3cd;
        border-left: 4px solid #ffc107;
        border: 1px solid #ffe69c;
      }
      .payment-box {
        background: #e7f5ff;
        border: 1px solid #74c0fc;
      }
      .terms-box {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
      }
      .signatures {
        margin-top: 30px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 25px;
      }
      .signature-line {
        text-align: center;
      }
      .signature-line .line {
        border-top: 2px solid #000;
        width: 180px;
        margin: 50px auto 8px;
      }
      .signature-name {
        font-size: 10px;
        font-weight: 600;
        margin: 2px 0;
      }
      .signature-role {
        font-size: 9px;
        color: #6c757d;
        margin: 2px 0;
      }
      .footer { 
        margin-top: 25px; 
        padding-top: 15px; 
        border-top: 2px solid #dee2e6;
        font-size: 8px;
        color: #6c757d;
      }
      .legal-box {
        background: #f1f3f5;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 10px;
      }
      .legal-box h5 {
        margin: 0 0 4px 0;
        font-size: 9px;
        color: #495057;
        font-weight: 600;
      }
      .legal-box p {
        margin: 0;
        font-size: 8px;
        line-height: 1.4;
      }
      .footer-center {
        text-align: center;
        padding-top: 8px;
      }
      @media print {
        body { 
          padding: 12mm; 
        }
        @page { 
          margin: 10mm; 
          size: A4; 
        }
      }
    </style>
  `;

  // Construir HTML completo
  const html = `
    <!DOCTYPE html>
    <html lang="es-CO">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Factura ${numeroFactura}</title>
      ${styles}
    </head>
    <body>
      ${generarEncabezadoHTML(empresaInfo, numeroFactura)}
      ${generarTablaServiciosHTML(citas)}
      ${generarTotalesHTML(subtotal, total)}
      ${generarNotasHTML(datosFactura)}
      ${generarFirmasHTML(empresaInfo)}
      ${generarPieHTML(empresaInfo)}

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  return html;
};
