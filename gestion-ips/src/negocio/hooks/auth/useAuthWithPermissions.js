/**
 * useAuth - Hook combinado de autenticación y permisos
 * Proporciona acceso a información de usuario y verificación de permisos
 */

import { useAuth as useAuthContext } from '../../../data/context/AuthContext.jsx';
import { usePermissionsContext } from '../../../negocio/contexts/PermissionsContext.jsx';

export const useAuthWithPermissions = () => {
  const auth = useAuthContext();
  const permissions = usePermissionsContext();

  /**
   * Verificar si el usuario actual tiene un permiso específico
   */
  const hasPermission = (module, action) => {
    if (!auth.user?.rol) return false;
    return permissions.checkPermission(auth.user.rol, module, action);
  };

  /**
   * Verificar si el usuario actual puede acceder a un módulo
   */
  const canAccessModule = (module) => {
    if (!auth.user?.rol) return false;
    return permissions.checkModuleAccess(auth.user.rol, module);
  };

  /**
   * Obtener todos los módulos accesibles para el usuario actual
   */
  const getAccessibleModules = () => {
    if (!auth.user?.rol) return [];
    return permissions.getAccessibleModules(auth.user.rol);
  };

  /**
   * Obtener permisos de un módulo específico para el usuario actual
   */
  const getModulePermissions = (module) => {
    if (!auth.user?.rol) return null;
    return permissions.getPermissionsForModule(auth.user.rol, module);
  };

  return {
    // Spread de funcionalidades de auth
    ...auth,
    
    // Funciones de verificación de permisos
    hasPermission,
    canAccessModule,
    getAccessibleModules,
    getModulePermissions,
    
    // Estado de permisos
    permissionsLoading: permissions.loading,
    permissionsError: permissions.error,
    usingDynamicPermissions: permissions.usingDynamicPermissions,
    
    // Función para recargar permisos
    reloadPermissions: permissions.loadPermissions
  };
};
