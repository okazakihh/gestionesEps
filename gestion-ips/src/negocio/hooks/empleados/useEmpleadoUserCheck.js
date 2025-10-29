import { useState, useEffect } from 'react';
import { parseEmpleadoData } from '../../utils/empleados/empleadoParser.js';

/**
 * Hook para verificar si un empleado tiene usuario creado
 * Capa de negocio - No contiene JSX
 */
export const useEmpleadoUserCheck = (empleados) => {
  const [userCheckCache, setUserCheckCache] = useState({});
  const [checkingUsers, setCheckingUsers] = useState(new Set());

  // Verificar usuarios para todos los empleados
  useEffect(() => {
    if (!empleados || empleados.length === 0) return;
    
    empleados.forEach(empleado => {
      if (userCheckCache[empleado.id] === undefined && !checkingUsers.has(empleado.id)) {
        checkEmployeeHasUser(empleado);
      }
    });
  }, [empleados]);

  // Función para verificar si el empleado tiene usuario
  const checkEmployeeHasUser = async (empleado) => {
    const empleadoId = empleado.id;

    // Verificar cache primero
    if (userCheckCache[empleadoId] !== undefined) {
      return userCheckCache[empleadoId];
    }

    // Marcar como verificando
    setCheckingUsers(prev => new Set(prev).add(empleadoId));

    try {
      // Extraer email y documento del empleado
      const parsed = parseEmpleadoData(empleado);
      const email = parsed.informacionContacto.email || '';
      const numeroDocumento = parsed.numeroDocumento || '';

      // Si no tiene email ni documento, asumir que no tiene usuario
      if (!email && !numeroDocumento) {
        setUserCheckCache(prev => ({ ...prev, [empleadoId]: false }));
        setCheckingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(empleadoId);
          return newSet;
        });
        return false;
      }

      // Importar servicio de usuarios dinámicamente
      const { usuarioApiService } = await import('../../../data/services/usuarioApiService.js');
      const response = await usuarioApiService.getAllUsuarios();

      if (response.success && response.data) {
        // Verificar si algún usuario tiene email o documento coincidente
        const hasUser = response.data.some(user =>
          (email && user.email === email) ||
          (numeroDocumento && user.personalInfo?.documento === numeroDocumento)
        );

        // Guardar en cache
        setUserCheckCache(prev => ({ ...prev, [empleadoId]: hasUser }));
        setCheckingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(empleadoId);
          return newSet;
        });
        return hasUser;
      }

      setUserCheckCache(prev => ({ ...prev, [empleadoId]: false }));
      setCheckingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(empleadoId);
        return newSet;
      });
      return false;
    } catch (error) {
      console.error('Error checking if employee has user:', error);
      setUserCheckCache(prev => ({ ...prev, [empleadoId]: false }));
      setCheckingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(empleadoId);
        return newSet;
      });
      return false;
    }
  };

  return {
    userCheckCache,
    checkingUsers,
    checkEmployeeHasUser
  };
};

export default useEmpleadoUserCheck;
