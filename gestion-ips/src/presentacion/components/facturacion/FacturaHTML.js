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
 * @param {string} fechaFactura - Fecha de la factura
 * @returns {string} HTML del encabezado
 */
const generarEncabezadoHTML = (empresa, numeroFactura, fechaFactura) => {
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
            <strong>Fecha:</strong> ${fechaFactura ? formatDate(fechaFactura) : formatDate(new Date())}
          </p>
        </div>
      </div>
    </div>
  `;
};

/**
 * Genera sección de información del destinatario
 * @param {Object} cliente - Información del cliente/destinatario
 * @param {string} tipoDestinatario - Tipo de destinatario (PACIENTE o ENTIDAD)
 * @returns {string} HTML con información del destinatario
 */
const generarDestinatarioHTML = (cliente, tipoDestinatario) => {
  const isPaciente = tipoDestinatario === 'PACIENTE';
  const badgeColor = isPaciente ? '#22b8cf' : '#228be6';
  const badgeIcon = isPaciente ? '👤' : '🏢';
  const badgeText = isPaciente ? 'Paciente' : 'Entidad';

  if (isPaciente) {
    // Información de Paciente (Persona Natural)
    return `
      <div class="destinatario-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 12px; font-weight: 600; color: #495057;">Información del Destinatario</h3>
          <span class="tipo-badge" style="background: ${badgeColor};">${badgeIcon} ${badgeText}</span>
        </div>
        <div class="destinatario-grid">
          <div class="destinatario-item">
            <span class="destinatario-label">Nombre Completo</span>
            <span class="destinatario-value">${cliente.nombreCompleto || 'N/A'}</span>
          </div>
          <div class="destinatario-item">
            <span class="destinatario-label">Tipo y Número de Documento</span>
            <span class="destinatario-value">${cliente.tipoDocumento || 'CC'}: ${cliente.numeroDocumento || 'N/A'}</span>
          </div>
          <div class="destinatario-item">
            <span class="destinatario-label">Dirección</span>
            <span class="destinatario-value">${cliente.direccion || 'N/A'}</span>
          </div>
          <div class="destinatario-item">
            <span class="destinatario-label">Ciudad / Departamento</span>
            <span class="destinatario-value">${cliente.ciudad || 'N/A'}${cliente.departamento ? ` / ${cliente.departamento}` : ''}</span>
          </div>
          <div class="destinatario-item">
            <span class="destinatario-label">Teléfono</span>
            <span class="destinatario-value">${cliente.telefono || 'N/A'}</span>
          </div>
          <div class="destinatario-item">
            <span class="destinatario-label">Email</span>
            <span class="destinatario-value">${cliente.email || 'N/A'}</span>
          </div>
        </div>
      </div>
    `;
  } else {
    // Información de Entidad (Persona Jurídica)
    const contactoHtml = (cliente.nombreContacto || cliente.cargoContacto) ? `
      <div style="border-top: 1px solid #e9ecef; margin-top: 10px; padding-top: 10px;">
        <div style="text-align: center; margin-bottom: 8px; font-size: 10px; color: #868e96; font-weight: 600;">
          INFORMACIÓN DE CONTACTO
        </div>
        <div class="destinatario-grid">
          ${cliente.nombreContacto ? `
            <div class="destinatario-item">
              <span class="destinatario-label">Nombre del Contacto</span>
              <span class="destinatario-value">${cliente.nombreContacto}</span>
            </div>
          ` : ''}
          ${cliente.cargoContacto ? `
            <div class="destinatario-item">
              <span class="destinatario-label">Cargo</span>
              <span class="destinatario-value">${cliente.cargoContacto}</span>
            </div>
          ` : ''}
        </div>
      </div>
    ` : '';

    return `
      <div class="destinatario-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 12px; font-weight: 600; color: #495057;">Información del Destinatario</h3>
          <span class="tipo-badge" style="background: ${badgeColor};">${badgeIcon} ${badgeText}</span>
        </div>
        <div class="destinatario-grid">
          <div class="destinatario-item">
            <span class="destinatario-label">Razón Social</span>
            <span class="destinatario-value" style="font-weight: 600;">${cliente.razonSocial || cliente.nombreCompleto || 'N/A'}</span>
          </div>
          <div class="destinatario-item">
            <span class="destinatario-label">NIT</span>
            <span class="destinatario-value">${cliente.numeroDocumento || 'N/A'}${cliente.digitoVerificacion ? `-${cliente.digitoVerificacion}` : ''}</span>
          </div>
          <div class="destinatario-item">
            <span class="destinatario-label">Dirección</span>
            <span class="destinatario-value">${cliente.direccion || 'N/A'}</span>
          </div>
          <div class="destinatario-item">
            <span class="destinatario-label">Ciudad / Departamento</span>
            <span class="destinatario-value">${cliente.ciudad || 'N/A'}${cliente.departamento ? ` / ${cliente.departamento}` : ''}</span>
          </div>
          <div class="destinatario-item">
            <span class="destinatario-label">Teléfono</span>
            <span class="destinatario-value">${cliente.telefono || 'N/A'}</span>
          </div>
          <div class="destinatario-item">
            <span class="destinatario-label">Email</span>
            <span class="destinatario-value">${cliente.email || 'N/A'}</span>
          </div>
        </div>
        ${contactoHtml}
      </div>
    `;
  }
};

/**
 * Genera sección de información de pago
 * @param {string} formaPago - Forma de pago
 * @param {string} medioPago - Medio de pago
 * @param {string} observaciones - Observaciones de pago
 * @returns {string} HTML con información de pago
 */
const generarInfoPagoHTML = (formaPago, medioPago, observaciones) => {
  if (!formaPago && !medioPago) return '';

  return `
    <div class="info-pago-box">
      <h3 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; color: #495057;">💳 Información de Pago</h3>
      <div class="destinatario-grid" style="grid-template-columns: repeat(${observaciones ? '3' : '2'}, 1fr);">
        ${formaPago ? `
          <div class="destinatario-item">
            <span class="destinatario-label">Forma de Pago</span>
            <span class="pago-badge" style="background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;">${formaPago}</span>
          </div>
        ` : ''}
        ${medioPago ? `
          <div class="destinatario-item">
            <span class="destinatario-label">Medio de Pago</span>
            <span class="pago-badge" style="background: #fff9db; color: #947600; border: 1px solid #ffe066;">${medioPago}</span>
          </div>
        ` : ''}
        ${observaciones ? `
          <div class="destinatario-item" style="grid-column: span ${formaPago && medioPago ? '3' : '2'};">
            <span class="destinatario-label">Observaciones</span>
            <span class="destinatario-value">${observaciones}</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
};

/**
 * Genera tabla de servicios/procedimientos
 * @param {Array} items - Lista de citas o servicios facturados
 * @returns {string} HTML con tabla de servicios
 */
const generarTablaServiciosHTML = (items) => {
  console.log('🖨️ generarTablaServiciosHTML - Items recibidos:', items);
  
  if (!items || items.length === 0) {
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
            <tr>
              <td colspan="7" style="text-align: center; padding: 20px; color: #868e96;">
                No hay servicios registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }
  
  const filas = items.map((item, index) => {
    // Manejar ambas estructuras: servicios (nueva) y citas (antigua)
    const valor = item.valorTotal || item.valorUnitario || item.valor || 0;
    const paciente = item.paciente || {};
    const nombrePaciente = typeof paciente === 'string' ? paciente : (paciente.nombre || 'N/A');
    const documentoPaciente = typeof paciente === 'string' ? 'N/A' : (paciente.documento || 'N/A');
    const tipoDocPaciente = typeof paciente === 'string' ? 'CC' : (paciente.tipoDocumento || 'CC');
    
    const medico = item.medico || {};
    const nombreMedico = typeof medico === 'string' ? medico : (medico.nombre || 'N/A');
    
    const descripcion = item.descripcion || item.procedimiento || 'Consulta Médica';
    const codigoCups = item.codigoCups || 'N/A';
    const fechaAtencion = item.fechaAtencion || new Date().toISOString();
    const cantidad = item.cantidad || 1;
    
    return `
      <tr>
        <td style="text-align: center;">${index + 1}</td>
        <td>
          <div style="font-weight: 600; font-size: 10px; margin-bottom: 2px;">${nombrePaciente}</div>
          <div style="font-size: 9px; color: #868e96;">Doc: ${tipoDocPaciente} ${documentoPaciente}</div>
        </td>
        <td>
          <div class="service-desc">${descripcion}</div>
          <div class="service-code">Código CUPS: ${codigoCups}</div>
        </td>
        <td>
          <div style="font-size: 10px;">${nombreMedico}</div>
          <div class="service-code">${formatDateShort(fechaAtencion)}</div>
        </td>
        <td style="text-align: center;">${cantidad}</td>
        <td style="text-align: right; font-family: monospace;">${formatCurrency(valor)}</td>
        <td style="text-align: right; font-weight: 600; font-family: monospace;">${formatCurrency(valor * cantidad)}</td>
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
 * @param {Object} datosBancarios - Información bancaria de la IPS
 * @returns {string} HTML con notas y términos
 */
const generarNotasHTML = (facturaData, datosBancarios = {}) => {
  
  return `
    <div class="notes">
      <div class="note-box payment-box">
        <h4>💳 DATOS BANCARIOS PARA TRANSFERENCIAS</h4>
        <p>
          <strong>Banco:</strong> ${datosBancarios.banco || 'N/A'} | <strong>${datosBancarios.tipoCuenta || 'Cuenta'}:</strong> ${datosBancarios.numeroCuenta || 'N/A'}<br>
          <strong>Nequi:</strong> ${datosBancarios.nequi || 'N/A'} | <strong>Daviplata:</strong> ${datosBancarios.daviplata || 'N/A'}
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
 * @param {Object} empresa - Información de la empresa/IPS (requerido)
 * @returns {string} HTML completo listo para imprimir
 */
export const generarFacturaHTML = (factura, facturaData = {}, empresa = null) => {
  // Validar que se proporcione la información de la empresa
  if (!empresa) {
    throw new Error('La información de la empresa es requerida. Use el hook useIpsConfig para obtenerla.');
  }
  
  const empresaInfo = empresa;

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
  console.log('🖨️ FacturaHTML - Factura:', factura);
  console.log('🖨️ FacturaHTML - DatosFactura:', datosFactura);
  
  const numeroFactura = datosFactura.numeroFactura || `FM-${factura.id || '0000'}`;
  const fechaFactura = datosFactura.fechaFactura || datosFactura.fecha || factura.fecha;
  
  // Buscar citas/servicios en diferentes propiedades
  const citas = datosFactura.servicios || datosFactura.citas || [];
  console.log('🖨️ FacturaHTML - Servicios/Citas encontrados:', citas);
  
  const total = datosFactura.total || 0;
  const subtotal = total; // En servicios de salud generalmente no hay IVA
  
  // Información del destinatario
  const tipoDestinatario = datosFactura.tipoDestinatario || 'PACIENTE';
  const cliente = datosFactura.cliente || {};
  
  // Información de pago
  const formaPago = datosFactura.formaPago || '';
  const medioPago = datosFactura.medioPago || '';
  const observaciones = datosFactura.observaciones || '';

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
      .destinatario-box {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 12px;
        margin: 15px 0;
      }
      .tipo-badge {
        color: white;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
      }
      .destinatario-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .destinatario-item {
        display: flex;
        flex-direction: column;
      }
      .destinatario-label {
        font-size: 9px;
        color: #868e96;
        margin-bottom: 2px;
      }
      .destinatario-value {
        font-size: 10px;
        font-weight: 500;
        color: #212529;
      }
      .info-pago-box {
        background: #fef3c7;
        border: 1px solid #fbbf24;
        border-radius: 4px;
        padding: 12px;
        margin: 15px 0;
      }
      .pago-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 3px;
        font-size: 9px;
        font-weight: 600;
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
      ${generarEncabezadoHTML(empresaInfo, numeroFactura, fechaFactura)}
      ${generarDestinatarioHTML(cliente, tipoDestinatario)}
      ${generarInfoPagoHTML(formaPago, medioPago, observaciones)}
      ${generarTablaServiciosHTML(citas)}
      ${generarTotalesHTML(subtotal, total)}
      ${generarNotasHTML(datosFactura, empresaInfo.datosBancarios)}
      ${generarFirmasHTML(empresaInfo)}
      ${generarPieHTML(empresaInfo)}

      <script>
        window.onload = function() {
          // No auto-print, user will print from modal
        };
      </script>
    </body>
    </html>
  `;

  return html;
};
