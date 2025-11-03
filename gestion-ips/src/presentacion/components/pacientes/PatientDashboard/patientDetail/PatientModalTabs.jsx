import React from 'react';
import PropTypes from 'prop-types';
import { Tabs } from '@mantine/core';
import { IconUser, IconPhone, IconHeart, IconFileText, IconId } from '@tabler/icons-react';

/**
 * Componente para las pestañas de navegación del modal de detalles del paciente
 * @param {Object} props - Propiedades del componente
 * @param {string} props.activeTab - Pestaña activa actual
 * @param {Function} props.setActiveTab - Función para cambiar la pestaña activa
 * @returns {JSX.Element} Componente de pestañas
 */
const PatientModalTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'personal', name: 'Información Personal', icon: IconUser },
    { id: 'contacto', name: 'Contacto', icon: IconPhone },
    { id: 'medica', name: 'Información Médica', icon: IconHeart },
    { id: 'emergencia', name: 'Contacto Emergencia', icon: IconId },
    { id: 'consentimiento', name: 'Consentimiento', icon: IconFileText },
    { id: 'clinica', name: 'Historia Clínica', icon: IconFileText },
  ];

  return (
    <Tabs value={activeTab} onChange={setActiveTab} variant="outline">
      <Tabs.List>
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <Tabs.Tab
              key={tab.id}
              value={tab.id}
              leftSection={<IconComponent size={16} />}
            >
              {tab.name}
            </Tabs.Tab>
          );
        })}
      </Tabs.List>
    </Tabs>
  );
};

PatientModalTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired
};


export default PatientModalTabs;