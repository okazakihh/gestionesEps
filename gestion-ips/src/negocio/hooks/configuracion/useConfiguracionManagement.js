/**
 * Hook para manejar la lógica de gestión de configuraciones (CRUD)
 * Capa de negocio - No contiene JSX
 * 
 * Proporciona funcionalidades para:
 * - Cargar configuraciones activas
 * - Obtener configuración por ID o clave
 * - Crear nuevas configuraciones
 * - Actualizar configuraciones existentes
 * - Desactivar y eliminar configuraciones
 */

import { useState, useEffect, useCallback } from 'react';
import { configuracionApiService } from '../../../data/services/configuracionApiService.js';
import Swal from 'sweetalert2';

export const useConfiguracionManagement = () => {
  const [configuraciones, setConfiguraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  });

  /**
   * Cargar todas las configuraciones activas
   */
  const loadConfiguraciones = useCallback(async (page = 0, size = 10) => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);
      
      const response = await configuracionApiService.getConfiguraciones({ page, size });
      
      setConfiguraciones(response.content || []);
      setPagination({
        page: response.pageable?.pageNumber || 0,
        size: response.size || 10,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      });
    } catch (err) {
      const error = err;
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setConnectionError(true);
        setError('No se pudo conectar con el servicio de configuración. Verifique que el servidor esté ejecutándose.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar configuraciones');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar configuraciones filtradas por tipo
   */
  const loadConfiguracionesByTipo = useCallback(async (tipo, page = 0, size = 10) => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);
      
      const response = await configuracionApiService.getConfiguracionesByTipo(tipo, { page, size });
      
      setConfiguraciones(response.content || []);
      setPagination({
        page: response.pageable?.pageNumber || 0,
        size: response.size || 10,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuraciones por tipo');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener configuración por ID
   */
  const getConfiguracionById = useCallback(async (id) => {
    try {
      setLoading(true);
      const configuracionData = await configuracionApiService.getConfiguracionById(id);
      return configuracionData;
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener configuración por clave
   */
  const getConfiguracionByClave = useCallback(async (clave) => {
    try {
      setLoading(true);
      const configuracionData = await configuracionApiService.getConfiguracionByClave(clave);
      return configuracionData;
    } catch (error) {
      console.error('Error al cargar configuración por clave:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nueva configuración
   */
  const createConfiguracion = useCallback(async (configuracionData) => {
    try {
      setLoading(true);
      
      // Validar datos requeridos
      if (!configuracionData.clave || !configuracionData.jsonData) {
        throw new Error('La clave y los datos JSON son requeridos');
      }

      const result = await configuracionApiService.createConfiguracion(configuracionData);

      await Swal.fire({
        title: '¡Configuración creada!',
        text: 'La configuración ha sido registrada correctamente',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      });

      await loadConfiguraciones();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error al crear configuración:', error);
      await Swal.fire({
        title: 'Error al crear configuración',
        text: error.message || 'Ha ocurrido un error inesperado',
        icon: 'error'
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [loadConfiguraciones]);

  /**
   * Actualizar configuración por ID
   */
  const updateConfiguracion = useCallback(async (id, jsonData) => {
    try {
      setLoading(true);

      const result = await configuracionApiService.updateConfiguracion(id, jsonData);

      await Swal.fire({
        title: '¡Configuración actualizada!',
        text: 'Los cambios han sido guardados correctamente',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      });

      await loadConfiguraciones();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      await Swal.fire({
        title: 'Error al actualizar',
        text: error.message || 'Ha ocurrido un error inesperado',
        icon: 'error'
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [loadConfiguraciones]);

  /**
   * Actualizar configuración por clave
   */
  const updateConfiguracionByClave = useCallback(async (clave, jsonData) => {
    try {
      setLoading(true);

      const result = await configuracionApiService.updateConfiguracionByClave(clave, jsonData);

      await Swal.fire({
        title: '¡Configuración actualizada!',
        text: 'Los cambios han sido guardados correctamente',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      });

      await loadConfiguraciones();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error al actualizar configuración por clave:', error);
      await Swal.fire({
        title: 'Error al actualizar',
        text: error.message || 'Ha ocurrido un error inesperado',
        icon: 'error'
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [loadConfiguraciones]);

  /**
   * Desactivar configuración (soft delete)
   */
  const deactivateConfiguracion = useCallback(async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Desactivar configuración?',
        text: 'La configuración será desactivada pero no eliminada',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, desactivar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        setLoading(true);
        await configuracionApiService.deactivateConfiguracion(id);

        await Swal.fire({
          title: '¡Desactivada!',
          text: 'La configuración ha sido desactivada',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        await loadConfiguraciones();
        return { success: true };
      }

      return { success: false, cancelled: true };
    } catch (error) {
      console.error('Error al desactivar configuración:', error);
      await Swal.fire({
        title: 'Error',
        text: error.message || 'No se pudo desactivar la configuración',
        icon: 'error'
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [loadConfiguraciones]);

  /**
   * Eliminar configuración permanentemente
   */
  const deleteConfiguracion = useCallback(async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Eliminar configuración?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        setLoading(true);
        await configuracionApiService.deleteConfiguracion(id);

        await Swal.fire({
          title: '¡Eliminada!',
          text: 'La configuración ha sido eliminada permanentemente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        await loadConfiguraciones();
        return { success: true };
      }

      return { success: false, cancelled: true };
    } catch (error) {
      console.error('Error al eliminar configuración:', error);
      await Swal.fire({
        title: 'Error',
        text: error.message || 'No se pudo eliminar la configuración',
        icon: 'error'
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  }, [loadConfiguraciones]);

  // Cargar configuraciones al montar el componente
  useEffect(() => {
    loadConfiguraciones();
  }, [loadConfiguraciones]);

  return {
    // Estado
    configuraciones,
    loading,
    error,
    connectionError,
    pagination,

    // Métodos de carga
    loadConfiguraciones,
    loadConfiguracionesByTipo,
    getConfiguracionById,
    getConfiguracionByClave,

    // Métodos CRUD
    createConfiguracion,
    updateConfiguracion,
    updateConfiguracionByClave,
    deactivateConfiguracion,
    deleteConfiguracion
  };
};

export default useConfiguracionManagement;
