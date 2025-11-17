import React from 'react';
import { Grid, Textarea, Paper, Stack, Group, Text, Checkbox, Select } from '@mantine/core';
import { IconAlertCircle, IconActivityHeartbeat, IconPill, IconCheck } from '@tabler/icons-react';
import { AntecedentesPatologicosForm, AntecedentesFamiliaresForm } from '../components/AntecedentesForm.jsx';

/**
 * Tab 3: Antecedentes Clínicos
 */
const AntecedentesTab = ({ formData, setFormData }) => {
  return (
    <Stack gap="md">
      {/* Antecedentes Patológicos */}
      <AntecedentesPatologicosForm
        values={formData.antecedentes.patologicos}
        onChange={(value) => setFormData({
          ...formData,
          antecedentes: { ...formData.antecedentes, patologicos: value }
        })}
      />

      {/* Antecedentes Familiares */}
      <AntecedentesFamiliaresForm
        values={formData.antecedentes.familiares}
        onChange={(value) => setFormData({
          ...formData,
          antecedentes: { ...formData.antecedentes, familiares: value }
        })}
      />

      {/* Antecedentes Quirúrgicos */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconActivityHeartbeat size={18} color="var(--mantine-color-orange-6)" />
          <Text size="sm" fw={600}>Antecedentes Quirúrgicos</Text>
        </Group>
        <Textarea
          placeholder="Liste cirugías previas con fechas aproximadas..."
          value={formData.antecedentes.quirurgicos}
          onChange={(e) => setFormData({
            ...formData,
            antecedentes: { ...formData.antecedentes, quirurgicos: e.target.value }
          })}
          minRows={3}
          size="sm"
        />
      </Paper>

      {/* Antecedentes Alérgicos */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconAlertCircle size={18} color="var(--mantine-color-red-6)" />
          <Text size="sm" fw={600}>Antecedentes Alérgicos</Text>
        </Group>
        <Stack gap="md">
          <Checkbox
            label="Ninguno conocido"
            checked={formData.antecedentes.alergicos.ninguno}
            onChange={(e) => setFormData({
              ...formData,
              antecedentes: {
                ...formData.antecedentes,
                alergicos: {
                  ...formData.antecedentes.alergicos,
                  ninguno: e.currentTarget.checked,
                  medicamentos: e.currentTarget.checked ? '' : formData.antecedentes.alergicos.medicamentos,
                  alimentos: e.currentTarget.checked ? '' : formData.antecedentes.alergicos.alimentos,
                  otros: e.currentTarget.checked ? '' : formData.antecedentes.alergicos.otros
                }
              }
            })}
            icon={IconCheck}
            size="sm"
          />
          
          {!formData.antecedentes.alergicos.ninguno && (
            <Grid gutter="md">
              <Grid.Col span={12}>
                <Textarea
                  label="Medicamentos"
                  placeholder="Especifique medicamentos que causan alergia..."
                  value={formData.antecedentes.alergicos.medicamentos}
                  onChange={(e) => setFormData({
                    ...formData,
                    antecedentes: {
                      ...formData.antecedentes,
                      alergicos: { ...formData.antecedentes.alergicos, medicamentos: e.target.value }
                    }
                  })}
                  minRows={2}
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Alimentos"
                  placeholder="Especifique alimentos que causan alergia..."
                  value={formData.antecedentes.alergicos.alimentos}
                  onChange={(e) => setFormData({
                    ...formData,
                    antecedentes: {
                      ...formData.antecedentes,
                      alergicos: { ...formData.antecedentes.alergicos, alimentos: e.target.value }
                    }
                  })}
                  minRows={2}
                  size="sm"
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Otros"
                  placeholder="Otras alergias (polen, ácaros, látex, etc.)..."
                  value={formData.antecedentes.alergicos.otros}
                  onChange={(e) => setFormData({
                    ...formData,
                    antecedentes: {
                      ...formData.antecedentes,
                      alergicos: { ...formData.antecedentes.alergicos, otros: e.target.value }
                    }
                  })}
                  minRows={2}
                  size="sm"
                />
              </Grid.Col>
            </Grid>
          )}
        </Stack>
      </Paper>

      {/* Hábitos y Estilo de Vida */}
      <Paper p="md" withBorder>
        <Group gap="xs" mb="md">
          <IconPill size={18} color="var(--mantine-color-teal-6)" />
          <Text size="sm" fw={600}>Hábitos y Estilo de Vida</Text>
        </Group>
        <Grid gutter="md">
          <Grid.Col span={4}>
            <Select
              label="Consumo de Alcohol"
              data={[
                { value: 'no', label: 'No consume' },
                { value: 'ocasional', label: 'Ocasional' },
                { value: 'frecuente', label: 'Frecuente' }
              ]}
              value={formData.antecedentes.habitos.alcohol}
              onChange={(value) => setFormData({
                ...formData,
                antecedentes: {
                  ...formData.antecedentes,
                  habitos: { ...formData.antecedentes.habitos, alcohol: value }
                }
              })}
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Tabaquismo"
              data={[
                { value: 'no', label: 'No fuma' },
                { value: 'si', label: 'Fumador activo' },
                { value: 'exfumador', label: 'Ex fumador' }
              ]}
              value={formData.antecedentes.habitos.tabaco}
              onChange={(value) => setFormData({
                ...formData,
                antecedentes: {
                  ...formData.antecedentes,
                  habitos: { ...formData.antecedentes.habitos, tabaco: value }
                }
              })}
              size="sm"
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Select
              label="Actividad Física"
              data={[
                { value: 'sedentario', label: 'Sedentario' },
                { value: 'moderado', label: 'Moderado' },
                { value: 'activo', label: 'Activo' }
              ]}
              value={formData.antecedentes.habitos.actividadFisica}
              onChange={(value) => setFormData({
                ...formData,
                antecedentes: {
                  ...formData.antecedentes,
                  habitos: { ...formData.antecedentes.habitos, actividadFisica: value }
                }
              })}
              size="sm"
            />
          </Grid.Col>
        </Grid>
      </Paper>
    </Stack>
  );
};

export default AntecedentesTab;
