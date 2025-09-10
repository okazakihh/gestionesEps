import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AdminPage } from '@/pages/AdminPage';
import { RequireRole } from '@/components/auth/RequireRole';

const AppRouter = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
      />
      
      {/* Rutas protegidas */}
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />} 
      />
      <Route
        path="/admin"
        element={
          <RequireRole roles={["ADMIN"]}>
            <AdminPage />
          </RequireRole>
        }
      />
      
      {/* Ruta por defecto */}
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
      
      {/* Ruta 404 */}
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  );
};

export default AppRouter;
