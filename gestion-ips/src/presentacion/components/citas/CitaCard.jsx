import React from 'react';
import { CalendarIcon, ClockIcon, UserIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CitaStatusBadge from './CitaStatusBadge';
import { formatTime, canAtenderCita, canCancelarCita } from '../../../negocio/utils/citaUtils';

/**
 * CitaCard - Tarjeta para mostrar información de una cita
 */
const CitaCard = ({ 
  cita, 
  patientInfo, 
  loadingPatient, 
  onAtender, 
  onCancelar,
  onCambiarEstado, // Nueva prop para cambiar estado
  canModify = true 
}) => {
  // Log completo de la cita para debug
  console.log('🎫 CitaCard recibió cita:', {
    id: cita.id,
    fecha: cita.fecha,
    horaInicio: cita.horaInicio,
    horaFin: cita.horaFin,
    estado: cita.estado,
    pacienteId: cita.pacienteId,
    todosLosCampos: Object.keys(cita),
    citaCompleta: cita
  });

  console.log('🎫 CitaCard props:', {
    canModify,
    tieneOnCambiarEstado: !!onCambiarEstado,
    tieneOnAtender: !!onAtender,
    tieneOnCancelar: !!onCancelar
  });

  // Determinar qué botones mostrar basado en el estado
  const atenderValidation = canAtenderCita(cita);
  const cancelarValidation = canCancelarCita(cita);

  const showAtenderButton = canModify && atenderValidation.valid;
  const showCancelarButton = canModify && cancelarValidation.valid;
  const showEstadoSection = canModify && onCambiarEstado;

  // Debug: Verificar condiciones para mostrar botones
  console.log('🎫 Condiciones para mostrar botones:', {
    canModify,
    onCambiarEstado: !!onCambiarEstado,
    showEstadoSection,
    showAtenderButton,
    showCancelarButton
  });

  // Debug: Verificar condiciones para mostrar botones
  console.log('🎫 Condiciones para mostrar botones:', {
    canModify,
    onCambiarEstado: !!onCambiarEstado,
    showEstadoSection,
    showAtenderButton,
    showCancelarButton
  });

  
  // Determinar estados disponibles para cambiar
  const getAvailableEstados = () => {
    const allEstados = [
      { value: 'PROGRAMADA', label: 'Programada', color: 'blue' },
      { value: 'EN_SALA', label: 'En Sala', color: 'yellow' },
      { value: 'ATENDIDO', label: 'Atendido', color: 'green' },
      { value: 'NO_SE_PRESENTO', label: 'No se Presentó', color: 'orange' },
      { value: 'CANCELADA', label: 'Cancelada', color: 'red' }
    ];
    
    // No mostrar el estado actual en las opciones
    return allEstados.filter(e => e.value !== cita.estado);
  };
  
  const handleEstadoChange = (e) => {
    const nuevoEstado = e.target.value;
    if (nuevoEstado && onCambiarEstado) {
      onCambiarEstado(cita, nuevoEstado);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <ClockIcon className="h-5 w-5 text-gray-400" />
            <span className="font-semibold text-gray-900">
              {formatTime(cita.horaInicio)} - {formatTime(cita.horaFin)}
            </span>
          </div>
          
          {loadingPatient ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span className="text-sm text-gray-500">Cargando paciente...</span>
            </div>
          ) : patientInfo ? (
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">
                {patientInfo.nombres} {patientInfo.apellidos}
              </span>
            </div>
          ) : cita.pacienteNombre ? (
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">{cita.pacienteNombre}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-500 text-sm">Paciente ID: {cita.pacienteId}</span>
            </div>
          )}
        </div>
        
        <CitaStatusBadge estado={cita.estado} />
      </div>

      {cita.motivo && (
        <div className="mb-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Motivo:</span> {cita.motivo}
          </p>
        </div>
      )}

      {cita.medicoAsignado && (
        <div className="mb-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Médico:</span> {cita.medicoAsignado}
          </p>
        </div>
      )}

      {cita.notas && (
        <div className="mb-3">
          <p className="text-sm text-gray-600 italic">
            {cita.notas}
          </p>
        </div>
      )}

      {/* Acciones con iconos */}
      {showEstadoSection && (
        <div className="mb-3 pt-3 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ACCIONES
          </label>
          
          {/* Iconos de acciones rápidas */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onCambiarEstado(cita, 'EN_SALA')}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              title="En Sala"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            <button
              onClick={() => onCambiarEstado(cita, 'ATENDIDO')}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
              title="Atendido"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            
            <button
              onClick={() => console.log('Ver detalles', cita)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Ver detalles"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitaCard;
