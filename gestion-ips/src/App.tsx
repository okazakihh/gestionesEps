import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MainLayout } from './components/ui/MainLayout';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import  UsuariosPage from './pages/UsersPage';

// Página de Usuarios con funcionalidad completa
// (Usar directamente el import de UsuariosPage)

const PacientesPage = () => (
  <MainLayout title="Gestión de Pacientes" subtitle="Administrar información de pacientes">
    <div className="p-6">
      <div className="text-center text-gray-500 py-12">
        <p className="text-lg">Página de gestión de pacientes en desarrollo...</p>
      </div>
    </div>
  </MainLayout>
);

const CitasPage = () => (
  <MainLayout title="Gestión de Citas" subtitle="Administrar citas médicas">
    <div className="p-6">
      <div className="text-center text-gray-500 py-12">
        <p className="text-lg">Página de gestión de citas en desarrollo...</p>
      </div>
    </div>
  </MainLayout>
);

const ReportesPage = () => (
  <MainLayout title="Reportes" subtitle="Generar y visualizar reportes del sistema">
    <div className="p-6">
      <div className="text-center text-gray-500 py-12">
        <p className="text-lg">Página de reportes en desarrollo...</p>
      </div>
    </div>
  </MainLayout>
);

const ConfiguracionPage = () => (
  <MainLayout title="Configuración" subtitle="Configurar parámetros del sistema">
    <div className="p-6">
      <div className="text-center text-gray-500 py-12">
        <p className="text-lg">Página de configuración en desarrollo...</p>
      </div>
    </div>
  </MainLayout>
);

// Configuración del cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<DashboardPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/pacientes" element={<PacientesPage />} />
            <Route path="/citas" element={<CitasPage />} />
            <Route path="/reportes" element={<ReportesPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
       
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
