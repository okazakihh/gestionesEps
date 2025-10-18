import { useState, useEffect } from 'react';
import { empleadosApiService } from '../../data/services/empleadosApiService';

/**
 * Hook para gestión de empleados (CRUD y estado)
 */
export const useEmpleados = (searchParams = {}) => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(false);

  const loadEmpleados = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);
      const response = await empleadosApiService.getEmpleados(searchParams);
      setEmpleados(response.content || []);
    } catch (err) {
      const error = err;
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setConnectionError(true);
        setError('No se pudo conectar con el servicio de empleados. Verifique que el servidor esté ejecutándose.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar empleados');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmpleados();
  }, [JSON.stringify(searchParams)]);

  const createEmpleado = async (jsonData) => {
    try {
      setLoading(true);
      await empleadosApiService.createEmpleado(jsonData);
      await loadEmpleados();
      return { success: true };
    } catch (error) {
      console.error('Error al crear empleado:', error);
      return { success: false, error: error.message || 'Ha ocurrido un error inesperado' };
    } finally {
      setLoading(false);
    }
  };

  const updateEmpleado = async (id, jsonData) => {
    try {
      setLoading(true);
      await empleadosApiService.updateEmpleado(id, jsonData);
      await loadEmpleados();
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      return { success: false, error: error.message || 'Ha ocurrido un error inesperado' };
    } finally {
      setLoading(false);
    }
  };

  const deactivateEmpleado = async (id) => {
    try {
      setLoading(true);
      await empleadosApiService.deactivateEmpleado(id);
      await loadEmpleados();
      return { success: true };
    } catch (error) {
      console.error('Error al desactivar empleado:', error);
      return { success: false, error: 'No se pudo desactivar el empleado' };
    } finally {
      setLoading(false);
    }
  };

  const getEmpleadoById = async (id) => {
    try {
      setLoading(true);
      const empleadoData = await empleadosApiService.getEmpleadoById(id);
      return { success: true, data: empleadoData };
    } catch (error) {
      console.error('Error al cargar empleado:', error);
      return { success: false, error: 'No se pudo cargar la información del empleado' };
    } finally {
      setLoading(false);
    }
  };

  return {
    empleados,
    loading,
    error,
    connectionError,
    loadEmpleados,
    createEmpleado,
    updateEmpleado,
    deactivateEmpleado,
    getEmpleadoById
  };
};
