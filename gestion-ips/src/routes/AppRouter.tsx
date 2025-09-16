import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import UsuariosPage from '../pages/UsersPage';
import PacientesPage from '../pages/pacientes/PacientesPage';
import PacienteForm from '../pages/pacientes/PacienteForm';
import GestionPacientesPage from '../pages/pacientes/GestionPacientesPage';
import HistoriasClinicasPage from '../pages/pacientes/HistoriasClinicasPage';
import ConsultasMedicasPage from '../pages/pacientes/ConsultasMedicasPage';
import DocumentosMedicosPage from '../pages/pacientes/DocumentosMedicosPage';

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

const AppRouter: React.FC = () => {
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
        path="/pacientes"
        element={
          <ProtectedRoute>
            <PacientesPage />
          </ProtectedRoute>
        }
      />

      {/* Submodulos de Pacientes - ahora manejados por PacientesPage con pestañas */}
      <Route
        path="/pacientes/gestion"
        element={
          <ProtectedRoute>
            <PacientesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pacientes/historias"
        element={
          <ProtectedRoute>
            <PacientesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pacientes/consultas"
        element={
          <ProtectedRoute>
            <PacientesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pacientes/documentos"
        element={
          <ProtectedRoute>
            <PacientesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pacientes/nuevo"
        element={
          <ProtectedRoute>
            <PacienteForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pacientes/:id/editar"
        element={
          <ProtectedRoute>
            <PacienteForm />
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
