import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CalendarDaysIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { pacientesApiService } from '../../../services/pacientesApiService.js';
import Swal from 'sweetalert2';

const PatientSearchModal = ({ isOpen, onClose, onPatientSelected, selectedSlot, selectedDoctor, onCreatePatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [error, setError] = useState(null);
  const [showCreatePatient, setShowCreatePatient] = useState(false);

  // Load all patients when modal opens
  const loadAllPatients = async () => {
    try {
      setLoadingPatients(true);
      setError(null);
      const response = await pacientesApiService.getPacientes({ size: 1000 }); // Load all patients
      if (response && response.content) {
        setAllPatients(response.content);
        setFilteredPatients(response.content);
      }
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Error al cargar la lista de pacientes');
    } finally {
      setLoadingPatients(false);
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

          const nombreCompleto = `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim();

          return {
            nombreCompleto: nombreCompleto || 'N/A',
            telefono: infoContacto.telefono || 'N/A',
            email: infoContacto.email || 'N/A'
          };
        }

        // Si no hay datosJson anidado, intentar parsear directamente (formato de API de creación)
        if (firstLevel.informacionPersonalJson || firstLevel.informacionContactoJson) {
          const infoPersonal = firstLevel.informacionPersonalJson ? JSON.parse(firstLevel.informacionPersonalJson) : {};
          const infoContacto = firstLevel.informacionContactoJson ? JSON.parse(firstLevel.informacionContactoJson) : {};

          const nombreCompleto = `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim();

          return {
            nombreCompleto: nombreCompleto || 'N/A',
            telefono: infoContacto.telefono || 'N/A',
            email: infoContacto.email || 'N/A'
          };
        }
      }
    } catch (error) {
      console.error('Error parsing patient data:', error, patient);
    }

    return {
      nombreCompleto: patient.nombreCompleto || 'N/A',
      telefono: 'N/A',
      email: 'N/A'
    };
  };

  // Filter patients based on search term
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredPatients(allPatients);
      setSelectedPatient(null);
      return;
    }

    const filtered = allPatients.filter(patient => {
      const patientData = parsePatientData(patient);
      const documentNumber = `${patient.tipoDocumento || ''} ${patient.numeroDocumento || ''}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      return documentNumber.includes(searchLower) ||
             patient.numeroDocumento?.toLowerCase().includes(searchLower) ||
             patientData.nombreCompleto?.toLowerCase().includes(searchLower) ||
             patientData.telefono?.toLowerCase().includes(searchLower);
    });

    setFilteredPatients(filtered);
    setSelectedPatient(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Load patients when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAllPatients();
      setSearchTerm('');
      setSelectedPatient(null);
      setFilteredPatients([]);
    }
  }, [isOpen]);

  // Auto-filter when search term changes
  useEffect(() => {
    handleSearch();
    // Show create patient button if search term is 8+ digits
    setShowCreatePatient(searchTerm.length >= 8 && /^\d+$/.test(searchTerm));
  }, [searchTerm, allPatients]);

  const handleCreateAppointment = () => {
    if (selectedPatient && onPatientSelected) {
      const patientData = parsePatientData(selectedPatient);
      const patientName = patientData.nombreCompleto !== 'N/A' ? patientData.nombreCompleto : `Paciente ${selectedPatient.id}`;

      onPatientSelected(selectedPatient, patientName);
      onClose();
    }
  };

  const resetSearch = () => {
    setSearchTerm('');
    setFilteredPatients([]);
    setSelectedPatient(null);
    setError(null);
  };

  const handleClose = () => {
    resetSearch();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-2xl">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Buscar Paciente
                </h3>
                <p className="text-blue-100 text-sm">
                  {selectedSlot && `Horario: ${selectedSlot.label}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Search Section */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Buscar por Documento
                </h4>

                <div className="flex space-x-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Buscar por documento, nombre o teléfono..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loadingPatients}
                    />
                  </div>
                  {showCreatePatient && (
                    <button
                      onClick={() => onCreatePatient && onCreatePatient(searchTerm)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <UserIcon className="h-4 w-4 mr-2" />
                      Crear Paciente
                    </button>
                  )}
                </div>

                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>

              {/* Patients List Section */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-gray-600" />
                    Pacientes {filteredPatients.length > 0 && `(${filteredPatients.length})`}
                  </h4>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {loadingPatients ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-sm text-gray-600">Cargando pacientes...</p>
                    </div>
                  ) : filteredPatients.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {filteredPatients.map((patient) => {
                        const patientData = parsePatientData(patient);
                        return (
                          <div
                            key={patient.id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                              selectedPatient?.id === patient.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                            onClick={() => setSelectedPatient(patient)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <UserIcon className="h-5 w-5 text-blue-600" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {patientData.nombreCompleto !== 'N/A' ? patientData.nombreCompleto : `Paciente ${patient.id}`}
                                      </p>
                                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                        patient.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {patient.activo ? 'Activo' : 'Inactivo'}
                                      </span>
                                    </div>
                                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                                      <span>📄 {patient.tipoDocumento} {patient.numeroDocumento}</span>
                                      <span>📞 {patientData.telefono !== 'N/A' ? patientData.telefono : 'Sin teléfono'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {selectedPatient?.id === patient.id && (
                                <div className="flex-shrink-0">
                                  <CheckIcon className="h-5 w-5 text-blue-600" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">
                        {searchTerm ? 'No se encontraron pacientes que coincidan con la búsqueda' : 'No hay pacientes disponibles'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Patient Action */}
              {selectedPatient && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-green-900 mb-4 flex items-center">
                    <CheckIcon className="h-5 w-5 mr-2 text-green-600" />
                    Paciente Seleccionado
                  </h4>

                  <div className="bg-white border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {parsePatientData(selectedPatient).nombreCompleto !== 'N/A' ? parsePatientData(selectedPatient).nombreCompleto : `Paciente ${selectedPatient.id}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedPatient.tipoDocumento} {selectedPatient.numeroDocumento}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleCreateAppointment}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <CalendarDaysIcon className="h-4 w-4 mr-2" />
                      Crear Cita para este Paciente
                    </button>
                  </div>
                </div>
              )}

              {/* Appointment Info */}
              {selectedSlot && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-blue-900 mb-2">Información de la Cita</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><span className="font-medium">Fecha:</span> {selectedSlot.date ? selectedSlot.date.toLocaleDateString('es-ES') : 'N/A'}</p>
                    <p><span className="font-medium">Horario:</span> {selectedSlot.label}</p>
                    {selectedDoctor && <p><span className="font-medium">Médico:</span> {selectedDoctor}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleClose}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSearchModal;