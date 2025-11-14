import React from 'react';
import { Grid, Textarea, Paper, Stack, Group, Text, Checkbox } from '@mantine/core';
import { IconStethoscope, IconUser, IconLungs, IconHeart, IconBone } from '@tabler/icons-react';
import SignosVitalesForm from '../components/SignosVitalesForm.jsx';

/**
 * Tab 4: Examen Físico Completo
 */
const ExamenFisicoTab = ({ formData, setFormData }) => {
  const sistemas = [
    { key: 'cabezaCuello', label: 'Cabeza y Cuello', icon: IconUser, color: 'blue' },
    { key: 'toraxPulmones', label: 'Tórax y Pulmones', icon: IconLungs, color: 'cyan' },
    { key: 'cardiovascular', label: 'Cardiovascular', icon: IconHeart, color: 'red' },
    { key: 'abdomen', label: 'Abdomen', icon: IconStethoscope, color: 'orange' },
    { key: 'extremidades', label: 'Extremidades', icon: IconBone, color: 'violet' },
    { key: 'neurologico', label: 'Neurológico', icon: IconStethoscope, color: 'indigo' },
    { key: 'pielFaneras', label: 'Piel y Faneras', icon: IconUser, color: 'pink' }
  ];

  return (
    <Stack gap="md">
      {/* Signos Vitales */}
      <Paper p="md" withBorder>
        <SignosVitalesForm
          values={formData.examenFisico.signosVitales}
          onChange={(values) => setFormData({
            ...formData,
            examenFisico: { ...formData.examenFisico, signosVitales: values }
          })}
        />
      </Paper>

      {/* Estado General */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconUser size={18} color="var(--mantine-color-blue-6)" />
          <Text size="sm" fw={600}>Estado General del Paciente</Text>
        </Group>
        <Textarea
          placeholder="Describa el estado general: alerta, orientado, hidratado, nutrido, etc."
          value={formData.examenFisico.estadoGeneral}
          onChange={(e) => setFormData({
            ...formData,
            examenFisico: { ...formData.examenFisico, estadoGeneral: e.target.value }
          })}
          minRows={3}
          size="sm"
        />
      </Paper>

      {/* Examen Físico por Sistemas */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconStethoscope size={18} color="var(--mantine-color-green-6)" />
          <Text size="sm" fw={600}>Examen Físico por Sistemas</Text>
        </Group>
        
        <Stack gap="lg">
          {sistemas.map((sistema) => {
            const Icon = sistema.icon;
            return (
              <Paper key={sistema.key} p="sm" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                <Stack gap="sm">
                  <Group gap="xs">
                    <Icon size={16} color={`var(--mantine-color-${sistema.color}-6)`} />
                    <Text size="sm" fw={600}>{sistema.label}</Text>
                  </Group>
                  
                  <Checkbox
                    label="Normal"
                    checked={formData.examenFisico.sistemasRevisados[sistema.key]?.normal}
                    onChange={(e) => setFormData({
                      ...formData,
                      examenFisico: {
                        ...formData.examenFisico,
                        sistemasRevisados: {
                          ...formData.examenFisico.sistemasRevisados,
                          [sistema.key]: {
                            ...formData.examenFisico.sistemasRevisados[sistema.key],
                            normal: e.currentTarget.checked,
                            hallazgos: e.currentTarget.checked ? '' : formData.examenFisico.sistemasRevisados[sistema.key]?.hallazgos
                          }
                        }
                      }
                    })}
                    size="sm"
                  />
                  
                  {!formData.examenFisico.sistemasRevisados[sistema.key]?.normal && (
                    <Textarea
                      placeholder="Describa los hallazgos anormales..."
                      value={formData.examenFisico.sistemasRevisados[sistema.key]?.hallazgos || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        examenFisico: {
                          ...formData.examenFisico,
                          sistemasRevisados: {
                            ...formData.examenFisico.sistemasRevisados,
                            [sistema.key]: {
                              ...formData.examenFisico.sistemasRevisados[sistema.key],
                              hallazgos: e.target.value
                            }
                          }
                        }
                      })}
                      minRows={2}
                      size="sm"
                    />
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default ExamenFisicoTab;
