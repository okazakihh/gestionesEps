import React, { useState } from 'react';
import CalendarWidget from '../calendar/CalendarWidget.jsx';
import DisponibilidadMedicoModal from '../availability/DisponibilidadMedicoModal.jsx';
import AgendaModal from '../agendaModal/AgendaModal.jsx';

/**
 * Componente contenedor para la barra lateral del dashboard.
 * Encapsula el CalendarWidget y los modales que se abren desde él.
 */
const CalendarSidebar = ({ onDaySelect, onNewPatient, disponibilidades }) => {
  // Estado de los modales que se abren desde aquí
  const [isDisponibilidadOpen, setIsDisponibilidadOpen] = useState(false);
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);

  const handleDaySelectInternal = (date) => {
    if (onDaySelect) {
      onDaySelect(date); // Notificar al padre que la fecha cambió
    }
  };

  return (
    <>
      <CalendarWidget
        onDaySelect={handleDaySelectInternal}
        onNewPatient={onNewPatient}
        onOpenAgenda={() => setIsAgendaOpen(true)}
        onOpenDisponibilidad={() => setIsDisponibilidadOpen(true)}
        disponibilidades={disponibilidades}
      />

      <DisponibilidadMedicoModal
        opened={isDisponibilidadOpen}
        onClose={() => setIsDisponibilidadOpen(false)}
      />

      <AgendaModal
        isOpen={isAgendaOpen}
        onClose={() => setIsAgendaOpen(false)}
      />
    </>
  );
};

export default CalendarSidebar;