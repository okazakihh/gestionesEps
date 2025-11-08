/**
 * Hook para cargar y gestionar permisos desde la configuración
 * Capa de negocio - Hooks
 * 
 * Este hook carga los permisos desde la base de datos (configuración)
 * y los hace disponibles para todo el sistema
 */

import { useState, useEffect, useCallback } from 'react';
import { useConfiguracionManagement } from '../configuracion/useConfiguracionManagement.js';

export const usePermissions = () => {
  const { getConfiguracionByClave } = useConfiguracionManagement();
  
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Cargar permisos desde configuración
   */
  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const config = await getConfiguracionByClave('PERMISOS_MODULOS');
      
      if (config && config.jsonData) {
        setPermissions(config.jsonData);
      } else {
        setPermissions(null);
      }
    } catch (err) {
      console.error('Error al cargar permisos:', err);
      setError(err.message);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  }, [getConfiguracionByClave]);

  /**
   * Verificar si un rol tiene un permiso específico
   */
  const hasPermission = useCallback((role, module, action) => {
    if (!permissions || !role || !module || !action) return false;
    
    return permissions[role]?.[module]?.[action] === true;
  }, [permissions]);

  /**
   * Verificar si un rol puede acceder a un módulo
   */
  const canAccessModule = useCallback((role, module) => {
    return hasPermission(role, module, 'read');
  }, [hasPermission]);

  /**
   * Obtener todos los permisos de un rol para un módulo
   */
  const getModulePermissions = useCallback((role, module) => {
    if (!permissions || !role || !module) return null;
    
    return permissions[role]?.[module] || null;
  }, [permissions]);

  /**
   * Obtener todos los módulos accesibles para un rol
   */
  const getAccessibleModules = useCallback((role) => {
    if (!permissions || !role) return [];
    
    const rolePermissions = permissions[role];
    if (!rolePermissions) return [];

    return Object.keys(rolePermissions).filter(module =>
      rolePermissions[module]?.read === true
    );
  }, [permissions]);

  // Cargar permisos al montar
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  return {
    permissions,
    loading,
    error,
    loadPermissions,
    hasPermission,
    canAccessModule,
    getModulePermissions,
    getAccessibleModules
  };
};
