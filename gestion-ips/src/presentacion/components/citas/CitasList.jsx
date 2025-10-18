import React from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import CitaCard from './CitaCard';
import { formatDate, groupCitasByDate } from '../../../negocio/utils/citaUtils';

/**
 * CitasList - Lista de citas agrupadas por fecha
 */
const CitasList = ({ 
  citas, 
  patientData, 
  loadingPatients,
  onAtender, 
  onCancelar,
  onCambiarEstado, // Nueva prop
  canModify = true,
  emptyMessage = "No hay citas para mostrar"
}) => {
  const citasAgrupadas = groupCitasByDate(citas);
  
  if (citas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CalendarIcon className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(citasAgrupadas).map(([fecha, citasDia]) => (
        <div key={fecha} className="space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
            <CalendarIcon className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {formatDate(fecha)}
            </h3>
            <span className="text-sm text-gray-500">
              ({citasDia.length} {citasDia.length === 1 ? 'cita' : 'citas'})
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {citasDia.map(cita => (
              <CitaCard
                key={cita.id}
                cita={cita}
                patientInfo={patientData[cita.pacienteId]}
                loadingPatient={loadingPatients[cita.pacienteId] || false}
                onAtender={onAtender}
                onCancelar={onCancelar}
                onCambiarEstado={onCambiarEstado}
                canModify={canModify}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CitasList;
