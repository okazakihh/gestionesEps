import React from 'react';
import { Select } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';

const DoctorSelect = ({ value, onChange, medicos, loadingMedicos, errors }) => {
  // Get full name of a doctor
  const getNombreCompletoMedico = (medico) => {
    try {
      const datosCompletos = JSON.parse(medico.jsonData || '{}');
      if (datosCompletos.jsonData) {
        const datosInternos = JSON.parse(datosCompletos.jsonData);
        const informacionPersonal = datosInternos.informacionPersonal || {};
        const informacionLaboral = datosInternos.informacionLaboral || {};

        const primerNombre = informacionPersonal.primerNombre || '';
        const segundoNombre = informacionPersonal.segundoNombre || '';
        const primerApellido = informacionPersonal.primerApellido || '';
        const segundoApellido = informacionPersonal.segundoApellido || '';
        const especialidad = informacionLaboral.especialidad || '';

        const nombreCompleto = `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.trim();
        return especialidad ? `${nombreCompleto} - ${especialidad}` : nombreCompleto;
      }
      return `Doctor ID: ${medico.id}`;
    } catch (error) {
      console.error('Error getting doctor name:', error);
      return `Doctor ID: ${medico.id}`;
    }
  };

  return (
    <Select
      label="Médico"
      placeholder={loadingMedicos ? 'Cargando...' : 'Seleccionar médico'}
      leftSection={<IconUser size={16} />}
      value={value}
      onChange={(value) => onChange('medicoAsignado', value)}
      data={medicos.map((medico) => ({
        value: getNombreCompletoMedico(medico),
        label: getNombreCompletoMedico(medico)
      }))}
      error={errors.medicoAsignado}
      required
      withAsterisk
      disabled={loadingMedicos}
      searchable
    />
  );
};

export default DoctorSelect;
