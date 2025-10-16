/**
 * Componente para generación dinámica de PDFs de facturas
 * Presentation Layer - Components
 */
import React from 'react';

class FacturaPDFGenerator {
  // Función para formatear fecha
  formatDate(dateString) {
    if (!dateString) return 'N/A';

    try {
      let date;

      // Handle LocalDateTime serialized as array [year, month, day, hour, minute, second, nanosecond]
      if (Array.isArray(dateString) && dateString.length >= 6) {
        date = new Date(dateString[0], dateString[1] - 1, dateString[2], dateString[3], dateString[4], dateString[5]);
      } else if (typeof dateString === 'string') {
        if (dateString.includes('T')) {
          date = new Date(dateString);
        } else if (dateString.includes('-') && dateString.length === 10) {
          date = new Date(dateString + 'T00:00:00');
        } else {
          date = new Date(dateString);
        }
      } else if (dateString instanceof Date) {
        date = dateString;
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }

      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Error en fecha';
    }
  }

  // Función para generar el contenido HTML de la factura
  generateFacturaHTML(facturaData) {
    return `
      <html>
        <head>
          <title>Factura Médica - ${facturaData.numeroFactura}</title>
          <style>
            @media print {
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 11px; line-height: 1.4; }
              .header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; text-align: center; }
              .institution-info { background: #f0f9ff; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
              .factura-info { background: #f8fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 2px solid #e5e7eb; }
              .patient-info { background: #fef3c7; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #f59e0b; }
              .service-detail { border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
              .section { margin-bottom: 10px; }
              .section-title { font-weight: bold; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; font-size: 12px; }
              .field { margin-bottom: 5px; }
              .field-label { font-weight: bold; display: inline-block; min-width: 120px; color: #6b7280; }
              .footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #e5e7eb; font-size: 9px; color: #6b7280; }
              .signature { margin-top: 40px; text-align: center; }
              .signature-line { border-top: 1px solid #000; width: 200px; margin: 0 auto; margin-top: 40px; }
              .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
              .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
              .important-note { background: #fee2e2; border: 1px solid #fecaca; padding: 8px; border-radius: 3px; margin: 5px 0; }
              @page { margin: 1.5cm; size: A4; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f8f9fa; font-weight: bold; }
              .total-row { background-color: #f0f9ff; font-weight: bold; }
              .total-amount { color: #2563eb; font-size: 14px; }
            }
          </style>
        </head>
        <body>
          <!-- Institutional Header -->
          <div class="header">
            <div class="institution-info">
              <h1 style="color: #2563eb; margin: 0; font-size: 20px; font-weight: bold;">GESTIÓN IPS</h1>
              <p style="margin: 5px 0; color: #374151; font-size: 14px;">Institución Prestadora de Servicios de Salud</p>
              <p style="margin: 2px 0; color: #6b7280;">NIT: 901.234.567-8 • Dirección: Calle 123 # 45-67, Bogotá D.C.</p>
              <p style="margin: 2px 0; color: #6b7280;">Teléfonos: (601) 123-4567 • Email: info@ips.com.co</p>
            </div>
            <h2 style="margin: 10px 0; color: #1f2937; font-size: 16px;">FACTURA DE SERVICIOS MÉDICOS</h2>
            <p style="margin: 5px 0; color: #6b7280; font-weight: bold;">Factura No: ${facturaData.numeroFactura}</p>
            <p style="margin: 2px 0; color: #6b7280;">Fecha de Emisión: ${this.formatDate(facturaData.fechaEmision)}</p>
          </div>

          <!-- Estado de la Factura -->
          <div class="factura-info">
            <h3 style="margin-top: 0; color: #1f2937; font-size: 14px; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">ESTADO DE LA FACTURA</h3>
            <div class="grid-2">
              <div><strong>Estado:</strong> <span style="color: ${facturaData.estado === 'PAGADA' ? '#10B981' : '#F59E0B'}; font-weight: bold;">${facturaData.estado}</span></div>
              <div><strong>Total:</strong> <span style="color: #2563eb; font-weight: bold; font-size: 14px;">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(facturaData.total)}</span></div>
            </div>
          </div>

          <!-- Service Detail -->
          <div class="service-detail">
            <h3 style="margin-top: 0; color: #1f2937; font-size: 14px; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">DETALLE DE SERVICIOS PRESTADOS</h3>

            <table>
              <thead>
                <tr>
                  <th style="font-size: 10px;">Paciente</th>
                  <th style="font-size: 10px;">Médico</th>
                  <th style="font-size: 10px;">Procedimiento</th>
                  <th style="font-size: 10px;">Código CUPS</th>
                  <th style="font-size: 10px;">Fecha Atención</th>
                  <th style="text-align: right; font-size: 10px;">Valor</th>
                </tr>
              </thead>
              <tbody>
                ${facturaData.citas.map(cita => `
                  <tr>
                    <td style="font-size: 10px;">${cita.paciente.nombre}<br><small style="color: #6b7280; font-size: 9px;">Doc: ${cita.paciente.documento}</small></td>
                    <td style="font-size: 10px;">${cita.medico.nombre}</td>
                    <td style="font-size: 10px;">${cita.procedimiento}</td>
                    <td style="font-size: 10px; font-family: monospace;">${cita.codigoCups}</td>
                    <td style="font-size: 10px;">${this.formatDate(cita.fechaAtencion)}</td>
                    <td style="text-align: right; font-size: 10px;">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(cita.valor)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="5" style="text-align: right; font-weight: bold; font-size: 11px;">TOTAL:</td>
                  <td style="text-align: right; font-size: 11px;" class="total-amount">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(facturaData.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Legal Information -->
          <div class="important-note">
            <h4 style="margin: 0 0 10px 0; color: #dc2626; font-size: 12px;">💰 INFORMACIÓN DE PAGO</h4>
            <p style="margin: 5px 0; font-size: 10px;">
              • Esta factura tiene una vigencia de 30 días calendario para su cancelación.<br>
              • Los pagos deben realizarse en las cuentas autorizadas por Gestión IPS.<br>
              • Para consultas sobre esta factura, contactar al teléfono (601) 123-4567.
            </p>
          </div>

          <!-- Footer Legal -->
          <div class="footer">
            <div style="border-top: 2px solid #2563eb; padding-top: 10px; margin-bottom: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 11px; text-align: center;">INFORMACIÓN LEGAL Y NORMATIVA</h4>
            </div>

            <div style="background: #f0f9ff; padding: 8px; border-radius: 3px; margin-bottom: 10px; border: 1px solid #bae6fd;">
              <h5 style="margin: 0 0 5px 0; color: #0369a1; font-size: 10px;">🏥 SERVICIOS PRESTADOS</h5>
              <p style="margin: 0; font-size: 8px; line-height: 1.2;">
                Los servicios médicos facturados cumplen con las normas técnicas y científicas establecidas por el Ministerio de Salud y Protección Social de Colombia.
              </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
              <div>
                <p style="margin: 0; font-size: 9px;"><strong>Documento generado por:</strong></p>
                <p style="margin: 2px 0; font-size: 9px;">Sistema de Gestión Médica IPS</p>
                <p style="margin: 2px 0; font-size: 9px;">Versión 2.1.0</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 9px;"><strong>Fecha y hora de generación:</strong></p>
                <p style="margin: 2px 0; font-size: 9px;">${new Date().toLocaleString('es-ES')}</p>
                <p style="margin: 2px 0; font-size: 9px;">Usuario: Sistema Automatizado</p>
              </div>
            </div>

            <div style="background: #fefce8; padding: 8px; border-radius: 3px; border: 1px solid #fde68a;">
              <h5 style="margin: 0 0 5px 0; color: #92400e; font-size: 10px;">⚖️ NORMATIVA APLICABLE</h5>
              <p style="margin: 0; font-size: 8px; line-height: 1.2;">
                <strong>Ley 100 de 1993:</strong> Sistema General de Seguridad Social en Salud<br>
                <strong>Ley 1122 de 2007:</strong> Régimen de Compensación<br>
                <strong>Decreto 4747 de 2007:</strong> Manual de Tarifas SOAT<br>
                <strong>Resolución 3047 de 2008:</strong> Clasificación CUPS
              </p>
            </div>

            <div style="margin-top: 15px; text-align: center; padding-top: 10px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 8px; color: #9ca3af;">
                Este documento tiene carácter oficial y cumple con todas las normativas colombianas aplicables a facturación de servicios de salud.
                Cualquier reclamación debe presentarse por escrito dentro de los 30 días siguientes a la fecha de emisión.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Función para imprimir la factura
  printFactura(htmlContent) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }

  // Función principal para generar PDF
  async generatePDF(facturaData) {
    try {
      const htmlContent = this.generateFacturaHTML(facturaData);
      this.printFactura(htmlContent);
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw error;
    }
  }
}

export default FacturaPDFGenerator;