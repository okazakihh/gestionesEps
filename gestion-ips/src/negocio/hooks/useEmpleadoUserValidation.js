import { useState, useEffect } from 'react';

/**
 * Hook para validar si empleados tienen cuentas de usuario
 */
export const useEmpleadoUserValidation = (empleados) => {
  const [userCheckCache, setUserCheckCache] = useState({});
  const [checkingUsers, setCheckingUsers] = useState(new Set());

  useEffect(() => {
    empleados.forEach(empleado => {
      if (userCheckCache[empleado.id] === undefined && !checkingUsers.has(empleado.id)) {
        checkEmployeeHasUser(empleado);
      }
    });
  }, [empleados]);

  const checkEmployeeHasUser = async (empleado) => {
    const empleadoId = empleado.id;

    // Check cache first
    if (userCheckCache[empleadoId] !== undefined) {
      return userCheckCache[empleadoId];
    }

    // Mark as checking
    setCheckingUsers(prev => new Set(prev).add(empleadoId));

    try {
      // Extract employee email and document number
      let email = '';
      let numeroDocumento = '';

      try {
        const datosCompletos = JSON.parse(empleado.jsonData || '{}');
        numeroDocumento = datosCompletos.numeroDocumento || '';
        if (datosCompletos.jsonData) {
          const datosInternos = JSON.parse(datosCompletos.jsonData);
          email = datosInternos.informacionContacto?.email || '';
        }
      } catch (error) {
        console.error('Error parsing empleado data for user check:', error);
      }

      // If no email or document, assume no user
      if (!email && !numeroDocumento) {
        setUserCheckCache(prev => ({ ...prev, [empleadoId]: false }));
        setCheckingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(empleadoId);
          return newSet;
        });
        return false;
      }

      // Import user service dynamically
      const { usuarioApiService } = await import('../../data/services/usuarioApiService');
      const response = await usuarioApiService.getAllUsuarios();

      if (response.success && response.data) {
        // Check if any user has matching email or document
        const hasUser = response.data.some(user =>
          (email && user.email === email) ||
          (numeroDocumento && user.personalInfo?.documento === numeroDocumento)
        );

        // Cache the result
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
