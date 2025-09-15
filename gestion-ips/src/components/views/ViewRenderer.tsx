import React from 'react';
import { useNavigationStore, ViewType } from '@/stores/navigationStore';
import { SPALoginPage } from '@/pages/SPALoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import UsuariosPage from '@/pages/UsersPage';
import PacientesPage from '@/pages/pacientes/PacientesPage';
import { SPALayout } from '@/components/layouts/SPALayout';

const CitasPage = () => (
  <SPALayout title="Gestión de Citas" subtitle="Administrar citas médicas">
    <div className="p-6">
      <div className="text-center text-gray-500 py-12">
        <p className="text-lg">Página de gestión de citas en desarrollo...</p>
      </div>
    </div>
  </SPALayout>
);

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

const viewComponents: Record<ViewType, React.ComponentType> = {
  login: SPALoginPage,
  dashboard: DashboardPage,
  usuarios: UsuariosPage,
  pacientes: PacientesPage,
  citas: CitasPage,
  reportes: ReportesPage,
  configuracion: ConfiguracionPage,
};

export const ViewRenderer: React.FC = () => {
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
