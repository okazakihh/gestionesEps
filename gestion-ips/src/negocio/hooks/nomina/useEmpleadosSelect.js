import { useState, useEffect, useCallback } from 'react';
import { empleadosApiService } from '../../../data/services/empleadosApiService';

/**
 * Hook para cargar y gestionar empleados para el selector
 */
export const useEmpleadosSelect = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carga todos los empleados activos
   */
  const loadEmpleados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar todos los empleados activos
      const response = await empleadosApiService.getEmpleados({
        page: 0,
        size: 1000, // Cargar todos
        activo: true
      });

      console.log('📋 Empleados cargados:', response);

      // Procesar empleados con doble parsing del JSON anidado
      const empleadosRaw = response.content || [];
      
      const empleadosProcessed = empleadosRaw.map(emp => {
        try {
          // PRIMER NIVEL: Parsear el jsonData principal
          const primerNivel = JSON.parse(emp.jsonData);
          
          // SEGUNDO NIVEL: Parsear el jsonData anidado
          const segundoNivel = JSON.parse(primerNivel.jsonData);
          
          // Extraer información personal
          const infoPersonal = segundoNivel.informacionPersonal || {};
          const primerNombre = infoPersonal.primerNombre || '';
          const segundoNombre = infoPersonal.segundoNombre || '';
          const primerApellido = infoPersonal.primerApellido || '';
          const segundoApellido = infoPersonal.segundoApellido || '';
          
          // Construir nombre completo
          const nombreCompleto = [primerNombre, segundoNombre, primerApellido, segundoApellido]
            .filter(Boolean)
            .join(' ');
          
          // Extraer información laboral
          const infoLaboral = segundoNivel.informacionLaboral || {};
          const cargo = infoLaboral.cargo || '';
          const salario = infoLaboral.salario || 0;
          const tipoContrato = infoLaboral.tipoContrato || '';
          const fechaContratacion = infoLaboral.fechaContratacion || '';
          
          // Construir objeto empleado estructurado
          return {
            id: emp.id,
            numeroDocumento: primerNivel.numeroDocumento || '',
            tipoDocumento: primerNivel.tipoDocumento || '',
            nombreCompleto,
            primerNombre,
            segundoNombre,
            primerApellido,
            segundoApellido,
            cargo,
            salario,
            tipoContrato,
            fechaContratacion,
            activo: emp.activo
          };
        } catch (error) {
          console.error('❌ Error parseando empleado:', emp.id, error);
          return {
            id: emp.id,
            numeroDocumento: '',
            tipoDocumento: '',
            nombreCompleto: 'Error al cargar',
            primerNombre: '',
            segundoNombre: '',
            primerApellido: '',
            segundoApellido: '',
            cargo: '',
            salario: 0,
            tipoContrato: '',
            fechaContratacion: '',
            activo: emp.activo
          };
        }
      });

      console.log('✅ Empleados procesados:', empleadosProcessed);
      setEmpleados(empleadosProcessed);
    } catch (err) {
      console.error('❌ Error cargando empleados:', err);
      setError(err.message || 'Error al cargar empleados');
      setEmpleados([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene un empleado por ID
   */
  const getEmpleadoById = useCallback(async (id) => {
    try {
      const empleado = await empleadosApiService.getEmpleadoById(id);
      return empleado;
    } catch (err) {
      console.error('❌ Error obteniendo empleado:', err);
      throw err;
    }
  }, []);

  /**
   * Formatea empleados para el Select de Mantine
   */
  const empleadosFormatted = empleados.map(emp => ({
    value: emp.id?.toString() || '',
    label: `${emp.nombreCompleto} - ${emp.tipoContrato || emp.numeroDocumento}`,
    empleado: emp // Guardamos el objeto completo procesado para acceso fácil
  }));

  // Carga inicial
  useEffect(() => {
    loadEmpleados();
  }, [loadEmpleados]);

  return {
    empleados,
    empleadosFormatted,
    loading,
    error,
    loadEmpleados,
    getEmpleadoById
  };
};
