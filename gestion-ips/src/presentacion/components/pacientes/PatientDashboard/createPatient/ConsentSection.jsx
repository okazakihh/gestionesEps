import React from 'react';
import PropTypes from 'prop-types';

const ConsentSection = ({ parsedData, handleNestedInputChange, validationErrors }) => {
  return (
    <div className="create-patient-modal-section">
      <div className="create-patient-modal-section-content">
        <h3 className="create-patient-modal-section-title">Consentimiento Informado</h3>
        <div className="create-patient-modal-consent">
          <div className="create-patient-modal-consent-text">
            <p className="create-patient-modal-consent-text-legal">Según la Ley 1581 de 2012 y normas relacionadas con historia clínica, el paciente debe otorgar su consentimiento expreso para:</p>
          </div>

          <div className="create-patient-modal-consent-item">
            <div className="create-patient-modal-consent-item">
              <div className="create-patient-modal-consent-checkbox">
                <input
                  id="aceptaTratamiento"
                  type="checkbox"
                  checked={parsedData.consentimientoInformado?.aceptaTratamiento || false}
                  onChange={(e) => handleNestedInputChange('consentimientoInformado', 'aceptaTratamiento', e.target.checked)}
                  className="create-patient-modal-consent-checkbox-input"
                />
              </div>
              <div className="create-patient-modal-consent-content">
                <label htmlFor="aceptaTratamiento" className="create-patient-modal-consent-label create-patient-modal-consent-label-required">
                  Tratamiento Médico
                </label>
                <p className="create-patient-modal-consent-description">Acepto recibir atención médica y procedimientos diagnósticos necesarios para mi salud.</p>
                {validationErrors.consentimientoTratamiento && (
                  <p className="create-patient-modal-error">{validationErrors.consentimientoTratamiento}</p>
                )}
              </div>
            </div>

            <div className="create-patient-modal-consent-item">
              <div className="create-patient-modal-consent-checkbox">
                <input
                  id="aceptaPrivacidad"
                  type="checkbox"
                  checked={parsedData.consentimientoInformado?.aceptaPrivacidad || false}
                  onChange={(e) => handleNestedInputChange('consentimientoInformado', 'aceptaPrivacidad', e.target.checked)}
                  className="create-patient-modal-consent-checkbox-input"
                />
              </div>
              <div className="create-patient-modal-consent-content">
                <label htmlFor="aceptaPrivacidad" className="create-patient-modal-consent-label create-patient-modal-consent-label-required">
                  Protección de Datos Personales
                </label>
                <p className="create-patient-modal-consent-description">Acepto el tratamiento de mis datos personales según la Ley 1581 de 2012 y normas de protección de datos.</p>
                {validationErrors.consentimientoPrivacidad && (
                  <p className="create-patient-modal-error">{validationErrors.consentimientoPrivacidad}</p>
                )}
              </div>
            </div>

            <div className="create-patient-modal-consent-item">
              <div className="create-patient-modal-consent-checkbox">
                <input
                  id="aceptaDatosPersonales"
                  type="checkbox"
                  checked={parsedData.consentimientoInformado?.aceptaDatosPersonales || false}
                  onChange={(e) => handleNestedInputChange('consentimientoInformado', 'aceptaDatosPersonales', e.target.checked)}
                  className="create-patient-modal-consent-checkbox-input"
                />
              </div>
              <div className="create-patient-modal-consent-content">
                <label htmlFor="aceptaDatosPersonales" className="create-patient-modal-consent-label create-patient-modal-consent-label-required">
                  Tratamiento de Datos Sensibles
                </label>
                <p className="create-patient-modal-consent-description">Acepto el tratamiento de datos sensibles de salud según la legislación colombiana.</p>
                {validationErrors.consentimientoDatos && (
                  <p className="create-patient-modal-error">{validationErrors.consentimientoDatos}</p>
                )}
              </div>
            </div>

            <div className="create-patient-modal-consent-item">
              <div className="create-patient-modal-consent-checkbox">
                <input
                  id="aceptaImagenes"
                  type="checkbox"
                  checked={parsedData.consentimientoInformado?.aceptaImagenes || false}
                  onChange={(e) => handleNestedInputChange('consentimientoInformado', 'aceptaImagenes', e.target.checked)}
                  className="create-patient-modal-consent-checkbox-input"
                />
              </div>
              <div className="create-patient-modal-consent-content">
                <label htmlFor="aceptaImagenes" className="create-patient-modal-consent-label">
                  Uso de Imágenes y Fotografías
                </label>
                <p className="create-patient-modal-consent-description">Acepto el uso de imágenes y fotografías para fines médicos y académicos (opcional).</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

ConsentSection.propTypes = {
  parsedData: PropTypes.object,
  handleNestedInputChange: PropTypes.func.isRequired,
  validationErrors: PropTypes.object
};


export default ConsentSection;