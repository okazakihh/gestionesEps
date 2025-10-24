import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, Select, Textarea } from '@mantine/core';
import { GENERO_OPTIONS, ESTADO_CIVIL_OPTIONS, ESTRATO_SOCIOECONOMICO_OPTIONS, NIVEL_EDUCATIVO_OPTIONS } from '../../../../../negocio/utils/listHelps.js';

const PersonalInfoSection = ({ parsedData, handleNestedInputChange, validationErrors }) => {
  return (
    <div className="create-patient-modal-section">
      <div className="create-patient-modal-section-content">
        <h3 className="create-patient-modal-section-title">Información Personal</h3>
        <div className="create-patient-modal-section-content-grid">
          <div className="sm:col-span-3">
            <TextInput
              label="Primer Nombre"
              placeholder="Ingrese el primer nombre"
              value={parsedData.informacionPersonal?.primerNombre || ''}
              onChange={(e) => handleNestedInputChange('informacionPersonal', 'primerNombre', e.target.value)}
              error={validationErrors.primerNombre}
              required
            />
          </div>

          <div className="sm:col-span-3">
            <TextInput
              label="Segundo Nombre"
              placeholder="Ingrese el segundo nombre"
              value={parsedData.informacionPersonal?.segundoNombre || ''}
              onChange={(e) => handleNestedInputChange('informacionPersonal', 'segundoNombre', e.target.value)}
            />
          </div>

          <div className="sm:col-span-3">
            <TextInput
              label="Primer Apellido"
              placeholder="Ingrese el primer apellido"
              value={parsedData.informacionPersonal?.primerApellido || ''}
              onChange={(e) => handleNestedInputChange('informacionPersonal', 'primerApellido', e.target.value)}
              error={validationErrors.primerApellido}
              required
            />
          </div>

          <div className="sm:col-span-3">
            <TextInput
              label="Segundo Apellido"
              placeholder="Ingrese el segundo apellido"
              value={parsedData.informacionPersonal?.segundoApellido || ''}
              onChange={(e) => handleNestedInputChange('informacionPersonal', 'segundoApellido', e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <TextInput
              label="Fecha de Nacimiento"
              type="date"
              placeholder="Seleccione la fecha"
              value={parsedData.informacionPersonal?.fechaNacimiento || ''}
              onChange={(e) => handleNestedInputChange('informacionPersonal', 'fechaNacimiento', e.target.value)}
              error={validationErrors.fechaNacimiento}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <Select
              label="Género"
              placeholder="Seleccionar..."
              data={GENERO_OPTIONS}
              value={parsedData.informacionPersonal?.genero || ''}
              onChange={(value) => handleNestedInputChange('informacionPersonal', 'genero', value)}
              error={validationErrors.genero}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <Select
              label="Estado Civil"
              placeholder="Seleccionar..."
              data={ESTADO_CIVIL_OPTIONS}
              value={parsedData.informacionPersonal?.estadoCivil || ''}
              onChange={(value) => handleNestedInputChange('informacionPersonal', 'estadoCivil', value)}
            />
          </div>

          <div className="sm:col-span-2">
            <TextInput
              label="Nacionalidad"
              placeholder="Colombiana"
              value={parsedData.informacionPersonal?.nacionalidad || ''}
              onChange={(e) => handleNestedInputChange('informacionPersonal', 'nacionalidad', e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <TextInput
              label="Teléfono Móvil"
              placeholder="Ingrese el número de teléfono"
              value={parsedData.informacionPersonal?.telefonoMovil || ''}
              onChange={(e) => handleNestedInputChange('informacionPersonal', 'telefonoMovil', e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Select
              label="Estrato Socioeconómico"
              placeholder="Seleccionar..."
              data={ESTRATO_SOCIOECONOMICO_OPTIONS}
              value={parsedData.informacionPersonal?.estratoSocioeconomico || ''}
              onChange={(value) => handleNestedInputChange('informacionPersonal', 'estratoSocioeconomico', value)}
            />
          </div>

          <div className="sm:col-span-2">
            <TextInput
              label="Ocupación"
              placeholder="Profesión u oficio"
              value={parsedData.informacionPersonal?.ocupacion || ''}
              onChange={(e) => handleNestedInputChange('informacionPersonal', 'ocupacion', e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Select
              label="Nivel Educativo"
              placeholder="Seleccionar..."
              data={NIVEL_EDUCATIVO_OPTIONS}
              value={parsedData.informacionPersonal?.nivelEducativo || ''}
              onChange={(value) => handleNestedInputChange('informacionPersonal', 'nivelEducativo', value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
};

PersonalInfoSection.propTypes = {
  parsedData: PropTypes.object,
  handleNestedInputChange: PropTypes.func.isRequired,
  validationErrors: PropTypes.object,
};

export default PersonalInfoSection;