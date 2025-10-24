import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, Select } from '@mantine/core';
import { RELACION_CONTACTO_EMERGENCIA_OPTIONS } from '../../../../../negocio/utils/listHelps.js';

const EmergencyContactSection = ({ parsedData = {}, handleNestedInputChange, validationErrors = {} }) => {
  return (
    <div className="create-patient-modal-section">
      <div className="create-patient-modal-section-content">
        <h3 className="create-patient-modal-section-title">Contacto de Emergencia</h3>
        <div className="create-patient-modal-section-content-grid">
          <div className="sm:col-span-4">
            <TextInput
              label="Nombre del Contacto"
              placeholder="Nombre completo del contacto de emergencia"
              value={parsedData.contactoEmergencia?.nombreContacto || ''}
              onChange={(e) => handleNestedInputChange('contactoEmergencia', 'nombreContacto', e.target.value)}
              error={validationErrors.nombreContactoEmergencia}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <Select
              label="Relación"
              placeholder="Seleccionar..."
              data={RELACION_CONTACTO_EMERGENCIA_OPTIONS}
              value={parsedData.contactoEmergencia?.relacion || ''}
              onChange={(value) => handleNestedInputChange('contactoEmergencia', 'relacion', value)}
              error={validationErrors.relacionContactoEmergencia}
              required
            />
          </div>

          <div className="sm:col-span-3">
            <TextInput
              label="Teléfono Principal"
              placeholder="Teléfono principal del contacto"
              value={parsedData.contactoEmergencia?.telefonoContacto || ''}
              onChange={(e) => handleNestedInputChange('contactoEmergencia', 'telefonoContacto', e.target.value)}
              error={validationErrors.telefonoContactoEmergencia}
              required
            />
          </div>

          <div className="sm:col-span-3">
            <TextInput
              label="Teléfono Secundario"
              placeholder="Teléfono alternativo (opcional)"
              value={parsedData.contactoEmergencia?.telefonoContactoSecundario || ''}
              onChange={(e) => handleNestedInputChange('contactoEmergencia', 'telefonoContactoSecundario', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
};

EmergencyContactSection.propTypes = {
  parsedData: PropTypes.shape({
    // Define the shape of parsedData if necessary
  }),
  handleNestedInputChange: PropTypes.func.isRequired,
  validationErrors: PropTypes.object,
};

export default EmergencyContactSection;