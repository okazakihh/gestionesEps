import React from 'react';
import { Grid, Textarea, Paper, Stack, Group, Text, Checkbox, Select, Box } from '@mantine/core';
import { IconStethoscope, IconUser, IconLungs, IconHeart, IconBone, IconCheck } from '@tabler/icons-react';
import SignosVitalesForm from '../components/SignosVitalesForm.jsx';
import ExamenFisicoPorDependencia from '../components/ExamenFisicoPorDependencia.jsx';
import { DEPENDENCIA_MEDICA_OPTIONS, REQUIERE_SIGNOS_VITALES, REQUIERE_EXAMEN_SISTEMAS } from '../../../../../../negocio/utils/listHelps.js';

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
      {/* Dependencia Médica */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconStethoscope size={18} color="var(--mantine-color-violet-6)" />
          <Text size="sm" fw={600}>Dependencia Médica</Text>
        </Group>
        <Select
          label="Seleccione la Dependencia Médica"
          placeholder="Ej: Otorrinolaringología, Optometría, Medicina General, etc."
          data={DEPENDENCIA_MEDICA_OPTIONS}
          value={formData.examenFisico.dependenciaMedica}
          onChange={(value) => setFormData({
            ...formData,
            examenFisico: { 
              ...formData.examenFisico, 
              dependenciaMedica: value,
              camposEspecificos: {} // Reset campos al cambiar dependencia
            }
          })}
          required
          size="sm"
          searchable
        />
      </Paper>

      {/* Signos Vitales - Solo si la dependencia lo requiere */}
      {formData.examenFisico.dependenciaMedica && 
       REQUIERE_SIGNOS_VITALES[formData.examenFisico.dependenciaMedica] && (
        <Paper p="md" withBorder>
          <SignosVitalesForm
            values={formData.examenFisico.signosVitales}
            onChange={(values) => setFormData({
              ...formData,
              examenFisico: { ...formData.examenFisico, signosVitales: values }
            })}
          />
        </Paper>
      )}

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

      {/* Examen Físico por Sistemas - Solo si la dependencia lo requiere */}
      {formData.examenFisico.dependenciaMedica && 
       REQUIERE_EXAMEN_SISTEMAS[formData.examenFisico.dependenciaMedica] && (
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
                    checked={formData.examenFisico.sistemasRevisados[sistema.key]?.normal || false}
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
                    icon={IconCheck}
                  />
                  
                  <Textarea
                    placeholder="Describa los hallazgos (dejar vacío si es normal)..."
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
                    disabled={formData.examenFisico.sistemasRevisados[sistema.key]?.normal}
                    styles={formData.examenFisico.sistemasRevisados[sistema.key]?.normal ? {
                      input: { backgroundColor: 'var(--mantine-color-gray-1)' }
                    } : undefined}
                  />
                </Stack>
              </Paper>
            );
          })}
          </Stack>
        </Paper>
      )}

      {/* Campos específicos por dependencia */}
      {formData.examenFisico.dependenciaMedica && (
        <Box>
          <ExamenFisicoPorDependencia
            dependencia={formData.examenFisico.dependenciaMedica}
            valores={formData.examenFisico.camposEspecificos || {}}
            onChange={(camposEspecificos) => setFormData({
              ...formData,
              examenFisico: { ...formData.examenFisico, camposEspecificos }
            })}
          />
        </Box>
      )}
    </Stack>
  );
};

export default ExamenFisicoTab;
