import { useState, useCallback, useMemo } from 'react';

/**
 * Hook para gestión del formulario de nómina
 * Maneja validaciones, cálculos automáticos y estado del formulario
 */
export const useNominaForm = (initialData = null) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    empleadoId: initialData?.empleadoId || '',
    periodo: initialData?.periodo || '',
    fechaPago: initialData?.fechaPago || '',
    salarioBase: initialData?.salarioBase || 0,
    horasExtras: initialData?.horasExtras || 0,
    bonificaciones: initialData?.bonificaciones || 0,
    deducciones: initialData?.deducciones || 0,
    observaciones: initialData?.observaciones || '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /**
   * Actualiza un campo del formulario
   */
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error cuando se modifica el campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Marca un campo como tocado
   */
  const touchField = useCallback((field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  }, []);

  /**
   * Cálculos automáticos
   */
  const calculatedValues = useMemo(() => {
    const salarioBase = Number(formData.salarioBase) || 0;
    const horasExtras = Number(formData.horasExtras) || 0;
    const bonificaciones = Number(formData.bonificaciones) || 0;
    const deducciones = Number(formData.deducciones) || 0;

    // Cálculos básicos
    const totalDevengado = salarioBase + horasExtras + bonificaciones;
    const totalDeducciones = deducciones;
    const totalPagar = totalDevengado - totalDeducciones;

    // Cálculos de seguridad social (aproximados)
    const salud = Math.round(salarioBase * 0.04); // 4% empleado
    const pension = Math.round(salarioBase * 0.04); // 4% empleado
    const totalSeguridad = salud + pension;

    return {
      salarioBase,
      horasExtras,
      bonificaciones,
      deducciones,
      totalDevengado,
      totalDeducciones,
      totalPagar,
      salud,
      pension,
      totalSeguridad
    };
  }, [formData.salarioBase, formData.horasExtras, formData.bonificaciones, formData.deducciones]);

  /**
   * Valida el formulario
   */
  const validate = useCallback(() => {
    const newErrors = {};

    // Validar empleado
    if (!formData.empleadoId) {
      newErrors.empleadoId = 'Debe seleccionar un empleado';
    }

    // Validar periodo
    if (!formData.periodo || formData.periodo.trim() === '') {
      newErrors.periodo = 'El periodo es requerido';
    }

    // Validar fecha de pago
    if (!formData.fechaPago) {
      newErrors.fechaPago = 'La fecha de pago es requerida';
    } else {
      const fechaPago = new Date(formData.fechaPago);
      const hoy = new Date();
      if (fechaPago > hoy) {
        newErrors.fechaPago = 'La fecha de pago no puede ser futura';
      }
    }

    // Validar salario base
    if (!formData.salarioBase || Number(formData.salarioBase) <= 0) {
      newErrors.salarioBase = 'El salario base debe ser mayor a 0';
    }

    // Validar valores numéricos no negativos
    if (formData.horasExtras && Number(formData.horasExtras) < 0) {
      newErrors.horasExtras = 'Las horas extras no pueden ser negativas';
    }

    if (formData.bonificaciones && Number(formData.bonificaciones) < 0) {
      newErrors.bonificaciones = 'Las bonificaciones no pueden ser negativas';
    }

    if (formData.deducciones && Number(formData.deducciones) < 0) {
      newErrors.deducciones = 'Las deducciones no pueden ser negativas';
    }

    // Validar que el total a pagar no sea negativo
    if (calculatedValues.totalPagar < 0) {
      newErrors.deducciones = 'Las deducciones no pueden superar el total devengado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, calculatedValues]);

  /**
   * Resetea el formulario
   */
  const resetForm = useCallback(() => {
    setFormData({
      empleadoId: '',
      periodo: '',
      fechaPago: '',
      salarioBase: 0,
      horasExtras: 0,
      bonificaciones: 0,
      deducciones: 0,
      observaciones: ''
    });
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Carga datos en el formulario
   */
  const loadData = useCallback((data) => {
    setFormData({
      empleadoId: data?.empleadoId || '',
      periodo: data?.periodo || '',
      fechaPago: data?.fechaPago || '',
      salarioBase: data?.salarioBase || 0,
      horasExtras: data?.horasExtras || 0,
      bonificaciones: data?.bonificaciones || 0,
      deducciones: data?.deducciones || 0,
      observaciones: data?.observaciones || '',
      ...data
    });
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Obtiene los datos para enviar al backend
   */
  const getSubmitData = useCallback(() => {
    return {
      ...formData,
      salarioBase: Number(formData.salarioBase),
      horasExtras: Number(formData.horasExtras) || 0,
      bonificaciones: Number(formData.bonificaciones) || 0,
      deducciones: Number(formData.deducciones) || 0,
      totalDevengado: calculatedValues.totalDevengado,
      totalDeducciones: calculatedValues.totalDeducciones,
      totalPagar: calculatedValues.totalPagar
    };
  }, [formData, calculatedValues]);

  /**
   * Verifica si el formulario es válido
   */
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  /**
   * Verifica si el formulario ha sido modificado
   */
  const isDirty = useMemo(() => {
    if (!initialData) return Object.keys(touched).length > 0;
    
    return Object.keys(formData).some(key => {
      return formData[key] !== initialData[key];
    });
  }, [formData, initialData, touched]);

  return {
    // Estado del formulario
    formData,
    errors,
    touched,
    
    // Valores calculados
    calculatedValues,
    
    // Estado del formulario
    isValid,
    isDirty,
    
    // Funciones
    updateField,
    touchField,
    validate,
    resetForm,
    loadData,
    getSubmitData
  };
};
