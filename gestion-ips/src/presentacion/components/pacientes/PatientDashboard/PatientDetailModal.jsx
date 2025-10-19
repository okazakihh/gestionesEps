import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  HeartIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ClockIcon,
  BuildingOfficeIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { pacientesApiService, historiasClinicasApiService, consultasApiService } from '../../../../data/services/pacientesApiService.js';

const PatientDetailModal = ({ patientId, isOpen, onClose }) => {
  const [patient, setPatient] = useState(null);
  const [historiaClinica, setHistoriaClinica] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (isOpen && patientId) {
      loadPatientDetails();
    }
  }, [isOpen, patientId]);

  const loadPatientDetails = async () => {
    try {
      setLoading(true);

      // Load patient basic info
      const patientResponse = await pacientesApiService.getPacienteById(patientId);
      setPatient(patientResponse);

      // Load clinical history
      try {
        const historiaResponse = await historiasClinicasApiService.getHistoriaClinicaByPaciente(patientId);
        setHistoriaClinica(historiaResponse);

        // Load consultations if history exists
        if (historiaResponse?.id) {
          const consultasResponse = await consultasApiService.getConsultasByHistoria(historiaResponse.id, { page: 0, size: 10 });
          setConsultas(consultasResponse.content || []);
        }
      } catch (error) {
        console.log('No clinical history found for patient:', patientId);
        setHistoriaClinica(null);
        setConsultas([]);
      }

    } catch (error) {
      console.error('Error loading patient details:', error);
    } finally {
      setLoading(false);
    }
  };

  const parsePatientData = (patient) => {
    try {
      if (patient?.datosJson) {
        const firstLevel = typeof patient.datosJson === 'string' ? JSON.parse(patient.datosJson) : patient.datosJson;

        // Try nested format first (existing patients)
        if (firstLevel.datosJson) {
          const secondLevel = typeof firstLevel.datosJson === 'string' ? JSON.parse(firstLevel.datosJson) : firstLevel.datosJson;
          return {
            ...secondLevel,
            consentimientoInformado: secondLevel.consentimientoInformado || {}
          };
        }

        // Try flat format (newly created patients)
        if (firstLevel.informacionPersonalJson || firstLevel.informacionContactoJson) {
          return {
            informacionPersonal: firstLevel.informacionPersonalJson ? JSON.parse(firstLevel.informacionPersonalJson) : {},
            informacionContacto: firstLevel.informacionContactoJson ? JSON.parse(firstLevel.informacionContactoJson) : {},
            informacionMedica: firstLevel.informacionMedicaJson ? JSON.parse(firstLevel.informacionMedicaJson) : {},
            contactoEmergencia: firstLevel.contactoEmergenciaJson ? JSON.parse(firstLevel.contactoEmergenciaJson) : {},
            consentimientoInformado: firstLevel.consentimientoInformadoJson ? JSON.parse(firstLevel.consentimientoInformadoJson) : {}
          };
        }
      }
    } catch (error) {
      console.error('Error parsing patient data:', error);
    }
    return {};
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      return `${age} años`;
    } catch (error) {
      return 'N/A';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      let date;

      // Handle LocalDateTime serialized as array [year, month, day, hour, minute, second, nanosecond]
      if (Array.isArray(dateString) && dateString.length >= 6) {
        // LocalDateTime comes as [2024, 12, 15, 10, 30, 0, 0]
        date = new Date(dateString[0], dateString[1] - 1, dateString[2], dateString[3], dateString[4], dateString[5]);
      } else if (typeof dateString === 'string') {
        // Try different parsing strategies
        if (dateString.includes('T')) {
          // ISO format with time: "2024-12-15T10:30:00.000+00:00"
          date = new Date(dateString);
        } else if (dateString.includes('-')) {
          // Date only format: "2024-12-15"
          date = new Date(dateString + 'T00:00:00');
        } else {
          // Other string formats
          date = new Date(dateString);
        }
      } else if (dateString instanceof Date) {
        date = dateString;
      } else {
        date = new Date(dateString);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }

      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Error en fecha';
    }
  };

  const printHistoriaClinica = () => {
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

    const printContent = createPrintContent(allConsultas, false, historiaData);
    printDocument(printContent);
  };

  const printConsulta = (consulta) => {
    // Parsear datos JSON de la historia clínica para obtener información del médico
    let historiaData = null;
    try {
      const parsed = JSON.parse(historiaClinica.datosJson || '{}');
      // Handle nested structure if exists
      historiaData = parsed.datosJson ? JSON.parse(parsed.datosJson) : parsed;
    } catch (error) {
      console.error('Error parsing historia clinica JSON:', error);
      historiaData = null;
    }

    // Parsear datos JSON de la consulta específica
    let consultaParsed = {};
    try {
      consultaParsed = JSON.parse(consulta.datosJson || '{}');
    } catch (error) {
      console.error('Error parsing consulta JSON:', error);
    }

    // Create print-friendly content for a specific consultation
    const consultaData = {
      id: consulta.id,
      numero: 1,
      tipo: 'Consulta Médica Individual',
      fecha: consultaParsed.detalleConsulta?.fechaConsulta || consulta.fechaCreacion,
      medico: consultaParsed.detalleConsulta?.medicoTratante || consultaParsed.informacionMedico?.medicoTratante || 'N/A',
      especialidad: consultaParsed.detalleConsulta?.especialidad || consultaParsed.informacionMedico?.especialidad || 'N/A',
      motivo: consultaParsed.informacionConsulta?.motivoConsulta || consultaParsed.detalleConsulta?.motivoConsulta || 'N/A',
      enfermedadActual: consultaParsed.informacionConsulta?.enfermedadActual || consultaParsed.detalleConsulta?.enfermedadActual || 'N/A',
      diagnosticos: consultaParsed.diagnosticoTratamiento?.diagnosticos || consultaParsed.diagnosticoTratamiento?.diagnosticoPrincipal || 'N/A',
      planTratamiento: consultaParsed.diagnosticoTratamiento?.planTratamiento || consultaParsed.diagnosticoTratamiento?.planManejo || 'N/A',
      examenFisico: consultaParsed.examenClinico?.examenFisico || 'N/A',
      signosVitales: consultaParsed.examenClinico?.signosVitales || 'N/A',
      formulaMedica: consultaParsed.formulaMedica?.medicamentos || 'N/A',
      incapacidad: consultaParsed.incapacidad || null,
      indicaciones: consultaParsed.seguimientoConsulta?.recomendaciones || consultaParsed.seguimientoConsulta?.indicaciones || 'N/A',
      proximaCita: consultaParsed.detalleConsulta?.proximaCita || consultaParsed.seguimientoConsulta?.proximaCita || 'N/A',
      observaciones: consultaParsed.informacionConsulta?.observaciones || consultaParsed.seguimientoConsulta?.recomendaciones || 'N/A'
    };

    const printContent = createPrintContent([consultaData], true, historiaData);
    printDocument(printContent);
  };

  const createPrintContent = (consultas, isSingleConsulta = false, historiaData = null) => {
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

  const printDocument = (content) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const patientData = patient ? parsePatientData(patient) : {};

  const tabs = [
    { id: 'personal', name: 'Información Personal', icon: UserIcon },
    { id: 'contacto', name: 'Contacto', icon: PhoneIcon },
    { id: 'medica', name: 'Información Médica', icon: HeartIcon },
    { id: 'emergencia', name: 'Contacto Emergencia', icon: IdentificationIcon },
    { id: 'consentimiento', name: 'Consentimiento', icon: DocumentTextIcon },
    { id: 'clinica', name: 'Historia Clínica', icon: DocumentTextIcon },
  ];

  // Determinar si mostrar las pestañas normales o la vista completa
  const showTabs = !['clinica_completa'].includes(activeTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-4/5 h-4/5">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {patientData.informacionPersonal?.primerNombre} {patientData.informacionPersonal?.segundoNombre} {patientData.informacionPersonal?.primerApellido} {patientData.informacionPersonal?.segundoApellido}
                  </h3>
                  <p className="text-blue-100">
                    {patient?.tipoDocumento} {patient?.numeroDocumento} • {calculateAge(patientData.informacionPersonal?.fechaNacimiento)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          {showTabs && (
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Información Personal */}
                {activeTab === 'personal' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ maxWidth: 'none' }}>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Datos Personales</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Primer Nombre:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.primerNombre || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Segundo Nombre:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.segundoNombre || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Primer Apellido:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.primerApellido || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Segundo Apellido:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.segundoApellido || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fecha de Nacimiento:</span>
                          <span className="font-medium">{formatDate(patientData.informacionPersonal?.fechaNacimiento)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Edad:</span>
                          <span className="font-medium">{calculateAge(patientData.informacionPersonal?.fechaNacimiento)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Género:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.genero || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado Civil:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.estadoCivil || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tipo de Sangre:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.tipoSangre || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nacionalidad:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.nacionalidad || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estrato Socioeconómico:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.estratoSocioeconomico || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Grupo Étnico:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.grupoEtnico || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Discapacidad:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.discapacidad || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ocupación:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.ocupacion || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nivel Educativo:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.nivelEducativo || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Información del Sistema</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID del Paciente:</span>
                          <span className="font-medium">{patient?.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tipo Documento:</span>
                          <span className="font-medium">{patient?.tipoDocumento}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Número Documento:</span>
                          <span className="font-medium">{patient?.numeroDocumento}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado:</span>
                          <span className={`font-medium ${patient?.activo ? 'text-green-600' : 'text-red-600'}`}>
                            {patient?.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fecha Registro:</span>
                          <span className="font-medium">{formatDate(patient?.fechaCreacion)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Última Actualización:</span>
                          <span className="font-medium">{formatDate(patient?.fechaActualizacion)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Información de Contacto */}
                {activeTab === 'contacto' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Información de Contacto</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ maxWidth: 'none' }}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Teléfono Principal</p>
                            <p className="font-medium">{patientData.informacionContacto?.telefono || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="text-sm text-gray-600">Teléfono Móvil</p>
                            <p className="font-medium">{patientData.informacionPersonal?.telefonoMovil || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{patientData.informacionContacto?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Dirección</p>
                            <p className="font-medium">{patientData.informacionContacto?.direccion || 'N/A'}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {patientData.informacionContacto?.ciudad}, {patientData.informacionContacto?.departamento}
                            </p>
                            <p className="text-sm text-gray-600">
                              {patientData.informacionContacto?.pais}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Información Médica */}
                {activeTab === 'medica' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Médica</h4>
                    <div className="space-y-6">
                      {/* Información básica médica */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ maxWidth: 'none' }}>
                        <div className="flex items-center space-x-3">
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">EPS</p>
                            <p className="font-medium">{patientData.informacionMedica?.eps || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <HeartIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Régimen de Afiliación</p>
                            <p className="font-medium">{patientData.informacionMedica?.regimenAfiliacion || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <HeartIcon className="h-5 w-5 text-red-400" />
                          <div>
                            <p className="text-sm text-gray-600">Tipo de Sangre</p>
                            <p className="font-medium">{patientData.informacionPersonal?.tipoSangre || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Antecedentes médicos */}
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <h5 className="font-semibold text-gray-900 mb-3">Antecedentes Médicos</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Antecedentes Personales</p>
                            <p className="font-medium bg-white p-3 rounded border min-h-[80px]">
                              {patientData.informacionMedica?.antecedentesPersonales || 'No registrados'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Antecedentes Familiares</p>
                            <p className="font-medium bg-white p-3 rounded border min-h-[80px]">
                              {patientData.informacionMedica?.antecedentesFamiliares || 'No registrados'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Enfermedades Crónicas</p>
                            <p className="font-medium bg-white p-3 rounded border min-h-[60px]">
                              {patientData.informacionMedica?.enfermedadesCronicas || 'Ninguna registrada'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Vacunas e Inmunizaciones</p>
                            <p className="font-medium bg-white p-3 rounded border min-h-[60px]">
                              {patientData.informacionMedica?.vacunas || 'No registradas'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Información actual */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Alergias</p>
                          <p className="font-medium bg-yellow-50 p-3 rounded-md border">
                            {patientData.informacionMedica?.alergias || 'Ninguna registrada'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Medicamentos Actuales</p>
                          <p className="font-medium bg-blue-50 p-3 rounded-md border">
                            {patientData.informacionMedica?.medicamentosActuales || 'Ninguno registrado'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-2">Observaciones Médicas Adicionales</p>
                        <p className="font-medium bg-gray-50 p-4 rounded-md border min-h-[100px]">
                          {patientData.informacionMedica?.observacionesMedicas || 'Sin observaciones registradas'}
                        </p>
                      </div>

                    </div>
                  </div>
                )}

                {/* Contacto de Emergencia */}
                {activeTab === 'emergencia' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Contacto de Emergencia</h4>
                    <div className="space-y-6">
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-2 mb-3">
                          <IdentificationIcon className="h-5 w-5 text-red-600" />
                          <h5 className="font-semibold text-red-900">Información de Emergencia</h5>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ maxWidth: 'none' }}>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-red-700 font-medium">Nombre Completo</p>
                              <p className="font-semibold text-lg text-red-900">{patientData.contactoEmergencia?.nombreContacto || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-red-700 font-medium">Relación</p>
                              <p className="font-medium text-red-800">{patientData.contactoEmergencia?.relacion || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <PhoneIcon className="h-5 w-5 text-red-500" />
                              <div>
                                <p className="text-sm text-red-700 font-medium">Teléfono Principal</p>
                                <p className="font-semibold text-red-900">{patientData.contactoEmergencia?.telefonoContacto || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <PhoneIcon className="h-5 w-5 text-orange-500" />
                              <div>
                                <p className="text-sm text-red-700 font-medium">Teléfono Secundario</p>
                                <p className="font-medium text-red-800">{patientData.contactoEmergencia?.telefonoContactoSecundario || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Consentimiento Informado */}
                {activeTab === 'consentimiento' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Consentimiento Informado</h4>

                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                        <h5 className="text-xl font-semibold text-blue-900">Consentimiento para Tratamiento Médico</h5>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded border">
                          <h6 className="font-semibold text-gray-900 mb-3">Consentimientos Otorgados</h6>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700">Tratamiento Médico:</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                patientData.consentimientoInformado?.aceptaTratamiento
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {patientData.consentimientoInformado?.aceptaTratamiento ? '✓ Aceptado' : '✗ No aceptado'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700">Privacidad de Datos (Ley 1581):</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                patientData.consentimientoInformado?.aceptaPrivacidad
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {patientData.consentimientoInformado?.aceptaPrivacidad ? '✓ Aceptado' : '✗ No aceptado'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700">Tratamiento Datos Sensibles:</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                patientData.consentimientoInformado?.aceptaDatosPersonales
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {patientData.consentimientoInformado?.aceptaDatosPersonales ? '✓ Aceptado' : '✗ No aceptado'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700">Uso de Imágenes:</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                patientData.consentimientoInformado?.aceptaImagenes
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {patientData.consentimientoInformado?.aceptaImagenes ? '✓ Aceptado' : '○ Opcional'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded border">
                          <h6 className="font-semibold text-gray-900 mb-3">Información Legal</h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 font-medium">Fecha de Consentimiento:</span>
                              <p className="font-medium">{formatDate(patientData.consentimientoInformado?.fechaConsentimiento) || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Testigo:</span>
                              <p className="font-medium">{patientData.consentimientoInformado?.testigoConsentimiento || 'N/A'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                          <div className="flex items-start space-x-3">
                            <svg className="h-5 w-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <div>
                              <h6 className="font-semibold text-yellow-900 mb-2">Información Legal Importante</h6>
                              <div className="text-sm text-yellow-800 space-y-1">
                                <p>• Este consentimiento cumple con la <strong>Ley 1581 de 2012</strong> (Protección de Datos Personales)</p>
                                <p>• El paciente ha sido informado sobre sus derechos y deberes según la <strong>Ley 1751 de 2015</strong></p>
                                <p>• Los datos médicos sensibles están protegidos por la normatividad colombiana</p>
                                <p>• El paciente puede revocar este consentimiento en cualquier momento</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Historia Clínica */}
                {activeTab === 'clinica' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">Historia Clínica</h4>
                      {historiaClinica && (
                        <button
                          onClick={() => setActiveTab('clinica_completa')}
                          className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-2" />
                          Ver Historia Clínica Completa
                        </button>
                      )}
                    </div>

                    {!historiaClinica ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay historia clínica</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Este paciente aún no tiene una historia clínica registrada.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Información de la Historia */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-blue-900 mb-2">Información General</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm" style={{ maxWidth: 'none' }}>
                            <div>
                              <span className="text-blue-700">Número de Historia:</span>
                              <p className="font-medium">{historiaClinica.numeroHistoria}</p>
                            </div>
                            <div>
                              <span className="text-blue-700">Fecha de Apertura:</span>
                              <p className="font-medium">{formatDate(historiaClinica.fechaApertura)}</p>
                            </div>
                            <div>
                              <span className="text-blue-700">Estado:</span>
                              <p className="font-medium">{historiaClinica.activa ? 'Activa' : 'Inactiva'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Consultas Médicas */}
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-4">Consultas Médicas ({consultas.length})</h5>

                          {consultas.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                              <CalendarDaysIcon className="mx-auto h-8 w-8 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">No hay consultas registradas</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {consultas.map((consulta, index) => (
                                <div key={consulta.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">Consulta #{consulta.id}</p>
                                        <p className="text-sm text-gray-600">
                                          {formatDate(consulta.fechaCreacion)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-gray-500">Creada</p>
                                      <p className="text-sm font-medium">{formatDate(consulta.fechaCreacion)}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Historia Clínica Completa */}
                {activeTab === 'clinica_completa' && historiaClinica && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">Historia Clínica Completa</h4>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => printHistoriaClinica()}
                          className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          title="Imprimir historia clínica completa"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          Imprimir HC
                        </button>
                        <button
                          onClick={() => setActiveTab('clinica')}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Volver
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Información Completa de la Historia */}
                      <div className="bg-gray-50 p-6 rounded-lg border">
                        <h5 className="font-semibold text-gray-900 mb-6 text-lg border-b pb-2">Información General de la Historia Clínica</h5>

                        {/* Header con información básica */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-sm">
                          <div>
                            <span className="text-gray-600 font-medium">Número de Historia:</span>
                            <p className="font-semibold text-gray-900 text-lg">{historiaClinica.numeroHistoria}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">Fecha de Apertura:</span>
                            <p className="font-medium text-gray-900">{formatDate(historiaClinica.fechaApertura)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">Estado:</span>
                            <p className="font-medium text-gray-900">{historiaClinica.activa ? 'Activa' : 'Inactiva'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">Total Consultas:</span>
                            <p className="font-medium text-gray-900">{consultas.length}</p>
                          </div>
                        </div>

                        {/* Datos Detallados de la Historia Clínica */}
                        {historiaClinica.datosJson && (
                          <div className="space-y-6">
                            {(() => {
                              try {
                                const parsed = JSON.parse(historiaClinica.datosJson);
                                const datosHistoria = parsed.datosJson ? JSON.parse(parsed.datosJson) : {};

                                return (
                                  <div className="space-y-6">
                                    {/* Información del Médico e Información de Consulta en una fila */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                      {/* Información del Médico */}
                                      {(datosHistoria.informacionMedico || datosHistoria.detalleConsulta) && (
                                        <div className="bg-white p-4 rounded-lg border">
                                          <h6 className="font-semibold text-gray-900 mb-3 flex items-center border-b pb-2">
                                            <UserIcon className="h-4 w-4 mr-2 text-blue-600" />
                                            Médico Responsable
                                          </h6>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Nombre:</span>
                                              <span className="font-medium">{(datosHistoria.informacionMedico?.medicoResponsable || datosHistoria.detalleConsulta?.medicoTratante) || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Registro:</span>
                                              <span className="font-medium">{(datosHistoria.informacionMedico?.registroMedico) || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Especialidad:</span>
                                              <span className="font-medium">{(datosHistoria.informacionMedico?.especialidad || datosHistoria.detalleConsulta?.especialidad) || 'N/A'}</span>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Información de la Consulta */}
                                      {datosHistoria.informacionConsulta && (
                                        <div className="bg-white p-4 rounded-lg border">
                                          <h6 className="font-semibold text-gray-900 mb-3 flex items-center border-b pb-2">
                                            <DocumentTextIcon className="h-4 w-4 mr-2 text-green-600" />
                                            Consulta Inicial
                                          </h6>
                                          <div className="space-y-2 text-sm">
                                            <div>
                                              <span className="text-gray-600 font-medium">Motivo:</span>
                                              <p className="mt-1">{datosHistoria.informacionConsulta.motivoConsulta || 'Apertura de historia clínica'}</p>
                                            </div>
                                            <div>
                                              <span className="text-gray-600 font-medium">Enfermedad Actual:</span>
                                              <p className="mt-1">{datosHistoria.informacionConsulta.enfermedadActual || 'N/A'}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Antecedentes Clínicos */}
                                    {datosHistoria.antecedentesClinico && (
                                      <div className="bg-white p-4 rounded-lg border">
                                        <h6 className="font-semibold text-gray-900 mb-3 flex items-center border-b pb-2">
                                          <HeartIcon className="h-4 w-4 mr-2 text-red-600" />
                                          Antecedentes Clínicos
                                        </h6>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <span className="text-gray-600 font-medium">Personales:</span>
                                            <p className="mt-1">{datosHistoria.antecedentesClinico.antecedentesPersonales || 'N/A'}</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-600 font-medium">Familiares:</span>
                                            <p className="mt-1">{datosHistoria.antecedentesClinico.antecedentesFamiliares || 'N/A'}</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-600 font-medium">Quirúrgicos:</span>
                                            <p className="mt-1">{datosHistoria.antecedentesClinico.antecedentesQuirurgicos || 'N/A'}</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-600 font-medium">Alérgicos:</span>
                                            <p className="mt-1">{datosHistoria.antecedentesClinico.antecedentesAlergicos || 'N/A'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Examen Clínico y Diagnóstico/Tratamiento en una fila */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                      {/* Examen Clínico */}
                                      {datosHistoria.examenClinico && (
                                        <div className="bg-white p-4 rounded-lg border">
                                          <h6 className="font-semibold text-gray-900 mb-3 flex items-center border-b pb-2">
                                            <IdentificationIcon className="h-4 w-4 mr-2 text-purple-600" />
                                            Examen Clínico
                                          </h6>
                                          <div className="space-y-2 text-sm">
                                            <div>
                                              <span className="text-gray-600 font-medium">Examen Físico:</span>
                                              <p className="mt-1">{datosHistoria.examenClinico.examenFisico || 'N/A'}</p>
                                            </div>
                                            <div>
                                              <span className="text-gray-600 font-medium">Signos Vitales:</span>
                                              <p className="mt-1">{datosHistoria.examenClinico.signosVitales || 'N/A'}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Diagnóstico y Tratamiento */}
                                      {datosHistoria.diagnosticoTratamiento && (
                                        <div className="bg-white p-4 rounded-lg border">
                                          <h6 className="font-semibold text-gray-900 mb-3 flex items-center border-b pb-2">
                                            <DocumentTextIcon className="h-4 w-4 mr-2 text-orange-600" />
                                            Diagnóstico y Tratamiento
                                          </h6>
                                          <div className="space-y-2 text-sm">
                                            <div>
                                              <span className="text-gray-600 font-medium">Diagnósticos:</span>
                                              <p className="mt-1">{datosHistoria.diagnosticoTratamiento.diagnosticos || 'N/A'}</p>
                                            </div>
                                            <div>
                                              <span className="text-gray-600 font-medium">Plan de Tratamiento:</span>
                                              <p className="mt-1">{datosHistoria.diagnosticoTratamiento.planTratamiento || 'N/A'}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Información adicional de consulta si existe */}
                                    {datosHistoria.informacionConsulta && (datosHistoria.informacionConsulta.revisionSistemas || datosHistoria.informacionConsulta.medicamentosActuales || datosHistoria.informacionConsulta.observaciones) && (
                                      <div className="bg-white p-4 rounded-lg border">
                                        <h6 className="font-semibold text-gray-900 mb-3">Información Adicional de la Consulta</h6>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                          {datosHistoria.informacionConsulta.revisionSistemas && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Revisión de Sistemas:</span>
                                              <p className="mt-1">{datosHistoria.informacionConsulta.revisionSistemas}</p>
                                            </div>
                                          )}
                                          {datosHistoria.informacionConsulta.medicamentosActuales && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Medicamentos:</span>
                                              <p className="mt-1">{datosHistoria.informacionConsulta.medicamentosActuales}</p>
                                            </div>
                                          )}
                                          {datosHistoria.informacionConsulta.observaciones && (
                                            <div className="md:col-span-3">
                                              <span className="text-gray-600 font-medium">Observaciones:</span>
                                              <p className="mt-1 bg-gray-50 p-2 rounded">{datosHistoria.informacionConsulta.observaciones}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              } catch (e) {
                                return (
                                  <div className="bg-gray-100 p-4 rounded border">
                                    <h6 className="font-medium text-gray-800 mb-2">Datos Adicionales (JSON Crudo):</h6>
                                    <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto bg-white p-2 rounded">
                                      {historiaClinica.datosJson}
                                    </pre>
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        )}
                      </div>

                      {/* Detalle Completo de Consultas Médicas */}
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-4 text-lg">Consultas Médicas Detalladas ({consultas.length})</h5>

                        {consultas.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <CalendarDaysIcon className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">No hay consultas registradas</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {consultas.map((consulta, index) => (
                              <div key={consulta.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                {/* Header de la consulta */}
                                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                      <span className="text-lg font-bold text-blue-600">{index + 1}</span>
                                    </div>
                                    <div>
                                      <h6 className="text-xl font-semibold text-gray-900">Consulta #{consulta.id}</h6>
                                      <p className="text-sm text-gray-600 flex items-center">
                                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                                        {formatDate(consulta.fechaCreacion)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <button
                                      onClick={() => printConsulta(consulta)}
                                      className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                      title="Imprimir esta consulta"
                                    >
                                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                      </svg>
                                      Imprimir
                                    </button>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">Historia Clínica</p>
                                      <p className="text-sm font-semibold text-blue-600">{historiaClinica.numeroHistoria}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Información Detallada de la Consulta */}
                                {consulta.datosJson && (
                                  <div className="space-y-6">
                                    {(() => {
                                      try {
                                        const parsed = JSON.parse(consulta.datosJson);

                                        return (
                                          <div className="space-y-6">
                                            {/* Primera fila: Detalle de consulta e Información médica */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                              {/* Detalle de la Consulta */}
                                              {parsed.detalleConsulta && (
                                                <div className="bg-gray-50 p-4 rounded-lg border">
                                                  <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                    <CalendarDaysIcon className="h-4 w-4 mr-2 text-blue-600" />
                                                    Detalle de la Consulta
                                                  </h6>
                                                  <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                      <span className="text-gray-600">Médico Tratante:</span>
                                                      <span className="font-medium">{parsed.detalleConsulta.medicoTratante || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                      <span className="text-gray-600">Especialidad:</span>
                                                      <span className="font-medium">{parsed.detalleConsulta.especialidad || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                      <span className="text-gray-600">Fecha Consulta:</span>
                                                      <span className="font-medium">{parsed.detalleConsulta.fechaConsulta ? formatDate(parsed.detalleConsulta.fechaConsulta) : 'N/A'}</span>
                                                    </div>
                                                    {parsed.detalleConsulta.proximaCita && (
                                                      <div className="flex justify-between">
                                                        <span className="text-gray-600">Próxima Cita:</span>
                                                        <span className="font-medium">{parsed.detalleConsulta.proximaCita}</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              )}

                                              {/* Información médica adicional */}
                                              {parsed.informacionMedico && (
                                                <div className="bg-gray-50 p-4 rounded-lg border">
                                                  <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                    <UserIcon className="h-4 w-4 mr-2 text-green-600" />
                                                    Información Médica
                                                  </h6>
                                                  <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                      <span className="text-gray-600">Registro Médico:</span>
                                                      <span className="font-medium">{parsed.informacionMedico.registroMedico || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                      <span className="text-gray-600">Especialidad:</span>
                                                      <span className="font-medium">{parsed.informacionMedico.especialidad || 'N/A'}</span>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>

                                            {/* Información de la Consulta */}
                                            {parsed.informacionConsulta && (
                                              <div className="bg-white p-4 rounded-lg border">
                                                <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                  <DocumentTextIcon className="h-4 w-4 mr-2 text-green-600" />
                                                  Información de la Consulta
                                                </h6>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                  <div>
                                                    <span className="text-gray-600 font-medium">Motivo de Consulta:</span>
                                                    <p className="mt-1 font-medium">{parsed.informacionConsulta.motivoConsulta || 'N/A'}</p>
                                                  </div>
                                                  <div>
                                                    <span className="text-gray-600 font-medium">Enfermedad Actual:</span>
                                                    <p className="mt-1 font-medium">{parsed.informacionConsulta.enfermedadActual || 'N/A'}</p>
                                                  </div>
                                                  {parsed.informacionConsulta.revisionSistemas && (
                                                    <div>
                                                      <span className="text-gray-600 font-medium">Revisión de Sistemas:</span>
                                                      <p className="mt-1">{parsed.informacionConsulta.revisionSistemas}</p>
                                                    </div>
                                                  )}
                                                  {parsed.informacionConsulta.medicamentosActuales && (
                                                    <div>
                                                      <span className="text-gray-600 font-medium">Medicamentos Actuales:</span>
                                                      <p className="mt-1">{parsed.informacionConsulta.medicamentosActuales}</p>
                                                    </div>
                                                  )}
                                                  {parsed.informacionConsulta.observaciones && (
                                                    <div className="md:col-span-2">
                                                      <span className="text-gray-600 font-medium">Observaciones:</span>
                                                      <p className="mt-1 bg-gray-50 p-2 rounded">{parsed.informacionConsulta.observaciones}</p>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                            {/* Examen Clínico y Diagnóstico/Tratamiento en una fila */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                              {/* Examen Clínico */}
                                              {parsed.examenClinico && (
                                                <div className="bg-white p-4 rounded-lg border">
                                                  <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                    <IdentificationIcon className="h-4 w-4 mr-2 text-purple-600" />
                                                    Examen Clínico
                                                  </h6>
                                                  <div className="space-y-2 text-sm">
                                                    <div>
                                                      <span className="text-gray-600 font-medium">Examen Físico:</span>
                                                      <p className="mt-1">{parsed.examenClinico.examenFisico || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                      <span className="text-gray-600 font-medium">Signos Vitales:</span>
                                                      <p className="mt-1">{parsed.examenClinico.signosVitales || 'N/A'}</p>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}

                                              {/* Diagnóstico y Tratamiento */}
                                              {parsed.diagnosticoTratamiento && (
                                                <div className="bg-white p-4 rounded-lg border">
                                                  <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                    <HeartIcon className="h-4 w-4 mr-2 text-red-600" />
                                                    Diagnóstico y Tratamiento
                                                  </h6>
                                                  <div className="space-y-2 text-sm">
                                                    <div>
                                                      <span className="text-gray-600 font-medium">Diagnósticos:</span>
                                                      <p className="mt-1">{parsed.diagnosticoTratamiento.diagnosticos || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                      <span className="text-gray-600 font-medium">Plan de Tratamiento:</span>
                                                      <p className="mt-1">{parsed.diagnosticoTratamiento.planTratamiento || 'N/A'}</p>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>

                                            {/* Seguimiento de la Consulta */}
                                            {parsed.seguimientoConsulta && (
                                              <div className="bg-white p-4 rounded-lg border">
                                                <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                  <ClockIcon className="h-4 w-4 mr-2 text-orange-600" />
                                                  Seguimiento de la Consulta
                                                </h6>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                  <div>
                                                    <span className="text-gray-600 font-medium">Evolución:</span>
                                                    <p className="mt-1">{parsed.seguimientoConsulta.evolucion || 'N/A'}</p>
                                                  </div>
                                                  <div>
                                                    <span className="text-gray-600 font-medium">Complicaciones:</span>
                                                    <p className="mt-1">{parsed.seguimientoConsulta.complicaciones || 'N/A'}</p>
                                                  </div>
                                                  <div>
                                                    <span className="text-gray-600 font-medium">Recomendaciones:</span>
                                                    <p className="mt-1">{parsed.seguimientoConsulta.recomendaciones || 'N/A'}</p>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      } catch (e) {
                                        return (
                                          <div className="bg-gray-100 p-4 rounded border">
                                            <h6 className="font-medium text-gray-800 mb-2">Información Detallada (JSON Crudo):</h6>
                                            <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto bg-white p-2 rounded">
                                              {consulta.datosJson}
                                            </pre>
                                          </div>
                                        );
                                      }
                                    })()}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailModal;