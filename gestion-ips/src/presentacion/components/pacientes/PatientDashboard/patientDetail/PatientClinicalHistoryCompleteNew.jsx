import React, { useMemo, useState, useEffect } from 'react';
import { Paper, Stack, Group, Title, Button, ScrollArea, Box, Modal, Image, Text } from '@mantine/core';
import {
  IconFileText,
  IconUser,
  IconHeart,
  IconStethoscope,
  IconClipboard,
  IconArrowLeft,
  IconEye,
  IconCalendar
} from '@tabler/icons-react';
import { useTheme } from '../../../../../negocio/contexts/ThemeContext.jsx';
import { getIpsConfig } from '../../../../../data/services/configuracionApiService.js';
import { generarHistoriaClinicaHTML, generarIncapacidadHTML, generarTratamientoHTML } from '../../HistoriaClinicaHTML.js';
import PatientInfoPreserved from './PatientInfoPreserved.jsx';

// Importar hooks personalizados para limpiar el componente
import { usePatientParser } from '../../../../../negocio/hooks/pacientes/usePatientParser.js';
import { useClinicalHistoryParser } from '../../../../../negocio/hooks/pacientes/useClinicalHistoryParser.js';
import { usePreviewModal } from '../../../../../negocio/hooks/pacientes/usePreviewModal.js';
import { empleadosApiService } from '../../../../../data/services/empleadosApiService.js';

// Importar componentes de sección refactorizados
import SectionTitle from '../../../ui/SectionTitle.jsx';
import { ProcedureDataSection, AnamnesisSection, AntecedentesSection, PhysicalExamSection, DiagnosisAndTreatmentSection, DigitalSignatureSection, IncapacitySection } from './ClinicalHistorySections.jsx';
import ConsultationList from './ConsultationList.jsx';

/**
 * Componente rediseñado para mostrar la historia clínica completa
 * con toda la información visible en formato scroll con Timeline de consultas
 */
