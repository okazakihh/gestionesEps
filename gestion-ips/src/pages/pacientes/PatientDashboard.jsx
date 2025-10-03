import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/ui/MainLayout.jsx';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import PatientList from '../../components/pacientes/PatientDashboard/PatientList.jsx';
import QuickStats from '../../components/pacientes/PatientDashboard/QuickStats.jsx';
import PatientDetailModal from '../../components/pacientes/PatientDashboard/PatientDetailModal.jsx';
import CreatePatientModal from '../../components/pacientes/PatientDashboard/CreatePatientModal.jsx';
import AgendaModal from '../../components/pacientes/PatientDashboard/AgendaModal.jsx';
import ScheduleAppointmentModal from '../../components/pacientes/PatientDashboard/ScheduleAppointmentModal.jsx';

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

  // Quick actions for common tasks
  const quickActions = [
    {
      title: 'Nuevo Paciente',
      description: 'Registrar paciente',
      icon: PlusIcon,
      color: 'bg-blue-500',
      action: handleOpenCreatePatientModal
    },
    {
      title: 'Agenda',
      description: 'Ver citas pendientes',
      icon: CalendarDaysIcon,
      color: 'bg-green-500',
      action: handleOpenAgendaModal
    },
    {
      title: 'Historias Clínicas',
      description: 'Ver registros médicos',
      icon: DocumentTextIcon,
      color: 'bg-purple-500',
      action: () => navigate('/pacientes/historias')
    },
    {
      title: 'Consultas',
      description: 'Ver consultas médicas',
      icon: ClipboardDocumentListIcon,
      color: 'bg-orange-500',
      action: () => navigate('/pacientes/consultas')
    }
  ];

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

        {/* Quick Stats */}
        <div className="mb-8">
          <QuickStats />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className="relative block w-full bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 ${action.color} rounded-lg p-3`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4 text-left">
                      <p className="text-sm font-medium text-gray-900">{action.title}</p>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

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