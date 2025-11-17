import React from 'react';
import { Grid, Textarea, Paper, Text } from '@mantine/core';
import { CAMPOS_POR_DEPENDENCIA } from '../../../../../../negocio/utils/listHelps.js';

/**
 * Componente que renderiza campos específicos de examen físico según la dependencia médica
 */
const ExamenFisicoPorDependencia = ({ dependencia, valores = {}, onChange }) => {
  if (!dependencia || !CAMPOS_POR_DEPENDENCIA[dependencia]) {
    return null;
  }

  const config = CAMPOS_POR_DEPENDENCIA[dependencia];

  const handleFieldChange = (key, value) => {
    onChange({
      ...valores,
      [key]: value
    });
  };

  return (
    <Paper p="md" withBorder>
      <Text size="sm" fw={600} mb="md" c="violet">
        Examen Específico - {config.label}
      </Text>
      <Grid gutter="md">
        {config.campos.map((campo) => (
          <Grid.Col key={campo.key} span={12}>
            <Textarea
              label={campo.label}
              placeholder={campo.placeholder || `Describa ${campo.label.toLowerCase()}...`}
              value={valores[campo.key] || ''}
              onChange={(e) => handleFieldChange(campo.key, e.target.value)}
              minRows={3}
              size="sm"
            />
          </Grid.Col>
        ))}
      </Grid>
    </Paper>
  );
};

export default ExamenFisicoPorDependencia;
