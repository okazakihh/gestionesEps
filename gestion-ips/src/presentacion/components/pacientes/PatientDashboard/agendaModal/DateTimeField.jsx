import React from 'react';
import { TextInput } from '@mantine/core';

const DateTimeField = ({ value, onChange, min, errors }) => {
  return (
    <TextInput
      label="Fecha y Hora"
      type="datetime-local"
      value={value}
      onChange={(e) => onChange('fechaHoraCita', e.target.value)}
      min={min}
      error={errors.fechaHoraCita}
      required
      withAsterisk
    />
  );
};

export default DateTimeField;
