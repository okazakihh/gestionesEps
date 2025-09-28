import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/ui/MainLayout.jsx';
import {
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import GestionPacientesComponent from '../../components/pacientes/GestionPacientesComponent.jsx';
import HistoriasClinicasComponent from '../../components/pacientes/HistoriasClinicasComponent.jsx';
import ConsultasMedicasComponent from '../../components/pacientes/ConsultasMedicasComponent.jsx';
import DocumentosMedicosComponent from '../../components/pacientes/DocumentosMedicosComponent.jsx';

const PacientesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pacientes');

  // Detectar la pestaña activa basada en la ruta actual
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/gestion')) {
      setActiveTab('pacientes');
    } else if (path.includes('/historias')) {
      setActiveTab('historias');
    } else if (path.includes('/consultas')) {
      setActiveTab('consultas');
    } else if (path.includes('/documentos')) {
      setActiveTab('documentos');
    } else {
      setActiveTab('pacientes');
    }
  }, [location.pathname]);

  // Función para cambiar de pestaña
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Navegar a la ruta correspondiente
    const routes = {
      pacientes: '/pacientes/gestion',
      historias: '/pacientes/historias',
      consultas: '/pacientes/consultas',
      documentos: '/pacientes/documentos'
    };
    navigate(routes[tabId]);
  };

  const tabs = [
    {
      id: 'pacientes',
      title: 'Pacientes',
      description: 'Gestión de pacientes',
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      component: GestionPacientesComponent
    },
    {
      id: 'historias',
      title: 'Historias Clínicas',
      description: 'Historias clínicas electrónicas',
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      component: HistoriasClinicasComponent
    },
    {
      id: 'consultas',
      title: 'Consultas Médicas',
      description: 'Consultas y tratamientos',
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-500',
      component: ConsultasMedicasComponent
    },
    {
      id: 'documentos',
      title: 'Documentos Médicos',
      description: 'Documentos y archivos',
      icon: DocumentIcon,
      color: 'bg-orange-500',
      component: DocumentosMedicosComponent
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData?.component;

  return (
    <MainLayout title="Módulo de Pacientes" subtitle="Gestión integral de pacientes y registros médicos">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Gestión de Pacientes</h1>
          <p className="mt-2 text-lg text-gray-600">
            Módulo completo para la administración de pacientes y registros médicos
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className={`-ml-0.5 mr-2 h-5 w-5 ${
                      activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    <span>{tab.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Active Component Content */}
        <div className="bg-white shadow rounded-lg">
          {ActiveComponent && <ActiveComponent />}
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Información del Sistema
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Este módulo cumple con la Resolución 1995 de 1999 del Ministerio de Salud de Colombia
                  para la gestión de historias clínicas electrónicas. Todos los datos se procesan de forma segura
                  y cumplen con las normativas de protección de datos personales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PacientesPage;