import { useCallback, useEffect, useState } from 'react';
import { useEmpleadosSelect } from '../nomina/useEmpleadosSelect';
import { disponibilidadApiService } from '../../../data/services/disponibilidadApiService';

// Hook de capa de negocio para disponibilidades médicas
export const useDisponibilidad = () => {
  const { empleadosFormatted, empleados, loading: loadingEmpleados, loadEmpleados } = useEmpleadosSelect();

  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loadingDisponibilidades, setLoadingDisponibilidades] = useState(false);

  const isMedico = (empleado) => {
    if (!empleado) return false;
    const cargo = (empleado.cargo || '').toLowerCase();
    const tipoContrato = (empleado.tipoContrato || '').toLowerCase();
    const nombre = (empleado.nombreCompleto || '').toLowerCase();

    const keywords = ['medic', 'médic', 'doctor', 'dr.', 'dr ', 'especialista', 'cardio', 'gineco', 'pediatr', 'odont', 'salud'];

    for (const kw of keywords) {
      if (cargo.includes(kw) || tipoContrato.includes(kw) || nombre.includes(kw)) return true;
    }

    if (!cargo && (tipoContrato === 'contrato medico' || tipoContrato === 'medico')) return true;

    return false;
  };

  const empleadosMedicosFormatted = empleadosFormatted.filter(e => isMedico(e.empleado));

  const loadDisponibilidades = useCallback(async () => {
    setLoadingDisponibilidades(true);
    try {
      const response = await disponibilidadApiService.getAllDisponibilidades();
      // ¡CORRECCI�"N! Guardar solo los datos (el array), no el objeto de respuesta completo.
      // Esto evita que la referencia del objeto cambie en cada render si los datos son los mismos.
      setDisponibilidades(response.data || []);
    } catch (error) {
      console.error('[useDisponibilidad] Error cargando disponibilidades médicas:', error);
    } finally {
      setLoadingDisponibilidades(false);
    }
  }, []);

  const createDisponibilidad = useCallback(async ({ doctorId, fecha, horaInicio, horaFin, activo = true }) => {
    if (!doctorId) throw new Error('Doctor requerido');
    if (!fecha) throw new Error('Fecha requerida');
    if (!horaInicio || !horaFin) throw new Error('Horas requeridas');
    if (horaFin <= horaInicio) throw new Error('Hora fin debe ser mayor que hora inicio');

    const selected = empleados.find(emp => emp.id?.toString() === doctorId?.toString());
    const nombreDoctor = selected ? selected.nombreCompleto : '';

    const payload = {
      datosJson: JSON.stringify({ doctorId: Number(doctorId), nombreDoctor, fecha, horaInicio, horaFin }),
      activo
    };

    return disponibilidadApiService.createDisponibilidad(payload);
  }, [empleados]);

  return {
    empleadosMedicosFormatted,
    loadingEmpleados,
    loadEmpleados,
    createDisponibilidad,
    disponibilidades,
    loadingDisponibilidades,
    loadDisponibilidades,
    getAllDisponibilidades: disponibilidadApiService.getAllDisponibilidades
  };
};
