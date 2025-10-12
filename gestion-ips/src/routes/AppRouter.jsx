import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { LoginPage } from '../pages/LoginPage.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import UsuariosPage from '../pages/UsersPage.jsx';
import PatientDashboard from '../pages/pacientes/PatientDashboard.jsx';
import EmpleadosPage from '../pages/empleados/EmpleadosPage.jsx';

// Componente para rutas protegidas
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
      {/* Ruta de login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } 
      />
      
      {/* Rutas protegidas */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute>
            <UsuariosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/empleados"
        element={
          <ProtectedRoute>
            <EmpleadosPage />
          </ProtectedRoute>
        }
      />

      {/* Rutas de Pacientes - Todo se maneja a través del PatientDashboard con modales */}
      <Route
        path="/pacientes/dashboard"
        element={
          <ProtectedRoute>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pacientes/*"
        element={
          <ProtectedRoute>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Redirección por defecto */}
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
      
      {/* Ruta catch-all */}
      <Route 
        path="*" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
};

export default AppRouter;
