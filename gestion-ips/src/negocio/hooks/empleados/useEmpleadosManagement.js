import { useState, useEffect, useCallback } from 'react';
import { empleadosApiService } from '../../../data/services/empleadosApiService.js';
import Swal from 'sweetalert2';
import { buildEmpleadoJSON } from '../../utils/empleados/empleadoParser.js';

/**
 * Hook para manejar la lógica de gestión de empleados (CRUD)
 * Capa de negocio - No contiene JSX
 */
export const useEmpleadosManagement = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const [searchParams] = useState({
    page: 0,
    size: 10
  });

  // Cargar empleados
  const loadEmpleados = useCallback(async () => {
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
  }, [searchParams]);

  // Cargar empleados al montar
  useEffect(() => {
    loadEmpleados();
  }, [loadEmpleados]);

  // Obtener empleado por ID
  const getEmpleadoById = useCallback(async (id) => {
    try {
      setLoading(true);
      const empleadoData = await empleadosApiService.getEmpleadoById(id);
      return empleadoData;
    } catch (error) {
      console.error('Error al cargar empleado:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear empleado
  const createEmpleado = useCallback(async (formData) => {
    try {
      setLoading(true);
      const datosCompletosJson = buildEmpleadoJSON(formData, true);

      console.log('🔍 DEBUG - JSON que se va a enviar:', datosCompletosJson);

      await empleadosApiService.createEmpleado(datosCompletosJson);

      await Swal.fire({
        title: '¡Empleado creado!',
        text: 'El empleado ha sido registrado correctamente',
        icon: 'success',
        timer: 5000,
        showConfirmButton: false
      });

      await loadEmpleados();
      return { success: true };
    } catch (error) {
      console.error('Error al crear empleado:', error);
      await Swal.fire({
        title: 'Error al crear empleado',
        text: error.message || 'Ha ocurrido un error inesperado',
        icon: 'error'
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [loadEmpleados]);

  // Actualizar empleado
  const updateEmpleado = useCallback(async (empleadoId, formData, activo) => {
    try {
      setLoading(true);
      const datosCompletosJson = buildEmpleadoJSON(formData, activo);

      await empleadosApiService.updateEmpleado(empleadoId, datosCompletosJson);

      await Swal.fire({
        title: '¡Empleado actualizado!',
        text: 'Los datos del empleado han sido actualizados correctamente',
        icon: 'success',
        timer: 5000,
        showConfirmButton: false
      });

      await loadEmpleados();
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      await Swal.fire({
        title: 'Error al actualizar empleado',
        text: error.message || 'Ha ocurrido un error inesperado',
        icon: 'error'
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [loadEmpleados]);

  // Desactivar empleado
  const deactivateEmpleado = useCallback(async (empleado, numeroDocumento) => {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea desactivar al empleado ${numeroDocumento}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      return { success: false, cancelled: true };
    }

    try {
      setLoading(true);
      await empleadosApiService.deactivateEmpleado(empleado.id);

      await Swal.fire({
        title: 'Empleado desactivado',
        text: 'El empleado ha sido desactivado correctamente',
        icon: 'warning',
        timer: 5000,
        showConfirmButton: false
      });

      await loadEmpleados();
      return { success: true };
    } catch (error) {
      console.error('Error al desactivar empleado:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo desactivar el empleado',
        icon: 'error'
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [loadEmpleados]);

  return {
    empleados,
    loading,
    error,
    connectionError,
    loadEmpleados,
    getEmpleadoById,
    createEmpleado,
    updateEmpleado,
    deactivateEmpleado
  };
};

export default useEmpleadosManagement;
