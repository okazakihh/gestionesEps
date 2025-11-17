import React from 'react';
import { Grid, TextInput, Select, Paper, Stack, Group, Text } from '@mantine/core';
import { IconUser, IconCalendar, IconBuilding } from '@tabler/icons-react';
import { useTheme } from '../../../../../../negocio/contexts/ThemeContext.jsx';

/**
 * Tab 1: Datos del Paciente y Procedimiento
 */
const DatosProcedimientoTab = ({ formData, setFormData, patientData }) => {
  const { tema } = useTheme();
  const ambitoOptions = [
    { value: 'ambulatorio', label: 'Ambulatorio' },
    { value: 'hospitalizacion', label: 'Hospitalización' },
    { value: 'urgencias', label: 'Urgencias' }
  ];

  const finalidadOptions = [
    { value: 'diagnostico', label: 'Diagnóstico' },
    { value: 'tratamiento', label: 'Tratamiento' },
    { value: 'prevencion', label: 'Prevención' },
    { value: 'control', label: 'Control' }
  ];

  return (
    <Stack gap="md">
      {/* Datos del Procedimiento */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconCalendar size={18} style={{ color: tema.primaryColor }} />
          <Text size="sm" fw={600}>Datos del Procedimiento Inicial</Text>
        </Group>
        <Grid gutter="md">
          <Grid.Col span={6}>
            <TextInput
              label="Fecha de Apertura"
              type="date"
              value={formData.fechaApertura}
              onChange={(e) => setFormData({ ...formData, fechaApertura: e.target.value })}
              required
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Hora"
              type="time"
              value={formData.horaApertura}
              onChange={(e) => setFormData({ ...formData, horaApertura: e.target.value })}
              required
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              label="Médico Responsable"
              value={formData.procedimiento.medicoResponsable}
              onChange={(e) => setFormData({
                ...formData,
                procedimiento: { ...formData.procedimiento, medicoResponsable: e.target.value }
              })}
              required
              leftSection={<IconUser size={16} />}
              leftSectionWidth={45}
              styles={{ input: { paddingLeft: '50px' } }}
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Registro Médico"
              value={formData.procedimiento.registroMedico}
              onChange={(e) => setFormData({
                ...formData,
                procedimiento: { ...formData.procedimiento, registroMedico: e.target.value }
              })}
              required
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Especialidad"
              value={formData.procedimiento.especialidad}
              onChange={(e) => setFormData({
                ...formData,
                procedimiento: { ...formData.procedimiento, especialidad: e.target.value }
              })}
              required
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              label="Entidad Prestadora"
              value={formData.procedimiento.entidadPrestadora}
              onChange={(e) => setFormData({
                ...formData,
                procedimiento: { ...formData.procedimiento, entidadPrestadora: e.target.value }
              })}
              leftSection={<IconBuilding size={16} />}
              leftSectionWidth={45}
              styles={{ input: { paddingLeft: '50px' } }}
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Ámbito del Procedimiento"
              data={ambitoOptions}
              value={formData.procedimiento.ambito}
              onChange={(value) => setFormData({
                ...formData,
                procedimiento: { ...formData.procedimiento, ambito: value }
              })}
              required
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Finalidad"
              data={finalidadOptions}
              value={formData.procedimiento.finalidad}
              onChange={(value) => setFormData({
                ...formData,
                procedimiento: { ...formData.procedimiento, finalidad: value }
              })}
              required
              size="sm"
            />
          </Grid.Col>
        </Grid>
      </Paper>
    </Stack>
  );
};

export default DatosProcedimientoTab;
