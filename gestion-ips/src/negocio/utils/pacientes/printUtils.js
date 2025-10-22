// Utilidades para impresión de historias clínicas y consultas

/**
 * Imprime la historia clínica completa
 * @param {Array} consultas - Lista de consultas
 * @param {Object} historiaClinica - Objeto de historia clínica
 * @param {Object} patient - Datos del paciente
 * @param {Object} patientData - Datos parseados del paciente
 */
export const printHistoriaClinica = (consultas, historiaClinica, patient, patientData) => {
  // Create print-friendly content for the complete clinical history
  const allConsultas = [];

  // Parsear datos JSON de la historia clínica
  let historiaData = null;
  try {
    const parsed = JSON.parse(historiaClinica.datosJson || '{}');
    // Handle nested structure if exists
    historiaData = parsed.datosJson ? JSON.parse(parsed.datosJson) : parsed;
  } catch (error) {
    console.error('Error parsing historia clinica JSON:', error);
    historiaData = null;
  }

  // Agregar consulta inicial
  allConsultas.push({
    id: `initial-${historiaClinica.id}`,
    numero: 1,
    tipo: 'Consulta Inicial',
    fecha: historiaClinica.fechaApertura,
    medico: (historiaData && historiaData.informacionMedico?.medicoResponsable) || 'N/A',
    especialidad: (historiaData && historiaData.informacionMedico?.especialidad) || 'N/A',
    motivo: (historiaData && historiaData.informacionConsulta?.motivoConsulta) || 'Apertura de historia clínica',
    enfermedadActual: (historiaData && historiaData.informacionConsulta?.enfermedadActual) || 'N/A',
    diagnosticos: (historiaData && historiaData.diagnosticoTratamiento?.diagnosticos) || 'N/A',
    planTratamiento: (historiaData && historiaData.diagnosticoTratamiento?.planTratamiento) || 'N/A',
    examenFisico: (historiaData && historiaData.examenClinico?.examenFisico) || 'N/A',
    signosVitales: (historiaData && historiaData.examenClinico?.signosVitales) || 'N/A',
    formulaMedica: 'N/A',
    incapacidad: null,
    indicaciones: 'N/A',
    proximaCita: 'N/A',
    observaciones: (historiaData && historiaData.informacionConsulta?.observaciones) || 'N/A'
  });

  // Agregar consultas posteriores
  if (consultas && Array.isArray(consultas)) {
    consultas.forEach((consulta, index) => {
      try {
        const consultaData = JSON.parse(consulta.datosJson || '{}');
        allConsultas.push({
          id: consulta.id,
          numero: index + 2,
          tipo: 'Consulta Médica',
          fecha: consultaData.detalleConsulta?.fechaConsulta || consulta.fechaCreacion,
          medico: consultaData.detalleConsulta?.medicoTratante || consultaData.informacionMedico?.medicoTratante || 'N/A',
          especialidad: consultaData.detalleConsulta?.especialidad || consultaData.informacionMedico?.especialidad || 'N/A',
          motivo: consultaData.informacionConsulta?.motivoConsulta || consultaData.detalleConsulta?.motivoConsulta || 'N/A',
          enfermedadActual: consultaData.informacionConsulta?.enfermedadActual || consultaData.detalleConsulta?.enfermedadActual || 'N/A',
          diagnosticos: consultaData.diagnosticoTratamiento?.diagnosticos || consultaData.diagnosticoTratamiento?.diagnosticoPrincipal || 'N/A',
          planTratamiento: consultaData.diagnosticoTratamiento?.planTratamiento || consultaData.diagnosticoTratamiento?.planManejo || 'N/A',
          examenFisico: consultaData.examenClinico?.examenFisico || 'N/A',
          signosVitales: consultaData.examenClinico?.signosVitales || 'N/A',
          formulaMedica: consultaData.formulaMedica?.medicamentos || 'N/A',
          incapacidad: consultaData.incapacidad || null,
          indicaciones: consultaData.seguimientoConsulta?.recomendaciones || consultaData.seguimientoConsulta?.indicaciones || 'N/A',
          proximaCita: consultaData.detalleConsulta?.proximaCita || consultaData.seguimientoConsulta?.proximaCita || 'N/A',
          observaciones: consultaData.informacionConsulta?.observaciones || consultaData.seguimientoConsulta?.recomendaciones || 'N/A'
        });
      } catch (error) {
        console.error('Error parsing consulta JSON:', error);
      }
    });
  }

  const printContent = createPrintContent(allConsultas, false, historiaData, patient, patientData, historiaClinica);
  printDocument(printContent);
};

