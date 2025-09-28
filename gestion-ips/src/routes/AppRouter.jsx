import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { LoginPage } from '../pages/LoginPage.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import UsuariosPage from '../pages/UsersPage.jsx';
import PacientesPage from '../pages/pacientes/PacientesPage.jsx';
import PacienteForm from '../pages/pacientes/PacienteForm.jsx';
import HistoriaClinicaForm from '../pages/pacientes/HistoriaClinicaForm.jsx';
import ConsultaMedicaForm from '../pages/pacientes/ConsultaMedicaForm.jsx';
import GestionPacientesPage from '../pages/pacientes/GestionPacientesPage.jsx';
import HistoriasClinicasPage from '../pages/pacientes/HistoriasClinicasPage.jsx';
import ConsultasMedicasPage from '../pages/pacientes/ConsultasMedicasPage.jsx';
import DocumentosMedicosPage from '../pages/pacientes/DocumentosMedicosPage.jsx';

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

      <Route
        path="/pacientes/historias/nueva"
        element={
          <ProtectedRoute>
            <HistoriaClinicaForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pacientes/historias/:id/editar"
        element={
          <ProtectedRoute>
            <HistoriaClinicaForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pacientes/consultas/nueva"
        element={
          <ProtectedRoute>
            <ConsultaMedicaForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pacientes/consultas/:id/editar"
        element={
          <ProtectedRoute>
            <ConsultaMedicaForm />
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
