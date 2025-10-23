import React from 'react';
import PropTypes from 'prop-types';
import {
  UserIcon,
  PhoneIcon,
  HeartIcon,
  DocumentTextIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

/**
 * Componente para las pestañas de navegación del modal de detalles del paciente
 * @param {Object} props - Propiedades del componente
 * @param {string} props.activeTab - Pestaña activa actual
 * @param {Function} props.setActiveTab - Función para cambiar la pestaña activa
 * @returns {JSX.Element} Componente de pestañas
 */
const PatientModalTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'personal', name: 'Información Personal', icon: UserIcon },
    { id: 'contacto', name: 'Contacto', icon: PhoneIcon },
    { id: 'medica', name: 'Información Médica', icon: HeartIcon },
    { id: 'emergencia', name: 'Contacto Emergencia', icon: IdentificationIcon },
    { id: 'consentimiento', name: 'Consentimiento', icon: DocumentTextIcon },
    { id: 'clinica', name: 'Historia Clínica', icon: DocumentTextIcon },
  ];
  return (
    <div className="patient-modal-tabs">
      <nav className="patient-modal-tabs-nav">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`patient-modal-tab ${
                activeTab === tab.id
                  ? 'patient-modal-tab-active'
                  : 'patient-modal-tab-inactive'
              }`}
            >
              <IconComponent className="patient-modal-tab-icon" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

PatientModalTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired
};


export default PatientModalTabs;