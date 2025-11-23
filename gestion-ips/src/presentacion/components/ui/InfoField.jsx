import React from 'react';
import { Grid, Group, Text } from '@mantine/core';

/**
 * Campo de información (etiqueta y valor) para mostrar datos.
 * @param {object} props
 * @param {string} props.label - La etiqueta del campo.
 * @param {string|number} props.value - El valor a mostrar.
 * @param {number} [props.span=6] - El número de columnas que ocupará en un Grid.
 */
const InfoField = ({ label, value, span = 6 }) => (
  <Grid.Col span={span}>
    <Group gap={8} wrap="nowrap" align="flex-start" style={{ textAlign: 'left', marginBottom: '8px' }}>
      <Text size="xs" fw={700} style={{ minWidth: 'fit-content', textAlign: 'left' }}>{label}:</Text>
      <Text size="xs" style={{ flex: 1, textAlign: 'left' }}>{value || 'No registrado'}</Text>
    </Group>
  </Grid.Col>
);

export default InfoField;