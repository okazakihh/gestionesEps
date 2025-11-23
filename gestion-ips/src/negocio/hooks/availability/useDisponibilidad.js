import { useCallback } from 'react';
import { useEmpleadosSelect } from '../nomina/useEmpleadosSelect';
import { disponibilidadApiService } from '../../../data/services/disponibilidadApiService';

// Hook de capa de negocio para disponibilidades médicas
export const useDisponibilidad = () => {
  const { empleadosFormatted, empleados, loading: loadingEmpleados, loadEmpleados } = useEmpleadosSelect();

  const isMedico = (empleado) => {
    if (!empleado) return false;
    const cargo = (empleado.cargo || '').toLowerCase();
    const tipoContrato = (empleado.tipoContrato || '').toLowerCase();
    const nombre = (empleado.nombreCompleto || '').toLowerCase();

    const keywords = ['medic', 'médic', 'doctor', 'dr.', 'dr ', 'especialista', 'cardio', 'gineco', 'pediatr', 'odont', 'salud'];

    // Check cargo and tipoContrato
    for (const kw of keywords) {
      if (cargo.includes(kw) || tipoContrato.includes(kw) || nombre.includes(kw)) return true;
    }

    // If cargo is empty but info suggests clinical role, include conservatively
    if (!cargo && (tipoContrato === 'contrato medico' || tipoContrato === 'medico')) return true;

    return false;
  };

  const empleadosMedicosFormatted = empleadosFormatted.filter(e => isMedico(e.empleado));

  // Log counts to help debugging why only a few medics appear
  try {
    const total = (empleadosFormatted || []).length;
    const medics = empleadosMedicosFormatted.length;
    console.debug(`[useDisponibilidad] empleados total=${total}, detectados_medicos=${medics}`);
  } catch (e) {
    // ignore
  }

  const createDisponibilidad = useCallback(async ({ doctorId, fecha, horaInicio, horaFin, activo = true }) => {
    // Validaciones de negocio básicas
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
    createDisponibilidad
  };
};
