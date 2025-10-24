import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, Select } from '@mantine/core';
import { TIPO_DOCUMENTO_OPTIONS } from '../../../../../negocio/utils/listHelps.js';

const BasicInfoSection = ({ formData, handleInputChange, validationErrors }) => {
  return (
    <div className="create-patient-modal-section">
      <div className="create-patient-modal-section-header">
        <div className="create-patient-modal-section-content-grid">
          <div className="sm:col-span-3">
            <Select
              label="Tipo de Documento"
              placeholder="Seleccionar..."
              data={TIPO_DOCUMENTO_OPTIONS}
              value={formData.tipoDocumento}
              onChange={(value) => handleInputChange('tipoDocumento', value)}
              error={validationErrors.numeroDocumento}
              required
            />
          </div>

          <div className="sm:col-span-3">
            <TextInput
              label="Número de Documento"
              placeholder="Ingrese el número de documento"
              value={formData.numeroDocumento}
              onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
              error={validationErrors.numeroDocumento}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

BasicInfoSection.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  validationErrors: PropTypes.object,
};

export default BasicInfoSection;