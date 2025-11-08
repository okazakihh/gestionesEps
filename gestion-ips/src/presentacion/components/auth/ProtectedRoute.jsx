/**
 * ProtectedRoute - Componente para proteger rutas según permisos
 * Usa el contexto de permisos para verificar acceso dinámicamente
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../data/context/AuthContext.jsx';
import { usePermissionsContext } from '../../../negocio/contexts/PermissionsContext.jsx';

export const ProtectedRoute = ({ 
  children, 
  module, 
  action = null, 
  redirectTo = '/dashboard' 
}) => {
  const { user } = useAuth();
  const { checkModuleAccess, checkPermission, loading } = usePermissionsContext();

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si estamos cargando permisos, mostrar un indicador de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si se especificó un módulo y acción, verificar permiso específico
  if (module && action) {
    const hasPermission = checkPermission(user.rol, module, action);
    if (!hasPermission) {
      return <Navigate to={redirectTo} replace />;
    }
  }
  // Si solo se especificó módulo, verificar acceso al módulo
  else if (module) {
    const hasAccess = checkModuleAccess(user.rol, module);
    if (!hasAccess) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // Usuario tiene permisos, renderizar componente
  return children;
};
