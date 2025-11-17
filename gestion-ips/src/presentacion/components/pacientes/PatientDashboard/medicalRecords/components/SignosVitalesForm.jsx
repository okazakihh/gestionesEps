import React from 'react';
import { Grid, TextInput, NumberInput, Group, Text } from '@mantine/core';
import { IconHeart, IconTemperature, IconActivity, IconLungs, IconScale, IconRuler } from '@tabler/icons-react';

/**
 * Componente reutilizable para captura de signos vitales
 */
const SignosVitalesForm = ({ values, onChange, readonly = false }) => {
  const handleChange = (field, value) => {
    onChange({
      ...values,
      [field]: value
    });
  };

  // Calcular IMC automáticamente
  const calcularIMC = () => {
    if (values.peso && values.talla) {
      const tallaMetros = values.talla / 100;
      const imc = values.peso / (tallaMetros * tallaMetros);
      return imc.toFixed(2);
    }
    return '';
  };

  React.useEffect(() => {
    const imc = calcularIMC();
    if (imc && imc !== values.imc) {
      handleChange('imc', imc);
    }
  }, [values.peso, values.talla]);

  return (
    <Grid gutter="md">
      <Grid.Col span={12}>
        <Group gap="xs" mb="xs">
          <IconHeart size={18} color="var(--mantine-color-red-6)" />
          <Text size="sm" fw={600}>Signos Vitales</Text>
        </Group>
      </Grid.Col>

      <Grid.Col span={6}>
        <TextInput
          label="Presión Arterial (mmHg)"
          placeholder="120/80"
          value={values.presionArterial || ''}
          onChange={(e) => handleChange('presionArterial', e.target.value)}
          leftSection={<IconHeart size={16} />}
          leftSectionWidth={45}
          readOnly={readonly}
          size="sm"
          styles={{ input: { paddingLeft: '50px' } }}
        />
      </Grid.Col>

      <Grid.Col span={6}>
        <NumberInput
          label="Frecuencia Cardíaca (lpm)"
          placeholder="70"
          value={values.frecuenciaCardiaca || ''}
          onChange={(value) => handleChange('frecuenciaCardiaca', value)}
          leftSection={<IconActivity size={16} />}
          leftSectionWidth={45}
          readOnly={readonly}
          min={0}
          max={250}
          size="sm"
          styles={{ input: { paddingLeft: '50px' } }}
        />
      </Grid.Col>

      <Grid.Col span={6}>
        <NumberInput
          label="Frecuencia Respiratoria (rpm)"
          placeholder="18"
          value={values.frecuenciaRespiratoria || ''}
          onChange={(value) => handleChange('frecuenciaRespiratoria', value)}
          leftSection={<IconLungs size={16} />}
          leftSectionWidth={45}
          readOnly={readonly}
          min={0}
          max={60}
          size="sm"
          styles={{ input: { paddingLeft: '50px' } }}
        />
      </Grid.Col>

      <Grid.Col span={6}>
        <NumberInput
          label="Temperatura (°C)"
          placeholder="36.5"
          value={values.temperatura || ''}
          onChange={(value) => handleChange('temperatura', value)}
          leftSection={<IconTemperature size={16} />}
          leftSectionWidth={45}
          readOnly={readonly}
          min={30}
          max={45}
          decimalScale={1}
          size="sm"
          styles={{ input: { paddingLeft: '50px' } }}
        />
      </Grid.Col>

      <Grid.Col span={4}>
        <NumberInput
          label="Peso (kg)"
          placeholder="70"
          value={values.peso || ''}
          onChange={(value) => handleChange('peso', value)}
          leftSection={<IconScale size={16} />}
          leftSectionWidth={45}
          readOnly={readonly}
          min={0}
          max={300}
          decimalScale={1}
          size="sm"
          styles={{ input: { paddingLeft: '50px' } }}
        />
      </Grid.Col>

      <Grid.Col span={4}>
        <NumberInput
          label="Talla (cm)"
          placeholder="170"
          value={values.talla || ''}
          onChange={(value) => handleChange('talla', value)}
          leftSection={<IconRuler size={16} />}
          leftSectionWidth={45}
          readOnly={readonly}
          min={0}
          max={250}
          size="sm"
          styles={{ input: { paddingLeft: '50px' } }}
        />
      </Grid.Col>

      <Grid.Col span={4}>
        <TextInput
          label="IMC"
          value={calcularIMC()}
          readOnly
          leftSection={<IconScale size={16} />}
          leftSectionWidth={45}
          styles={{
            input: {
              backgroundColor: 'var(--mantine-color-gray-0)',
              fontWeight: 600,
              paddingLeft: '50px'
            }
          }}
          size="sm"
        />
      </Grid.Col>

      <Grid.Col span={6}>
        <NumberInput
          label="SpO2 (%)"
          placeholder="98"
          value={values.spo2 || ''}
          onChange={(value) => handleChange('spo2', value)}
          leftSection={<IconLungs size={16} />}
          leftSectionWidth={45}
          readOnly={readonly}
          min={0}
          max={100}
          size="sm"
          styles={{ input: { paddingLeft: '50px' } }}
        />
      </Grid.Col>
    </Grid>
  );
};

export default SignosVitalesForm;
