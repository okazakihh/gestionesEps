import React from 'react';
import { Checkbox, Grid, Textarea, Stack, Text, Group, Paper } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';

/**
 * Componente para manejar antecedentes patológicos con checkboxes
 */
const AntecedentesPatologicosForm = ({ values, onChange }) => {
  const antecedentesOptions = [
    { value: 'ninguno', label: 'Ninguno' },
    { value: 'hipertension', label: 'Hipertensión Arterial' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'enfCardiovascular', label: 'Enfermedad Cardiovascular' },
    { value: 'enfCerebrovascular', label: 'Enfermedad Cerebrovascular' },
    { value: 'enfRespiratorias', label: 'Enfermedades Respiratorias' },
    { value: 'enfRenales', label: 'Enfermedades Renales' },
    { value: 'cancer', label: 'Cáncer' },
    { value: 'traumatismos', label: 'Traumatismos' },
    { value: 'psiquiatricos', label: 'Trastornos Psiquiátricos' }
  ];

  const handleCheckboxChange = (value, checked) => {
    const newSelected = checked
      ? [...(values.selected || []), value]
      : (values.selected || []).filter(v => v !== value);

    // Si se selecciona "ninguno", limpiar todas las demás
    if (value === 'ninguno' && checked) {
      onChange({
        selected: ['ninguno'],
        detalles: ''
      });
    } else if (newSelected.includes('ninguno')) {
      // Si hay otros seleccionados, remover "ninguno"
      onChange({
        selected: newSelected.filter(v => v !== 'ninguno'),
        detalles: values.detalles || ''
      });
    } else {
      onChange({
        selected: newSelected,
        detalles: values.detalles || ''
      });
    }
  };

  return (
    <Stack gap="md">
      <Group gap="xs">
        <IconAlertCircle size={18} color="var(--mantine-color-red-6)" />
        <Text size="sm" fw={600}>Antecedentes Patológicos</Text>
      </Group>

      <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
        <Grid gutter="sm">
          {antecedentesOptions.map((option) => (
            <Grid.Col key={option.value} span={{ base: 12, sm: 6, md: 4 }}>
              <Checkbox
                label={option.label}
                checked={(values.selected || []).includes(option.value)}
                onChange={(e) => handleCheckboxChange(option.value, e.currentTarget.checked)}
                size="sm"
                icon={IconCheck}
              />
            </Grid.Col>
          ))}
        </Grid>
      </Paper>

      {values.selected && values.selected.length > 0 && !values.selected.includes('ninguno') && (
        <Textarea
          label="Detalles de Antecedentes"
          placeholder="Especifique detalles, fechas, tratamientos previos..."
          value={values.detalles || ''}
          onChange={(e) => onChange({
            ...values,
            detalles: e.target.value
          })}
          minRows={3}
          size="sm"
        />
      )}
    </Stack>
  );
};

/**
 * Componente para antecedentes familiares
 */
const AntecedentesFamiliaresForm = ({ values, onChange }) => {
  const familiaresOptions = [
    { value: 'ninguno', label: 'Ninguno' },
    { value: 'hipertension', label: 'Hipertensión' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'enfCerebrovascular', label: 'Enf. Cerebrovascular' },
    { value: 'enfMental', label: 'Enf. Mental' },
    { value: 'neurologicos', label: 'Neurológicos' },
    { value: 'cancer', label: 'Cáncer' },
    { value: 'alergicos', label: 'Alérgicos' },
    { value: 'enfRespiratorias', label: 'Enf. Respiratorias' }
  ];

  const handleCheckboxChange = (value, checked) => {
    const newSelected = checked
      ? [...(values.selected || []), value]
      : (values.selected || []).filter(v => v !== value);

    if (value === 'ninguno' && checked) {
      onChange({
        selected: ['ninguno'],
        detalles: ''
      });
    } else if (newSelected.includes('ninguno')) {
      onChange({
        selected: newSelected.filter(v => v !== 'ninguno'),
        detalles: values.detalles || ''
      });
    } else {
      onChange({
        selected: newSelected,
        detalles: values.detalles || ''
      });
    }
  };

  return (
    <Stack gap="md">
      <Group gap="xs">
        <IconAlertCircle size={18} color="var(--mantine-color-blue-6)" />
        <Text size="sm" fw={600}>Antecedentes Familiares</Text>
      </Group>

      <Paper p="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
        <Grid gutter="sm">
          {familiaresOptions.map((option) => (
            <Grid.Col key={option.value} span={{ base: 12, sm: 6, md: 4 }}>
              <Checkbox
                label={option.label}
                checked={(values.selected || []).includes(option.value)}
                onChange={(e) => handleCheckboxChange(option.value, e.currentTarget.checked)}
                size="sm"
                icon={IconCheck}
              />
            </Grid.Col>
          ))}
        </Grid>
      </Paper>

      {values.selected && values.selected.length > 0 && !values.selected.includes('ninguno') && (
        <Textarea
          label="Especificar Familiares Afectados"
          placeholder="Madre, padre, hermanos, otros familiares..."
          value={values.detalles || ''}
          onChange={(e) => onChange({
            ...values,
            detalles: e.target.value
          })}
          minRows={2}
          size="sm"
        />
      )}
    </Stack>
  );
};

export { AntecedentesPatologicosForm, AntecedentesFamiliaresForm };
