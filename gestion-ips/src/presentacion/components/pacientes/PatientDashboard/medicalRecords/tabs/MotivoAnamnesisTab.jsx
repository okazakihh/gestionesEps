import React from 'react';
import { Grid, Textarea, Paper, Stack, Group, Text, TextInput } from '@mantine/core';
import { IconFileText, IconHeart, IconList } from '@tabler/icons-react';

/**
 * Tab 2: Motivo de Consulta y Anamnesis
 */
const MotivoAnamnesisTab = ({ formData, setFormData }) => {
  return (
    <Stack gap="md">
      {/* Motivo de Consulta */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconFileText size={18} color="var(--mantine-color-blue-6)" />
          <Text size="sm" fw={600}>Motivo de Consulta</Text>
        </Group>
        <Textarea
          placeholder="Describa el motivo principal de la consulta del paciente..."
          value={formData.consultaInicial.motivoConsulta}
          onChange={(e) => setFormData({
            ...formData,
            consultaInicial: { ...formData.consultaInicial, motivoConsulta: e.target.value }
          })}
          minRows={4}
          required
          size="sm"
        />
      </Paper>

      {/* Enfermedad Actual / Anamnesis */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconHeart size={18} color="var(--mantine-color-red-6)" />
          <Text size="sm" fw={600}>Enfermedad Actual / Anamnesis</Text>
        </Group>
        <Grid gutter="md">
          <Grid.Col span={12}>
            <Textarea
              label="Historia Detallada de la Enfermedad"
              placeholder="Describa la evolución de la enfermedad, inicio de síntomas, características, intensidad..."
              value={formData.consultaInicial.enfermedadActual}
              onChange={(e) => setFormData({
                ...formData,
                consultaInicial: { ...formData.consultaInicial, enfermedadActual: e.target.value }
              })}
              minRows={5}
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              label="Tiempo de Evolución"
              placeholder="Ej: 3 días, 2 semanas, 1 mes..."
              value={formData.consultaInicial.tiempoEvolucion}
              onChange={(e) => setFormData({
                ...formData,
                consultaInicial: { ...formData.consultaInicial, tiempoEvolucion: e.target.value }
              })}
              size="sm"
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Revisión por Sistemas */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconList size={18} color="var(--mantine-color-green-6)" />
          <Text size="sm" fw={600}>Revisión por Sistemas</Text>
        </Group>
        <Textarea
          placeholder="Revisión sistemática de órganos y aparatos: cardiovascular, respiratorio, digestivo, urinario, neurológico, etc."
          value={formData.consultaInicial.revisionSistemas}
          onChange={(e) => setFormData({
            ...formData,
            consultaInicial: { ...formData.consultaInicial, revisionSistemas: e.target.value }
          })}
          minRows={4}
          size="sm"
        />
      </Paper>

      {/* Medicamentos Actuales */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconFileText size={18} color="var(--mantine-color-violet-6)" />
          <Text size="sm" fw={600}>Medicamentos Actuales</Text>
        </Group>
        <Textarea
          placeholder="Liste los medicamentos que el paciente está tomando actualmente, con dosis y frecuencia..."
          value={formData.consultaInicial.medicamentosActuales}
          onChange={(e) => setFormData({
            ...formData,
            consultaInicial: { ...formData.consultaInicial, medicamentosActuales: e.target.value }
          })}
          minRows={3}
          size="sm"
        />
      </Paper>
    </Stack>
  );
};

export default MotivoAnamnesisTab;
