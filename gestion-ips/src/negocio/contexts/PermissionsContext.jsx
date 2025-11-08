/**
 * Contexto de Permisos
 * Proporciona acceso global a los permisos cargados desde la configuración
 */

import React, { createContext, useContext } from 'react';
import { usePermissions } from '../hooks/auth/usePermissions.js';
import { 
  hasPermission as hasPermissionStatic, 
  canAccessModule as canAccessModuleStatic,
  ROLE_PERMISSIONS 
} from '../utils/auth/permissions.js';

const PermissionsContext = createContext(null);

export const PermissionsProvider = ({ children }) => {
  const {
    permissions,
    loading,
    error,
    loadPermissions,
    hasPermission: hasPermissionDynamic,
    canAccessModule: canAccessModuleDynamic,
    getModulePermissions,
    getAccessibleModules
  } = usePermissions();

  /**
   * Verificar permiso - usa configuración dinámica si está disponible, 
   * sino fallback a permisos estáticos
   */
  const checkPermission = (role, module, action) => {
    if (permissions && !loading) {
      // Usar permisos dinámicos de la configuración
      return hasPermissionDynamic(role, module, action);
    }
    
    // Fallback a permisos estáticos hardcodeados
    return hasPermissionStatic(role, module, action);
  };

  /**
   * Verificar acceso a módulo
   */
  const checkModuleAccess = (role, module) => {
    if (permissions && !loading) {
      return canAccessModuleDynamic(role, module);
    }
    
    return canAccessModuleStatic(role, module);
  };

  /**
   * Obtener permisos de un módulo para un rol
   */
  const getPermissionsForModule = (role, module) => {
    if (permissions && !loading) {
      return getModulePermissions(role, module);
    }
    
    // Fallback a permisos estáticos
    return ROLE_PERMISSIONS[role]?.[module] || null;
  };

  const value = {
    permissions,
    loading,
    error,
    loadPermissions,
    checkPermission,
    checkModuleAccess,
    getPermissionsForModule,
    getAccessibleModules,
    // Indicar si estamos usando permisos dinámicos o estáticos
    usingDynamicPermissions: !!permissions && !loading
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

/**
 * Hook para usar el contexto de permisos
 */
export const usePermissionsContext = () => {
  const context = useContext(PermissionsContext);
  
  if (!context) {
    throw new Error('usePermissionsContext debe usarse dentro de PermissionsProvider');
  }
  
  return context;
};