const PatientClinicalHistoryCompleteNew = ({
    historiaClinica,
    consultas,
    setActiveTab,
    patient,
    patientData
  }) => {
    const { tema } = useTheme();

    const [ipsData, setIpsData] = useState(null);
    const [empleados, setEmpleados] = useState([]);

    useEffect(() => {
      let mounted = true;
      getIpsConfig()
        .then(data => { if (mounted) setIpsData(data); })
        .catch(err => { console.error('Error loading IPS config:', err); });

      // Cargar empleados para buscar la firma
      empleadosApiService.getEmpleados({ page: 0, size: 500 }) // Asumimos un número grande para traer a todos los médicos
        .then(data => {
          if (mounted && data && data.content) {
            setEmpleados(data.content);
          }
        })
        .catch(err => { console.error('Error loading empleados:', err); });

      return () => { mounted = false; };
    }, []);

    // Usar hooks para limpiar la lógica de parseo
    const parsedPatientData = usePatientParser(patient, patientData);
    const { parsedData, allConsultas } = useClinicalHistoryParser(historiaClinica, consultas);
    const { previewOpen, previewHTML, previewTitle, openPreview, closePreview, handlePrint: handlePrintPreview } = usePreviewModal();

  const medicosConFirma = useMemo(() => {
    if (!empleados || empleados.length === 0) {
      return new Map();
    }
    const map = new Map();
    empleados.forEach(emp => {
      try {
        const info = typeof emp.datosJson === 'string' ? JSON.parse(emp.datosJson).informacionPersonal : emp.datosJson.informacionPersonal;
        const firma = typeof emp.datosJson === 'string' ? JSON.parse(emp.datosJson).firmaDigital : emp.datosJson.firmaDigital;

        if (info && firma) {
          const nombreCompleto = [info.primerNombre, info.segundoNombre, info.primerApellido, info.segundoApellido]
            .filter(Boolean).join(' ').trim();
          if (nombreCompleto) {
            map.set(nombreCompleto, firma);
          }
        }
      } catch (e) {
        // Ignorar errores de parseo si 'datosJson' no es un JSON válido
      }
    });
    return map;
  }, [empleados]);

  const openPreviewForHistoria = async () => {
    try {
      const ipsData = await getIpsConfig();
      // Inyectar la firma del médico en cada consulta
      const consultasConFirma = allConsultas.map(consulta => {
        const firma = medicosConFirma.get(consulta.medico);
        if (firma && !consulta.firmaDigital) { // Solo inyectar si no tiene ya una firma
          return { ...consulta, firmaDigital: firma };
        }
        return consulta;
      });
      const html = generarHistoriaClinicaHTML(consultasConFirma, historiaClinica, patient, parsedPatientData, parsedData, ipsData);
      openPreview(`Historia Clínica - ${historiaClinica?.numeroHistoria || ''}`, html);
    } catch (e) {
      console.error('Error generating historia preview:', e);
    }
  };

  const openPreviewForConsulta = async (consulta) => {
    try {
      const consultaData = consulta.datosJson ? JSON.parse(consulta.datosJson) : {};
      const processed = {
        id: consulta.id,
        numero: 1,
        tipo: 'Consulta Médica Individual',
        fecha: consultaData.detalleConsulta?.fechaConsulta || consulta.fechaCreacion,
        medico: consultaData.detalleConsulta?.medicoTratante || consultaData.informacionMedico?.medicoTratante || 'N/A',
        especialidad: consultaData.detalleConsulta?.especialidad || consultaData.informacionMedico?.especialidad || 'N/A',
        motivo: consultaData.informacionConsulta?.motivoConsulta || consultaData.detalleConsulta?.motivoConsulta || 'N/A',
        enfermedadActual: consultaData.informacionConsulta?.enfermedadActual || consultaData.detalleConsulta?.enfermedadActual || 'N/A',
        diagnosticos: consultaData.diagnosticoTratamiento?.diagnosticos || consultaData.diagnosticoTratamiento?.diagnosticoPrincipal || 'N/A',
        planTratamiento: consultaData.diagnosticoTratamiento?.planTratamiento || consultaData.diagnosticoTratamiento?.planManejo || 'N/A',
        examenFisico: consultaData.examenFisico?.estadoGeneral || consultaData.examenFisico?.hallazgos || consultaData.examenClinico?.examenFisico || 'N/A',
        signosVitales: consultaData.examenFisico?.signosVitales || consultaData.examenClinico?.signosVitales || 'N/A',
        formulaMedica: consultaData.diagnosticoTratamiento?.medicamentos || consultaData.formulaMedica?.medicamentos || 'N/A',
        incapacidad: consultaData.incapacidad || null,
        indicaciones: consultaData.seguimientoConsulta?.recomendaciones || consultaData.seguimientoConsulta?.indicaciones || 'N/A',
        proximaCita: consultaData.detalleConsulta?.proximaCita || consultaData.seguimientoConsulta?.proximaCita || 'N/A',
        observaciones: consultaData.informacionConsulta?.observaciones || consultaData.seguimientoConsulta?.recomendaciones || 'N/A'
      };

      const ipsData = await getIpsConfig();
      const html = generarHistoriaClinicaHTML([processed], historiaClinica, patient, parsedPatientData, null, ipsData);
      openPreview(`Consulta #${consulta.id}`, html);
    } catch (e) {
      console.error('Error generating consulta preview:', e);
    }
  };

  const openPreviewIncapacidadForHistoria = async () => {
    try {
      const historiaData = parsedData || null;
      const initial = {
        incapacidad: historiaData?.diagnosticoPlan?.incapacidad || null,
      };
      const ipsData = await getIpsConfig();
      const html = generarIncapacidadHTML(initial, historiaClinica, patient, parsedPatientData, ipsData);
      openPreview(`Incapacidad - Historia ${historiaClinica?.numeroHistoria || ''}`, html);
    } catch (e) {
      console.error('Error generating incapacidad for historia preview:', e);
    }
  };

  const openPreviewTratamientoForHistoria = async () => {
    const historiaData = parsedData || null;
    const initial = {
      diagnosticos: historiaData?.diagnosticoPlan?.diagnosticos || null,
      planTratamiento: historiaData?.diagnosticoPlan?.planTratamiento || null,
      formulaMedica: historiaData?.diagnosticoPlan?.medicamentos || null,
      medicamentos: historiaData?.diagnosticoPlan?.medicamentos || null
    };
    const ipsData = await getIpsConfig();
    const html = generarTratamientoHTML(initial, historiaClinica, patient, parsedPatientData, ipsData);
    openPreview(`Tratamiento - Historia ${historiaClinica?.numeroHistoria || ''}`, html);
  };

  const openPreviewIncapacidadForConsulta = async (consulta) => {
    try {
      const consultaData = consulta.datosJson ? JSON.parse(consulta.datosJson) : {};
      const processed = { ...consulta, incapacidad: consultaData.incapacidad || consulta.incapacidad || null };
      const ipsData = await getIpsConfig();
      const html = generarIncapacidadHTML(processed, historiaClinica, patient, parsedPatientData, ipsData);
      openPreview(`Incapacidad - Consulta #${consulta.id}`, html);
    } catch (e) {
      console.error('Error generating incapacidad preview:', e);
    }
  };

  const openPreviewTratamientoForConsulta = async (consulta) => {
    try {
      const consultaData = consulta.datosJson ? JSON.parse(consulta.datosJson) : {};
      const processed = {
        ...consulta,
        diagnosticos: consultaData.diagnosticoTratamiento?.diagnosticos || consultaData.diagnosticos || null,
        planTratamiento: consultaData.diagnosticoTratamiento?.planTratamiento || consultaData.planTratamiento || null,
        formulaMedica: consultaData.diagnosticoTratamiento?.medicamentos || consultaData.formulaMedica || null,
        medicamentos: consultaData.diagnosticoTratamiento?.medicamentos || null
      };
      const ipsData = await getIpsConfig();
      const html = generarTratamientoHTML(processed, historiaClinica, patient, parsedPatientData, ipsData);
      openPreview(`Tratamiento - Consulta #${consulta.id}`, html);
    } catch (e) {
      console.error('Error generating tratamiento preview:', e);
    }
  };

  return (
    <Stack gap={0}>
      {/* Header estilo documento */}
      <Paper p="lg" style={{ 
        backgroundColor: 'white',
        borderBottom: `3px solid ${tema.primaryColor}`,
        borderRadius: '8px 8px 0 0'
      }}>
        <Group position="apart" align="center">
          <Group align="center" spacing="sm">
            {ipsData?.logo ? (
              <div style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 4, border: '1px solid #e9ecef' }}>
                <Image src={ipsData.logo} alt="Logo IPS" width={80} height={80} fit="contain" />
              </div>
            ) : null}
            <Stack gap={0}>
              <Title order={3} style={{ color: tema.primaryColor, textAlign: 'left', margin: 0 }}>
                HISTORIA CLÍNICA
              </Title>
              <Text size="xs" c="dimmed" ta="left">
                HC # {historiaClinica?.numeroHistoria || 'N/A'}
              </Text>
            </Stack>
          </Group>
        </Group>
      </Paper>

      {/* Modal de vista previa para impresión */}
      <Modal
        opened={previewOpen}
        onClose={closePreview}
        title={previewTitle}
        size="90%"
        overlayProps={{ color: tema.overlayColor, backgroundOpacity: 0.55, blur: 3 }}
        styles={{
          header: { backgroundColor: `${tema.primaryColor} !important`, padding: '10px 16px' },
          title: { color: 'white !important', fontWeight: 700 },
          close: { color: 'white !important' }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}>
          <Button size="xs" variant="light" color={tema.mantineColor} onClick={handlePrintPreview} >
            Imprimir vista previa
          </Button>
          <Button size="xs" variant="default" onClick={closePreview}>Cerrar</Button>
        </div>
        <div style={{ width: '100%', height: '75vh', overflow: 'auto', border: '1px solid #ddd' }} dangerouslySetInnerHTML={{ __html: previewHTML }} />
      </Modal>

      <PatientInfoPreserved 
        parsedPatientData={parsedPatientData || {}}
        parsedData={parsedData || {}}
        historiaClinica={historiaClinica}
        tema={tema}
      />

      {/* Botones de acción */}
      <Paper p="sm" style={{ 
        backgroundColor: 'white',
        borderLeft: `3px solid ${tema.primaryColor}`,
        borderRight: `3px solid ${tema.primaryColor}`,
        borderRadius: 0
      }}>
        <Group justify="flex-end" gap="xs">
          {/* Botones de impresión eliminados: usar 'Vista' para abrir preview con opción de imprimir */}
          <Button
            leftSection={<IconEye size={14} />}
            onClick={openPreviewForHistoria}
            variant="outline"
            color={tema.mantineColor}
            size="xs"
          >
            Vista HC Completa
          </Button>
          <Button
            leftSection={<IconEye size={14} />}
            onClick={openPreviewTratamientoForHistoria}
            variant="outline"
            color={tema.mantineColor}
            size="xs"
          >
            Vista Tratamiento
          </Button>
          <Button
            leftSection={<IconEye size={14} />}
            onClick={openPreviewIncapacidadForHistoria}
            variant="outline"
            color={tema.mantineColor}
            size="xs"
          >
            Vista Incapacidad
          </Button>
          <Button
            leftSection={<IconArrowLeft size={14} />}
            onClick={() => setActiveTab('clinica')}
            variant="default"
            size="xs"
          >
            Volver
          </Button>
        </Group>
      </Paper>

      {/* Contenido en formato scroll */}
      <ScrollArea h="calc(90vh - 320px)" style={{ 
        borderLeft: `3px solid ${tema.primaryColor}`,
        borderRight: `3px solid ${tema.primaryColor}`,
        borderBottom: `3px solid ${tema.primaryColor}`,
        borderRadius: '0 0 8px 8px',
        backgroundColor: 'white'
      }}>
        <Stack gap="md" p="md">
          
          {/* Sección 1: Datos del Procedimiento */}
          <ProcedureDataSection data={parsedData?.procedimiento} />

          {/* Sección 2: Consulta Inicial - Solo mostrar si hay datos */}
          <AnamnesisSection data={parsedData?.consultaInicial} />

          {/* Sección 3: Antecedentes */}
          <AntecedentesSection data={parsedData?.antecedentes} />

          {/* Sección 4: Examen Físico */}
          <PhysicalExamSection data={parsedData?.examenFisico} />

          {/* Sección 5: Diagnóstico y Tratamiento */}
          <DiagnosisAndTreatmentSection data={parsedData} />

          {/* Firma Digital - Historia Clínica Inicial */}
          <DigitalSignatureSection data={parsedData?.firmaDigital} />

          {/* Incapacidad - Historia Clínica Inicial */}
          <IncapacitySection data={parsedData?.diagnosticoPlan?.incapacidad} />

          {/* Sección 6: Consultas Médicas Detalladas */}
          <ConsultationList
            consultas={consultas}
            onPreviewConsulta={openPreviewForConsulta}
            onPreviewIncapacidad={openPreviewIncapacidadForConsulta}
            onPreviewTratamiento={openPreviewTratamientoForConsulta}
          />

        </Stack>
      </ScrollArea>
    </Stack>
  );
};

export default PatientClinicalHistoryCompleteNew;
