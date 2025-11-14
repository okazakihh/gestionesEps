/**
 * Generador de HTML para el Desprendible de Pago
 * Según normativa colombiana
 */

/**
 * Formatea valor monetario
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
 * Formatea fecha
 */
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Genera el HTML completo del desprendible de pago
 * @param {Object} nomina - Datos de la nómina
 * @param {Object} ipsData - Información de la empresa (requerido desde configuración)
 * @returns {string} HTML del desprendible
 */
export const generarDesprendibleHTML = (nomina, ipsData) => {
  // Usar configuración de IPS desde la base de datos
  const empresaNombre = ipsData?.nombre || 'IPS';
  const empresaNit = ipsData?.nit || 'N/A';
  const empresaDireccion = ipsData?.direccion ? `${ipsData.direccion}, ${ipsData.ciudad || ''}` : 'N/A';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Desprendible de Pago - ${nomina.empleadoNombre} - ${nomina.periodo}</title>
      <style>
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        
        body { 
          font-family: Arial, sans-serif; 
          padding: 20mm; 
          color: #333;
        }
        
        .header { 
          text-align: center; 
          border-bottom: 3px solid #228BE6; 
          padding-bottom: 15px; 
          margin-bottom: 20px; 
        }
        
        .header h1 { 
          color: #228BE6; 
          font-size: 24px; 
          margin-bottom: 5px; 
        }
        
        .header p { 
          color: #666; 
          font-size: 12px; 
        }
        
        .header h2 { 
          color: #228BE6; 
          font-size: 18px; 
          margin-top: 15px; 
        }
        
        .section { 
          margin-bottom: 20px; 
          border: 1px solid #ddd; 
          padding: 15px; 
          border-radius: 5px; 
        }
        
        .section-title { 
          font-weight: bold; 
          color: #228BE6; 
          margin-bottom: 10px; 
          font-size: 14px; 
        }
        
        .info-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 10px; 
        }
        
        .info-item { 
          margin-bottom: 8px; 
        }
        
        .info-label { 
          color: #666; 
          font-size: 11px; 
        }
        
        .info-value { 
          font-weight: 600; 
          font-size: 13px; 
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 10px; 
        }
        
        table th { 
          background: #f1f3f5; 
          padding: 8px; 
          text-align: left; 
          font-size: 12px; 
          border: 1px solid #ddd; 
        }
        
        table td { 
          padding: 8px; 
          font-size: 12px; 
          border: 1px solid #ddd; 
        }
        
        .text-right { 
          text-align: right; 
        }
        
        .total-row { 
          background: #d3f9d8; 
          font-weight: bold; 
        }
        
        .total-ded { 
          background: #ffe0e0; 
          font-weight: bold; 
        }
        
        .neto { 
          background: #228BE6; 
          color: white; 
          padding: 15px; 
          text-align: center; 
          border-radius: 5px; 
          margin: 20px 0; 
        }
        
        .neto h3 { 
          font-size: 14px; 
          margin-bottom: 5px; 
        }
        
        .neto .amount { 
          font-size: 28px; 
          font-weight: bold; 
        }
        
        .firmas { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 50px; 
          margin-top: 50px; 
          padding-top: 30px; 
          border-top: 1px solid #ddd; 
        }
        
        .firma-line { 
          border-top: 1px solid black; 
          padding-top: 8px; 
          text-align: center; 
          font-size: 11px; 
          font-weight: 600; 
          margin-top: 50px; 
        }
        
        .footer { 
          text-align: center; 
          color: #666; 
          font-size: 10px; 
          margin-top: 30px; 
        }
        
        @media print {
          body { 
            padding: 10mm; 
          }
          .section { 
            page-break-inside: avoid; 
          }
        }
      </style>
    </head>
    <body>
      <!-- Encabezado -->
      <div class="header">
        <h1>${empresaNombre}</h1>
        <p>NIT: ${empresaNit}</p>
        <p>${empresaDireccion}</p>
        <h2>DESPRENDIBLE DE PAGO</h2>
        <p>Periodo: ${nomina.periodo}</p>
      </div>

      <!-- Datos del Empleado -->
      <div class="section">
        <div class="section-title">DATOS DEL EMPLEADO</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Nombre:</div>
            <div class="info-value">${nomina.empleadoNombre || '-'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Documento:</div>
            <div class="info-value">${nomina.empleadoDocumento || '-'}</div>
          </div>
          ${nomina.cargo ? `
          <div class="info-item">
            <div class="info-label">Cargo:</div>
            <div class="info-value">${nomina.cargo}</div>
          </div>
          ` : ''}
          <div class="info-item">
            <div class="info-label">Fecha de Pago:</div>
            <div class="info-value">${formatDate(nomina.fechaPago)}</div>
          </div>
        </div>
      </div>

      <!-- Tabla de Devengados -->
      <div class="section">
        <div class="section-title">DEVENGADOS</div>
        <table>
          <thead>
            <tr>
              <th>Concepto</th>
              <th class="text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Salario Básico (${nomina.diasTrabajados || 30} días)</td>
              <td class="text-right">${formatCurrency(nomina.salarioBase)}</td>
            </tr>
            ${nomina.auxilioTransporte > 0 ? `
            <tr>
              <td>Auxilio de Transporte</td>
              <td class="text-right">${formatCurrency(nomina.auxilioTransporte)}</td>
            </tr>
            ` : ''}
            ${nomina.horasExtrasDiurnas > 0 ? `
            <tr>
              <td>Horas Extras Diurnas (${nomina.horasExtrasDiurnas}h)</td>
              <td class="text-right">${formatCurrency(nomina.valorHorasExtrasDiurnas || 0)}</td>
            </tr>
            ` : ''}
            ${nomina.horasExtrasNocturnas > 0 ? `
            <tr>
              <td>Horas Extras Nocturnas (${nomina.horasExtrasNocturnas}h)</td>
              <td class="text-right">${formatCurrency(nomina.valorHorasExtrasNocturnas || 0)}</td>
            </tr>
            ` : ''}
            ${nomina.horasExtrasDominicales > 0 ? `
            <tr>
              <td>Horas Extras Dominicales (${nomina.horasExtrasDominicales}h)</td>
              <td class="text-right">${formatCurrency(nomina.valorHorasExtrasDominicales || 0)}</td>
            </tr>
            ` : ''}
            ${nomina.bonificaciones > 0 ? `
            <tr>
              <td>Bonificaciones</td>
              <td class="text-right">${formatCurrency(nomina.bonificaciones)}</td>
            </tr>
            ` : ''}
            ${nomina.comisiones > 0 ? `
            <tr>
              <td>Comisiones</td>
              <td class="text-right">${formatCurrency(nomina.comisiones)}</td>
            </tr>
            ` : ''}
            ${nomina.otrosIngresos > 0 ? `
            <tr>
              <td>Otros Ingresos</td>
              <td class="text-right">${formatCurrency(nomina.otrosIngresos)}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td><strong>TOTAL DEVENGADO</strong></td>
              <td class="text-right"><strong>${formatCurrency(nomina.totalDevengado)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tabla de Deducciones -->
      <div class="section">
        <div class="section-title">DEDUCCIONES</div>
        <table>
          <thead>
            <tr>
              <th>Concepto</th>
              <th class="text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Salud (4%)</td>
              <td class="text-right">${formatCurrency(nomina.deduccionSalud || 0)}</td>
            </tr>
            <tr>
              <td>Pensión (4%)</td>
              <td class="text-right">${formatCurrency(nomina.deduccionPension || 0)}</td>
            </tr>
            ${nomina.prestamos > 0 ? `
            <tr>
              <td>Préstamos</td>
              <td class="text-right">${formatCurrency(nomina.prestamos)}</td>
            </tr>
            ` : ''}
            ${nomina.embargos > 0 ? `
            <tr>
              <td>Embargos</td>
              <td class="text-right">${formatCurrency(nomina.embargos)}</td>
            </tr>
            ` : ''}
            ${nomina.otrasDeducciones > 0 ? `
            <tr>
              <td>Otras Deducciones</td>
              <td class="text-right">${formatCurrency(nomina.otrasDeducciones)}</td>
            </tr>
            ` : ''}
            <tr class="total-ded">
              <td><strong>TOTAL DEDUCCIONES</strong></td>
              <td class="text-right"><strong>${formatCurrency(nomina.totalDeducciones)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Neto a Pagar -->
      <div class="neto">
        <h3>NETO A PAGAR</h3>
        <div class="amount">${formatCurrency(nomina.netoPagar)}</div>
      </div>

      <!-- Aportes del Empleador (Informativo) -->
      ${(nomina.aporteEmpleadorSalud > 0 || nomina.aporteEmpleadorPension > 0 || nomina.aporteEmpleadorARL > 0) ? `
      <div class="section" style="background: #f8f9fa;">
        <div class="section-title">APORTES DEL EMPLEADOR (Informativo)</div>
        <div class="info-grid">
          ${nomina.aporteEmpleadorSalud > 0 ? `
          <div class="info-item">
            <div class="info-label">Salud (8.5%):</div>
            <div class="info-value">${formatCurrency(nomina.aporteEmpleadorSalud)}</div>
          </div>
          ` : ''}
          ${nomina.aporteEmpleadorPension > 0 ? `
          <div class="info-item">
            <div class="info-label">Pensión (12%):</div>
            <div class="info-value">${formatCurrency(nomina.aporteEmpleadorPension)}</div>
          </div>
          ` : ''}
          ${nomina.aporteEmpleadorARL > 0 ? `
          <div class="info-item">
            <div class="info-label">ARL:</div>
            <div class="info-value">${formatCurrency(nomina.aporteEmpleadorARL)}</div>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}

      <!-- Observaciones -->
      ${nomina.observaciones ? `
      <div class="section">
        <div class="section-title">Observaciones:</div>
        <p style="font-size: 12px;">${nomina.observaciones}</p>
      </div>
      ` : ''}

      <!-- Firmas -->
      <div class="firmas">
        <div>
          <div class="firma-line">Firma del Empleado</div>
        </div>
        <div>
          <div class="firma-line">Firma del Empleador</div>
        </div>
      </div>

      <!-- Pie de Página -->
      <div class="footer">
        <p>Este documento es un desprendible de pago y debe ser conservado como soporte de los pagos realizados.</p>
        <p>Generado el ${new Date().toLocaleDateString('es-CO')} - Sistema de Gestión de Nómina</p>
      </div>

      <!-- Script para auto-imprimir -->
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;
};
