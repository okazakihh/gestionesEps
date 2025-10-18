import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

// Context
import { useAuth } from '../../../../negocio/context/AuthContext';

// Custom Hooks
import { useCitas } from '../../../../negocio/hooks/useCitas';
import { useCitasFilters } from '../../../../negocio/hooks/useCitasFilters';
import { usePatientData } from '../../../../negocio/hooks/usePatientData';

// Utils
import { parseCitaData } from '../../../../negocio/utils/citaUtils';

// Components
import CitasStats from '../../../components/citas/CitasStats';
import CitasFilters from '../../../components/citas/CitasFilters';
import CitasList from '../../../components/citas/CitasList';
import CreateHistoriaClinicaModal from './CreateHistoriaClinicaModal';

/**
 * AgendaModal - Modal para gestión de citas
 * 
 * Componente principal para visualizar y gestionar la agenda de citas médicas.
 * Muestra estadísticas, filtros y lista de citas con opciones de atención y cancelación.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Callback para cerrar el modal
 * @param {URLSearchParams} props.searchParams - Parámetros de búsqueda de la URL
 */
const AgendaModal = ({ isOpen, onClose, searchParams }) => {
  // ==================== CONTEXT ====================
  const { user } = useAuth();

  // ==================== CUSTOM HOOKS ====================
  const {
    citas,
    loading,
    error,
    updatingStatus,
    loadCitas,
    updateCitaEstado,
    marcarComoAtendida,
    cancelarCita
  } = useCitas(searchParams);

  // Obtener fecha de hoy en formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Inicializar filtros con fecha de hoy por defecto
  const initialFilters = {
    fechaInicio: getTodayDate(),
    fechaFin: '',
    estado: '',
    paciente: ''
  };

  const {
    filters,
    filteredCitas,
    updateFilter,
    setFilters,
    resetFilters
  } = useCitasFilters(citas, initialFilters);

  const {
    patientData,
    loadingPatients,
    getPatientById,
    isLoadingPatient
  } = usePatientData(citas);

  // ==================== LOCAL STATE ====================
  const [currentView, setCurrentView] = useState('agenda'); // 'agenda', 'create_historia', 'create_consulta', 'view_patient'
  const [selectedCita, setSelectedCita] = useState(null);
  const [isHistoriaModalOpen, setIsHistoriaModalOpen] = useState(false);
  const [citaParaHistoria, setCitaParaHistoria] = useState(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (isOpen) {
      loadCitas();
    }
  }, [isOpen, searchParams]);

  // ==================== HANDLERS ====================
  
  /**
   * Maneja la acción de atender una cita
   */
  const handleAtender = async (cita) => {
    const result = await Swal.fire({
      title: '¿Atender cita?',
      text: 'Se marcará la cita como atendida',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, atender',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
      const success = await marcarComoAtendida(cita.id);
      
      if (success) {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Cita marcada como atendida',
          icon: 'success',
          confirmButtonColor: '#16a34a',
          timer: 2000
        });
        loadCitas(); // Recargar citas
      } else {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo atender la cita',
          icon: 'error',
          confirmButtonColor: '#16a34a'
        });
      }
    }
  };

  /**
   * Maneja la acción de cancelar una cita
   */
  const handleCancelar = async (cita) => {
    const result = await Swal.fire({
      title: '¿Cancelar cita?',
      text: 'Opcionalmente, indique el motivo de la cancelación',
      input: 'textarea',
      inputPlaceholder: 'Motivo de cancelación (opcional)',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      inputValidator: (value) => {
        // No es obligatorio, pero si se proporciona debe tener al menos 3 caracteres
        if (value && value.length < 3) {
          return 'El motivo debe tener al menos 3 caracteres';
        }
      }
    });

    if (result.isConfirmed) {
      const motivo = result.value || 'Sin motivo especificado';
      const success = await cancelarCita(cita.id, motivo);
      
      if (success) {
        Swal.fire({
          title: '¡Cita cancelada!',
          text: 'La cita ha sido cancelada correctamente',
          icon: 'success',
          confirmButtonColor: '#16a34a',
          timer: 2000
        });
        loadCitas(); // Recargar citas
      } else {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cancelar la cita',
          icon: 'error',
          confirmButtonColor: '#16a34a'
        });
      }
    }
  };

  /**
   * Maneja el cambio de estado de una cita
   */
  const handleCambiarEstado = async (cita, nuevoEstado) => {
    const estadoLabels = {
      'PROGRAMADA': 'Programada',
      'EN_SALA': 'En Sala',
      'ATENDIDO': 'Atendido',
      'NO_SE_PRESENTO': 'No se Presentó',
      'CANCELADA': 'Cancelada'
    };

    const result = await Swal.fire({
      title: '¿Cambiar estado de la cita?',
      html: `
        <p>Estado actual: <strong>${estadoLabels[cita.estado] || cita.estado}</strong></p>
        <p>Nuevo estado: <strong>${estadoLabels[nuevoEstado] || nuevoEstado}</strong></p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280'
    });

    if (result.isConfirmed) {
      const response = await updateCitaEstado(cita.id, nuevoEstado);
      
      if (response.success) {
        Swal.fire({
          title: '¡Estado actualizado!',
          text: `La cita ahora está en estado: ${estadoLabels[nuevoEstado] || nuevoEstado}`,
          icon: 'success',
          confirmButtonColor: '#16a34a',
          timer: 2000
        });

        // Si el nuevo estado es ATENDIDO, abrir modal de Historia Clínica
        if (nuevoEstado === 'ATENDIDO') {
          setCitaParaHistoria(cita);
          setIsHistoriaModalOpen(true);
        }
      } else {
        Swal.fire({
          title: 'Error',
          text: response.error || 'No se pudo actualizar el estado de la cita',
          icon: 'error',
          confirmButtonColor: '#16a34a'
        });
      }
    }
  };

  /**
   * Maneja el cierre del modal
   */
  const handleClose = () => {
    setCurrentView('agenda');
    setSelectedCita(null);
    onClose();
  };

  /**
   * Maneja el cierre del modal de Historia Clínica
   */
  const handleCloseHistoriaModal = () => {
    setIsHistoriaModalOpen(false);
    setCitaParaHistoria(null);
  };

  /**
   * Maneja la creación exitosa de una Historia Clínica
   */
  const handleHistoriaCreated = () => {
    handleCloseHistoriaModal();
    loadCitas(); // Recargar las citas
    Swal.fire({
      title: '¡Historia Clínica Creada!',
      text: 'La historia clínica ha sido registrada correctamente',
      icon: 'success',
      confirmButtonColor: '#16a34a',
      timer: 2000
    });
  };

  /**
   * Maneja la recarga manual de citas
   */
  const handleReload = () => {
    loadCitas();
  };

  // ==================== RENDER CONDITIONS ====================
  if (!isOpen) return null;

  // ==================== RENDER ====================
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleClose}></div>
        </div>

        {/* Modal Container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-4/5 h-4/5">
          
          {/* Header */}
          <div className="bg-green-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentView !== 'agenda' && (
                <button
                  onClick={() => setCurrentView('agenda')}
                  className="text-white hover:text-green-100 transition-colors"
                  aria-label="Volver"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </button>
              )}
              <h2 className="text-xl font-bold text-white">
                {currentView === 'agenda' ? 'Agenda de Citas' : 'Detalle de Cita'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-green-100 transition-colors"
              aria-label="Cerrar"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentView === 'agenda' && (
              <>
                {/* Error Display */}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-sm text-red-700">{error}</div>
                    <div className="mt-4">
                      <button
                        onClick={handleReload}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {loading && !error && (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  </div>
                )}

                {/* Content */}
                {!loading && !error && (
                  <div className="space-y-6">
                    {/* Statistics */}
                    <CitasStats citas={citas} />

                    {/* Filters */}
                    <CitasFilters
                      filters={filters}
                      onFilterChange={updateFilter}
                      onReset={resetFilters}
                    />

                    {/* Citas List */}
                    <CitasList
                      citas={filteredCitas}
                      patientData={patientData}
                      loadingPatients={loadingPatients}
                      onAtender={handleAtender}
                      onCancelar={handleCancelar}
                      onCambiarEstado={handleCambiarEstado}
                      canModify={true}
                      emptyMessage="No se encontraron citas con los filtros aplicados"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Historia Clínica */}
      {citaParaHistoria && (
        <CreateHistoriaClinicaModal
          isOpen={isHistoriaModalOpen}
          onClose={handleCloseHistoriaModal}
          onHistoriaCreated={handleHistoriaCreated}
          pacienteId={citaParaHistoria.pacienteId}
          citaId={citaParaHistoria.id}
          citaData={{
            medicoAsignado: citaParaHistoria.medicoAsignado,
            motivo: citaParaHistoria.motivo,
            notas: citaParaHistoria.notas,
            especialidad: citaParaHistoria.especialidad || ''
          }}
        />
      )}
    </div>
  );
};

export default AgendaModal;
