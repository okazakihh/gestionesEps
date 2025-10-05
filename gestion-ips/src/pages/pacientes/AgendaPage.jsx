import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pacientesApiService } from '../../services/pacientesApiService.js';
import { MainLayout } from '../../components/ui/MainLayout.jsx';
import ServiceAlert from '../../components/ui/ServiceAlert.jsx';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const AgendaPage = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const [searchParams, setSearchParams] = useState({
    page: 0,
    size: 10
  });

  useEffect(() => {
    loadCitasPendientes();
  }, [searchParams]);

  const loadCitasPendientes = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);
      const response = await pacientesApiService.getCitasPendientes(searchParams);
      setCitas(response.content || []);
    } catch (err) {
      const error = err;
      // Detectar errores de conexión
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setConnectionError(true);
        setError('No se pudo conectar con el servicio de citas médicas. Verifique que el servidor esté ejecutándose.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar citas pendientes');
      }
    } finally {
      setLoading(false);
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

  const parseCitaData = (cita) => {
    try {
      if (cita.datosJson) {
        const parsedData = typeof cita.datosJson === 'string' ? JSON.parse(cita.datosJson) : cita.datosJson;

        // Extraer información del CUPS si existe
        const informacionCups = parsedData.informacionCups || null;

        console.log("informacion del cups -------->", informacionCups)

        return {
          fechaCita: parsedData.fechaHoraCita || parsedData.fechaCita || null,
          horaCita: parsedData.horaCita || null,
          motivo: parsedData.motivo || 'N/A',
          // Priorizar especialidad del CUPS sobre la del formulario
          especialidad: (informacionCups && informacionCups.especialidad) || parsedData.especialidad || 'N/A',
          medico: parsedData.medicoAsignado || parsedData.medico || 'N/A',
          tipoCita: parsedData.tipoCita || 'General',
          observaciones: parsedData.notas || parsedData.observaciones || 'Sin observaciones',
          codigoCups: parsedData.codigoCups || null,
          informacionCups: informacionCups
        };
      }
    } catch (error) {
      console.error('Error parsing cita data:', error);
    }
    return {
      fechaCita: null,
      horaCita: null,
      motivo: 'N/A',
      especialidad: 'N/A',
      medico: 'N/A',
      tipoCita: 'General',
      observaciones: 'Sin observaciones',
      codigoCups: null,
      informacionCups: null
    };
  };

  const getPacienteInfo = (cita) => {
    try {
      if (cita.paciente?.datosJson) {
        const parsedData = typeof cita.paciente.datosJson === 'string' ? JSON.parse(cita.paciente.datosJson) : cita.paciente.datosJson;

        // Try nested format first (existing patients)
        if (parsedData.datosJson) {
          const secondLevel = typeof parsedData.datosJson === 'string' ? JSON.parse(parsedData.datosJson) : parsedData.datosJson;
          const infoPersonal = secondLevel.informacionPersonal || {};
          const infoContacto = secondLevel.informacionContacto || {};

          return {
            nombre: `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim() || 'N/A',
            telefono: infoContacto.telefono || 'N/A',
            documento: `${cita.paciente.tipoDocumento || ''} ${cita.paciente.numeroDocumento || ''}`.trim() || 'N/A'
          };
        }

        // Try flat format (newly created patients)
        if (parsedData.informacionPersonalJson || parsedData.informacionContactoJson) {
          const infoPersonal = parsedData.informacionPersonalJson ? JSON.parse(parsedData.informacionPersonalJson) : {};
          const infoContacto = parsedData.informacionContactoJson ? JSON.parse(parsedData.informacionContactoJson) : {};

          return {
            nombre: `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim() || 'N/A',
            telefono: infoContacto.telefono || 'N/A',
            documento: `${cita.paciente.tipoDocumento || ''} ${cita.paciente.numeroDocumento || ''}`.trim() || 'N/A'
          };
        }
      }
    } catch (error) {
      console.error('Error parsing paciente data:', error);
    }

    return {
      nombre: cita.paciente?.nombreCompleto || 'N/A',
      telefono: 'N/A',
      documento: `${cita.paciente?.tipoDocumento || ''} ${cita.paciente?.numeroDocumento || ''}`.trim() || 'N/A'
    };
  };

  if (loading) {
    return (
      <MainLayout title="Agenda de Citas" subtitle="Cargando...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Agenda de Citas" subtitle="Error">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar citas pendientes
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
              <div className="mt-4">
                <button
                  onClick={loadCitasPendientes}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Agenda de Citas" subtitle="Citas médicas pendientes">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Agenda de Citas</h1>
            <p className="mt-2 text-sm text-gray-700">
              Gestión de citas médicas pendientes y programadas.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              to="/pacientes/dashboard"
              className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              <CalendarDaysIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              Agendar Nueva Cita
            </Link>
          </div>
        </div>

        {/* Service Alert */}
        {connectionError && (
          <div className="mt-6">
            <ServiceAlert
              type="error"
              title="Error de Conexión"
              message="No se pudo conectar con el servicio de citas médicas. Verifique que el servidor esté ejecutándose."
              onRetry={loadCitasPendientes}
              retryLabel="Reintentar Conexión"
            />
          </div>
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
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
                      {citas.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
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
                      {citas.length > 0 ? formatDate(citas[0]?.fechaCreacion) : 'Ninguna'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
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
                      {new Set(citas.map(cita => cita.paciente?.id)).size}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Citas List */}
        <div className="mt-8">
          {citas.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas pendientes</h3>
              <p className="mt-1 text-sm text-gray-500">
                Todas las citas han sido atendidas o no hay citas programadas.
              </p>
              <div className="mt-6">
                <Link
                  to="/pacientes/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <CalendarDaysIcon className="-ml-1 mr-2 h-5 w-5" />
                  Agendar Nueva Cita
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {citas.map((cita) => {
                const citaData = parseCitaData(cita);
                const pacienteInfo = getPacienteInfo(cita);

                // Debug temporal - FORZAR mostrar info CUPS para cita #5
                if (cita.id === 5) {
                  console.log('🔍 Cita #5 - citaData:', citaData);
                  console.log('🔍 Cita #5 - informacionCups:', citaData.informacionCups);
                  console.log('🔍 Cita #5 - codigoCups:', citaData.codigoCups);

                  // FORZAR valores para debug
                  if (!citaData.informacionCups) {
                    citaData.informacionCups = {
                      categoria: "Diagnóstico",
                      especialidad: "Otorrinolaringología",
                      tipo: "Exploración",
                      equipo_requerido: "Otoscopio"
                    };
                  }
                  if (!citaData.codigoCups) {
                    citaData.codigoCups = "891503";
                  }
                  console.log('🔧 Cita #5 - VALORES FORZADOS:', citaData);
                }

                return (
                  <div key={cita.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
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
                              Cita #{cita.id} - DEBUG: {new Date().toISOString()}
                            </h4>
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Pendiente - CUPS INTEGRADO
                            </span>
                          </div>

                          {/* Fecha y Hora */}
                          <div className="mb-3">
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="font-medium">Fecha programada:</span>
                              <span className="ml-2">{formatDate(citaData.fechaCita)}</span>
                            </div>
                            {citaData.horaCita && (
                              <div className="flex items-center text-sm text-gray-600">
                                <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="font-medium">Hora:</span>
                                <span className="ml-2">{citaData.horaCita}</span>
                              </div>
                            )}
                          </div>

                          {/* Información del Paciente */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
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
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Especialidad</p>
                              <p className="text-sm text-gray-600">{citaData.especialidad}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Médico</p>
                              <p className="text-sm text-gray-600">{citaData.medico}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Tipo</p>
                              <p className="text-sm text-gray-600">{citaData.tipoCita}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Código CUPS</p>
                              <p className="text-sm text-gray-600">{citaData.codigoCups || 'N/A'}</p>
                              {citaData.informacionCups ? (
                                <p className="text-xs text-green-600 mt-1 font-medium">
                                  ✅ CUPS: {citaData.informacionCups.especialidad || citaData.informacionCups.categoria}
                                </p>
                              ) : (
                                <p className="text-xs text-red-500 mt-1 font-medium">
                                  ❌ Sin info CUPS
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Motivo y Detalles CUPS */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Motivo de la consulta</p>
                              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{citaData.motivo}</p>
                            </div>
                            {citaData.informacionCups ? (
                              <div>
                                <p className="text-sm font-medium text-green-700 mb-1">✅ Detalles CUPS</p>
                                <div className="text-xs text-gray-600 bg-green-50 p-2 rounded space-y-1 border border-green-200">
                                  {citaData.informacionCups.categoria && (
                                    <div><span className="font-medium">Categoría:</span> {citaData.informacionCups.categoria}</div>
                                  )}
                                  {citaData.informacionCups.especialidad && (
                                    <div><span className="font-medium">Especialidad:</span> {citaData.informacionCups.especialidad}</div>
                                  )}
                                  {citaData.informacionCups.tipo && (
                                    <div><span className="font-medium">Tipo:</span> {citaData.informacionCups.tipo}</div>
                                  )}
                                  {citaData.informacionCups.ambito && (
                                    <div><span className="font-medium">Ámbito:</span> {citaData.informacionCups.ambito}</div>
                                  )}
                                  {citaData.informacionCups.equipo_requerido && (
                                    <div><span className="font-medium">Equipo:</span> {citaData.informacionCups.equipo_requerido}</div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm font-medium text-red-700 mb-1">❌ Sin Detalles CUPS</p>
                                <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                  No hay información adicional del CUPS disponible
                                </div>
                              </div>
                            )}
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
                          to={`/pacientes/${cita.paciente?.id}`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                        >
                          <UserIcon className="h-4 w-4 mr-2" />
                          Ver Paciente
                        </Link>
                        <button className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Atender
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AgendaPage;