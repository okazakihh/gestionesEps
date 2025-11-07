/**
 * FacturaHTML.js
 * 
 * Módulo para generar HTML de facturas médicas colombianas listas para imprimir.
 * Cumple con normativa colombiana de facturación en salud: Resolución 3047/2008, Ley 1122/2007
 * 
 * Exports:
 * - generarFacturaHTML(factura, facturaData, empresa)
 */

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
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
        <div class="company-info">
          <h1 style="color: #228BE6; margin: 0 0 5px 0; font-size: 22px; font-weight: bold;">
            ${empresa.nombre}
          </h1>
          <p style="margin: 2px 0; color: #495057; font-size: 12px;">
            <strong>NIT:</strong> ${empresa.nit}
          </p>
          <p style="margin: 2px 0; color: #495057; font-size: 12px;">
            ${empresa.direccion}
          </p>
          <p style="margin: 2px 0; color: #495057; font-size: 12px;">
            <strong>Tel:</strong> ${empresa.telefono || 'N/A'} | <strong>Email:</strong> ${empresa.email || 'N/A'}
          </p>
        </div>
        <div class="invoice-info" style="text-align: right;">
          <div style="background: #228BE6; color: white; padding: 10px 20px; border-radius: 5px; margin-bottom: 10px;">
            <h2 style="margin: 0; font-size: 18px;">FACTURA</h2>
          </div>
          <p style="margin: 5px 0; font-size: 14px; font-weight: bold; color: #228BE6;">
            ${numeroFactura}
          </p>
          <p style="margin: 2px 0; font-size: 11px; color: #868e96;">
            <strong>Fecha:</strong> ${formatDate(new Date())}
          </p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Genera información del cliente/paciente
 * @param {Array} citas - Lista de citas facturadas
 * @returns {string} HTML con información del cliente
 */
const generarInfoClienteHTML = (citas) => {
  // Tomar información del primer paciente (normalmente todas las citas son del mismo)
  const primeraCita = citas[0] || {};
  const paciente = primeraCita.paciente || {};
  
  return `
    <div class="client-info">
      <h3 style="margin: 0 0 10px 0; color: #495057; font-size: 14px; border-bottom: 2px solid #228BE6; padding-bottom: 5px;">
        INFORMACIÓN DEL PACIENTE/CLIENTE
      </h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <p style="margin: 3px 0; font-size: 12px;">
            <strong>Nombre:</strong> ${paciente.nombre || 'N/A'}
          </p>
          <p style="margin: 3px 0; font-size: 12px;">
            <strong>Documento:</strong> ${paciente.tipoDocumento || 'CC'} ${paciente.documento || 'N/A'}
          </p>
        </div>
        <div>
          <p style="margin: 3px 0; font-size: 12px;">
            <strong>EPS:</strong> ${paciente.eps || 'PARTICULAR'}
          </p>
          <p style="margin: 3px 0; font-size: 12px;">
            <strong>Tipo de Atención:</strong> ${paciente.tipoAtencion || 'Particular'}
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
    
    return `
      <tr>
        <td style="text-align: center; padding: 10px; border: 1px solid #dee2e6;">${index + 1}</td>
        <td style="padding: 10px; border: 1px solid #dee2e6;">
          <strong>${cita.procedimiento || 'Consulta Médica'}</strong><br>
          <span style="font-size: 10px; color: #868e96;">
            Código CUPS: ${cita.codigoCups || 'N/A'}
          </span>
        </td>
        <td style="padding: 10px; border: 1px solid #dee2e6;">
          <span style="font-size: 11px;">${cita.medico?.nombre || 'N/A'}</span><br>
          <span style="font-size: 10px; color: #868e96;">
            ${formatDateShort(cita.fechaAtencion)}
          </span>
        </td>
        <td style="text-align: center; padding: 10px; border: 1px solid #dee2e6;">1</td>
        <td style="text-align: right; padding: 10px; border: 1px solid #dee2e6; font-family: monospace;">
          ${formatCurrency(valor)}
        </td>
        <td style="text-align: right; padding: 10px; border: 1px solid #dee2e6; font-weight: bold; font-family: monospace;">
          ${formatCurrency(valor)}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="services-table">
      <h3 style="margin: 20px 0 10px 0; color: #495057; font-size: 14px;">
        DETALLE DE SERVICIOS
      </h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background: #f1f3f5;">
            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: center; width: 50px;">Item</th>
            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Descripción del Servicio</th>
            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left; width: 180px;">Profesional / Fecha</th>
            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: center; width: 60px;">Cant.</th>
            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: right; width: 100px;">Valor Unit.</th>
            <th style="padding: 10px; border: 1px solid #dee2e6; text-align: right; width: 120px;">Valor Total</th>
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
    <div class="totals" style="margin-top: 20px;">
      <div style="display: flex; justify-content: flex-end;">
        <div style="width: 300px; border: 2px solid #dee2e6; border-radius: 5px; padding: 15px; background: #f8f9fa;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6;">
            <span style="font-size: 13px;"><strong>Subtotal:</strong></span>
            <span style="font-size: 13px; font-family: monospace;">${formatCurrency(subtotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dee2e6;">
            <span style="font-size: 13px;"><strong>IVA (0%):</strong></span>
            <span style="font-size: 13px; font-family: monospace;">${formatCurrency(0)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 0; background: #228BE6; margin: -15px -15px 0 -15px; padding: 15px; border-radius: 0 0 3px 3px;">
            <span style="font-size: 16px; font-weight: bold; color: white;">TOTAL A PAGAR:</span>
            <span style="font-size: 18px; font-weight: bold; color: white; font-family: monospace;">
              ${formatCurrency(total)}
            </span>
          </div>
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
    <div class="notes" style="margin-top: 30px;">
      ${observaciones ? `
      <div style="margin-bottom: 15px;">
        <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #495057;">OBSERVACIONES:</h4>
        <p style="margin: 0; font-size: 11px; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 3px;">
          ${observaciones}
        </p>
      </div>
      ` : ''}

      <div style="background: #e7f5ff; padding: 12px; border-radius: 5px; border: 1px solid #74c0fc; margin-bottom: 15px;">
        <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #1971c2;">💳 INFORMACIÓN DE PAGO</h4>
        <p style="margin: 3px 0; font-size: 10px; color: #495057;">
          <strong>Banco:</strong> Bancolombia | <strong>Cuenta Corriente:</strong> 123-456789-01<br>
          <strong>Nequi:</strong> 300 123 4567 | <strong>Daviplata:</strong> 301 234 5678
        </p>
      </div>

      <div style="background: #f8f9fa; padding: 12px; border-radius: 5px; border: 1px solid #dee2e6;">
        <h4 style="margin: 0 0 8px 0; font-size: 12px; color: #495057;">📋 TÉRMINOS Y CONDICIONES</h4>
        <ul style="margin: 5px 0; padding-left: 20px; font-size: 10px; line-height: 1.6; color: #6c757d;">
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
    <div class="signatures" style="margin-top: 40px; display: flex; justify-content: space-between; gap: 30px;">
      <div style="flex: 1; text-align: center;">
        <div style="border-top: 2px solid #000; width: 200px; margin: 60px auto 10px;"></div>
        <p style="margin: 0; font-size: 11px; font-weight: bold;">Firma Autorizada</p>
        <p style="margin: 2px 0; font-size: 10px; color: #6c757d;">${empresa.nombre}</p>
        <p style="margin: 2px 0; font-size: 9px; color: #6c757d;">Representante Legal</p>
      </div>
      <div style="flex: 1; text-align: center;">
        <div style="border-top: 2px solid #000; width: 200px; margin: 60px auto 10px;"></div>
        <p style="margin: 0; font-size: 11px; font-weight: bold;">Recibido por</p>
        <p style="margin: 2px 0; font-size: 10px; color: #6c757d;">Nombre y Firma</p>
        <p style="margin: 2px 0; font-size: 9px; color: #6c757d;">Fecha: ______________</p>
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
    <div class="footer" style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #dee2e6;">
      <div style="background: #f1f3f5; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
        <h5 style="margin: 0 0 5px 0; color: #495057; font-size: 10px;">⚖️ INFORMACIÓN LEGAL Y TRIBUTARIA</h5>
        <p style="margin: 0; font-size: 8px; line-height: 1.4; color: #6c757d;">
          <strong>Régimen Común - Responsable de IVA</strong><br>
          Esta factura se asimila en todos sus efectos a una letra de cambio según Art. 774 del Código de Comercio.<br>
          Factura electrónica válida según Resolución DIAN 000042 de 2020.<br>
          <strong>Normativa Aplicable:</strong> Ley 1122/2007 (Sistema General de Seguridad Social en Salud), 
          Resolución 3047/2008 (Facturación en Salud), Ley 1951/2019 (Factura Electrónica)
        </p>
      </div>

      <div style="text-align: center; padding-top: 10px;">
        <p style="margin: 0; font-size: 8px; color: #adb5bd;">
          ${empresa.nombre} - ${empresa.nit} | Generado el ${fechaGeneracion}
        </p>
        <p style="margin: 5px 0 0 0; font-size: 8px; color: #adb5bd;">
          Sistema de Gestión Médica - Versión 1.0
        </p>
      </div>
    </div>
  `;
};

/**
 * Genera HTML completo de la factura médica
 * @param {Object} factura - Objeto de la factura
 * @param {Object} facturaData - Datos parseados de la factura
 * @param {Object} empresa - Información de la empresa/IPS
 * @returns {string} HTML completo listo para imprimir
 */
export const generarFacturaHTML = (factura, facturaData = {}, empresa = {}) => {
  // Valores por defecto
  const empresaInfo = {
    nombre: empresa.nombre || 'GESTIÓN IPS',
    nit: empresa.nit || '900.123.456-7',
    direccion: empresa.direccion || 'Calle 123 #45-67, Bogotá D.C.',
    telefono: empresa.telefono || '(601) 234-5678',
    email: empresa.email || 'contacto@gestionips.com'
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
      @media print {
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 20mm; 
          font-size: 12px;
          color: #212529;
        }
        .header { 
          border-bottom: 3px solid #228BE6; 
          padding-bottom: 15px; 
          margin-bottom: 20px; 
        }
        .company-info h1 { 
          color: #228BE6; 
          font-size: 22px; 
          margin-bottom: 5px; 
        }
        .client-info { 
          background: #f8f9fa; 
          padding: 15px; 
          border-radius: 5px; 
          margin-bottom: 20px;
          border: 1px solid #dee2e6;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 20px;
        }
        th { 
          background: #f1f3f5; 
          padding: 10px; 
          text-align: left; 
          font-weight: 600;
          border: 1px solid #dee2e6;
        }
        td { 
          padding: 10px; 
          border: 1px solid #dee2e6;
        }
        .totals { 
          margin-top: 20px; 
        }
        .footer { 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 2px solid #dee2e6;
          font-size: 9px;
          color: #6c757d;
        }
        @page { 
          margin: 15mm; 
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
      ${generarInfoClienteHTML(citas)}
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
