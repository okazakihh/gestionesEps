import { useState, useEffect, useCallback } from 'react';
import { empleadosApiService } from '../../../data/services/empleadosApiService';

/**
 * Hook para cargar empleados activos
 * Usado en el selector de empleados del formulario de nómina
 */
export const useEmpleados = () => {
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


      // Cargar empleados con paginación grande para obtener todos
      const response = await empleadosApiService.getEmpleados({
        page: 0,
        size: 1000
      });


      // Mapear empleados para el selector
      const empleadosMapeados = (response.content || [])
        .filter(emp => emp.activo !== false) // Solo empleados activos
        .map(emp => {
          // Parsear jsonData - NIVEL 1
          let datosEmpleado = {};
          if (emp.jsonData) {
            try {
              const primerNivel = JSON.parse(emp.jsonData);
              
              // Parsear el jsonData interno - NIVEL 2
              if (primerNivel.jsonData) {
                const segundoNivel = JSON.parse(primerNivel.jsonData);
                
                // Extraer información de los diferentes niveles
                datosEmpleado = {
                  // Información personal
                  primerNombre: segundoNivel.informacionPersonal?.primerNombre || '',
                  segundoNombre: segundoNivel.informacionPersonal?.segundoNombre || '',
                  primerApellido: segundoNivel.informacionPersonal?.primerApellido || '',
                  segundoApellido: segundoNivel.informacionPersonal?.segundoApellido || '',
                  
                  // Documento del primer nivel
                  numeroDocumento: primerNivel.numeroDocumento || '',
                  tipoDocumento: primerNivel.tipoDocumento || 'CC',
                  
                  // Información laboral
                  cargo: segundoNivel.informacionLaboral?.cargo || '',
                  salario: parseFloat(segundoNivel.informacionLaboral?.salario || 0),
                  tipoContrato: segundoNivel.informacionLaboral?.tipoContrato || '',
                  fechaContratacion: segundoNivel.informacionLaboral?.fechaContratacion || 
                                    segundoNivel.informacionLaboral?.fechaIngreso || '',
                  tipoPersonal: segundoNivel.informacionLaboral?.tipoPersonal || '',
                  especialidad: segundoNivel.informacionLaboral?.especialidad || ''
                };
              }
            } catch (e) {
              console.error('Error parseando jsonData del empleado:', emp.id, e);
            }
          }

          // Construir nombre completo
          const nombreCompleto = [
            datosEmpleado.primerNombre,
            datosEmpleado.segundoNombre,
            datosEmpleado.primerApellido,
            datosEmpleado.segundoApellido
          ].filter(Boolean).join(' ');

          return {
            value: emp.id,
            label: `${nombreCompleto} - ${datosEmpleado.tipoContrato || 'N/A'}`,
            // Guardar toda la información del empleado
            empleado: {
              id: emp.id,
              nombre: datosEmpleado.primerNombre || '',
              segundoNombre: datosEmpleado.segundoNombre || '',
              apellido: datosEmpleado.primerApellido || '',
              segundoApellido: datosEmpleado.segundoApellido || '',
              nombreCompleto,
              documento: datosEmpleado.numeroDocumento || '',
              tipoDocumento: datosEmpleado.tipoDocumento || 'CC',
              tipoContrato: datosEmpleado.tipoContrato || '',
              salario: datosEmpleado.salario || 0,
              cargo: datosEmpleado.cargo || '',
              fechaIngreso: datosEmpleado.fechaContratacion || '',
              tipoPersonal: datosEmpleado.tipoPersonal || '',
              especialidad: datosEmpleado.especialidad || '',
              activo: emp.activo
            }
          };
        });


      setEmpleados(empleadosMapeados);
    } catch (err) {
      console.error('❌ Error cargando empleados:', err);
      setError(err.message || 'Error al cargar empleados');
      setEmpleados([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca un empleado por ID en la lista cargada
   */
  const getEmpleadoById = useCallback((empleadoId) => {
    const empleadoOption = empleados.find(emp => emp.value === empleadoId);
    return empleadoOption?.empleado || null;
  }, [empleados]);

  // Cargar empleados al montar el componente
  useEffect(() => {
    loadEmpleados();
  }, [loadEmpleados]);

  return {
    empleados,
    loading,
    error,
    loadEmpleados,
    getEmpleadoById
  };
};
