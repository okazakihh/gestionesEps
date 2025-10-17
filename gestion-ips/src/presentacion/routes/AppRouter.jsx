import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/negocio/hooks/useAuth.js';
import { LoginPage } from '@/presentacion/pages/LoginPage.jsx';
import { DashboardPage } from '@/presentacion/pages/DashboardPage.jsx';
import UsuariosPage from '@/presentacion/pages/UsersPage.jsx';
import PatientDashboard from '@/presentacion/pages/pacientes/PatientDashboard.jsx';
import EmpleadosPage from '@/presentacion/pages/empleados/EmpleadosPage.jsx';
import FacturacionPage from '@/presentacion/pages/facturacion/FacturacionPage.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRouter = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/usuarios" element={<ProtectedRoute><UsuariosPage /></ProtectedRoute>} />
      <Route path="/empleados" element={<ProtectedRoute><EmpleadosPage /></ProtectedRoute>} />
      <Route path="/facturacion" element={<ProtectedRoute><FacturacionPage /></ProtectedRoute>} />
      <Route path="/pacientes/dashboard" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
      <Route path="/pacientes/*" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

export default AppRouter;