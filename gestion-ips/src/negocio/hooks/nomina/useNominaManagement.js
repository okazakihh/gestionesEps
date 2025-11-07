import { useState, useEffect, useCallback } from 'react';
import nominaApiService from '../../../data/services/nominaApiService';

/**
 * Hook para gestión de nóminas
 * Maneja operaciones CRUD, paginación y estado de nóminas
 */
export const useNominaManagement = () => {
  // Estado principal
  const [nominas, setNominas] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Estado de carga y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado de operaciones
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState(null);
  const [operationSuccess, setOperationSuccess] = useState(null);

  /**
   * Carga nóminas activas con paginación
   */
  const loadNominas = useCallback(async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true);
      setError(null);

      const response = await nominaApiService.getNominasActivas({
        page,
        size
      });

      console.log('📋 Nóminas cargadas:', response);

      setNominas(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(page);
      setPageSize(size);
    } catch (err) {
      console.error('❌ Error cargando nóminas:', err);
      setError(err.message || 'Error al cargar nóminas');
      setNominas([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  /**
   * Carga nóminas de un empleado específico
   */
  const loadNominasByEmpleado = useCallback(async (empleadoId, page = 0, size = 10) => {
    try {
      setLoading(true);
      setError(null);

      const response = await nominaApiService.getNominasByEmpleado(empleadoId, {
        page,
        size
      });

      console.log(`📋 Nóminas del empleado ${empleadoId}:`, response);

      setNominas(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(page);
      setPageSize(size);
    } catch (err) {
      console.error('❌ Error cargando nóminas del empleado:', err);
      setError(err.message || 'Error al cargar nóminas del empleado');
      setNominas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene una nómina por ID
   */
  const getNominaById = useCallback(async (id) => {
    try {
      setOperationLoading(true);
      setOperationError(null);

      const nomina = await nominaApiService.getNominaById(id);
      
      console.log('✅ Nómina obtenida:', nomina);
      
      return nomina;
    } catch (err) {
      console.error('❌ Error obteniendo nómina:', err);
      setOperationError(err.message || 'Error al obtener nómina');
      throw err;
    } finally {
      setOperationLoading(false);
    }
  }, []);

  /**
   * Crea una nueva nómina
   */
  const createNomina = useCallback(async (empleadoId, nominaData) => {
    try {
      setOperationLoading(true);
      setOperationError(null);
      setOperationSuccess(null);

      console.log('➕ Creando nómina:', { empleadoId, nominaData });

      const nuevaNomina = await nominaApiService.createNomina(empleadoId, nominaData);
      
      console.log('✅ Nómina creada:', nuevaNomina);
      
      setOperationSuccess('Nómina creada exitosamente');
      
      // Recargar lista
      await loadNominas();
      
      return nuevaNomina;
    } catch (err) {
      console.error('❌ Error creando nómina:', err);
      setOperationError(err.message || 'Error al crear nómina');
      throw err;
    } finally {
      setOperationLoading(false);
    }
  }, [loadNominas]);

  /**
   * Actualiza una nómina existente
   */
  const updateNomina = useCallback(async (id, nominaData) => {
    try {
      setOperationLoading(true);
      setOperationError(null);
      setOperationSuccess(null);

      console.log('✏️ Actualizando nómina:', { id, nominaData });

      const nominaActualizada = await nominaApiService.updateNomina(id, nominaData);
      
      console.log('✅ Nómina actualizada:', nominaActualizada);
      
      setOperationSuccess('Nómina actualizada exitosamente');
      
      // Recargar lista
      await loadNominas();
      
      return nominaActualizada;
    } catch (err) {
      console.error('❌ Error actualizando nómina:', err);
      setOperationError(err.message || 'Error al actualizar nómina');
      throw err;
    } finally {
      setOperationLoading(false);
    }
  }, [loadNominas]);

  /**
   * Desactiva una nómina (soft delete)
   */
  const deactivateNomina = useCallback(async (id) => {
    try {
      setOperationLoading(true);
      setOperationError(null);
      setOperationSuccess(null);

      console.log('🔒 Desactivando nómina:', id);

      await nominaApiService.deactivateNomina(id);
      
      console.log('✅ Nómina desactivada');
      
      setOperationSuccess('Nómina desactivada exitosamente');
      
      // Recargar lista
      await loadNominas();
    } catch (err) {
      console.error('❌ Error desactivando nómina:', err);
      setOperationError(err.message || 'Error al desactivar nómina');
      throw err;
    } finally {
      setOperationLoading(false);
    }
  }, [loadNominas]);

  /**
   * Elimina permanentemente una nómina
   */
  const deleteNomina = useCallback(async (id) => {
    try {
      setOperationLoading(true);
      setOperationError(null);
      setOperationSuccess(null);

      console.log('🗑️ Eliminando nómina:', id);

      await nominaApiService.deleteNomina(id);
      
      console.log('✅ Nómina eliminada');
      
      setOperationSuccess('Nómina eliminada exitosamente');
      
      // Recargar lista
      await loadNominas();
    } catch (err) {
      console.error('❌ Error eliminando nómina:', err);
      setOperationError(err.message || 'Error al eliminar nómina');
      throw err;
    } finally {
      setOperationLoading(false);
    }
  }, [loadNominas]);

  /**
   * Cambia de página
   */
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadNominas(newPage, pageSize);
    }
  }, [loadNominas, pageSize, totalPages]);

  /**
   * Cambia el tamaño de página
   */
  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    loadNominas(0, newSize);
  }, [loadNominas]);

  /**
   * Limpia mensajes de operación
   */
  const clearOperationMessages = useCallback(() => {
    setOperationError(null);
    setOperationSuccess(null);
  }, []);

  // Carga inicial
  useEffect(() => {
    loadNominas(0, pageSize);
  }, []); // Solo carga inicial

  return {
    // Estado
    nominas,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    loading,
    error,
    operationLoading,
    operationError,
    operationSuccess,
    
    // Funciones
    loadNominas,
    loadNominasByEmpleado,
    getNominaById,
    createNomina,
    updateNomina,
    deactivateNomina,
    deleteNomina,
    handlePageChange,
    handlePageSizeChange,
    clearOperationMessages
  };
};
