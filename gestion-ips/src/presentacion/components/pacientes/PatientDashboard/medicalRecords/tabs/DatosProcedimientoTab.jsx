import React from 'react';
import { Grid, TextInput, Select, Paper, Stack, Group, Text } from '@mantine/core';
import { IconUser, IconCalendar, IconBuilding } from '@tabler/icons-react';

/**
 * Tab 1: Datos del Paciente y Procedimiento
 */
const DatosProcedimientoTab = ({ formData, setFormData, patientData }) => {
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
      {/* Información del Paciente - Read Only */}
      <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
        <Group gap="xs" mb="md">
          <IconUser size={18} color="var(--mantine-color-blue-6)" />
          <Text size="sm" fw={600}>Información del Paciente</Text>
        </Group>
        <Grid gutter="md">
          <Grid.Col span={6}>
            <TextInput
              label="Nombre Completo"
              value={`${patientData?.informacionPersonal?.primerNombre || ''} ${patientData?.informacionPersonal?.primerApellido || ''}`}
              readOnly
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="Tipo Documento"
              value={patientData?.tipoDocumento || ''}
              readOnly
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="# Documento"
              value={patientData?.numeroDocumento || ''}
              readOnly
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="Edad"
              value={patientData?.informacionPersonal?.edad || ''}
              readOnly
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="Sexo"
              value={patientData?.informacionPersonal?.sexo || ''}
              readOnly
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="RH"
              value={patientData?.informacionPersonal?.tipoSangre || ''}
              readOnly
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <TextInput
              label="Estado Civil"
              value={patientData?.informacionPersonal?.estadoCivil || ''}
              readOnly
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="EPS/Aseguradora"
              value={patientData?.informacionMedica?.eps || ''}
              readOnly
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Régimen"
              value={patientData?.informacionMedica?.regimenAfiliacion || ''}
              readOnly
              size="sm"
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Datos del Procedimiento */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconCalendar size={18} color="var(--mantine-color-green-6)" />
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
