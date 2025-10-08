import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/ui/MainLayout.jsx';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  UserIcon,
  ClockIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import PatientList from '../../components/pacientes/PatientDashboard/PatientList.jsx';
import PatientDetailModal from '../../components/pacientes/PatientDashboard/PatientDetailModal.jsx';
import CreatePatientModal from '../../components/pacientes/PatientDashboard/CreatePatientModal.jsx';
import AgendaModal from '../../components/pacientes/PatientDashboard/AgendaModal.jsx';
import ScheduleAppointmentModal from '../../components/pacientes/PatientDashboard/ScheduleAppointmentModal.jsx';
import CalendarWidget from '../../components/pacientes/PatientDashboard/CalendarWidget.jsx';
import { empleadosApiService } from '../../services/empleadosApiService.js';
import { pacientesApiService, consultasApiService } from '../../services/pacientesApiService.js';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatePatientModalOpen, setIsCreatePatientModalOpen] = useState(false);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Estados para el calendario y citas
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [medicos, setMedicos] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorPatients, setDoctorPatients] = useState([]);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Modal handlers
  const handlePatientClick = (patientId) => {
    setSelectedPatientId(patientId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatientId(null);
  };

  const handleScheduleAppointment = (patientId, patientName) => {
    setSelectedPatientForAppointment({ id: patientId, name: patientName });
    setIsAppointmentModalOpen(true);
  };

  const handleCloseAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setSelectedPatientForAppointment(null);
  };

  const handleAppointmentCreated = () => {
    // Could refresh patient list or show success message
    console.log('Cita creada exitosamente');
  };

  const handleOpenCreatePatientModal = () => {
    setIsCreatePatientModalOpen(true);
  };

  const handleCloseCreatePatientModal = () => {
    setIsCreatePatientModalOpen(false);
  };

  const handlePatientCreated = (patientData) => {
    // Refresh patient list
    setRefreshTrigger(prev => prev + 1);
    console.log('Paciente creado exitosamente - lista actualizada', patientData);
  };

  const handleOpenAgendaModal = () => {
    setIsAgendaModalOpen(true);
  };

  const handleCloseAgendaModal = () => {
    setIsAgendaModalOpen(false);
  };

  // Funciones para el calendario y citas
  const loadMedicos = async () => {
    try {
      setLoadingMedicos(true);
      const response = await empleadosApiService.getEmpleados({ size: 1000 });
      const empleados = response.content || [];

      // Filter employees that are medical doctors
      const medicosFiltrados = empleados.filter(empleado => {
        try {
          const datosCompletos = JSON.parse(empleado.jsonData || '{}');
          if (datosCompletos.jsonData) {
            const datosInternos = JSON.parse(datosCompletos.jsonData);
            const informacionLaboral = datosInternos.informacionLaboral || {};
            return informacionLaboral.tipoPersonal === 'MEDICO' && informacionLaboral.tipoMedico === 'DOCTOR';
          }
          return false;
        } catch (error) {
          console.error('Error parsing employee data:', error);
          return false;
        }
      });

      setMedicos(medicosFiltrados);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoadingMedicos(false);
    }
  };

  const loadDoctorData = async (doctorId, date) => {
    if (!doctorId) return;

    try {
      setLoadingAppointments(true);
      setLoadingPatients(true);

      // Get doctor details for name comparison
      const selectedDoctor = medicos.find(m => m.id == doctorId);
      const doctorName = selectedDoctor ? getNombreCompletoMedico(selectedDoctor) : '';

      // Load all appointments and filter by doctor
      const appointmentsResponse = await pacientesApiService.getCitas({ size: 1000 });

      // Filter appointments by doctor first
      let filteredAppointments = (appointmentsResponse.content || []).filter(appointment => {
        try {
          const appointmentData = JSON.parse(appointment.datosJson || '{}');
          const medicoId = appointmentData.medicoId || appointmentData.idMedico;
          const medicoAsignado = appointmentData.medicoAsignado;


          // Check by ID first (new appointments)
          if (medicoId && medicoId == doctorId) {
            return true;
          }

          // Fallback: check by name (legacy appointments)
          if (medicoAsignado && doctorName === medicoAsignado) {
            return true;
          }

          return false;
        } catch (error) {
          console.error('Error parsing appointment doctor:', error);
          return false;
        }
      });


      if (date) {
        const selectedDateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        filteredAppointments = filteredAppointments.filter(appointment => {
          try {
            const appointmentData = JSON.parse(appointment.datosJson || '{}');
            const appointmentDateTime = appointmentData.fechaHoraCita;
            if (!appointmentDateTime) return false;

            const appointmentDate = new Date(appointmentDateTime).toISOString().split('T')[0];
            return appointmentDate === selectedDateString;
          } catch (error) {
            console.error('Error parsing appointment date:', error);
            return false;
          }
        });
      } else {
        // If no date selected, show only future appointments (next 30 days)
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        filteredAppointments = filteredAppointments.filter(appointment => {
          try {
            const appointmentData = JSON.parse(appointment.datosJson || '{}');
            const appointmentDateTime = appointmentData.fechaHoraCita;
            if (!appointmentDateTime) return false;

            const appointmentDate = new Date(appointmentDateTime);
            return appointmentDate >= today && appointmentDate <= thirtyDaysFromNow;
          } catch (error) {
            console.error('Error parsing appointment date:', error);
            return false;
          }
        });
      }


      // Transform appointments to display format
      const formattedAppointments = filteredAppointments.map(appointment => {
        try {
          const appointmentData = JSON.parse(appointment.datosJson || '{}');
          const appointmentDateTime = new Date(appointmentData.fechaHoraCita);

          // Get patient name from loaded patient data or fallback to appointment data
          let patientName = appointmentData.pacienteNombre || appointmentData.motivo || 'Paciente';
          if (appointmentData.pacienteId) {
            const patientData = doctorPatients.find(p => p.id == appointmentData.pacienteId);
            if (patientData) {
              try {
                const patientInfo = JSON.parse(patientData.datosJson || '{}');
                const personalInfo = patientInfo.informacionPersonal || {};
                const fullName = `${personalInfo.primerNombre || ''} ${personalInfo.segundoNombre || ''} ${personalInfo.primerApellido || ''} ${personalInfo.segundoApellido || ''}`.trim();
                if (fullName && fullName !== ' ') {
                  patientName = fullName;
                }
              } catch (error) {
                console.error('Error parsing patient name for appointment:', appointment.id, error);
              }
            } else {
              console.log('Patient not found in doctorPatients:', appointmentData.pacienteId, 'Available patients:', doctorPatients.map(p => p.id));
            }
          } else {
            console.log('No pacienteId in appointment data:', appointmentData);
          }

          return {
            id: appointment.id,
            time: appointmentDateTime.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            patient: patientName,
            status: appointmentData.estado || 'PROGRAMADA',
            pacienteId: appointmentData.pacienteId
          };
        } catch (error) {
          console.error('Error formatting appointment:', error);
          return {
            id: appointment.id,
            time: 'N/A',
            patient: 'Error al cargar',
            status: 'ERROR',
            pacienteId: null
          };
        }
      });

      setAppointments(formattedAppointments);

      // Get unique patient IDs from appointments
      const patientIds = [...new Set(formattedAppointments
        .map(apt => apt.pacienteId)
        .filter(id => id))];

      console.log('Patient IDs extracted from appointments:', patientIds);

      // Load patient details
      if (patientIds.length > 0) {
        const patientsData = [];
        for (const patientId of patientIds) {
          try {
            console.log('Loading patient details for ID:', patientId);
            const patientResponse = await pacientesApiService.getPacienteById(patientId);
            patientsData.push(patientResponse);
            console.log('Patient loaded:', patientResponse.id, patientResponse.datosJson ? 'has data' : 'no data');
          } catch (error) {
            console.error(`Error loading patient ${patientId}:`, error);
          }
        }
        console.log('All patients loaded for doctor:', patientsData.length);
        setDoctorPatients(patientsData);
      } else {
        console.log('No patient IDs found in appointments');
        setDoctorPatients([]);
      }

    } catch (error) {
      console.error('Error loading doctor data:', error);
      // Show empty arrays instead of mock data
      setAppointments([]);
      setDoctorPatients([]);
    } finally {
      setLoadingAppointments(false);
      setLoadingPatients(false);
    }
  };

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctor(doctorId);
    setAppointments([]);
    setDoctorPatients([]);
    if (doctorId) {
      loadDoctorData(doctorId, selectedDate);
    }
  };

  const getNombreCompletoMedico = (medico) => {
    try {
      const datosCompletos = JSON.parse(medico.jsonData || '{}');
      if (datosCompletos.jsonData) {
        const datosInternos = JSON.parse(datosCompletos.jsonData);
        const informacionPersonal = datosInternos.informacionPersonal || {};
        const informacionLaboral = datosInternos.informacionLaboral || {};

        const primerNombre = informacionPersonal.primerNombre || '';
        const segundoNombre = informacionPersonal.segundoNombre || '';
        const primerApellido = informacionPersonal.primerApellido || '';
        const segundoApellido = informacionPersonal.segundoApellido || '';
        const especialidad = informacionLaboral.especialidad || '';

        const nombreCompleto = `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.trim();
        return especialidad ? `${nombreCompleto} - ${especialidad}` : nombreCompleto;
      }
      return `Doctor ID: ${medico.id}`;
    } catch (error) {
      console.error('Error getting doctor name:', error);
      return `Doctor ID: ${medico.id}`;
    }
  };

  // Load doctors on component mount
  useEffect(() => {
    loadMedicos();
  }, []);



  return (
    <MainLayout title="Dashboard de Pacientes" subtitle="Gestión integral del flujo médico de pacientes">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sistema de Gestión de Pacientes</h1>
              <p className="mt-2 text-lg text-gray-600">
                Dashboard unificado para el seguimiento completo del flujo médico
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={handleOpenCreatePatientModal}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Nuevo Paciente
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            {/* Calendar */}
            <CalendarWidget
              onDaySelect={(date) => {
                setSelectedDate(date);
                // Reload doctor data if doctor is already selected
                if (selectedDoctor) {
                  loadDoctorData(selectedDoctor, date);
                }
              }}
              onNewPatient={handleOpenCreatePatientModal}
              onOpenAgenda={handleOpenAgendaModal}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Appointment Availability Card */}
            {selectedDate && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Agenda Médica - {selectedDate.toLocaleDateString('es-ES')}
                </h3>

                {/* Doctor Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="h-4 w-4 inline mr-2" />
                    Seleccionar Doctor
                  </label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loadingMedicos}
                  >
                    <option value="">
                      {loadingMedicos ? 'Cargando doctores...' : 'Seleccionar doctor'}
                    </option>
                    {medicos.map((medico) => (
                      <option key={medico.id} value={medico.id}>
                        {getNombreCompletoMedico(medico)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Schedule and Appointments */}
                {selectedDoctor && (
                  <div className="space-y-6">
                    {/* Time slots */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Horarios Disponibles</h4>

                      {loadingAppointments ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Cargando horarios...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { time: '08:00', label: '8:00 AM' },
                            { time: '09:00', label: '9:00 AM' },
                            { time: '10:00', label: '10:00 AM' },
                            { time: '11:00', label: '11:00 AM' },
                            { time: '14:00', label: '2:00 PM' },
                            { time: '15:00', label: '3:00 PM' },
                            { time: '16:00', label: '4:00 PM' },
                            { time: '17:00', label: '5:00 PM' }
                          ].map((slot) => {
                            const hasAppointment = appointments.some(apt => apt.time.startsWith(slot.time));
                            return (
                              <div
                                key={slot.time}
                                className={`p-2 text-center text-xs rounded-md border transition-colors ${
                                  hasAppointment
                                    ? 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed'
                                    : 'bg-green-50 border-green-200 text-green-700 cursor-pointer hover:bg-green-100 hover:shadow-md'
                                }`}
                                title={hasAppointment ? 'Horario ocupado' : 'Horario disponible'}
                              >
                                {slot.label}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Appointments for selected date or upcoming */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        {selectedDate
                          ? `Citas Programadas - ${selectedDate.toLocaleDateString('es-ES')}`
                          : 'Próximas Citas Programadas'
                        }
                      </h4>

                      {loadingAppointments ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Cargando citas...</p>
                        </div>
                      ) : appointments.length > 0 ? (
                        <div className="space-y-2">
                          {appointments.map((appointment) => (
                            <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                              <div className="flex items-center space-x-3">
                                <ClockIcon className="h-4 w-4 text-gray-400" />
                                <div>
                                  <span className="text-sm font-medium">{appointment.time}</span>
                                  <p className="text-xs text-gray-600">{appointment.patient}</p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                appointment.status === 'CONFIRMADA'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {appointment.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          {selectedDate ? 'No hay citas programadas para este día' : 'No hay citas programadas próximamente'}
                        </p>
                      )}
                    </div>

                    {/* Patients associated with this doctor */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Pacientes del Doctor</h4>

                      {loadingPatients ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-500">Cargando pacientes...</p>
                        </div>
                      ) : doctorPatients.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {doctorPatients.map((patient) => {
                            try {
                              const patientData = JSON.parse(patient.datosJson || '{}');
                              const infoPersonal = patientData.informacionPersonal || {};
                              const infoContacto = patientData.informacionContacto || {};

                              const nombreCompleto = `${infoPersonal.primerNombre || ''} ${infoPersonal.segundoNombre || ''} ${infoPersonal.primerApellido || ''} ${infoPersonal.segundoApellido || ''}`.trim();

                              return (
                                <div key={patient.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                                  <div className="flex items-center space-x-3">
                                    <UserIcon className="h-4 w-4 text-blue-600" />
                                    <div>
                                      <span className="text-sm font-medium text-blue-900">{nombreCompleto || `Paciente ${patient.id}`}</span>
                                      <p className="text-xs text-blue-700">{infoContacto.telefono || 'Sin teléfono'}</p>
                                    </div>
                                  </div>
                                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    ID: {patient.id}
                                  </span>
                                </div>
                              );
                            } catch (error) {
                              console.error('Error parsing patient data:', error);
                              return (
                                <div key={patient.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md">
                                  <div className="flex items-center space-x-3">
                                    <UserIcon className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-red-900">Error al cargar paciente {patient.id}</span>
                                  </div>
                                </div>
                              );
                            }
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No hay pacientes asociados a este doctor</p>
                      )}
                    </div>
                  </div>
                )}

                {!selectedDoctor && (
                  <div className="text-center py-8">
                    <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Selecciona un doctor para ver su agenda, citas y pacientes</p>
                  </div>
                )}
              </div>
            )}

            {!selectedDate && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                  <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Selecciona un día</h3>
                  <p className="text-xs text-gray-500">Haz click en un día del calendario para ver la disponibilidad de citas</p>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Buscar pacientes por nombre, documento o teléfono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FunnelIcon className="h-4 w-4 mr-2" />
                    Filtros
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">Todos</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">EPS</label>
                      <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Todas</option>
                        <option value="nueva_eps">Nueva EPS</option>
                        <option value="salud_total">Salud Total</option>
                        <option value="sanitas">Sanitas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Sangre</label>
                      <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Todos</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Patient List */}
            <div className="bg-white shadow rounded-lg">
              <PatientList
                searchTerm={searchTerm}
                filterStatus={filterStatus}
                onPatientClick={handlePatientClick}
                onScheduleAppointment={handleScheduleAppointment}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        </div>

        {/* Patient Detail Modal */}
        <PatientDetailModal
          patientId={selectedPatientId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />

        {/* Create Patient Modal */}
        <CreatePatientModal
          isOpen={isCreatePatientModalOpen}
          onClose={handleCloseCreatePatientModal}
          onPatientCreated={handlePatientCreated}
        />

        {/* Agenda Modal */}
        <AgendaModal
          isOpen={isAgendaModalOpen}
          onClose={handleCloseAgendaModal}
        />

        {/* Schedule Appointment Modal */}
        <ScheduleAppointmentModal
          patientId={selectedPatientForAppointment?.id}
          patientName={selectedPatientForAppointment?.name}
          isOpen={isAppointmentModalOpen}
          onClose={handleCloseAppointmentModal}
          onAppointmentCreated={handleAppointmentCreated}
        />

        {/* Footer Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Dashboard Unificado de Pacientes
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Este dashboard proporciona una vista completa del flujo médico de cada paciente.
                  Desde el registro inicial hasta el seguimiento continuo, todo el historial médico
                  está disponible en una interfaz intuitiva y fácil de navegar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientDashboard;