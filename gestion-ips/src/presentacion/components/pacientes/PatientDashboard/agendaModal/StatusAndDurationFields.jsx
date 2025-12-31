import React from 'react';
import { Select, Grid } from '@mantine/core';
import { IconCheck, IconClock } from '@tabler/icons-react';
import { ESTADO_CITA_AGENDAR_OPTIONS, DURACION_CITA_OPTIONS } from '../../../../../negocio/utils/listHelps.js';

const StatusAndDurationFields = ({ estado, duracion, onChange }) => {
  return (
    <Grid gutter="md">
      <Grid.Col span={12}>
        <Select
          label="Estado"
          leftSection={<IconCheck size={16} />}
          value={estado}
          onChange={(value) => onChange('estado', value)}
          data={ESTADO_CITA_AGENDAR_OPTIONS.map(option => ({
            value: option.value,
            label: option.label
          }))}
        />
      </Grid.Col>

      <Grid.Col span={12}>
        <Select
          label="Duración"
          leftSection={<IconClock size={16} />}
          value={duracion || '30'}
          onChange={(value) => onChange('duracion', value)}
          data={DURACION_CITA_OPTIONS.map(option => ({
            value: option.value,
            label: option.label
          }))}
        />
      </Grid.Col>
    </Grid>
  );
};

export default StatusAndDurationFields;
