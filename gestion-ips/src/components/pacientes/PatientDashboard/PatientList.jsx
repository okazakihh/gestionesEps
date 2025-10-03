import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { pacientesApiService } from '../../../services/pacientesApiService.js';

const PatientList = ({ searchTerm, filterStatus, onPatientClick, onScheduleAppointment, refreshTrigger }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadPatients();
  }, [searchTerm, filterStatus, currentPage]);

  useEffect(() => {
    if (refreshTrigger) {
      loadPatients();
    }
  }, [refreshTrigger]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      // Construir parámetros de búsqueda
      const params = {
        page: currentPage,
        size: pageSize
      };

      // Agregar filtros si existen
      if (searchTerm) {
        params.nombre = searchTerm; // El backend debería manejar búsqueda por nombre
      }

      if (filterStatus !== 'all') {
        params.activo = filterStatus === 'active';
      }

      // Cargar pacientes desde la API
      const response = await pacientesApiService.getPacientes(params);

      // Debug: Ver qué fechas llegan del backend
      console.log('Pacientes response:', response.content?.[0]);

      // El response debería tener la estructura: { content: [], totalElements, totalPages, etc. }
      setPatients(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients([]);
      setTotalPages(0);
      setTotalElements(0);
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
        console.error('Invalid date parsed:', dateString, '->', date);
        return 'Fecha inválida';
      }

      const formatted = date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      return formatted;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Error en fecha';
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      return `${age} años`;
    } catch (error) {
      return 'N/A';
    }
  };

  // Función para extraer información del JSON del paciente
  const parsePatientData = (patient) => {
    try {
      if (patient.datosJson) {
        // Parsear el primer nivel del JSON
        const firstLevel = typeof patient.datosJson === 'string' ? JSON.parse(patient.datosJson) : patient.datosJson;

        // El campo datosJson contiene otro JSON string anidado
        if (firstLevel.datosJson) {
          const secondLevel = typeof firstLevel.datosJson === 'string' ? JSON.parse(firstLevel.datosJson) : firstLevel.datosJson;

          // Extraer información personal
          const infoPersonal = secondLevel.informacionPersonal || {};
          const infoContacto = secondLevel.informacionContacto || {};
          const infoMedica = secondLevel.informacionMedica || {};

          const nombreCompleto = `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim();

          return {
            nombreCompleto: nombreCompleto || 'N/A',
            telefono: infoContacto.telefono || 'N/A',
            email: infoContacto.email || 'N/A',
            ciudad: infoContacto.ciudad || 'N/A',
            eps: infoMedica.eps || 'N/A',
            fechaNacimiento: infoPersonal.fechaNacimiento || null,
            genero: infoPersonal.genero || 'N/A',
            estadoCivil: infoPersonal.estadoCivil || 'N/A'
          };
        }

        // Si no hay datosJson anidado, intentar parsear directamente (formato de API de creación)
        if (firstLevel.informacionPersonalJson || firstLevel.informacionContactoJson) {
          const infoPersonal = firstLevel.informacionPersonalJson ? JSON.parse(firstLevel.informacionPersonalJson) : {};
          const infoContacto = firstLevel.informacionContactoJson ? JSON.parse(firstLevel.informacionContactoJson) : {};
          const infoMedica = firstLevel.informacionMedicaJson ? JSON.parse(firstLevel.informacionMedicaJson) : {};

          const nombreCompleto = `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim();

          return {
            nombreCompleto: nombreCompleto || 'N/A',
            telefono: infoContacto.telefono || 'N/A',
            email: infoContacto.email || 'N/A',
            ciudad: infoContacto.ciudad || 'N/A',
            eps: infoMedica.eps || 'N/A',
            fechaNacimiento: infoPersonal.fechaNacimiento || null,
            genero: infoPersonal.genero || 'N/A',
            estadoCivil: infoPersonal.estadoCivil || 'N/A'
          };
        }
      }
    } catch (error) {
      console.error('Error parsing patient data:', error, patient);
    }

    return {
      nombreCompleto: patient.nombreCompleto || 'N/A',
      telefono: 'N/A',
      email: 'N/A',
      ciudad: 'N/A',
      eps: 'N/A',
      fechaNacimiento: null,
      genero: 'N/A',
      estadoCivil: 'N/A'
    };
  };

  const getStatusBadge = (patient) => {
    if (!patient.activo) {
      return <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Inactivo</span>;
    }

    // TODO: Una vez implementada la API de citas, agregar lógica de citas próximas
    return <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Activo</span>;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Lista de Pacientes ({patients.length} encontrados)
        </h3>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron pacientes</h3>
          <p className="mt-1 text-sm text-gray-500">
            Intenta ajustar los filtros de búsqueda.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {patients.map((patient) => {
              const patientData = parsePatientData(patient);
              return (
                <div
                  key={patient.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  onClick={() => onPatientClick(patient.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Header con nombre y estado */}
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 truncate">
                            {patientData.nombreCompleto}
                          </h4>
                          {getStatusBadge(patient)}
                        </div>

                        {/* Información básica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2">Documento:</span>
                            <span>{patient.tipoDocumento} {patient.numeroDocumento}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2">Edad:</span>
                            <span>{calculateAge(patientData.fechaNacimiento)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2">Género:</span>
                            <span>{patientData.genero}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2">Estado Civil:</span>
                            <span>{patientData.estadoCivil}</span>
                          </div>
                        </div>

                        {/* Información de contacto */}
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{patientData.telefono}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate">{patientData.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{patientData.ciudad}</span>
                          </div>
                        </div>

                        {/* Información médica */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2">EPS:</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {patientData.eps}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Registrado: {formatDate(patient.fechaCreacion || patient.fechaActualizacion)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onScheduleAppointment(patient.id, patientData.nombreCompleto);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <ClockIcon className="h-4 w-4 mr-2" />
                        Agendar Cita
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPatientClick(patient.id);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Página {currentPage + 1} de {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PatientList;