import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  EyeIcon,
  ClockIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { pacientesApiService } from '../../../../data/services/pacientesApiService.js';
import { ActionIcon, Group, Button } from '@mantine/core';

const PatientList = ({ searchTerm, filterStatus, onPatientClick, onScheduleAppointment, onEditPatient, refreshTrigger }) => {
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, [refreshTrigger]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterStatus, allPatients]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      // Cargar TODOS los pacientes sin filtros para filtrado frontend
      const params = {
        page: 0,
        size: 1000 // Cargar muchos pacientes para filtrado local
      };

      const response = await pacientesApiService.getPacientes(params);

      // Debug: Ver qué fechas llegan del backend
      console.log('Pacientes response:', response.content?.[0]);

      // Guardar todos los pacientes
      setAllPatients(response.content || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading patients:', error);
      setAllPatients([]);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allPatients];

    // Aplicar filtro de búsqueda por nombre, documento o teléfono
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(patient => {
        const patientData = parsePatientData(patient);
        return (
          patientData.nombreCompleto?.toLowerCase().includes(searchLower) ||
          patient.numeroDocumento?.toLowerCase().includes(searchLower) ||
          patientData.telefono?.toLowerCase().includes(searchLower) ||
          patientData.email?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Aplicar filtro de estado
    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(patient => patient.activo === isActive);
    }

    setFilteredPatients(filtered);
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

      {filteredPatients.length === 0 ? (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron pacientes</h3>
          <p className="mt-1 text-sm text-gray-500">
            Intenta ajustar los filtros de búsqueda.
          </p>
        </div>
      ) : (
        <>
          {/* Header con botón de crear */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Lista de Pacientes ({filteredPatients.length})
            </h3>
            <Button
              onClick={() => window.location.href = '/pacientes/gestion'}
              leftSection={<span>+</span>}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Nuevo Paciente
            </Button>
          </div>

          {/* Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto overflow-y-auto max-h-80">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Edad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ciudad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient) => {
                      const patientData = parsePatientData(patient);
                      return (
                        <tr key={patient.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {patient.numeroDocumento}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patientData.nombreCompleto}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {calculateAge(patientData.fechaNacimiento)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patientData.telefono}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patientData.ciudad}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(patient)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Group gap="xs">
                              <ActionIcon
                                variant="light"
                                color="blue"
                                size="sm"
                                onClick={() => onScheduleAppointment(patient.id, patientData.nombreCompleto)}
                                title="Agendar cita"
                              >
                                <ClockIcon className="w-4 h-4" />
                              </ActionIcon>
                              <ActionIcon
                                variant="light"
                                color="green"
                                size="sm"
                                onClick={() => onEditPatient && onEditPatient(patient)}
                                title="Editar paciente"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </ActionIcon>
                              <ActionIcon
                                variant="light"
                                color="gray"
                                size="sm"
                                onClick={() => onPatientClick(patient.id)}
                                title="Ver detalles"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </ActionIcon>
                            </Group>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredPatients.length === 0 && !loading && (
                <div className="text-center py-12">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron pacientes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Intenta ajustar los filtros de búsqueda.
                  </p>
                </div>
              )}
            </div>
          </div>

        </>
      )}
    </div>
  );
};

export default PatientList;