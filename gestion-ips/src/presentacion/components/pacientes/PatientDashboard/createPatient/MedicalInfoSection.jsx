import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, Select, Textarea } from '@mantine/core';
import { REGIMEN_AFILIACION_OPTIONS, TIPO_SANGRE_OPTIONS } from '../../../../../negocio/utils/listHelps.js';

const MedicalInfoSection = ({ parsedData = {}, handleNestedInputChange, validationErrors = {} }) => {
  return (
    <div className="create-patient-modal-section">
      <div className="create-patient-modal-section-content">
        <h3 className="create-patient-modal-section-title">Información Médica</h3>
        <div className="create-patient-modal-section-content-grid">
          <div className="sm:col-span-3">
            <TextInput
              label="EPS"
              placeholder="Nombre de la EPS..."
              value={parsedData.informacionMedica?.eps || ''}
              onChange={(e) => handleNestedInputChange('informacionMedica', 'eps', e.target.value)}
              error={validationErrors.eps}
              required
            />
          </div>

          <div className="sm:col-span-3">
            <Select
              label="Régimen de Afiliación"
              placeholder="Seleccionar..."
              data={REGIMEN_AFILIACION_OPTIONS}
              value={parsedData.informacionMedica?.regimenAfiliacion || ''}
              onChange={(value) => handleNestedInputChange('informacionMedica', 'regimenAfiliacion', value)}
              error={validationErrors.regimenAfiliacion}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <Select
              label="Tipo de Sangre"
              placeholder="Seleccionar..."
              data={TIPO_SANGRE_OPTIONS}
              value={parsedData.informacionPersonal?.tipoSangre || ''}
              onChange={(value) => handleNestedInputChange('informacionPersonal', 'tipoSangre', value)}
            />
          </div>

          <div className="sm:col-span-6">
            <Textarea
              label="Alergias"
              placeholder="Describa las alergias del paciente..."
              value={parsedData.informacionMedica?.alergias || ''}
              onChange={(e) => handleNestedInputChange('informacionMedica', 'alergias', e.target.value)}
              rows={3}
            />
          </div>

          <div className="sm:col-span-6">
            <Textarea
              label="Medicamentos Actuales"
              placeholder="Liste los medicamentos que toma actualmente..."
              value={parsedData.informacionMedica?.medicamentosActuales || ''}
              onChange={(e) => handleNestedInputChange('informacionMedica', 'medicamentosActuales', e.target.value)}
              rows={3}
            />
          </div>

          <div className="sm:col-span-6">
            <Textarea
              label="Antecedentes Médicos Personales"
              placeholder="Describa enfermedades previas, cirugías, hospitalizaciones..."
              value={parsedData.informacionMedica?.antecedentesPersonales || ''}
              onChange={(e) => handleNestedInputChange('informacionMedica', 'antecedentesPersonales', e.target.value)}
              rows={3}
            />
          </div>

          <div className="sm:col-span-6">
            <Textarea
              label="Antecedentes Médicos Familiares"
              placeholder="Enfermedades en familiares directos (padres, hermanos, hijos)..."
              value={parsedData.informacionMedica?.antecedentesFamiliares || ''}
              onChange={(e) => handleNestedInputChange('informacionMedica', 'antecedentesFamiliares', e.target.value)}
              rows={3}
            />
          </div>

          <div className="sm:col-span-6">
            <Textarea
              label="Enfermedades Crónicas"
              placeholder="Diabetes, hipertensión, asma, etc."
              value={parsedData.informacionMedica?.enfermedadesCronicas || ''}
              onChange={(e) => handleNestedInputChange('informacionMedica', 'enfermedadesCronicas', e.target.value)}
              rows={2}
            />
          </div>

          <div className="sm:col-span-6">
            <Textarea
              label="Vacunas y Esquemas de Inmunización"
              placeholder="Vacunas aplicadas y fechas..."
              value={parsedData.informacionMedica?.vacunas || ''}
              onChange={(e) => handleNestedInputChange('informacionMedica', 'vacunas', e.target.value)}
              rows={2}
            />
          </div>

          <div className="sm:col-span-6">
            <Textarea
              label="Observaciones Médicas Adicionales"
              placeholder="Observaciones adicionales del estado de salud..."
              value={parsedData.informacionMedica?.observacionesMedicas || ''}
              onChange={(e) => handleNestedInputChange('informacionMedica', 'observacionesMedicas', e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

MedicalInfoSection.propTypes = {
  parsedData: PropTypes.shape({
    informacionMedica: PropTypes.object,
    informacionPersonal: PropTypes.object,
  }),
  handleNestedInputChange: PropTypes.func.isRequired,
  validationErrors: PropTypes.object,
};

export default MedicalInfoSection;