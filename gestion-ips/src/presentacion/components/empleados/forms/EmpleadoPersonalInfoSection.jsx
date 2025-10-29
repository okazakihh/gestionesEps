import React from 'react';
import { Grid, TextInput, Select } from '@mantine/core';
import { TIPO_DOCUMENTO_OPTIONS, GENERO_OPTIONS } from '../../../../negocio/utils/listHelps';

const EmpleadoPersonalInfoSection = ({ 
  formData, 
  onFieldChange, 
  disabled = false 
}) => {
  return (
    <div>
      <Grid>
        <Grid.Col span={6}>
          <Select
            label="Tipo de Documento"
            placeholder="Seleccione tipo de documento"
            value={formData.tipoDocumento}
            onChange={(value) => onFieldChange('tipoDocumento', value)}
            data={TIPO_DOCUMENTO_OPTIONS}
            disabled={disabled}
            required
            withAsterisk
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Número de Documento"
            placeholder="Ingrese número de documento"
            value={formData.numeroDocumento}
            onChange={(e) => onFieldChange('numeroDocumento', e.target.value)}
            disabled={disabled}
            required
            withAsterisk
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Primer Nombre"
            placeholder="Ingrese primer nombre"
            value={formData.primerNombre}
            onChange={(e) => onFieldChange('primerNombre', e.target.value)}
            disabled={disabled}
            required
            withAsterisk
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Segundo Nombre"
            placeholder="Ingrese segundo nombre"
            value={formData.segundoNombre}
            onChange={(e) => onFieldChange('segundoNombre', e.target.value)}
            disabled={disabled}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Primer Apellido"
            placeholder="Ingrese primer apellido"
            value={formData.primerApellido}
            onChange={(e) => onFieldChange('primerApellido', e.target.value)}
            disabled={disabled}
            required
            withAsterisk
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Segundo Apellido"
            placeholder="Ingrese segundo apellido"
            value={formData.segundoApellido}
            onChange={(e) => onFieldChange('segundoApellido', e.target.value)}
            disabled={disabled}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Fecha de Nacimiento"
            type="date"
            value={formData.fechaNacimiento}
            onChange={(e) => onFieldChange('fechaNacimiento', e.target.value)}
            disabled={disabled}
            required
            withAsterisk
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Select
            label="Género"
            placeholder="Seleccione género"
            value={formData.genero}
            onChange={(value) => onFieldChange('genero', value)}
            data={GENERO_OPTIONS}
            disabled={disabled}
            required
            withAsterisk
          />
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default EmpleadoPersonalInfoSection;
