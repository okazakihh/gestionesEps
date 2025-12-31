import React from 'react';
import { Textarea } from '@mantine/core';

const NotesTextarea = ({ value, onChange }) => {
  return (
    <Textarea
      label="Notas Adicionales"
      placeholder="Información adicional, instrucciones especiales, etc..."
      value={value}
      onChange={(e) => onChange('notas', e.target.value)}
      rows={2}
    />
  );
};

export default NotesTextarea;
