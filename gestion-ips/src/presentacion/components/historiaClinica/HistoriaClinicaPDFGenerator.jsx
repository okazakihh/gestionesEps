/**
 * Componente para generación dinámica de PDFs de historias clínicas
 * Presentation Layer - Components
 */
class HistoriaClinicaPDFGenerator {
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
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Error en fecha';
    }
  }

  // Función para generar el contenido HTML de la historia clínica
  generateHistoriaClinicaHTML(historiaData) {
    const {
      informacionMedico = {},
      informacionConsulta = {},
      antecedentesClinico = {},
      examenClinico = {},
      diagnosticoTratamiento = {},
      firmaDigital = {}
    } = historiaData.datosJson ? JSON.parse(historiaData.datosJson) : {};

    return `
      <html>
        <head>
          <title>Historia Clínica - ${historiaData.paciente?.nombre || 'Paciente'}</title>
          <style>
            @media print {
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 11px; line-height: 1.4; }
              .header { border-bottom: 3px solid #10B981; padding-bottom: 15px; margin-bottom: 20px; text-align: center; }
              .institution-info { background: #ECFDF5; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
              .patient-info { background: #FEF3C7; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #F59E0B; }
              .section { border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
              .section-title { font-weight: bold; color: #065F46; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; font-size: 12px; margin-bottom: 10px; }
              .field { margin-bottom: 8px; }
              .field-label { font-weight: bold; display: inline-block; min-width: 150px; color: #374151; }
              .field-value { color: #6b7280; }
              .signature { margin-top: 40px; text-align: center; border-top: 2px solid #10B981; padding-top: 20px; }
              .signature-line { border-top: 1px solid #000; width: 250px; margin: 0 auto; margin-top: 20px; }
              .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
              .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; }
              .important-note { background: #FEF3C7; border: 1px solid #FCD34D; padding: 8px; border-radius: 3px; margin: 5px 0; }
              @page { margin: 1.5cm; size: A4; }
              .medical-record { border: 2px solid #10B981; }
              .confidential { background: #FEE2E2; color: #DC2626; padding: 5px; border-radius: 3px; font-weight: bold; text-align: center; margin-bottom: 15px; }
            }
          </style>
        </head>
        <body>
          <!-- Institutional Header -->
          <div class="header">
            <div class="institution-info">
              <h1 style="color: #065F46; margin: 0; font-size: 20px; font-weight: bold;">GESTIÓN IPS</h1>
              <p style="margin: 5px 0; color: #374151; font-size: 14px;">Institución Prestadora de Servicios de Salud</p>
              <p style="margin: 2px 0; color: #6b7280;">NIT: 901.234.567-8 • Dirección: Calle 123 # 45-67, Bogotá D.C.</p>
              <p style="margin: 2px 0; color: #6b7280;">Teléfonos: (601) 123-4567 • Email: info@ips.com.co</p>
            </div>
            <h2 style="margin: 10px 0; color: #1f2937; font-size: 16px;">HISTORIA CLÍNICA</h2>
            <p style="margin: 5px 0; color: #6b7280; font-weight: bold;">HC-${historiaData.id}</p>
            <p style="margin: 2px 0; color: #6b7280;">Fecha de Apertura: ${this.formatDate(historiaData.fechaApertura)}</p>
          </div>

          <!-- Confidentiality Notice -->
          <div class="confidential">
            📋 DOCUMENTO CONFIDENCIAL - HISTORIA CLÍNICA PROTEGIDA POR LA LEY 23 DE 1981
          </div>

          <!-- Patient Information -->
          <div class="patient-info">
            <h3 style="margin-top: 0; color: #92400e; font-size: 14px; border-bottom: 2px solid #f59e0b; padding-bottom: 5px;">INFORMACIÓN DEL PACIENTE</h3>
            <div class="grid-2">
              <div><strong>Nombre Completo:</strong> ${historiaData.paciente?.nombre || 'No disponible'}</div>
              <div><strong>Documento:</strong> ${historiaData.paciente?.documento || 'No disponible'}</div>
              <div><strong>Estado:</strong> ${historiaData.activa ? 'Activa' : 'Inactiva'}</div>
              <div><strong>ID de Historia:</strong> ${historiaData.id}</div>
            </div>
          </div>

          <!-- Medical Information -->
          <div class="section medical-record">
            <h3 class="section-title">🏥 INFORMACIÓN MÉDICA</h3>
            <div class="grid-3">
              <div class="field">
                <span class="field-label">Médico Responsable:</span>
                <span class="field-value">${informacionMedico.medicoResponsable || 'No especificado'}</span>
              </div>
              <div class="field">
                <span class="field-label">Registro Médico:</span>
                <span class="field-value">${informacionMedico.registroMedico || 'No especificado'}</span>
              </div>
              <div class="field">
                <span class="field-label">Especialidad:</span>
                <span class="field-value">${informacionMedico.especialidad || 'No especificado'}</span>
              </div>
            </div>
          </div>

          <!-- Consultation Information -->
          <div class="section">
            <h3 class="section-title">📋 INFORMACIÓN DE CONSULTA</h3>
            <div class="field" style="margin-bottom: 15px;">
              <span class="field-label">Motivo de Consulta:</span>
              <div class="field-value" style="margin-top: 5px; padding: 8px; background: #f9fafb; border-radius: 3px; border-left: 3px solid #10B981;">
                ${informacionConsulta.motivoConsulta || 'No especificado'}
              </div>
            </div>

            ${informacionConsulta.enfermedadActual ? `
            <div class="field" style="margin-bottom: 15px;">
              <span class="field-label">Enfermedad Actual:</span>
              <div class="field-value" style="margin-top: 5px; padding: 8px; background: #f9fafb; border-radius: 3px; border-left: 3px solid #F59E0B;">
                ${informacionConsulta.enfermedadActual}
              </div>
            </div>
            ` : ''}

            ${informacionConsulta.observaciones ? `
            <div class="field" style="margin-bottom: 15px;">
              <span class="field-label">Observaciones:</span>
              <div class="field-value" style="margin-top: 5px; padding: 8px; background: #f9fafb; border-radius: 3px; border-left: 3px solid #6B7280;">
                ${informacionConsulta.observaciones}
              </div>
            </div>
            ` : ''}
          </div>

          <!-- Clinical History -->
          <div class="section">
            <h3 class="section-title">📚 ANTECEDENTES CLÍNICOS</h3>
            <div class="grid-2">
              ${antecedentesClinico.antecedentesPersonales ? `
              <div class="field">
                <span class="field-label">Personales:</span>
                <div class="field-value" style="margin-top: 3px;">${antecedentesClinico.antecedentesPersonales}</div>
              </div>
              ` : ''}

              ${antecedentesClinico.antecedentesFamiliares ? `
              <div class="field">
                <span class="field-label">Familiares:</span>
                <div class="field-value" style="margin-top: 3px;">${antecedentesClinico.antecedentesFamiliares}</div>
              </div>
              ` : ''}

              ${antecedentesClinico.antecedentesQuirurgicos ? `
              <div class="field">
                <span class="field-label">Quirúrgicos:</span>
                <div class="field-value" style="margin-top: 3px;">${antecedentesClinico.antecedentesQuirurgicos}</div>
              </div>
              ` : ''}

              ${antecedentesClinico.antecedentesAlergicos ? `
              <div class="field">
                <span class="field-label">Alérgicos:</span>
                <div class="field-value" style="margin-top: 3px;">${antecedentesClinico.antecedentesAlergicos}</div>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Clinical Examination -->
          <div class="section">
            <h3 class="section-title">🔍 EXAMEN CLÍNICO</h3>
            <div class="grid-2">
              ${examenClinico.examenFisico ? `
              <div class="field">
                <span class="field-label">Examen Físico:</span>
                <div class="field-value" style="margin-top: 3px; padding: 8px; background: #f0f9ff; border-radius: 3px;">${examenClinico.examenFisico}</div>
              </div>
              ` : ''}

              ${examenClinico.signosVitales ? `
              <div class="field">
                <span class="field-label">Signos Vitales:</span>
                <div class="field-value" style="margin-top: 3px; padding: 8px; background: #f0f9ff; border-radius: 3px;">${examenClinico.signosVitales}</div>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Diagnosis and Treatment -->
          <div class="section">
            <h3 class="section-title">💊 DIAGNÓSTICO Y TRATAMIENTO</h3>
            ${diagnosticoTratamiento.diagnosticos ? `
            <div class="field" style="margin-bottom: 15px;">
              <span class="field-label">Diagnósticos:</span>
              <div class="field-value" style="margin-top: 5px; padding: 10px; background: #FEF3C7; border-radius: 3px; border-left: 4px solid #F59E0B;">
                ${diagnosticoTratamiento.diagnosticos}
              </div>
            </div>
            ` : ''}

            ${diagnosticoTratamiento.planTratamiento ? `
            <div class="field" style="margin-bottom: 15px;">
              <span class="field-label">Plan de Tratamiento:</span>
              <div class="field-value" style="margin-top: 5px; padding: 10px; background: #ECFDF5; border-radius: 3px; border-left: 4px solid #10B981;">
                ${diagnosticoTratamiento.planTratamiento}
              </div>
            </div>
            ` : ''}
          </div>

          <!-- Legal Information -->
          <div class="important-note">
            <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 12px;">⚕️ INFORMACIÓN MÉDICA CONFIDENCIAL</h4>
            <p style="margin: 5px 0; font-size: 10px;">
              • Esta historia clínica contiene información protegida por el secreto médico.<br>
              • Solo personal autorizado puede acceder a esta información.<br>
              • Cualquier divulgación no autorizada está penada por la ley.
            </p>
          </div>

          <!-- Digital Signature -->
          <div class="signature">
            <h4 style="margin-bottom: 20px; color: #065F46;">Firma Digital Autorizada</h4>
            <div style="border: 2px solid #10B981; padding: 15px; border-radius: 5px; background: #ECFDF5;">
              <div style="text-align: center; margin-bottom: 10px;">
                <div style="font-size: 14px; font-weight: bold; color: #065F46;">
                  ${firmaDigital.nombreMedico || 'Nombre del Médico'}
                </div>
                <div style="font-size: 12px; color: #6B7280; margin: 5px 0;">
                  Cédula Profesional: ${firmaDigital.numeroCedula || 'No especificada'}
                </div>
                <div style="font-size: 12px; color: #6B7280;">
                  Especialidad: ${firmaDigital.especialidad || 'No especificada'}
                </div>
              </div>
              <div class="signature-line"></div>
              <div style="text-align: center; margin-top: 10px; font-size: 10px; color: #6B7280;">
                Fecha de Firma: ${firmaDigital.fechaFirma ? this.formatDate(firmaDigital.fechaFirma) : 'Fecha no especificada'}
              </div>
            </div>
          </div>

          <!-- Footer Legal -->
          <div style="margin-top: 30px; padding-top: 15px; border-top: 2px solid #10B981; font-size: 9px; color: #6b7280;">
            <div style="background: #ECFDF5; padding: 8px; border-radius: 3px; margin-bottom: 10px; border: 1px solid #A7F3D0;">
              <h5 style="margin: 0 0 5px 0; color: #065F46; font-size: 10px;">🏥 NORMATIVA APLICABLE</h5>
              <p style="margin: 0; font-size: 8px; line-height: 1.2;">
                • Ley 23 de 1981 - Código Sanitario Nacional<br>
                • Ley 1581 de 2012 - Protección de Datos Personales<br>
                • Decreto 1377 de 2013 - Reglamentación Habeas Data<br>
                • Resolución 1995 de 1999 - Historias Clínicas
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

            <div style="margin-top: 15px; text-align: center; padding-top: 10px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 8px; color: #9ca3af;">
                Este documento tiene carácter oficial y cumple con todas las normativas colombianas aplicables a historias clínicas.
                La información contenida es confidencial y está protegida por las leyes de protección de datos personales.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Función para imprimir la historia clínica
  printHistoriaClinica(htmlContent) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }

  // Función principal para generar PDF
  async generatePDF(historiaData) {
    try {
      const htmlContent = this.generateHistoriaClinicaHTML(historiaData);
      this.printHistoriaClinica(htmlContent);
    } catch (error) {
      console.error('Error generando PDF de historia clínica:', error);
      throw error;
    }
  }
}

export default HistoriaClinicaPDFGenerator;