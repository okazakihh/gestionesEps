import React from 'react';
import PropTypes from 'prop-types';
import { TextInput } from '@mantine/core';

const ContactInfoSection = ({ parsedData, handleNestedInputChange, validationErrors }) => {
  return (
    <div className="create-patient-modal-section">
      <div className="create-patient-modal-section-content">
        <h3 className="create-patient-modal-section-title">Información de Contacto</h3>
        <div className="create-patient-modal-section-content-grid">
          <div className="sm:col-span-3">
            <TextInput
              label="Teléfono"
              placeholder="Ingrese el número de teléfono"
              value={parsedData.informacionContacto?.telefono || ''}
              onChange={(e) => handleNestedInputChange('informacionContacto', 'telefono', e.target.value)}
              error={validationErrors.telefono}
              required
            />
          </div>

          <div className="sm:col-span-3">
            <TextInput
              label="Correo Electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              value={parsedData.informacionContacto?.email || ''}
              onChange={(e) => handleNestedInputChange('informacionContacto', 'email', e.target.value)}
              error={validationErrors.email}
            />
          </div>

          <div className="sm:col-span-6">
            <TextInput
              label="Dirección"
              placeholder="Dirección completa de residencia"
              value={parsedData.informacionContacto?.direccion || ''}
              onChange={(e) => handleNestedInputChange('informacionContacto', 'direccion', e.target.value)}
            />
          </div>

          <div className="sm:col-span-3">
            <TextInput
              label="Ciudad"
              placeholder="Ciudad de residencia"
              value={parsedData.informacionContacto?.ciudad || ''}
              onChange={(e) => handleNestedInputChange('informacionContacto', 'ciudad', e.target.value)}
            />
          </div>

          <div className="sm:col-span-3">
            <TextInput
              label="Departamento"
              placeholder="Departamento de residencia"
              value={parsedData.informacionContacto?.departamento || ''}
              onChange={(e) => handleNestedInputChange('informacionContacto', 'departamento', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
};

ContactInfoSection.propTypes = {
  parsedData: PropTypes.shape({
    informacionContacto: PropTypes.shape({
      telefono: PropTypes.string,
      email: PropTypes.string,
      direccion: PropTypes.string,
      ciudad: PropTypes.string,
      departamento: PropTypes.string,
    }),
  }),
  handleNestedInputChange: PropTypes.func.isRequired,
  validationErrors: PropTypes.shape({
    telefono: PropTypes.string,
    email: PropTypes.string,
  }),
};

export default ContactInfoSection;