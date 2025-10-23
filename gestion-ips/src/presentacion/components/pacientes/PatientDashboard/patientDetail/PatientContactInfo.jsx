import React from 'react';
import PropTypes from 'prop-types';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';

/**
 * Componente para mostrar la información de contacto del paciente
 * Extraído del PatientDetailModal para mantener el clean code
 */
const PatientContactInfo = ({ patientData }) => {
  return (
    <div className="patient-detail-container">
      <h4 className="patient-detail-header">Información de Contacto</h4>
      <div className="patient-contact-grid patient-detail-max-width-none">
        <div className="patient-contact-section">
          <div className="patient-contact-item">
            <PhoneIcon className="patient-contact-icon-primary" />
            <div>
              <p className="patient-contact-label">Teléfono Principal</p>
              <p className="patient-contact-value">{patientData.informacionContacto?.telefono || 'N/A'}</p>
            </div>
          </div>
          <div className="patient-contact-item">
            <PhoneIcon className="patient-contact-icon-mobile" />
            <div>
              <p className="patient-contact-label">Teléfono Móvil</p>
              <p className="patient-contact-value">{patientData.informacionPersonal?.telefonoMovil || 'N/A'}</p>
            </div>
          </div>
          <div className="patient-contact-item">
            <EnvelopeIcon className="patient-contact-icon-primary" />
            <div>
              <p className="patient-contact-label">Email</p>
              <p className="patient-contact-value">{patientData.informacionContacto?.email || 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="patient-contact-section">
          <div className="patient-contact-address">
            <MapPinIcon className="patient-contact-icon-primary mt-0.5" />
            <div className="patient-contact-address-content">
              <p className="patient-contact-label">Dirección</p>
              <p className="patient-contact-value">{patientData.informacionContacto?.direccion || 'N/A'}</p>
              <p className="patient-contact-address-city">
                {patientData.informacionContacto?.ciudad}, {patientData.informacionContacto?.departamento}
              </p>
              <p className="patient-contact-address-country">
                {patientData.informacionContacto?.pais}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

PatientContactInfo.propTypes = {
  patientData: PropTypes.object
};


export default PatientContactInfo;