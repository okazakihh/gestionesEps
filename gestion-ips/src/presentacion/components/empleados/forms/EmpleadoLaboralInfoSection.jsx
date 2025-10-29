import React from 'react';
import { Grid, TextInput, Select } from '@mantine/core';
import { 
  TIPO_PERSONAL_OPTIONS, 
  ESPECIALIDAD_MEDICA_OPTIONS, 
  CARGO_ADMINISTRATIVO_OPTIONS,
  TIPO_CONTRATO_OPTIONS 
} from '../../../../negocio/utils/listHelps';

const EmpleadoLaboralInfoSection = ({ 
  formData, 
  onFieldChange, 
  disabled = false 
}) => {
  const isMedico = formData.tipoPersonal === 'MEDICO';

  return (
    <div>
      <Grid>
        <Grid.Col span={6}>
          <Select
            label="Tipo de Personal"
            placeholder="Seleccione tipo de personal"
            value={formData.tipoPersonal}
            onChange={(value) => onFieldChange('tipoPersonal', value)}
            data={TIPO_PERSONAL_OPTIONS}
            disabled={disabled}
            required
            withAsterisk
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Fecha de Ingreso"
            type="date"
            value={formData.fechaIngreso}
            onChange={(e) => onFieldChange('fechaIngreso', e.target.value)}
            disabled={disabled}
            required
            withAsterisk
          />
        </Grid.Col>
        
        {isMedico ? (
          <>
            <Grid.Col span={6}>
              <TextInput
                label="Número de Licencia"
                placeholder="Ingrese número de licencia"
                value={formData.numeroLicencia}
                onChange={(e) => onFieldChange('numeroLicencia', e.target.value)}
                disabled={disabled}
                required
                withAsterisk
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Especialidad"
                placeholder="Seleccione especialidad"
                value={formData.especialidad}
                onChange={(value) => onFieldChange('especialidad', value)}
                data={ESPECIALIDAD_MEDICA_OPTIONS}
                disabled={disabled}
                required
                withAsterisk
              />
            </Grid.Col>
          </>
        ) : (
          <Grid.Col span={6}>
            <Select
              label="Cargo"
              placeholder="Seleccione cargo"
              value={formData.cargo}
              onChange={(value) => onFieldChange('cargo', value)}
              data={CARGO_ADMINISTRATIVO_OPTIONS}
              disabled={disabled}
              required
              withAsterisk
            />
          </Grid.Col>
        )}
        
        <Grid.Col span={6}>
          <TextInput
            label="Salario"
            type="number"
            placeholder="Ingrese salario"
            value={formData.salario}
            onChange={(e) => onFieldChange('salario', e.target.value)}
            disabled={disabled}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Select
            label="Tipo de Contrato"
            placeholder="Seleccione tipo de contrato"
            value={formData.tipoContrato}
            onChange={(value) => onFieldChange('tipoContrato', value)}
            data={TIPO_CONTRATO_OPTIONS}
            disabled={disabled}
          />
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default EmpleadoLaboralInfoSection;
