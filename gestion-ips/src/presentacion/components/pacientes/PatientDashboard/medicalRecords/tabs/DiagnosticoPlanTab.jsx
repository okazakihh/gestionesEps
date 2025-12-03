import React from 'react';
import { Grid, Textarea, Paper, Stack, Group, Text, Checkbox, TextInput } from '@mantine/core';
import { IconStethoscope, IconPill, IconFileText, IconCalendar, IconCheck } from '@tabler/icons-react';
import DiagnosticosTable from '../components/DiagnosticosTable.jsx';
import MedicamentosTable from '../components/MedicamentosTable.jsx';
import ExamenesTable from '../components/ExamenesTable.jsx';

/**
 * Tab 5: Diagnóstico y Plan de Tratamiento
 */
const DiagnosticoPlanTab = ({ formData, setFormData }) => {
  return (
    <Stack gap="md">
      {/* Diagnósticos */}
      <DiagnosticosTable
        diagnosticos={formData.diagnosticoPlan.diagnosticos}
        onChange={(diagnosticos) => setFormData({
          ...formData,
          diagnosticoPlan: { ...formData.diagnosticoPlan, diagnosticos }
        })}
      />

      {/* Exámenes y Ayudas Diagnósticas */}
      <ExamenesTable
        examenes={formData.diagnosticoPlan.examenes}
        onChange={(examenes) => setFormData({
          ...formData,
          diagnosticoPlan: { ...formData.diagnosticoPlan, examenes }
        })}
      />

      {/* Plan de Tratamiento */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconStethoscope size={18} color="var(--mantine-color-green-6)" />
          <Text size="sm" fw={600}>Plan de Tratamiento</Text>
        </Group>
        <Textarea
          placeholder="Describa el plan terapéutico general, indicaciones, procedimientos, etc."
          value={formData.diagnosticoPlan.planTratamiento}
          onChange={(e) => setFormData({
            ...formData,
            diagnosticoPlan: { ...formData.diagnosticoPlan, planTratamiento: e.target.value }
          })}
          minRows={4}
          size="sm"
        />
      </Paper>

      {/* Medicamentos */}
      <MedicamentosTable
        medicamentos={formData.diagnosticoPlan.medicamentos}
        onChange={(medicamentos) => setFormData({
          ...formData,
          diagnosticoPlan: { ...formData.diagnosticoPlan, medicamentos }
        })}
      />

      {/* Recomendaciones */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconFileText size={18} color="var(--mantine-color-orange-6)" />
          <Text size="sm" fw={600}>Recomendaciones y Observaciones</Text>
        </Group>
        <Textarea
          placeholder="Indicaciones al paciente: reposo, dieta, actividades a evitar, signos de alarma, etc."
          value={formData.diagnosticoPlan.recomendaciones}
          onChange={(e) => setFormData({
            ...formData,
            diagnosticoPlan: { ...formData.diagnosticoPlan, recomendaciones: e.target.value }
          })}
          minRows={4}
          size="sm"
        />
      </Paper>

      {/* Incapacidad */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconFileText size={18} color="var(--mantine-color-red-6)" />
          <Text size="sm" fw={600}>Incapacidad</Text>
        </Group>
        <Grid>
          <Grid.Col span={12}>
            <Group>
              <Text size="xs">Emitir incapacidad</Text>
              <input
                type="checkbox"
                checked={formData.diagnosticoPlan.incapacidad?.aplica}
                onChange={(e) => setFormData({
                  ...formData,
                  diagnosticoPlan: { ...formData.diagnosticoPlan, incapacidad: { ...formData.diagnosticoPlan.incapacidad, aplica: e.currentTarget.checked } }
                })}
              />
            </Group>
          </Grid.Col>

          {formData.diagnosticoPlan.incapacidad?.aplica && (
            <>
              <Grid.Col span={6}>
                <TextInput
                  label="Tipo de Incapacidad"
                  placeholder="Ej: Laboral"
                  value={formData.diagnosticoPlan.incapacidad.tipo}
                  onChange={(e) => setFormData({ ...formData, diagnosticoPlan: { ...formData.diagnosticoPlan, incapacidad: { ...formData.diagnosticoPlan.incapacidad, tipo: e.target.value } } })}
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <TextInput
                  label="Fecha Inicio"
                  type="date"
                  value={formData.diagnosticoPlan.incapacidad.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, diagnosticoPlan: { ...formData.diagnosticoPlan, incapacidad: { ...formData.diagnosticoPlan.incapacidad, fechaInicio: e.target.value } } })}
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <TextInput
                  label="Fecha Fin"
                  type="date"
                  value={formData.diagnosticoPlan.incapacidad.fechaFin}
                  onChange={(e) => setFormData({ ...formData, diagnosticoPlan: { ...formData.diagnosticoPlan, incapacidad: { ...formData.diagnosticoPlan.incapacidad, fechaFin: e.target.value } } })}
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="Días"
                  type="number"
                  value={formData.diagnosticoPlan.incapacidad.dias}
                  onChange={(e) => setFormData({ ...formData, diagnosticoPlan: { ...formData.diagnosticoPlan, incapacidad: { ...formData.diagnosticoPlan.incapacidad, dias: e.target.value } } })}
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={8}>
                <TextInput
                  label="Motivo"
                  placeholder="Motivo de la incapacidad"
                  value={formData.diagnosticoPlan.incapacidad.motivo}
                  onChange={(e) => setFormData({ ...formData, diagnosticoPlan: { ...formData.diagnosticoPlan, incapacidad: { ...formData.diagnosticoPlan.incapacidad, motivo: e.target.value } } })}
                  size="sm"
                />
              </Grid.Col>
            </>
          )}
        </Grid>
      </Paper>

      {/* Seguimiento */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconCalendar size={18} color="var(--mantine-color-violet-6)" />
          <Text size="sm" fw={600}>Seguimiento</Text>
        </Group>
        <Stack gap="md">
          <Checkbox
            label="Requiere seguimiento"
            checked={formData.diagnosticoPlan.seguimiento.requiere}
            icon={IconCheck}
            onChange={(e) => setFormData({
              ...formData,
              diagnosticoPlan: {
                ...formData.diagnosticoPlan,
                seguimiento: {
                  ...formData.diagnosticoPlan.seguimiento,
                  requiere: e.currentTarget.checked
                }
              }
            })}
            size="sm"
          />
          
          {formData.diagnosticoPlan.seguimiento.requiere && (
            <Grid gutter="md">
              <Grid.Col span={6}>
                <TextInput
                  label="Tipo de Seguimiento"
                  placeholder="Ej: Otorrinolaringología, Medicina Interna..."
                  value={formData.diagnosticoPlan.seguimiento.tipo}
                  onChange={(e) => setFormData({
                    ...formData,
                    diagnosticoPlan: {
                      ...formData.diagnosticoPlan,
                      seguimiento: {
                        ...formData.diagnosticoPlan.seguimiento,
                        tipo: e.target.value
                      }
                    }
                  })}
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Fecha Próxima Cita"
                  type="date"
                  value={formData.diagnosticoPlan.seguimiento.fechaProxima}
                  onChange={(e) => setFormData({
                    ...formData,
                    diagnosticoPlan: {
                      ...formData.diagnosticoPlan,
                      seguimiento: {
                        ...formData.diagnosticoPlan.seguimiento,
                        fechaProxima: e.target.value
                      }
                    }
                  })}
                  size="sm"
                />
              </Grid.Col>
            </Grid>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default DiagnosticoPlanTab;
