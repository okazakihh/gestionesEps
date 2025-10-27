import React from 'react';
import { XMarkIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const ScheduleAppointmentHeader = ({ patientName, loading, onClose }) => {
  return (
    <div className="bg-blue-600 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <CalendarDaysIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-semibold text-white">
                Agendar Cita Médica
              </h3>
              {loading && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="ml-2 text-sm text-blue-100">Agendando...</span>
                </div>
              )}
            </div>
            <p className="text-blue-100">
              Paciente: {patientName}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default ScheduleAppointmentHeader;