/**
 * Crea el contenido HTML para impresión
 * @param {Array} consultas - Lista de consultas
 * @param {boolean} isSingleConsulta - Si es una sola consulta
 * @param {Object} historiaData - Datos de la historia clínica
 * @param {Object} patient - Datos del paciente
 * @param {Object} patientData - Datos parseados del paciente
 * @param {Object} historiaClinica - Objeto de historia clínica
 * @returns {string} Contenido HTML para impresión
 */
export const createPrintContent = (consultas, isSingleConsulta = false, historiaData = null, patient = null, patientData = null, historiaClinica = null) => {
  const patientInfo = patientData?.informacionPersonal || {};
  const patientContact = patientData?.informacionContacto || {};
  const patientMedical = patientData?.informacionMedica || {};
  const patientName = [patientInfo.primerNombre, patientInfo.segundoNombre, patientInfo.primerApellido, patientInfo.segundoApellido]
    .filter(Boolean).join(' ') || 'N/A';

  let html = `
    <html>
      <head>
        <title>Historia Clínica - ${patientName}</title>
        <style>
          @media print {
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 11px; line-height: 1.4; }
            .header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; text-align: center; }
            .institution-info { background: #f0f9ff; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
            .patient-info { background: #f8fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 2px solid #e5e7eb; }
            .medical-antecedents { background: #fef3c7; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #f59e0b; }
            .consulta { border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
            .consulta-header { background: #f3f4f6; padding: 8px; margin: -15px -15px 10px -15px; border-radius: 5px 5px 0 0; border-bottom: 1px solid #d1d5db; }
            .section { margin-bottom: 10px; }
            .section-title { font-weight: bold; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 3px; font-size: 12px; }
            .field { margin-bottom: 5px; }
            .field-label { font-weight: bold; display: inline-block; min-width: 120px; color: #6b7280; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #e5e7eb; font-size: 9px; color: #6b7280; }
            .signature { margin-top: 40px; text-align: center; }
            .signature-line { border-top: 1px solid #000; width: 200px; margin: 0 auto; margin-top: 40px; }
            .consent-section { background: #ecfdf5; padding: 10px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #d1fae5; }
            .rights-section { background: #fefce8; padding: 10px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #fde68a; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
            .important-note { background: #fee2e2; border: 1px solid #fecaca; padding: 8px; border-radius: 3px; margin: 5px 0; }
            @page { margin: 1.5cm; size: A4; }
          }
        </style>
      </head>
      <body>
        <!-- Institutional Header -->
        <div class="header">
          <div class="institution-info">
            <h1 style="color: #2563eb; margin: 0; font-size: 20px; font-weight: bold;">INSTITUCIÓN PRESTADORA DE SALUD IPS</h1>
            <p style="margin: 5px 0; color: #374151; font-size: 14px;">Sistema de Gestión Médica Integral</p>
            <p style="margin: 2px 0; color: #6b7280;">NIT: 901.234.567-8 • Dirección: Calle 123 # 45-67, Bogotá D.C.</p>
            <p style="margin: 2px 0; color: #6b7280;">Teléfonos: (601) 123-4567 • Email: info@ips.com.co</p>
          </div>
          <h2 style="margin: 10px 0; color: #1f2937; font-size: 16px;">HISTORIA CLÍNICA ELECTRÓNICA</h2>
          <p style="margin: 5px 0; color: #6b7280; font-weight: bold;">Número de Historia Clínica: ${historiaClinica.numeroHistoria}</p>
          <p style="margin: 2px 0; color: #6b7280;">Fecha de Impresión: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}</p>
        </div>

        <!-- Patient Information -->
        <div class="patient-info">
          <h3 style="margin-top: 0; color: #1f2937; font-size: 14px; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">INFORMACIÓN DEL PACIENTE</h3>
          <div class="grid-2">
            <div><strong>Nombre Completo:</strong> ${patientName}</div>
            <div><strong>Tipo y Número de Documento:</strong> ${patient?.tipoDocumento || 'N/A'} ${patient?.numeroDocumento || 'N/A'}</div>
            <div><strong>Fecha de Nacimiento:</strong> ${patientInfo.fechaNacimiento ? new Date(patientInfo.fechaNacimiento).toLocaleDateString('es-CO') : 'N/A'}</div>
            <div><strong>Edad:</strong> ${(() => {
              if (!patientInfo.fechaNacimiento) return 'N/A';
              try {
                const nacimiento = new Date(patientInfo.fechaNacimiento);
                const hoy = new Date();
                let edad = hoy.getFullYear() - nacimiento.getFullYear();
                const mes = hoy.getMonth() - nacimiento.getMonth();
                if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
                return `${edad} años`;
              } catch { return 'N/A'; }
            })()}</div>
            <div><strong>Sexo:</strong> ${patientInfo.genero || 'N/A'}</div>
            <div><strong>Estado Civil:</strong> ${patientInfo.estadoCivil || 'N/A'}</div>
            <div><strong>Dirección:</strong> ${patientContact.direccion || 'N/A'}</div>
            <div><strong>Ciudad:</strong> ${patientContact.ciudad || 'N/A'}, ${patientContact.departamento || 'N/A'}</div>
            <div><strong>Teléfono:</strong> ${patientContact.telefono || 'N/A'}</div>
            <div><strong>Email:</strong> ${patientContact.email || 'N/A'}</div>
            <div><strong>Ocupación:</strong> ${patientInfo.ocupacion || 'N/A'}</div>
            <div><strong>Nivel Educativo:</strong> ${patientInfo.nivelEducativo || 'N/A'}</div>
          </div>
        </div>

        <!-- Medical Information -->
        <div class="patient-info">
          <h3 style="margin-top: 0; color: #1f2937; font-size: 14px; border-bottom: 2px solid #dc2626; padding-bottom: 5px;">INFORMACIÓN MÉDICA BÁSICA</h3>
          <div class="grid-3">
            <div><strong>Tipo de Sangre:</strong> ${patientMedical.tipoSangre || patientInfo.tipoSangre || 'N/A'}</div>
            <div><strong>EPS:</strong> ${patientMedical.eps || patientMedical.regimenAfiliacion || 'NUEVA EPS'}</div>
            <div><strong>Tipo de Seguro:</strong> ${patientMedical.tipoSeguro || 'N/A'}</div>
          </div>
          <div style="margin-top: 10px;">
            <div><strong>Alergias:</strong> ${patientMedical.alergias || 'NINGUNA'}</div>
            <div style="margin-top: 5px;"><strong>Medicamentos Actuales:</strong> ${patientMedical.medicamentosActuales || 'NINGUNA'}</div>
          </div>
        </div>

        <!-- Medical Antecedents -->
        <div class="medical-antecedents">
          <h3 style="margin-top: 0; color: #92400e; font-size: 14px; border-bottom: 2px solid #f59e0b; padding-bottom: 5px;">ANTECEDENTES MÉDICOS</h3>
          ${historiaData && (historiaData.antecedentesClinico || historiaData.informacionMedica) ? `
          <div class="grid-2">
            <div>
              <strong>Antecedentes Personales:</strong><br>
              ${(historiaData.antecedentesClinico?.antecedentesPersonales || historiaData.informacionMedica?.antecedentesPersonales) || 'No registrados'}
            </div>
            <div>
              <strong>Antecedentes Familiares:</strong><br>
              ${(historiaData.antecedentesClinico?.antecedentesFamiliares || historiaData.informacionMedica?.antecedentesFamiliares) || 'No registrados'}
            </div>
            <div>
              <strong>Antecedentes Quirúrgicos:</strong><br>
              ${(historiaData.antecedentesClinico?.antecedentesQuirurgicos || historiaData.informacionMedica?.antecedentesQuirurgicos) || 'No registrados'}
            </div>
            <div>
              <strong>Antecedentes Alérgicos:</strong><br>
              ${(historiaData.antecedentesClinico?.antecedentesAlergicos || historiaData.informacionMedica?.antecedentesAlergicos) || 'No registrados'}
            </div>
          </div>
          ` : '<p>No se encontraron antecedentes médicos registrados.</p>'}
        </div>

        <!-- Legal Information -->
        <div class="consent-section">
          <h4 style="margin: 0 0 10px 0; color: #065f46; font-size: 12px;">CONSENTIMIENTO INFORMADO Y DERECHOS DEL PACIENTE</h4>
          <p style="margin: 5px 0; font-size: 10px;">
            <strong>Consentimiento:</strong> El paciente ha sido informado sobre los procedimientos médicos, riesgos, beneficios y alternativas.
            Ha autorizado el tratamiento y manejo de su información médica conforme a la Ley 1581 de 2012.
          </p>
          <p style="margin: 5px 0; font-size: 10px;">
            <strong>Derechos del Paciente:</strong> Conoce sus derechos a la privacidad, confidencialidad, acceso a su historia clínica,
            segunda opinión médica y atención digna según la normatividad colombiana.
          </p>
        </div>
  `;

  // Add consultations
  consultas.forEach(consulta => {
    html += `
      <div class="consulta">
        <div class="consulta-header">
          <h4 style="margin: 0; color: #1f2937; font-size: 14px;">${consulta.tipo} #${consulta.numero}</h4>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
            <p style="margin: 0; color: #6b7280; font-size: 11px;">
              <strong>Fecha:</strong> ${consulta.fecha ? new Date(consulta.fecha).toLocaleDateString('es-CO') : 'N/A'}
              ${consulta.fecha ? ` | <strong>Hora:</strong> ${new Date(consulta.fecha).toLocaleTimeString('es-CO')}` : ''}
            </p>
            <p style="margin: 0; color: #6b7280; font-size: 10px;">
              <strong>Historia Clínica:</strong> ${historiaClinica.numeroHistoria}
            </p>
          </div>
        </div>

        <!-- Información del Médico -->
        <div class="section">
          <div class="section-title">👨‍⚕️ INFORMACIÓN DEL PROFESIONAL DE LA SALUD</div>
          <div class="grid-2">
            <div><span class="field-label">Médico Tratante:</span> ${consulta.medico || 'N/A'}</div>
            <div><span class="field-label">Especialidad:</span> ${consulta.especialidad || 'N/A'}</div>
            <div><span class="field-label">Registro Médico:</span> ${consulta.medico ? 'N/A' : 'N/A'}</div>
            <div><span class="field-label">Tipo de Consulta:</span> ${consulta.tipo || 'Consulta General'}</div>
          </div>
        </div>

        <!-- Anamnesis -->
        <div class="section">
          <div class="section-title">📝 ANAMNESIS</div>
          ${consulta.motivo ? `
          <div class="field">
            <span class="field-label">Motivo de Consulta:</span>
            <div style="margin-top: 3px; padding: 6px; background: #f8fafc; border-radius: 3px; border-left: 3px solid #3b82f6;">${consulta.motivo}</div>
          </div>
          ` : ''}

          ${consulta.enfermedadActual ? `
          <div class="field">
            <span class="field-label">Enfermedad Actual:</span>
            <div style="margin-top: 3px; padding: 6px; background: #fef3c7; border-radius: 3px; border-left: 3px solid #f59e0b;">${consulta.enfermedadActual}</div>
          </div>
          ` : ''}
        </div>

        <!-- Examen Clínico -->
        ${(consulta.examenFisico || consulta.signosVitales) ? `
        <div class="section">
          <div class="section-title">🔍 EXAMEN CLÍNICO</div>
          <div class="grid-2">
            ${consulta.examenFisico ? `<div><span class="field-label">Examen Físico:</span><br><span style="padding: 4px; background: #ecfdf5; border-radius: 3px; display: inline-block; margin-top: 2px;">${consulta.examenFisico}</span></div>` : '<div></div>'}
            ${consulta.signosVitales ? `<div><span class="field-label">Signos Vitales:</span><br><span style="padding: 4px; background: #ecfdf5; border-radius: 3px; display: inline-block; margin-top: 2px;">${consulta.signosVitales}</span></div>` : '<div></div>'}
          </div>
        </div>
        ` : ''}

        <!-- Diagnóstico -->
        ${(consulta.diagnosticos || consulta.planTratamiento) ? `
        <div class="section">
          <div class="section-title">💊 DIAGNÓSTICO Y TRATAMIENTO</div>
          ${consulta.diagnosticos ? `
          <div class="field">
            <span class="field-label">Diagnósticos CIE-10:</span>
            <div style="margin-top: 3px; padding: 8px; background: #fee2e2; border-radius: 3px; border-left: 4px solid #dc2626; font-family: monospace;">${consulta.diagnosticos}</div>
          </div>
          ` : ''}

          ${consulta.planTratamiento ? `
          <div class="field">
            <span class="field-label">Plan de Manejo:</span>
            <div style="margin-top: 3px; padding: 8px; background: #f0f9ff; border-radius: 3px; border-left: 4px solid #2563eb;">${consulta.planTratamiento}</div>
          </div>
          ` : ''}
        </div>
        ` : ''}

        <!-- Órdenes Médicas -->
        ${consulta.formulaMedica ? `
        <div class="section">
          <div class="section-title">📋 ÓRDENES MÉDICAS</div>
          <div style="padding: 10px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 5px;">
            <strong style="color: #dc2626;">💊 FORMULA MÉDICA:</strong><br>
            <div style="margin-top: 5px; padding: 8px; background: white; border-radius: 3px; font-family: monospace; white-space: pre-line;">${consulta.formulaMedica}</div>
          </div>
        </div>
        ` : ''}

        <!-- Incapacidad -->
        ${(consulta.incapacidad?.tipo || consulta.incapacidad?.dias) ? `
        <div class="section">
          <div class="section-title">📄 INCAPACIDAD MÉDICA</div>
          <div class="important-note">
            <strong>⚠️ INCAPACIDAD CERTIFICADA</strong><br>
            ${consulta.incapacidad.tipo ? `<strong>Tipo:</strong> ${consulta.incapacidad.tipo}<br>` : ''}
            ${consulta.incapacidad.dias ? `<strong>Días:</strong> ${consulta.incapacidad.dias}` : ''}
          </div>
        </div>
        ` : ''}

        <!-- Seguimiento y Recomendaciones -->
        ${(consulta.indicaciones || consulta.proximaCita || consulta.observaciones) ? `
        <div class="section">
          <div class="section-title">📅 SEGUIMIENTO Y RECOMENDACIONES</div>
          <div class="grid-2">
            ${consulta.indicaciones ? `<div><span class="field-label">Indicaciones:</span><br><span style="padding: 4px; background: #f0fdf4; border-radius: 3px; display: inline-block; margin-top: 2px;">${consulta.indicaciones}</span></div>` : '<div></div>'}
            ${consulta.proximaCita ? `<div><span class="field-label">Próxima Cita:</span><br><span style="padding: 4px; background: #fef3c7; border-radius: 3px; display: inline-block; margin-top: 2px; font-weight: bold;">${consulta.proximaCita}</span></div>` : '<div></div>'}
          </div>

          ${consulta.observaciones ? `
          <div class="field" style="margin-top: 10px;">
            <span class="field-label">Observaciones:</span>
            <div style="margin-top: 3px; padding: 8px; background: #f9fafb; border-radius: 3px; border: 1px solid #e5e7eb;">${consulta.observaciones}</div>
          </div>
          ` : ''}
        </div>
        ` : ''}

        <!-- Firma y Sello (lado a lado) -->
        <div style="margin-top: 25px; display: flex; justify-content: space-between; gap: 15px; page-break-inside: avoid;">
          <!-- Firma Digital del Profesional -->
          <div style="flex: 1; padding: 12px; background: white; border: 1.5px solid #000; border-radius: 3px;">
            <div style="text-align: center; border-bottom: 1px solid #666; padding-bottom: 6px; margin-bottom: 12px;">
              <strong style="font-size: 10px; color: #000;">✍️ FIRMA DEL PROFESIONAL</strong>
            </div>

            ${consulta.firmaDigital || consulta.medico ? `
              <!-- Línea de firma -->
              <div style="border-top: 1.5px solid #000; width: 180px; margin: 20px auto 10px;"></div>

              <!-- Información del profesional -->
              <div style="text-align: center;">
                <p style="margin: 3px 0; font-weight: bold; font-size: 11px; color: #000;">
                  ${consulta.firmaDigital?.nombreMedico || consulta.medico || 'Profesional de la Salud'}
                </p>

                ${consulta.firmaDigital?.registroProfesional ? `
                <p style="margin: 2px 0; font-size: 9px; color: #333;">
                  Reg. Prof.: ${consulta.firmaDigital.registroProfesional}
                </p>
                ` : ''}

                ${consulta.firmaDigital?.especialidad || consulta.especialidad ? `
                <p style="margin: 2px 0; font-size: 9px; color: #555;">
                  ${consulta.firmaDigital?.especialidad || consulta.especialidad}
                </p>
                ` : ''}

                <p style="margin: 8px 0 2px 0; font-size: 8px; color: #666;">
                  Fecha: ${consulta.firmaDigital?.fechaFirma || consulta.fecha || new Date().toLocaleDateString('es-CO')}
                </p>

                ${consulta.firmaDigital?.selloDigital ? `
                <p style="margin: 2px 0; font-size: 7px; color: #888; font-style: italic;">
                  Firmado digitalmente
                </p>
                ` : ''}
              </div>
            ` : `
              <!-- Espacio para firma manual -->
              <div style="margin-top: 50px;"></div>
              <div style="border-top: 1.5px solid #000; width: 180px; margin: 0 auto 8px;"></div>
              <div style="text-align: center;">
                <p style="margin: 3px 0; font-size: 9px; color: #333;">
                  Firma del Profesional Responsable
                </p>
                <p style="margin: 8px 0 2px 0; font-size: 8px; color: #666;">
                  Fecha: ${new Date().toLocaleDateString('es-CO')}
                </p>
              </div>
            `}
          </div>

          <!-- Sello de la Institución -->
          <div style="flex: 1; padding: 12px; background: white; border: 1.5px solid #000; border-radius: 3px;">
            <div style="text-align: center; border-bottom: 1px solid #666; padding-bottom: 6px; margin-bottom: 12px;">
              <strong style="font-size: 10px; color: #000;">🏛️ SELLO DE LA INSTITUCIÓN</strong>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <div style="padding: 10px; border: 1px solid #d1d5db; border-radius: 3px; background: white; display: inline-block;">
                <p style="margin: 0 0 10px 0; font-size: 9px; color: #6b7280; font-weight: bold;">SELLO OFICIAL</p>
                <div style="margin: 10px auto; width: 80px; height: 60px; border: 1px dashed #9ca3af;"></div>
                <p style="margin: 10px 0 0 0; font-size: 8px; color: #9ca3af;">IPS Sistema de Gestión Médica</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  html += `
        <!-- Footer Legal -->
        <div class="footer">
          <div style="border-top: 2px solid #2563eb; padding-top: 10px; margin-bottom: 15px;">
            <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 11px; text-align: center;">INFORMACIÓN LEGAL Y NORMATIVA</h4>
          </div>

          <div style="background: #f0f9ff; padding: 8px; border-radius: 3px; margin-bottom: 10px; border: 1px solid #bae6fd;">
            <h5 style="margin: 0 0 5px 0; color: #0369a1; font-size: 10px;">🔒 PROTECCIÓN DE DATOS PERSONALES</h5>
            <p style="margin: 0; font-size: 8px; line-height: 1.2;">
              Esta historia clínica está protegida por la Ley 1581 de 2012 y el Decreto 1377 de 2013.
              Los datos personales solo pueden ser utilizados para fines médicos y con autorización del titular.
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
              <p style="margin: 2px 0; font-size: 9px;">${new Date().toLocaleString('es-CO')}</p>
              <p style="margin: 2px 0; font-size: 9px;">Usuario: Sistema Automatizado</p>
            </div>
          </div>

          <div style="background: #fef2f2; padding: 8px; border-radius: 3px; border: 1px solid #fecaca;">
            <h5 style="margin: 0 0 5px 0; color: #dc2626; font-size: 10px;">⚖️ NORMATIVA APLICABLE</h5>
            <p style="margin: 0; font-size: 8px; line-height: 1.2;">
              <strong>Ley 100 de 1993:</strong> Sistema General de Seguridad Social en Salud<br>
              <strong>Ley 1581 de 2012:</strong> Protección de Datos Personales<br>
              <strong>Decreto 1377 de 2013:</strong> Reglamentación de la Ley 1581<br>
              <strong>Ley 1751 de 2015:</strong> Derechos y deberes de los usuarios en salud<br>
              <strong>Resolución 1995 de 1999:</strong> Historia Clínica<br>
              <strong>Decreto 780 de 2016:</strong> Historia Clínica Electrónica
            </p>
          </div>

          <div style="margin-top: 15px; text-align: center; padding-top: 10px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 8px; color: #9ca3af;">
              Este documento tiene carácter oficial y cumple con todas las normativas colombianas aplicables a historias clínicas.
              Cualquier modificación debe ser autorizada por el profesional responsable.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return html;
};

/**
 * Imprime una consulta específica
 * @param {Object} consulta - Objeto de consulta
 * @param {Object} historiaClinica - Objeto de historia clínica
 * @param {Object} patient - Datos del paciente
 * @param {Object} patientData - Datos parseados del paciente
 */
export const printConsulta = (consulta, historiaClinica, patient, patientData) => {
  // Procesar la consulta individual de la misma manera que en printHistoriaClinica
  let processedConsulta = null;
  try {
    const consultaData = JSON.parse(consulta.datosJson || '{}');
    processedConsulta = {
      id: consulta.id,
      numero: 1, // Para consulta individual, siempre es 1
      tipo: 'Consulta Médica Individual',
      fecha: consultaData.detalleConsulta?.fechaConsulta || consulta.fechaCreacion,
      medico: consultaData.detalleConsulta?.medicoTratante || consultaData.informacionMedico?.medicoTratante || 'N/A',
      especialidad: consultaData.detalleConsulta?.especialidad || consultaData.informacionMedico?.especialidad || 'N/A',
      motivo: consultaData.informacionConsulta?.motivoConsulta || consultaData.detalleConsulta?.motivoConsulta || 'N/A',
      enfermedadActual: consultaData.informacionConsulta?.enfermedadActual || consultaData.detalleConsulta?.enfermedadActual || 'N/A',
      diagnosticos: consultaData.diagnosticoTratamiento?.diagnosticos || consultaData.diagnosticoTratamiento?.diagnosticoPrincipal || 'N/A',
      planTratamiento: consultaData.diagnosticoTratamiento?.planTratamiento || consultaData.diagnosticoTratamiento?.planManejo || 'N/A',
      examenFisico: consultaData.examenClinico?.examenFisico || 'N/A',
      signosVitales: consultaData.examenClinico?.signosVitales || 'N/A',
      formulaMedica: consultaData.formulaMedica?.medicamentos || 'N/A',
      incapacidad: consultaData.incapacidad || null,
      indicaciones: consultaData.seguimientoConsulta?.recomendaciones || consultaData.seguimientoConsulta?.indicaciones || 'N/A',
      proximaCita: consultaData.detalleConsulta?.proximaCita || consultaData.seguimientoConsulta?.proximaCita || 'N/A',
      observaciones: consultaData.informacionConsulta?.observaciones || consultaData.seguimientoConsulta?.recomendaciones || 'N/A'
    };
  } catch (error) {
    console.error('Error parsing consulta JSON:', error);
    processedConsulta = {
      id: consulta.id,
      numero: 1,
      tipo: 'Consulta Médica Individual',
      fecha: consulta.fechaCreacion,
      medico: 'N/A',
      especialidad: 'N/A',
      motivo: 'N/A',
      enfermedadActual: 'N/A',
      diagnosticos: 'N/A',
      planTratamiento: 'N/A',
      examenFisico: 'N/A',
      signosVitales: 'N/A',
      formulaMedica: 'N/A',
      incapacidad: null,
      indicaciones: 'N/A',
      proximaCita: 'N/A',
      observaciones: 'N/A'
    };
  }

  const printContent = createPrintContent([processedConsulta], true, null, patient, patientData, historiaClinica);
  printDocument(printContent);
};

/**
 * Imprime el documento en una nueva ventana
 * @param {string} content - Contenido HTML a imprimir
 */
export const printDocument = (content) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};
