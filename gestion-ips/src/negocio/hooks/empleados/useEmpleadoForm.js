import { useState } from 'react';
import { getInitialFormData } from '../../utils/empleados/empleadoValidator.js';
import { parseEmpleadoData } from '../../utils/empleados/empleadoParser.js';

/**
 * Hook para manejar el estado del formulario de empleado
 * Capa de negocio - No contiene JSX
 */
export const useEmpleadoForm = () => {
  const [formData, setFormData] = useState(getInitialFormData());

  // Resetear formulario
  const resetForm = () => {
    setFormData(getInitialFormData());
  };

  // Actualizar campo del formulario
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Actualizar múltiples campos
  const updateFields = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  // Cargar datos de empleado en el formulario
  const loadEmpleadoData = (empleadoData) => {
    const parsed = parseEmpleadoData(empleadoData);

    setFormData({
      numeroDocumento: parsed.numeroDocumento || '',
      tipoDocumento: parsed.tipoDocumento || 'CC',
      primerNombre: parsed.informacionPersonal.primerNombre || '',
      segundoNombre: parsed.informacionPersonal.segundoNombre || '',
      primerApellido: parsed.informacionPersonal.primerApellido || '',
      segundoApellido: parsed.informacionPersonal.segundoApellido || '',
      fechaNacimiento: parsed.informacionPersonal.fechaNacimiento || '',
      genero: parsed.informacionPersonal.genero || 'MASCULINO',
      telefono: parsed.informacionContacto.telefono || '',
      email: parsed.informacionContacto.email || '',
      direccion: parsed.informacionContacto.direccion || '',
      ciudad: parsed.informacionContacto.ciudad || '',
      departamento: parsed.informacionContacto.departamento || '',
      pais: parsed.informacionContacto.pais || 'Colombia',
      tipoPersonal: parsed.informacionLaboral.tipoPersonal || '',
      tipoMedico: parsed.informacionLaboral.tipoMedico || '',
      especialidad: parsed.informacionLaboral.especialidad || '',
      numeroLicencia: parsed.informacionLaboral.numeroLicencia || '',
      dependencia: parsed.informacionLaboral.dependencia || '',
      cargo: parsed.informacionLaboral.cargo || '',
      salario: parsed.informacionLaboral.salario || '',
      fechaIngreso: parsed.informacionLaboral.fechaIngreso || '',
      fechaContratacion: parsed.informacionLaboral.fechaContratacion || '',
      tipoContrato: parsed.informacionLaboral.tipoContrato || 'INDEFINIDO'
    });
  };

  return {
    formData,
    setFormData,
    resetForm,
    updateField,
    updateFields,
    loadEmpleadoData
  };
};

export default useEmpleadoForm;
