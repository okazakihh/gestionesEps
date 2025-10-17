import React from 'react';
import { useNavigationStore, ViewType } from '@/presentacion/stores/navigationStore.js';
import { SPALoginPage } from '@/presentacion/pages/SPALoginPage.jsx';
import { DashboardPage } from '@/presentacion/pages/DashboardPage.jsx';
import UsuariosPage from '@/presentacion/pages/UsersPage.jsx';
import PacientesPage from '@/presentacion/pages/pacientes/PacientesPage.jsx';
import EmpleadosPage from '@/presentacion/pages/empleados/EmpleadosPage.jsx';
import { SPALayout } from '@/presentacion/components/layouts/SPALayout.jsx';


const ReportesPage = () => (
  <SPALayout title="Reportes" subtitle="Generar y visualizar reportes del sistema">
    <div className="p-6">
      <div className="text-center text-gray-500 py-12">
        <p className="text-lg">Página de reportes en desarrollo...</p>
      </div>
    </div>
  </SPALayout>
);

const ConfiguracionPage = () => (
  <SPALayout title="Configuración" subtitle="Configurar parámetros del sistema">
    <div className="p-6">
      <div className="text-center text-gray-500 py-12">
        <p className="text-lg">Página de configuración en desarrollo...</p>
      </div>
    </div>
  </SPALayout>
);

const viewComponents = {
  login: SPALoginPage,
  dashboard: DashboardPage,
  usuarios: UsuariosPage,
  pacientes: PacientesPage,
  empleados: EmpleadosPage,
  reportes: ReportesPage,
  configuracion: ConfiguracionPage,
};

export const ViewRenderer = () => {
  const { currentView } = useNavigationStore();
  
  const ViewComponent = viewComponents[currentView];
  
  if (!ViewComponent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vista no encontrada</h2>
          <p className="text-gray-600">La vista "{currentView}" no está disponible.</p>
        </div>
      </div>
    );
  }
  
  return <ViewComponent />;
};
