import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import DoctorScheduleCard from './DoctorScheduleCard.jsx';
import DailyAppointmentsList from './DailyAppointmentsList.jsx';

/**
 * Componente que muestra la agenda médica con los horarios de todos los doctores
 * y las citas programadas del día
 */
const MedicalScheduleSection = ({
  selectedDate,
  user,
  loadingAppointments,
  allDoctorAppointments,
  calculateAvailableSlots,
  handleSlotClick,
  getDoctorInitials,
  getAppointmentInfo,
  updateAppointmentStatus,
  updatingStatus
}) => {
  if (!selectedDate) return null;

  const isDoctor = user && (user.rol === 'DOCTOR' || user.rol === 'AUXILIAR_MEDICO');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <ClockIcon className="h-5 w-5 mr-2" />
        Agenda Médica - {selectedDate.toLocaleDateString('es-ES')}
        {isDoctor && (
          <span className="ml-2 text-sm font-normal text-blue-600">(Vista Personal)</span>
        )}
      </h3>

      {/* Multi-Doctor Schedule Display */}
      <div className="space-y-6">
        {/* Time slots for all doctors */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {isDoctor
              ? 'Mis Horarios Disponibles'
              : 'Horarios Disponibles por Doctor'
            }
          </h4>

          {loadingAppointments ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-xs text-gray-500">Cargando horarios...</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-96">
              <div className="grid grid-cols-5 gap-4 pb-4" style={{ minWidth: 'max-content' }}>
                {Object.entries(allDoctorAppointments).map(([doctorId, doctorData]) => {
                  const { doctorName, appointments: doctorAppointments } = doctorData;
                  const availableSlots = calculateAvailableSlots(doctorAppointments, selectedDate);

                  return (
                    <DoctorScheduleCard
                      key={doctorId}
                      doctorId={doctorId}
                      doctorName={doctorName}
                      appointments={doctorAppointments}
                      availableSlots={availableSlots}
                      onSlotClick={handleSlotClick}
                      getDoctorInitials={getDoctorInitials}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Citas programadas del día */}
        <DailyAppointmentsList
          selectedDate={selectedDate}
          user={user}
          loadingAppointments={loadingAppointments}
          allDoctorAppointments={allDoctorAppointments}
          getAppointmentInfo={getAppointmentInfo}
          updateAppointmentStatus={updateAppointmentStatus}
          updatingStatus={updatingStatus}
        />
      </div>
    </div>
  );
};

export default MedicalScheduleSection;
