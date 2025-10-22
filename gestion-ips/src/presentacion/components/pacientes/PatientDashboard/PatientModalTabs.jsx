import React from 'react';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  HeartIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ClockIcon,
  BuildingOfficeIcon,
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
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex space-x-8">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default PatientModalTabs;