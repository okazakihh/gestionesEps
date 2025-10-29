import React from 'react';
import { Grid, TextInput } from '@mantine/core';

const EmpleadoContactInfoSection = ({ 
  formData, 
  onFieldChange, 
  disabled = false 
}) => {
  return (
    <div>
      <Grid>
        <Grid.Col span={6}>
          <TextInput
            label="Teléfono"
            placeholder="Ingrese teléfono"
            value={formData.telefono}
            onChange={(e) => onFieldChange('telefono', e.target.value)}
            disabled={disabled}
            required
            withAsterisk
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Email"
            type="email"
            placeholder="Ingrese email"
            value={formData.email}
            onChange={(e) => onFieldChange('email', e.target.value)}
            disabled={disabled}
            required
            withAsterisk
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <TextInput
            label="Dirección"
            placeholder="Ingrese dirección"
            value={formData.direccion}
            onChange={(e) => onFieldChange('direccion', e.target.value)}
            disabled={disabled}
            required
            withAsterisk
          />
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default EmpleadoContactInfoSection;
