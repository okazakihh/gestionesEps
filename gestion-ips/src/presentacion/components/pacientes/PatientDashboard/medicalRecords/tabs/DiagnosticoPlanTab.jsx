import React from 'react';
import { Grid, Textarea, Paper, Stack, Group, Text, Checkbox, TextInput } from '@mantine/core';
import { IconStethoscope, IconPill, IconFileText, IconCalendar } from '@tabler/icons-react';
import DiagnosticosTable from '../components/DiagnosticosTable.jsx';
import MedicamentosTable from '../components/MedicamentosTable.jsx';

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

      {/* Ayudas Diagnósticas */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconFileText size={18} color="var(--mantine-color-indigo-6)" />
          <Text size="sm" fw={600}>Ayudas Diagnósticas Solicitadas</Text>
        </Group>
        <Textarea
          placeholder="Laboratorios: hemograma, glicemia, perfil lipídico, etc.&#10;Imágenes: Rx, ecografía, TAC, RMN, etc.&#10;Otros estudios: electrocardiograma, espirometría, etc."
          value={formData.diagnosticoPlan.ayudasDiagnosticas}
          onChange={(e) => setFormData({
            ...formData,
            diagnosticoPlan: { ...formData.diagnosticoPlan, ayudasDiagnosticas: e.target.value }
          })}
          minRows={4}
          size="sm"
        />
      </Paper>

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
