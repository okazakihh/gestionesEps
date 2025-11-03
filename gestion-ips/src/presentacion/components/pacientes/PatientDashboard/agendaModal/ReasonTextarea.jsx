import React from 'react';
import { Textarea } from '@mantine/core';
import { IconFileText } from '@tabler/icons-react';

const ReasonTextarea = ({ value, onChange, errors }) => {
  return (
    <Textarea
      label="Motivo de la Consulta"
      placeholder="Describa el motivo de la consulta médica..."
      value={value}
      onChange={(e) => onChange('motivo', e.target.value)}
      rows={2}
      error={errors.motivo}
      required
      withAsterisk
    />
  );
};

export default ReasonTextarea;