import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  HeartIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ClockIcon,
  BuildingOfficeIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { pacientesApiService, historiasClinicasApiService, consultasApiService } from '../../../services/pacientesApiService.js';

const PatientDetailModal = ({ patientId, isOpen, onClose }) => {
  const [patient, setPatient] = useState(null);
  const [historiaClinica, setHistoriaClinica] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (isOpen && patientId) {
      loadPatientDetails();
    }
  }, [isOpen, patientId]);

  const loadPatientDetails = async () => {
    try {
      setLoading(true);

      // Load patient basic info
      const patientResponse = await pacientesApiService.getPacienteById(patientId);
      setPatient(patientResponse);

      // Load clinical history
      try {
        const historiaResponse = await historiasClinicasApiService.getHistoriaClinicaByPaciente(patientId);
        setHistoriaClinica(historiaResponse);

        // Load consultations if history exists
        if (historiaResponse?.id) {
          const consultasResponse = await consultasApiService.getConsultasByHistoria(historiaResponse.id, { page: 0, size: 10 });
          setConsultas(consultasResponse.content || []);
        }
      } catch (error) {
        console.log('No clinical history found for patient:', patientId);
        setHistoriaClinica(null);
        setConsultas([]);
      }

    } catch (error) {
      console.error('Error loading patient details:', error);
    } finally {
      setLoading(false);
    }
  };

  const parsePatientData = (patient) => {
    try {
      if (patient?.datosJson) {
        const firstLevel = typeof patient.datosJson === 'string' ? JSON.parse(patient.datosJson) : patient.datosJson;

        // Try nested format first (existing patients)
        if (firstLevel.datosJson) {
          const secondLevel = typeof firstLevel.datosJson === 'string' ? JSON.parse(firstLevel.datosJson) : firstLevel.datosJson;
          return secondLevel;
        }

        // Try flat format (newly created patients)
        if (firstLevel.informacionPersonalJson || firstLevel.informacionContactoJson) {
          return {
            informacionPersonal: firstLevel.informacionPersonalJson ? JSON.parse(firstLevel.informacionPersonalJson) : {},
            informacionContacto: firstLevel.informacionContactoJson ? JSON.parse(firstLevel.informacionContactoJson) : {},
            informacionMedica: firstLevel.informacionMedicaJson ? JSON.parse(firstLevel.informacionMedicaJson) : {},
            contactoEmergencia: firstLevel.contactoEmergenciaJson ? JSON.parse(firstLevel.contactoEmergenciaJson) : {}
          };
        }
      }
    } catch (error) {
      console.error('Error parsing patient data:', error);
    }
    return {};
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
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Error en fecha';
    }
  };

  const patientData = patient ? parsePatientData(patient) : {};

  const tabs = [
    { id: 'personal', name: 'Información Personal', icon: UserIcon },
    { id: 'contacto', name: 'Contacto', icon: PhoneIcon },
    { id: 'medica', name: 'Información Médica', icon: HeartIcon },
    { id: 'emergencia', name: 'Contacto Emergencia', icon: IdentificationIcon },
    { id: 'clinica', name: 'Historia Clínica', icon: DocumentTextIcon },
  ];

  // Determinar si mostrar las pestañas normales o la vista completa
  const showTabs = !['clinica_completa'].includes(activeTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-4/5 h-4/5">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {patientData.informacionPersonal?.primerNombre} {patientData.informacionPersonal?.segundoNombre} {patientData.informacionPersonal?.primerApellido} {patientData.informacionPersonal?.segundoApellido}
                  </h3>
                  <p className="text-blue-100">
                    {patient?.tipoDocumento} {patient?.numeroDocumento} • {calculateAge(patientData.informacionPersonal?.fechaNacimiento)}
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

          {/* Tabs */}
          {showTabs && (
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Información Personal */}
                {activeTab === 'personal' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ maxWidth: 'none' }}>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Datos Personales</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Primer Nombre:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.primerNombre || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Segundo Nombre:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.segundoNombre || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Primer Apellido:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.primerApellido || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Segundo Apellido:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.segundoApellido || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fecha de Nacimiento:</span>
                          <span className="font-medium">{formatDate(patientData.informacionPersonal?.fechaNacimiento)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Edad:</span>
                          <span className="font-medium">{calculateAge(patientData.informacionPersonal?.fechaNacimiento)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Género:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.genero || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado Civil:</span>
                          <span className="font-medium">{patientData.informacionPersonal?.estadoCivil || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Información del Sistema</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID del Paciente:</span>
                          <span className="font-medium">{patient?.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tipo Documento:</span>
                          <span className="font-medium">{patient?.tipoDocumento}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Número Documento:</span>
                          <span className="font-medium">{patient?.numeroDocumento}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado:</span>
                          <span className={`font-medium ${patient?.activo ? 'text-green-600' : 'text-red-600'}`}>
                            {patient?.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fecha Registro:</span>
                          <span className="font-medium">{formatDate(patient?.fechaCreacion)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Última Actualización:</span>
                          <span className="font-medium">{formatDate(patient?.fechaActualizacion)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Información de Contacto */}
                {activeTab === 'contacto' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Información de Contacto</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ maxWidth: 'none' }}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Teléfono</p>
                            <p className="font-medium">{patientData.informacionContacto?.telefono || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium">{patientData.informacionContacto?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Dirección</p>
                            <p className="font-medium">{patientData.informacionContacto?.direccion || 'N/A'}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {patientData.informacionContacto?.ciudad}, {patientData.informacionContacto?.departamento}
                            </p>
                            <p className="text-sm text-gray-600">
                              {patientData.informacionContacto?.pais}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Información Médica */}
                {activeTab === 'medica' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Médica</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ maxWidth: 'none' }}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">EPS</p>
                            <p className="font-medium">{patientData.informacionMedica?.eps || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <HeartIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Tipo de Seguro</p>
                            <p className="font-medium">{patientData.informacionMedica?.tipoSeguro || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Alergias</p>
                          <p className="font-medium bg-yellow-50 p-3 rounded-md border">
                            {patientData.informacionMedica?.alergias || 'Ninguna registrada'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Medicamentos Actuales</p>
                          <p className="font-medium bg-blue-50 p-3 rounded-md border">
                            {patientData.informacionMedica?.medicamentosActuales || 'Ninguno registrado'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Observaciones Médicas</p>
                      <p className="font-medium bg-gray-50 p-4 rounded-md border min-h-[100px]">
                        {patientData.informacionMedica?.observacionesMedicas || 'Sin observaciones registradas'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Contacto de Emergencia */}
                {activeTab === 'emergencia' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Contacto de Emergencia</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ maxWidth: 'none' }}>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Nombre Completo</p>
                          <p className="font-medium text-lg">{patientData.contactoEmergencia?.nombreContacto || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Relación</p>
                          <p className="font-medium">{patientData.contactoEmergencia?.relacion || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Teléfono</p>
                            <p className="font-medium">{patientData.contactoEmergencia?.telefonoContacto || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Historia Clínica */}
                {activeTab === 'clinica' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">Historia Clínica</h4>
                      {historiaClinica && (
                        <button
                          onClick={() => setActiveTab('clinica_completa')}
                          className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <DocumentTextIcon className="h-4 w-4 mr-2" />
                          Ver Historia Clínica Completa
                        </button>
                      )}
                    </div>

                    {!historiaClinica ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay historia clínica</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Este paciente aún no tiene una historia clínica registrada.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Información de la Historia */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-blue-900 mb-2">Información General</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm" style={{ maxWidth: 'none' }}>
                            <div>
                              <span className="text-blue-700">Número de Historia:</span>
                              <p className="font-medium">{historiaClinica.numeroHistoria}</p>
                            </div>
                            <div>
                              <span className="text-blue-700">Fecha de Apertura:</span>
                              <p className="font-medium">{formatDate(historiaClinica.fechaApertura)}</p>
                            </div>
                            <div>
                              <span className="text-blue-700">Estado:</span>
                              <p className="font-medium">{historiaClinica.activa ? 'Activa' : 'Inactiva'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Consultas Médicas */}
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-4">Consultas Médicas ({consultas.length})</h5>

                          {consultas.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                              <CalendarDaysIcon className="mx-auto h-8 w-8 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">No hay consultas registradas</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {consultas.map((consulta, index) => (
                                <div key={consulta.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">Consulta #{consulta.id}</p>
                                        <p className="text-sm text-gray-600">
                                          {formatDate(consulta.fechaCreacion)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-gray-500">Creada</p>
                                      <p className="text-sm font-medium">{formatDate(consulta.fechaCreacion)}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Historia Clínica Completa */}
                {activeTab === 'clinica_completa' && historiaClinica && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">Historia Clínica Completa</h4>
                      <button
                        onClick={() => setActiveTab('clinica')}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Información Completa de la Historia */}
                      <div className="bg-gray-50 p-6 rounded-lg border">
                        <h5 className="font-semibold text-gray-900 mb-6 text-lg border-b pb-2">Información General de la Historia Clínica</h5>

                        {/* Header con información básica */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-sm">
                          <div>
                            <span className="text-gray-600 font-medium">Número de Historia:</span>
                            <p className="font-semibold text-gray-900 text-lg">{historiaClinica.numeroHistoria}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">Fecha de Apertura:</span>
                            <p className="font-medium text-gray-900">{formatDate(historiaClinica.fechaApertura)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">Estado:</span>
                            <p className="font-medium text-gray-900">{historiaClinica.activa ? 'Activa' : 'Inactiva'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">Total Consultas:</span>
                            <p className="font-medium text-gray-900">{consultas.length}</p>
                          </div>
                        </div>

                        {/* Datos Detallados de la Historia Clínica */}
                        {historiaClinica.datosJson && (
                          <div className="space-y-6">
                            {(() => {
                              try {
                                const parsed = JSON.parse(historiaClinica.datosJson);
                                const datosHistoria = parsed.datosJson ? JSON.parse(parsed.datosJson) : {};

                                return (
                                  <div className="space-y-6">
                                    {/* Información del Médico e Información de Consulta en una fila */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                      {/* Información del Médico */}
                                      {datosHistoria.informacionMedico && (
                                        <div className="bg-white p-4 rounded-lg border">
                                          <h6 className="font-semibold text-gray-900 mb-3 flex items-center border-b pb-2">
                                            <UserIcon className="h-4 w-4 mr-2 text-blue-600" />
                                            Médico Responsable
                                          </h6>
                                          <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Nombre:</span>
                                              <span className="font-medium">{datosHistoria.informacionMedico.medicoResponsable || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Registro:</span>
                                              <span className="font-medium">{datosHistoria.informacionMedico.registroMedico || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">Especialidad:</span>
                                              <span className="font-medium">{datosHistoria.informacionMedico.especialidad || 'N/A'}</span>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Información de la Consulta */}
                                      {datosHistoria.informacionConsulta && (
                                        <div className="bg-white p-4 rounded-lg border">
                                          <h6 className="font-semibold text-gray-900 mb-3 flex items-center border-b pb-2">
                                            <DocumentTextIcon className="h-4 w-4 mr-2 text-green-600" />
                                            Consulta Inicial
                                          </h6>
                                          <div className="space-y-2 text-sm">
                                            <div>
                                              <span className="text-gray-600 font-medium">Motivo:</span>
                                              <p className="mt-1">{datosHistoria.informacionConsulta.motivoConsulta || 'N/A'}</p>
                                            </div>
                                            <div>
                                              <span className="text-gray-600 font-medium">Enfermedad Actual:</span>
                                              <p className="mt-1">{datosHistoria.informacionConsulta.enfermedadActual || 'N/A'}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Antecedentes Clínicos */}
                                    {datosHistoria.antecedentesClinico && (
                                      <div className="bg-white p-4 rounded-lg border">
                                        <h6 className="font-semibold text-gray-900 mb-3 flex items-center border-b pb-2">
                                          <HeartIcon className="h-4 w-4 mr-2 text-red-600" />
                                          Antecedentes Clínicos
                                        </h6>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <span className="text-gray-600 font-medium">Personales:</span>
                                            <p className="mt-1">{datosHistoria.antecedentesClinico.antecedentesPersonales || 'N/A'}</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-600 font-medium">Familiares:</span>
                                            <p className="mt-1">{datosHistoria.antecedentesClinico.antecedentesFamiliares || 'N/A'}</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-600 font-medium">Quirúrgicos:</span>
                                            <p className="mt-1">{datosHistoria.antecedentesClinico.antecedentesQuirurgicos || 'N/A'}</p>
                                          </div>
                                          <div>
                                            <span className="text-gray-600 font-medium">Alérgicos:</span>
                                            <p className="mt-1">{datosHistoria.antecedentesClinico.antecedentesAlergicos || 'N/A'}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Examen Clínico y Diagnóstico/Tratamiento en una fila */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                      {/* Examen Clínico */}
                                      {datosHistoria.examenClinico && (
                                        <div className="bg-white p-4 rounded-lg border">
                                          <h6 className="font-semibold text-gray-900 mb-3 flex items-center border-b pb-2">
                                            <IdentificationIcon className="h-4 w-4 mr-2 text-purple-600" />
                                            Examen Clínico
                                          </h6>
                                          <div className="space-y-2 text-sm">
                                            <div>
                                              <span className="text-gray-600 font-medium">Examen Físico:</span>
                                              <p className="mt-1">{datosHistoria.examenClinico.examenFisico || 'N/A'}</p>
                                            </div>
                                            <div>
                                              <span className="text-gray-600 font-medium">Signos Vitales:</span>
                                              <p className="mt-1">{datosHistoria.examenClinico.signosVitales || 'N/A'}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Diagnóstico y Tratamiento */}
                                      {datosHistoria.diagnosticoTratamiento && (
                                        <div className="bg-white p-4 rounded-lg border">
                                          <h6 className="font-semibold text-gray-900 mb-3 flex items-center border-b pb-2">
                                            <DocumentTextIcon className="h-4 w-4 mr-2 text-orange-600" />
                                            Diagnóstico y Tratamiento
                                          </h6>
                                          <div className="space-y-2 text-sm">
                                            <div>
                                              <span className="text-gray-600 font-medium">Diagnósticos:</span>
                                              <p className="mt-1">{datosHistoria.diagnosticoTratamiento.diagnosticos || 'N/A'}</p>
                                            </div>
                                            <div>
                                              <span className="text-gray-600 font-medium">Plan de Tratamiento:</span>
                                              <p className="mt-1">{datosHistoria.diagnosticoTratamiento.planTratamiento || 'N/A'}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Información adicional de consulta si existe */}
                                    {datosHistoria.informacionConsulta && (datosHistoria.informacionConsulta.revisionSistemas || datosHistoria.informacionConsulta.medicamentosActuales || datosHistoria.informacionConsulta.observaciones) && (
                                      <div className="bg-white p-4 rounded-lg border">
                                        <h6 className="font-semibold text-gray-900 mb-3">Información Adicional de la Consulta</h6>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                          {datosHistoria.informacionConsulta.revisionSistemas && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Revisión de Sistemas:</span>
                                              <p className="mt-1">{datosHistoria.informacionConsulta.revisionSistemas}</p>
                                            </div>
                                          )}
                                          {datosHistoria.informacionConsulta.medicamentosActuales && (
                                            <div>
                                              <span className="text-gray-600 font-medium">Medicamentos:</span>
                                              <p className="mt-1">{datosHistoria.informacionConsulta.medicamentosActuales}</p>
                                            </div>
                                          )}
                                          {datosHistoria.informacionConsulta.observaciones && (
                                            <div className="md:col-span-3">
                                              <span className="text-gray-600 font-medium">Observaciones:</span>
                                              <p className="mt-1 bg-gray-50 p-2 rounded">{datosHistoria.informacionConsulta.observaciones}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              } catch (e) {
                                return (
                                  <div className="bg-gray-100 p-4 rounded border">
                                    <h6 className="font-medium text-gray-800 mb-2">Datos Adicionales (JSON Crudo):</h6>
                                    <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto bg-white p-2 rounded">
                                      {historiaClinica.datosJson}
                                    </pre>
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        )}
                      </div>

                      {/* Detalle Completo de Consultas Médicas */}
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-4 text-lg">Consultas Médicas Detalladas ({consultas.length})</h5>

                        {consultas.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <CalendarDaysIcon className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">No hay consultas registradas</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {consultas.map((consulta, index) => (
                              <div key={consulta.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                {/* Header de la consulta */}
                                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                      <span className="text-lg font-bold text-blue-600">{index + 1}</span>
                                    </div>
                                    <div>
                                      <h6 className="text-xl font-semibold text-gray-900">Consulta #{consulta.id}</h6>
                                      <p className="text-sm text-gray-600 flex items-center">
                                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                                        {formatDate(consulta.fechaCreacion)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">Historia Clínica</p>
                                    <p className="text-sm font-semibold text-blue-600">{historiaClinica.numeroHistoria}</p>
                                  </div>
                                </div>

                                {/* Información Detallada de la Consulta */}
                                {consulta.datosJson && (
                                  <div className="space-y-6">
                                    {(() => {
                                      try {
                                        const parsed = JSON.parse(consulta.datosJson);

                                        return (
                                          <div className="space-y-6">
                                            {/* Primera fila: Detalle de consulta e Información médica */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                              {/* Detalle de la Consulta */}
                                              {parsed.detalleConsulta && (
                                                <div className="bg-gray-50 p-4 rounded-lg border">
                                                  <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                    <CalendarDaysIcon className="h-4 w-4 mr-2 text-blue-600" />
                                                    Detalle de la Consulta
                                                  </h6>
                                                  <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                      <span className="text-gray-600">Médico Tratante:</span>
                                                      <span className="font-medium">{parsed.detalleConsulta.medicoTratante || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                      <span className="text-gray-600">Especialidad:</span>
                                                      <span className="font-medium">{parsed.detalleConsulta.especialidad || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                      <span className="text-gray-600">Fecha Consulta:</span>
                                                      <span className="font-medium">{parsed.detalleConsulta.fechaConsulta ? formatDate(parsed.detalleConsulta.fechaConsulta) : 'N/A'}</span>
                                                    </div>
                                                    {parsed.detalleConsulta.proximaCita && (
                                                      <div className="flex justify-between">
                                                        <span className="text-gray-600">Próxima Cita:</span>
                                                        <span className="font-medium">{parsed.detalleConsulta.proximaCita}</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              )}

                                              {/* Información médica adicional */}
                                              {parsed.informacionMedico && (
                                                <div className="bg-gray-50 p-4 rounded-lg border">
                                                  <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                    <UserIcon className="h-4 w-4 mr-2 text-green-600" />
                                                    Información Médica
                                                  </h6>
                                                  <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                      <span className="text-gray-600">Registro Médico:</span>
                                                      <span className="font-medium">{parsed.informacionMedico.registroMedico || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                      <span className="text-gray-600">Especialidad:</span>
                                                      <span className="font-medium">{parsed.informacionMedico.especialidad || 'N/A'}</span>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>

                                            {/* Información de la Consulta */}
                                            {parsed.informacionConsulta && (
                                              <div className="bg-white p-4 rounded-lg border">
                                                <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                  <DocumentTextIcon className="h-4 w-4 mr-2 text-green-600" />
                                                  Información de la Consulta
                                                </h6>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                  <div>
                                                    <span className="text-gray-600 font-medium">Motivo de Consulta:</span>
                                                    <p className="mt-1 font-medium">{parsed.informacionConsulta.motivoConsulta || 'N/A'}</p>
                                                  </div>
                                                  <div>
                                                    <span className="text-gray-600 font-medium">Enfermedad Actual:</span>
                                                    <p className="mt-1 font-medium">{parsed.informacionConsulta.enfermedadActual || 'N/A'}</p>
                                                  </div>
                                                  {parsed.informacionConsulta.revisionSistemas && (
                                                    <div>
                                                      <span className="text-gray-600 font-medium">Revisión de Sistemas:</span>
                                                      <p className="mt-1">{parsed.informacionConsulta.revisionSistemas}</p>
                                                    </div>
                                                  )}
                                                  {parsed.informacionConsulta.medicamentosActuales && (
                                                    <div>
                                                      <span className="text-gray-600 font-medium">Medicamentos Actuales:</span>
                                                      <p className="mt-1">{parsed.informacionConsulta.medicamentosActuales}</p>
                                                    </div>
                                                  )}
                                                  {parsed.informacionConsulta.observaciones && (
                                                    <div className="md:col-span-2">
                                                      <span className="text-gray-600 font-medium">Observaciones:</span>
                                                      <p className="mt-1 bg-gray-50 p-2 rounded">{parsed.informacionConsulta.observaciones}</p>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                            {/* Examen Clínico y Diagnóstico/Tratamiento en una fila */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                              {/* Examen Clínico */}
                                              {parsed.examenClinico && (
                                                <div className="bg-white p-4 rounded-lg border">
                                                  <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                    <IdentificationIcon className="h-4 w-4 mr-2 text-purple-600" />
                                                    Examen Clínico
                                                  </h6>
                                                  <div className="space-y-2 text-sm">
                                                    <div>
                                                      <span className="text-gray-600 font-medium">Examen Físico:</span>
                                                      <p className="mt-1">{parsed.examenClinico.examenFisico || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                      <span className="text-gray-600 font-medium">Signos Vitales:</span>
                                                      <p className="mt-1">{parsed.examenClinico.signosVitales || 'N/A'}</p>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}

                                              {/* Diagnóstico y Tratamiento */}
                                              {parsed.diagnosticoTratamiento && (
                                                <div className="bg-white p-4 rounded-lg border">
                                                  <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                    <HeartIcon className="h-4 w-4 mr-2 text-red-600" />
                                                    Diagnóstico y Tratamiento
                                                  </h6>
                                                  <div className="space-y-2 text-sm">
                                                    <div>
                                                      <span className="text-gray-600 font-medium">Diagnósticos:</span>
                                                      <p className="mt-1">{parsed.diagnosticoTratamiento.diagnosticos || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                      <span className="text-gray-600 font-medium">Plan de Tratamiento:</span>
                                                      <p className="mt-1">{parsed.diagnosticoTratamiento.planTratamiento || 'N/A'}</p>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>

                                            {/* Seguimiento de la Consulta */}
                                            {parsed.seguimientoConsulta && (
                                              <div className="bg-white p-4 rounded-lg border">
                                                <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                  <ClockIcon className="h-4 w-4 mr-2 text-orange-600" />
                                                  Seguimiento de la Consulta
                                                </h6>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                  <div>
                                                    <span className="text-gray-600 font-medium">Evolución:</span>
                                                    <p className="mt-1">{parsed.seguimientoConsulta.evolucion || 'N/A'}</p>
                                                  </div>
                                                  <div>
                                                    <span className="text-gray-600 font-medium">Complicaciones:</span>
                                                    <p className="mt-1">{parsed.seguimientoConsulta.complicaciones || 'N/A'}</p>
                                                  </div>
                                                  <div>
                                                    <span className="text-gray-600 font-medium">Recomendaciones:</span>
                                                    <p className="mt-1">{parsed.seguimientoConsulta.recomendaciones || 'N/A'}</p>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      } catch (e) {
                                        return (
                                          <div className="bg-gray-100 p-4 rounded border">
                                            <h6 className="font-medium text-gray-800 mb-2">Información Detallada (JSON Crudo):</h6>
                                            <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto bg-white p-2 rounded">
                                              {consulta.datosJson}
                                            </pre>
                                          </div>
                                        );
                                      }
                                    })()}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailModal;