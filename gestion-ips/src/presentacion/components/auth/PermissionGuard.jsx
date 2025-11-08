/**
 * PermissionGuard - Componente para proteger secciones de UI según permisos
 * Muestra u oculta contenido basándose en permisos del usuario
 */

import React from 'react';
import { useAuthWithPermissions } from '../../../negocio/hooks/auth/useAuthWithPermissions.js';

export const PermissionGuard = ({ 
  module, 
  action = null, 
  children, 
  fallback = null,
  showLoading = false 
}) => {
  const { hasPermission, canAccessModule, permissionsLoading } = useAuthWithPermissions();

  // Mostrar indicador de carga si está configurado
  if (permissionsLoading && showLoading) {
    return (
      <div className="inline-block">
        <div className="animate-pulse">
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Verificar permisos
  let hasAccess = false;
  
  if (module && action) {
    // Verificar permiso específico de módulo + acción
    hasAccess = hasPermission(module, action);
  } else if (module) {
    // Solo verificar acceso al módulo
    hasAccess = canAccessModule(module);
  } else {
    // Sin restricciones, mostrar contenido
    hasAccess = true;
  }

  // Mostrar contenido si tiene acceso, sino mostrar fallback
  return hasAccess ? children : fallback;
};
