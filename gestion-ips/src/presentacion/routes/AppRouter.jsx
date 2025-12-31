import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../data/context/AuthContext.jsx';
import { ProtectedRoute } from '../components/auth/ProtectedRoute.jsx';
import { PERMISSIONS } from '../../negocio/utils/auth/permissions.js';
import { LoginPage } from '../pages/LoginPage.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { ReportesPage } from '../pages/ReportesPage.jsx';
import UsuariosPage from '../pages/UsersPage.jsx';
import PatientDashboard from '../pages/pacientes/PatientDashboard.jsx';
import EmpleadosPage from '../pages/empleados/EmpleadosPage.jsx';
import FacturacionPage from '../pages/facturacion/FacturacionPage.jsx';
import { NominaPage } from '../pages/nomina/NominaPage.jsx';
import ConfiguracionPage from '../pages/configuracion/ConfiguracionPage.jsx';

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
          <ProtectedRoute module={PERMISSIONS.USUARIOS}>
            <UsuariosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/empleados"
        element={
          <ProtectedRoute module={PERMISSIONS.NOMINA}>
            <EmpleadosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/facturacion"
        element={
          <ProtectedRoute module={PERMISSIONS.FACTURACION}>
            <FacturacionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/nomina"
        element={
          <ProtectedRoute module={PERMISSIONS.NOMINA}>
            <NominaPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reportes"
        element={
          <ProtectedRoute module={PERMISSIONS.REPORTES}>
            <ReportesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/configuracion"
        element={
          <ProtectedRoute module={PERMISSIONS.CONFIGURACION}>
            <ConfiguracionPage />
          </ProtectedRoute>
        }
      />

      {/* Rutas de Pacientes - Todo se maneja a través del PatientDashboard con modales */}
      <Route
        path="/pacientes/dashboard"
        element={
          <ProtectedRoute module={PERMISSIONS.PACIENTES}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pacientes/*"
        element={
          <ProtectedRoute module={PERMISSIONS.PACIENTES}>
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
