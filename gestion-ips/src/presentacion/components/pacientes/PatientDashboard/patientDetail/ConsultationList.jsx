import React from 'react';
import { Paper, Stack, Group, Title, Button, Text, Badge } from '@mantine/core';
import { IconCalendar, IconEye } from '@tabler/icons-react';
import { useTheme } from '../../../../../negocio/contexts/ThemeContext';
import { formatDate } from '../../../../../negocio/utils/pacientes/patientModalUtils';
import { AnamnesisSection, DiagnosisAndTreatmentSection, DigitalSignatureSection, IncapacitySection, PhysicalExamSection, ProcedureDataSection } from './ClinicalHistorySections';

const ConsultationItem = ({ consulta, index, onPreviewConsulta, onPreviewIncapacidad, onPreviewTratamiento, onPreviewExamenes }) => {
  const { tema } = useTheme();
  let parsedConsulta = null;
  try {
    parsedConsulta = consulta.datosJson ? JSON.parse(consulta.datosJson) : {};
  } catch (e) {
    console.error('Error parsing consulta data:', e);
  }

  return (
    <Paper key={consulta.id} p="md" withBorder style={{ backgroundColor: `${tema.primaryColor}08` }}>
      {/* Header de Consulta */}
      <Group justify="space-between" mb="md" pb="sm" style={{ borderBottom: `2px solid ${tema.primaryColor}30` }}>
        <Group gap="md">
          <Badge size="xl" circle color={tema.mantineColor} variant="filled">{index + 1}</Badge>
          <Stack gap={2}>
            <Text size="sm" fw={700}>Consulta #{consulta.id}</Text>
            <Group gap="xs">
              <IconCalendar size={14} style={{ color: tema.primaryColor }} />
              <Text size="xs" c="dimmed">
                {parsedConsulta?.detalleConsulta?.fechaConsulta ? formatDate(parsedConsulta.detalleConsulta.fechaConsulta) : formatDate(consulta.fechaCreacion)}
              </Text>
            </Group>
          </Stack>
        </Group>
        <Group gap="sm">
          <Button leftSection={<IconEye size={16} />} onClick={() => onPreviewIncapacidad(consulta)} variant="outline" color={tema.mantineColor} size="xs">Incapacidad</Button>
          <Button leftSection={<IconEye size={16} />} onClick={() => onPreviewTratamiento(consulta)} variant="outline" color={tema.mantineColor} size="xs">Tratamiento</Button>
          <Button leftSection={<IconEye size={16} />} onClick={() => onPreviewExamenes(consulta)} variant="outline" color={tema.mantineColor} size="xs">Exámenes</Button>
          <Button leftSection={<IconEye size={16} />} onClick={() => onPreviewConsulta(consulta)} variant="outline" color={tema.mantineColor} size="xs">Vista Previa</Button>
        </Group>
      </Group>

      {/* Contenido de la Consulta */}
      {parsedConsulta && (
        <Stack gap="md">
          <ProcedureDataSection data={parsedConsulta.detalleConsulta} />
          <AnamnesisSection data={parsedConsulta.informacionConsulta} />
          <PhysicalExamSection data={parsedConsulta.examenFisico} />
          <DiagnosisAndTreatmentSection data={parsedConsulta.diagnosticoTratamiento} />
          <IncapacitySection data={parsedConsulta.incapacidad} />
          <DigitalSignatureSection data={parsedConsulta.firmaDigital} />
        </Stack>
      )}
    </Paper>
  );
};

/**
 * Muestra la lista de consultas médicas de un paciente.
 * @param {object} props
 * @param {Array} props.consultas - El array de consultas.
 * @param {Function} props.onPreviewConsulta - Función para abrir la vista previa de una consulta.
 * @param {Function} props.onPreviewIncapacidad - Función para abrir la vista previa de incapacidad.
 * @param {Function} props.onPreviewTratamiento - Función para abrir la vista previa de tratamiento.
 * @param {Function} props.onPreviewExamenes - Función para abrir la vista previa de exámenes.
 */
const ConsultationList = ({
  consultas = [],
  onPreviewConsulta,
  onPreviewIncapacidad,
  onPreviewTratamiento,
  onPreviewExamenes
}) => {
  const { tema } = useTheme();

  return (
    <Stack gap="md">
      <Title order={5} size="h6" style={{ color: tema.primaryColor }}>
        <Group gap="xs">
          <IconCalendar size={18} />
          Consultas Médicas ({consultas?.length || 0})
        </Group>
      </Title>

      {consultas && consultas.length > 0 ? (
        consultas.map((consulta, index) => (
          <ConsultationItem
            key={consulta.id}
            consulta={consulta}
            index={index}
            onPreviewConsulta={onPreviewConsulta}
            onPreviewIncapacidad={onPreviewIncapacidad}
            onPreviewTratamiento={onPreviewTratamiento}
            onPreviewExamenes={onPreviewExamenes}
          />
        ))
      ) : (
        <Paper p="xl" withBorder>
          <Text size="sm" c="dimmed" ta="center">
            No hay consultas registradas
          </Text>
        </Paper>
      )}
    </Stack>
  );
};

export default ConsultationList;
