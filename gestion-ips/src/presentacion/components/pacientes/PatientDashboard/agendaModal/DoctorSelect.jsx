import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

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
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <UserIcon className="h-4 w-4 inline mr-2" />
        Médico *
      </label>
      <select
        value={value}
        onChange={(e) => onChange('medicoAsignado', e.target.value)}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors.medicoAsignado ? 'border-red-300' : 'border-gray-300'
        }`}
        required
        disabled={loadingMedicos}
      >
        <option value="">
          {loadingMedicos ? 'Cargando...' : 'Seleccionar médico'}
        </option>
        {medicos.map((medico) => (
          <option key={medico.id} value={getNombreCompletoMedico(medico)}>
            {getNombreCompletoMedico(medico)}
          </option>
        ))}
      </select>
      {errors.medicoAsignado && (
        <p className="mt-1 text-sm text-red-600">{errors.medicoAsignado}</p>
      )}
    </div>
  );
};

export default DoctorSelect;