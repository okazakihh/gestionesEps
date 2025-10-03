import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon, CalendarDaysIcon, ClockIcon, UserIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { pacientesApiService } from '../../../services/pacientesApiService.js';

const AgendaModal = ({ isOpen, onClose }) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState({});
  const [loadingPatients, setLoadingPatients] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [searchParams, setSearchParams] = useState({
    page: 0,
    size: 10
  });
  // Initialize filters with today's date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const [filters, setFilters] = useState({
    fechaInicio: getTodayDate(),
    fechaFin: getTodayDate(),
    estado: '',
    paciente: ''
  });
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [showCitasCards, setShowCitasCards] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadCitasPendientes();
    } else {
      // Reset state when modal closes
      setPatientData({});
      setLoadingPatients({});
    }
  }, [isOpen, searchParams]);

  // Load patient data when citas are loaded
  useEffect(() => {
    if (citas.length > 0) {
      citas.forEach(cita => {
        if (cita.pacienteId && !patientData[cita.pacienteId] && !loadingPatients[cita.pacienteId]) {
          loadPatientData(cita.pacienteId);
        }
      });
    }
  }, [citas]);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFilters();
  }, [citas, filters]);

  const loadCitasPendientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pacientesApiService.getCitasPendientes(searchParams);
      setCitas(response.content || []);
    } catch (err) {
      const error = err;
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setError('No se pudo conectar con el servicio de citas médicas. Verifique que el servidor esté ejecutándose.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar citas pendientes');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPatientData = async (pacienteId) => {
    if (patientData[pacienteId] || loadingPatients[pacienteId]) {
      return; // Already loaded or loading
    }

    try {
      setLoadingPatients(prev => ({ ...prev, [pacienteId]: true }));
      const response = await pacientesApiService.getPacienteById(pacienteId);
      setPatientData(prev => ({ ...prev, [pacienteId]: response }));
    } catch (err) {
      console.error('Error loading patient data:', err);
      // Set empty data to avoid retrying
      setPatientData(prev => ({ ...prev, [pacienteId]: {} }));
    } finally {
      setLoadingPatients(prev => ({ ...prev, [pacienteId]: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      let date;

      // Handle LocalDateTime serialized as array [year, month, day, hour, minute, second, nanosecond]
      if (Array.isArray(dateString) && dateString.length >= 6) {
        // LocalDateTime comes as [2024, 12, 15, 10, 30, 0, 0]
        date = new Date(dateString[0], dateString[1] - 1, dateString[2], dateString[3], dateString[4], dateString[5]);
      } else if (typeof dateString === 'string') {
        // Try different parsing strategies
        if (dateString.includes('T')) {
          // ISO format with time: "2024-12-15T10:30:00.000+00:00"
          date = new Date(dateString);
        } else if (dateString.includes('-')) {
          // Date only format: "2024-12-15"
          date = new Date(dateString + 'T00:00:00');
        } else {
          // Other string formats
          date = new Date(dateString);
        }
      } else if (dateString instanceof Date) {
        date = dateString;
      } else {
        date = new Date(dateString);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }

      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Error en fecha';
    }
  };


  const getPacienteInfo = (cita) => {
    const patientInfo = patientData[cita.pacienteId];

    if (patientInfo) {
      try {
        // Parse patient data from the loaded patient information
        if (patientInfo.datosJson) {
          const parsedData = typeof patientInfo.datosJson === 'string' ? JSON.parse(patientInfo.datosJson) : patientInfo.datosJson;

          // Try nested format first (existing patients)
          if (parsedData.datosJson) {
            const secondLevel = typeof parsedData.datosJson === 'string' ? JSON.parse(parsedData.datosJson) : parsedData.datosJson;
            const infoPersonal = secondLevel.informacionPersonal || {};
            const infoContacto = secondLevel.informacionContacto || {};

            return {
              nombre: `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim() || 'N/A',
              telefono: infoContacto.telefono || 'N/A',
              documento: `${patientInfo.tipoDocumento || ''} ${patientInfo.numeroDocumento || ''}`.trim() || 'N/A'
            };
          }

          // Try flat format (newly created patients)
          if (parsedData.informacionPersonalJson || parsedData.informacionContactoJson) {
            const infoPersonal = parsedData.informacionPersonalJson ? JSON.parse(parsedData.informacionPersonalJson) : {};
            const infoContacto = parsedData.informacionContactoJson ? JSON.parse(parsedData.informacionContactoJson) : {};

            return {
              nombre: `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim() || 'N/A',
              telefono: infoContacto.telefono || 'N/A',
              documento: `${patientInfo.tipoDocumento || ''} ${patientInfo.numeroDocumento || ''}`.trim() || 'N/A'
            };
          }
        }
      } catch (error) {
        console.error('Error parsing paciente data:', error);
      }
    }

    // Fallback to basic patient info from the cita
    return {
      nombre: cita.pacienteNombre || 'N/A',
      telefono: loadingPatients[cita.pacienteId] ? 'Cargando...' : 'N/A',
      documento: loadingPatients[cita.pacienteId] ? 'Cargando...' : 'N/A'
    };
  };

  const getCitaInfo = (cita) => {
    try {
      if (cita.datosJson) {
        const citaData = typeof cita.datosJson === 'string' ? JSON.parse(cita.datosJson) : cita.datosJson;

        // Handle different possible estado formats
        let estado = citaData.estado || 'PROGRAMADO';

        // Normalize estado to uppercase for consistency
        if (typeof estado === 'string') {
          estado = estado.toUpperCase();
        }

        // Map common variations to standard values
        const estadoMapping = {
          'PROGRAMADO': 'PROGRAMADO',
          'PROGRAMADA': 'PROGRAMADO', // feminine form
          'EN_SALA': 'EN_SALA',
          'EN SALA': 'EN_SALA',
          'ATENDIDO': 'ATENDIDO',
          'ATENDIDA': 'ATENDIDO', // feminine form
          'NO_SE_PRESENTO': 'NO_SE_PRESENTO',
          'NO SE PRESENTO': 'NO_SE_PRESENTO',
          'NO SE PRESENTÓ': 'NO_SE_PRESENTO'
        };

        estado = estadoMapping[estado] || estado;

        return {
          fechaHoraCita: citaData.fechaHoraCita || null,
          motivo: citaData.motivo || 'N/A',
          medicoAsignado: citaData.medicoAsignado || 'N/A',
          estado: estado,
          notas: citaData.notas || 'Sin notas',
          especialidad: citaData.especialidad || 'N/A',
          tipoCita: citaData.tipoCita || 'General'
        };
      }
    } catch (error) {
      console.error('Error parsing cita data:', error);
    }

    return {
      fechaHoraCita: null,
      motivo: 'N/A',
      medicoAsignado: 'N/A',
      estado: 'PROGRAMADO',
      notas: 'Sin notas',
      especialidad: 'N/A',
      tipoCita: 'General'
    };
  };

  const getAvailableStatusTransitions = (currentStatus) => {
    const transitions = {
      'PROGRAMADO': ['EN_SALA', 'NO_SE_PRESENTO'],
      'EN_SALA': ['ATENDIDO'],
      'ATENDIDO': [],
      'NO_SE_PRESENTO': []
    };
    return transitions[currentStatus] || [];
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PROGRAMADO': 'Programado',
      'EN_SALA': 'En Sala',
      'ATENDIDO': 'Atendido',
      'NO_SE_PRESENTO': 'No se Presentó'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'PROGRAMADO': 'bg-blue-100 text-blue-800',
      'EN_SALA': 'bg-yellow-100 text-yellow-800',
      'ATENDIDO': 'bg-green-100 text-green-800',
      'NO_SE_PRESENTO': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const updateAppointmentStatus = async (citaId, newStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [citaId]: true }));

      const response = await pacientesApiService.actualizarEstadoCita(citaId, newStatus);

      if (response.success) {
        // Update the cita in the local state
        setCitas(prevCitas =>
          prevCitas.map(cita =>
            cita.id === citaId ? response.data : cita
          )
        );

        // Show success message (you can use SweetAlert2 here if available)
        console.log(`Estado de cita ${citaId} actualizado a ${newStatus}`);
      } else {
        throw new Error(response.error || 'Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      // Show error message (you can use SweetAlert2 here if available)
      alert(`Error al actualizar estado: ${error.message}`);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [citaId]: false }));
    }
  };

  const applyFilters = () => {
    let filtered = [...citas];

    // Filter by date range
    if (filters.fechaInicio) {
      const startDate = new Date(filters.fechaInicio);
      filtered = filtered.filter(cita => {
        const citaInfo = getCitaInfo(cita);
        if (!citaInfo.fechaHoraCita) return false;
        const citaDate = new Date(citaInfo.fechaHoraCita);
        return citaDate >= startDate;
      });
    }

    if (filters.fechaFin) {
      const endDate = new Date(filters.fechaFin);
      endDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(cita => {
        const citaInfo = getCitaInfo(cita);
        if (!citaInfo.fechaHoraCita) return false;
        const citaDate = new Date(citaInfo.fechaHoraCita);
        return citaDate <= endDate;
      });
    }

    // Filter by status
    if (filters.estado) {
      filtered = filtered.filter(cita => {
        const citaInfo = getCitaInfo(cita);
        return citaInfo.estado === filters.estado;
      });
    }

    // Filter by patient
    if (filters.paciente) {
      filtered = filtered.filter(cita => {
        const pacienteInfo = getPacienteInfo(cita);
        const searchTerm = filters.paciente.toLowerCase();
        const nombre = pacienteInfo.nombre?.toLowerCase() || '';
        const documento = pacienteInfo.documento?.toLowerCase() || '';
        const telefono = pacienteInfo.telefono?.toLowerCase() || '';

        return nombre.includes(searchTerm) ||
               documento.includes(searchTerm) ||
               telefono.includes(searchTerm);
      });
    }

    setFilteredCitas(filtered);
  };

  const clearFilters = () => {
    const today = getTodayDate();
    setFilters({
      fechaInicio: today,
      fechaFin: today,
      estado: '',
      paciente: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-4/5 h-4/5">
          {/* Header */}
          <div className="bg-green-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Agenda de Citas</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-700">{error}</div>
                <div className="mt-4">
                  <button
                    onClick={loadCitasPendientes}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="bg-white overflow-hidden shadow rounded-lg border">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CalendarDaysIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Citas Pendientes
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {filteredCitas.length}
                              </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg border">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ClockIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Próxima Cita
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {filteredCitas.length > 0 ? formatDate(filteredCitas[0]?.fechaCreacion) : 'Ninguna'}
                              </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg border">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <UserIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Pacientes Atendidos
                              </dt>
                              <dd className="text-lg font-medium text-gray-900">
                                {new Set(filteredCitas.map(cita => cita.pacienteId)).size}
                              </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Desde
                      </label>
                      <input
                        type="date"
                        id="fechaInicio"
                        value={filters.fechaInicio}
                        onChange={(e) => setFilters(prev => ({ ...prev, fechaInicio: e.target.value }))}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Hasta
                      </label>
                      <input
                        type="date"
                        id="fechaFin"
                        value={filters.fechaFin}
                        onChange={(e) => setFilters(prev => ({ ...prev, fechaFin: e.target.value }))}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <select
                        id="estado"
                        value={filters.estado}
                        onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      >
                        <option value="">Todos los estados</option>
                        <option value="PROGRAMADO">Programado</option>
                        <option value="EN_SALA">En Sala</option>
                        <option value="ATENDIDO">Atendido</option>
                        <option value="NO_SE_PRESENTO">No se Presentó</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="paciente" className="block text-sm font-medium text-gray-700 mb-1">
                        Buscar Paciente
                      </label>
                      <input
                        type="text"
                        id="paciente"
                        value={filters.paciente}
                        onChange={(e) => setFilters(prev => ({ ...prev, paciente: e.target.value }))}
                        placeholder="Nombre, documento o teléfono..."
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      />
                    </div>

                    <div className="md:col-span-2 lg:col-span-1 flex items-end">
                      <button
                        onClick={clearFilters}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Limpiar Filtros
                      </button>
                    </div>
                  </div>
                </div>

                {/* Toggle Citas Cards */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Citas Médicas</h3>
                  <button
                    onClick={() => setShowCitasCards(!showCitasCards)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {showCitasCards ? 'Ocultar Citas' : 'Mostrar Citas'}
                  </button>
                </div>

                {/* Citas List */}
                {showCitasCards && (
                  <>
                    {filteredCitas.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          {citas.length === 0 ? 'No hay citas pendientes' : 'No hay citas que coincidan con los filtros'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {citas.length === 0
                            ? 'Todas las citas han sido atendidas o no hay citas programadas.'
                            : 'Intenta ajustar los filtros de búsqueda.'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredCitas.map((cita) => {
                          const citaInfo = getCitaInfo(cita);
                          const pacienteInfo = getPacienteInfo(cita);

                          return (
                            <div key={cita.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200 border">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4 flex-1">
                                  <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                      <CalendarDaysIcon className="h-6 w-6 text-green-600" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="text-lg font-semibold text-gray-900">
                                        Cita #{cita.id}
                                      </h4>
                                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(citaInfo.estado)}`}>
                                        {getStatusLabel(citaInfo.estado)}
                                      </span>
                                    </div>

                                    {/* Fecha y Hora */}
                                    <div className="mb-3">
                                      <div className="flex items-center text-sm text-gray-600 mb-1">
                                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                                        <span className="font-medium">Fecha programada:</span>
                                        <span className="ml-2">{citaInfo.fechaHoraCita ? formatDate(citaInfo.fechaHoraCita) : 'N/A'}</span>
                                      </div>
                                    </div>

                                    {/* Información del Paciente */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3" style={{ maxWidth: 'none' }}>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 mb-1">Paciente</p>
                                        <p className="text-sm text-gray-600">{pacienteInfo.nombre}</p>
                                        <p className="text-sm text-gray-500">{pacienteInfo.documento}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 mb-1">Contacto</p>
                                        <div className="flex items-center text-sm text-gray-600">
                                          <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                                          {pacienteInfo.telefono}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Detalles de la Cita */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3" style={{ maxWidth: 'none' }}>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 mb-1">Especialidad</p>
                                        <p className="text-sm text-gray-600">{citaInfo.especialidad}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 mb-1">Médico</p>
                                        <p className="text-sm text-gray-600">{citaInfo.medicoAsignado}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 mb-1">Tipo</p>
                                        <p className="text-sm text-gray-600">{citaInfo.tipoCita}</p>
                                      </div>
                                    </div>

                                    {/* Motivo */}
                                    <div className="mb-3">
                                      <p className="text-sm font-medium text-gray-900 mb-1">Motivo de la consulta</p>
                                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{citaInfo.motivo}</p>
                                    </div>

                                    {/* Fecha de creación */}
                                    <div className="text-xs text-gray-500">
                                      Creada: {formatDate(cita.fechaCreacion)}
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-2 ml-4">
                                  <Link
                                    to={`/pacientes/${cita.pacienteId}`}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                    onClick={onClose}
                                  >
                                    <UserIcon className="h-4 w-4 mr-2" />
                                    Ver Paciente
                                  </Link>

                                  {/* Status Change Buttons */}
                                  {getAvailableStatusTransitions(citaInfo.estado).map((newStatus) => (
                                    <button
                                      key={newStatus}
                                      onClick={() => updateAppointmentStatus(cita.id, newStatus)}
                                      disabled={updatingStatus[cita.id]}
                                      className={`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white transition-colors duration-200 ${
                                        newStatus === 'EN_SALA'
                                          ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                                          : newStatus === 'ATENDIDO'
                                          ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                          : newStatus === 'NO_SE_PRESENTO'
                                          ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                          : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                      {updatingStatus[cita.id] ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      ) : (
                                        <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                      )}
                                      {getStatusLabel(newStatus)}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaModal;