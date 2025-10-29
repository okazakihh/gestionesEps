import React from 'react';

/**
 * Componente para mostrar la tarjeta de horarios de un doctor
 */
const DoctorScheduleCard = ({ 
  doctorId, 
  doctorName, 
  appointments, 
  availableSlots,
  onSlotClick,
  getDoctorInitials
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-3 min-w-72 flex-shrink-0">
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-blue-800">
            {getDoctorInitials(doctorName)}
          </span>
        </div>
        <div>
          <h5 className="text-xs font-medium text-gray-900">{doctorName}</h5>
          <p className="text-xs text-gray-500">{appointments.length} citas</p>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-1">
        {availableSlots.map((slot) => (
          <div
            key={`${doctorId}-${slot.time}`}
            onClick={() => slot.available && onSlotClick(slot, doctorId)}
            className={`p-0.5 text-center text-[10px] rounded border transition-colors ${
              slot.available
                ? 'bg-green-50 border-green-200 text-green-700 cursor-pointer hover:bg-green-100 hover:shadow-sm'
                : 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed'
            }`}
            title={slot.available ? `Click para agendar cita con ${doctorName}` : 'Horario ocupado'}
          >
            {slot.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorScheduleCard;
