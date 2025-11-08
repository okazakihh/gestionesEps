/**
 * Hook para gestionar roles del sistema
 * Capa de negocio - Hooks
 * 
 * Proporciona funcionalidades para:
 * - Cargar todos los roles disponibles
 * - Gestionar estado de carga y errores
 * - Mapear roles a formato utilizable en UI
 */

import { useState, useEffect, useCallback } from 'react';
import { roleApiService } from '../../../data/services/roleApiService.js';

/**
 * Mapeo de colores por defecto para roles conocidos
 */
const DEFAULT_ROLE_COLORS = {
  'ADMIN': 'red',
  'ADMINISTRATIVO': 'blue',
  'AUXILIAR_ADMINISTRATIVO': 'cyan',
  'DOCTOR': 'green',
  'AUXILIAR_MEDICO': 'teal',
  'ENFERMERO': 'grape',
  'RECEPCIONISTA': 'violet'
};

/**
 * Asignar color a un rol basándose en su nombre
 */
const getColorForRole = (roleName) => {
  // Si tiene un color predefinido, usarlo
  if (DEFAULT_ROLE_COLORS[roleName]) {
    return DEFAULT_ROLE_COLORS[roleName];
  }
  
  // Si no, asignar un color basado en el hash del nombre
  const colors = ['blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange', 'pink', 'grape', 'violet', 'indigo'];
  const hash = roleName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [rolesMap, setRolesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Cargar todos los roles del sistema
   */
  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const rolesData = await roleApiService.getAllRoles();
      
      // Mapear roles a formato utilizable en UI
      const rolesFormateados = rolesData.map(role => ({
        key: role.name,
        label: formatRoleName(role.name),
        color: getColorForRole(role.name),
        id: role.id,
        originalData: role
      }));
      
      setRoles(rolesFormateados);
      
      // Crear mapa para acceso rápido por key
      const map = {};
      rolesFormateados.forEach(role => {
        map[role.key] = role;
      });
      setRolesMap(map);
      
    } catch (err) {
      console.warn('No se pudieron cargar roles desde la API, usando roles por defecto:', err.message);
      
      // Si es 404, significa que el endpoint no existe aún (pendiente de deploy)
      if (err.message?.includes('404') || err.statusCode === 404) {
        console.info('El servicio de roles aún no está desplegado. Usando roles por defecto.');
        setError(null); // No mostrar como error crítico
      } else {
        setError('No se pudieron cargar roles. Usando configuración por defecto.');
      }
      
      // En caso de error, usar roles por defecto
      usarRolesPorDefecto();
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Formatear nombre de rol para mostrar
   * Ejemplo: "ADMIN" -> "Administrador"
   */
  const formatRoleName = (name) => {
    const nameMap = {
      'ADMIN': 'Administrador',
      'ADMINISTRATIVO': 'Administrativo',
      'AUXILIAR_ADMINISTRATIVO': 'Auxiliar Administrativo',
      'DOCTOR': 'Doctor',
      'AUXILIAR_MEDICO': 'Auxiliar Médico',
      'ENFERMERO': 'Enfermero',
      'RECEPCIONISTA': 'Recepcionista'
    };
    
    return nameMap[name] || name
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  /**
   * Usar roles por defecto en caso de error de carga
   */
  const usarRolesPorDefecto = () => {
    const rolesDefault = [
      { key: 'ADMIN', label: 'Administrador', color: 'red' },
      { key: 'ADMINISTRATIVO', label: 'Administrativo', color: 'blue' },
      { key: 'AUXILIAR_ADMINISTRATIVO', label: 'Auxiliar Administrativo', color: 'cyan' },
      { key: 'DOCTOR', label: 'Doctor', color: 'green' },
      { key: 'AUXILIAR_MEDICO', label: 'Auxiliar Médico', color: 'teal' }
    ];
    
    setRoles(rolesDefault);
    
    const map = {};
    rolesDefault.forEach(role => {
      map[role.key] = role;
    });
    setRolesMap(map);
  };

  /**
   * Obtener rol por key
   */
  const getRoleByKey = useCallback((key) => {
    return rolesMap[key] || null;
  }, [rolesMap]);

  /**
   * Verificar si un rol existe
   */
  const roleExists = useCallback((key) => {
    return !!rolesMap[key];
  }, [rolesMap]);

  // Cargar roles al montar el componente
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  return {
    roles,
    rolesMap,
    loading,
    error,
    loadRoles,
    getRoleByKey,
    roleExists
  };
};
