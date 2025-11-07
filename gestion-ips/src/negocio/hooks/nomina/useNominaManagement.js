import { useState, useEffect, useCallback } from 'react';
import nominaApiService from '../../../data/services/nominaApiService';
import { empleadosApiService } from '../../../data/services/empleadosApiService';
import Swal from 'sweetalert2';

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

  // Cache de empleados
  const [cacheEmpleados, setCacheEmpleados] = useState(new Map());

  /**
   * Obtiene información de un empleado usando cache
   */
  const getEmpleadoInfo = useCallback(async (empleadoId) => {
    if (cacheEmpleados.has(empleadoId)) {
      return cacheEmpleados.get(empleadoId);
    }

    try {
      const empleado = await empleadosApiService.getEmpleadoById(empleadoId);
      
      // Parsear el doble JSON del empleado
      const primerNivel = JSON.parse(empleado.jsonData || '{}');
      const segundoNivel = JSON.parse(primerNivel.jsonData || '{}');
      
      const infoPersonal = segundoNivel.informacionPersonal || {};
      const nombreCompleto = [
        infoPersonal.primerNombre,
        infoPersonal.segundoNombre,
        infoPersonal.primerApellido,
        infoPersonal.segundoApellido
      ].filter(Boolean).join(' ');

      const empleadoInfo = {
        nombreCompleto: nombreCompleto || 'Sin nombre',
        numeroDocumento: primerNivel.numeroDocumento || '-'
      };

      // Guardar en cache
      setCacheEmpleados(prev => {
        const newCache = new Map(prev);
        newCache.set(empleadoId, empleadoInfo);
        return newCache;
      });

      return empleadoInfo;
    } catch (error) {
      console.warn(`Error cargando empleado ${empleadoId}:`, error);
      return { nombreCompleto: 'Sin nombre', numeroDocumento: '-' };
    }
  }, [cacheEmpleados]);

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

      // Parsear jsonData de cada nómina y enriquecer con info del empleado
      const nominasParsed = await Promise.all(
        (response.content || []).map(async (nomina) => {
          try {
            // Parsear el jsonData que contiene los detalles de la nómina
            const datosNomina = JSON.parse(nomina.jsonData || '{}');
            
            // Obtener información del empleado
            const empleadoInfo = await getEmpleadoInfo(nomina.empleadoId);
            
            return {
              ...nomina,
              // Datos parseados del JSON
              ...datosNomina,
              // Mantener los campos del objeto original
              id: nomina.id,
              empleadoId: nomina.empleadoId,
              activo: nomina.activo,
              fechaCreacion: nomina.fechaCreacion,
              fechaActualizacion: nomina.fechaActualizacion,
              // Agregar información del empleado
              empleadoNombre: empleadoInfo.nombreCompleto,
              empleadoDocumento: empleadoInfo.numeroDocumento
            };
          } catch (error) {
            console.error('❌ Error parseando nómina:', nomina.id, error);
            return nomina; // Devolver la nómina sin parsear si hay error
          }
        })
      );

      console.log('✅ Nóminas procesadas:', nominasParsed);

      setNominas(nominasParsed);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(page);
      setPageSize(size);
    } catch (err) {
      console.error('❌ Error cargando nóminas:', err);
      const errorMessage = err.message || 'Error al cargar nóminas';
      setError(errorMessage);
      setNominas([]);
      
      // Mostrar alerta de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al Cargar Nóminas',
        text: errorMessage,
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, getEmpleadoInfo]);

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

      // Obtener información del empleado una sola vez
      const empleadoInfo = await getEmpleadoInfo(empleadoId);

      // Parsear jsonData de cada nómina
      const nominasParsed = (response.content || []).map(nomina => {
        try {
          const datosNomina = JSON.parse(nomina.jsonData || '{}');
          return {
            ...nomina,
            ...datosNomina,
            id: nomina.id,
            empleadoId: nomina.empleadoId,
            activo: nomina.activo,
            fechaCreacion: nomina.fechaCreacion,
            fechaActualizacion: nomina.fechaActualizacion,
            empleadoNombre: empleadoInfo.nombreCompleto,
            empleadoDocumento: empleadoInfo.numeroDocumento
          };
        } catch (error) {
          console.error('❌ Error parseando nómina:', nomina.id, error);
          return nomina;
        }
      });

      setNominas(nominasParsed);
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
  }, [getEmpleadoInfo]);

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
      
      // Mostrar alerta de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Nómina Creada!',
        text: 'La nómina se ha registrado exitosamente',
        confirmButtonColor: '#10B981',
        timer: 2000,
        timerProgressBar: true
      });
      
      setOperationSuccess('Nómina creada exitosamente');
      
      // Recargar lista
      await loadNominas();
      
      return nuevaNomina;
    } catch (err) {
      console.error('❌ Error creando nómina:', err);
      const errorMessage = err.message || 'Error al crear nómina';
      setOperationError(errorMessage);
      
      // Mostrar alerta de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al Crear Nómina',
        text: errorMessage,
        confirmButtonColor: '#EF4444'
      });
      
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
      
      // Mostrar alerta de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Nómina Actualizada!',
        text: 'Los cambios se han guardado correctamente',
        confirmButtonColor: '#10B981',
        timer: 2000,
        timerProgressBar: true
      });
      
      setOperationSuccess('Nómina actualizada exitosamente');
      
      // Recargar lista
      await loadNominas();
      
      return nominaActualizada;
    } catch (err) {
      console.error('❌ Error actualizando nómina:', err);
      const errorMessage = err.message || 'Error al actualizar nómina';
      setOperationError(errorMessage);
      
      // Mostrar alerta de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al Actualizar Nómina',
        text: errorMessage,
        confirmButtonColor: '#EF4444'
      });
      
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
      
      // Mostrar alerta de éxito
      await Swal.fire({
        icon: 'success',
        title: 'Nómina Desactivada',
        text: 'La nómina ha sido desactivada',
        confirmButtonColor: '#10B981',
        timer: 2000,
        timerProgressBar: true
      });
      
      setOperationSuccess('Nómina desactivada exitosamente');
      
      // Recargar lista
      await loadNominas();
    } catch (err) {
      console.error('❌ Error desactivando nómina:', err);
      const errorMessage = err.message || 'Error al desactivar nómina';
      setOperationError(errorMessage);
      
      // Mostrar alerta de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al Desactivar',
        text: errorMessage,
        confirmButtonColor: '#EF4444'
      });
      
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
      
      // Mostrar alerta de éxito
      await Swal.fire({
        icon: 'success',
        title: 'Nómina Eliminada',
        text: 'La nómina ha sido eliminada permanentemente',
        confirmButtonColor: '#10B981',
        timer: 2000,
        timerProgressBar: true
      });
      
      setOperationSuccess('Nómina eliminada exitosamente');
      
      // Recargar lista
      await loadNominas();
    } catch (err) {
      console.error('❌ Error eliminando nómina:', err);
      const errorMessage = err.message || 'Error al eliminar nómina';
      setOperationError(errorMessage);
      
      // Mostrar alerta de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al Eliminar',
        text: errorMessage,
        confirmButtonColor: '#EF4444'
      });
      
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
