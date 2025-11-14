import { useState, useCallback, useMemo, useEffect } from 'react';
import { calcularNominaCompleta } from '../../utils/nomina/nominaCalculos';

/**
 * Genera el periodo automático en formato YYYY-MM
 */
const generarPeriodoActual = () => {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Genera la fecha de pago automática (último día del mes actual)
 */
const generarFechaPagoActual = () => {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = fecha.getMonth();
  // Último día del mes
  const ultimoDia = new Date(year, month + 1, 0);
  const mes = String(ultimoDia.getMonth() + 1).padStart(2, '0');
  const dia = String(ultimoDia.getDate()).padStart(2, '0');
  return `${ultimoDia.getFullYear()}-${mes}-${dia}`;
};

/**
 * Hook para gestión del formulario de nómina
 * Maneja validaciones, cálculos automáticos y estado del formulario
 */
export const useNominaForm = (initialData = null) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    empleadoId: initialData?.empleadoId || '',
    periodo: initialData?.periodo || generarPeriodoActual(),
    fechaPago: initialData?.fechaPago || generarFechaPagoActual(),
    salarioBase: initialData?.salarioBase || 0,
    diasTrabajados: initialData?.diasTrabajados || 30,
    horasExtrasDiurnas: initialData?.horasExtrasDiurnas || 0,
    horasExtrasNocturnas: initialData?.horasExtrasNocturnas || 0,
    horasExtrasDominicales: initialData?.horasExtrasDominicales || 0,
    horasRecargoNocturno: initialData?.horasRecargoNocturno || 0,
    horasRecargoDominical: initialData?.horasRecargoDominical || 0,
    bonificaciones: initialData?.bonificaciones || 0,
    comisiones: initialData?.comisiones || 0,
    otrosIngresos: initialData?.otrosIngresos || 0,
    prestamos: initialData?.prestamos || 0,
    embargos: initialData?.embargos || 0,
    otrasDeducciones: initialData?.otrasDeducciones || 0,
    observaciones: initialData?.observaciones || '',
    // Datos del empleado (solo lectura)
    empleadoNombre: initialData?.empleadoNombre || '',
    empleadoDocumento: initialData?.empleadoDocumento || '',
    tipoContrato: initialData?.tipoContrato || '',
    cargo: initialData?.cargo || '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [calculatedValues, setCalculatedValues] = useState({
    salarioBase: 0,
    salarioProporcional: 0,
    auxilioTransporte: 0,
    horasExtras: { diurnas: 0, nocturnas: 0, dominicales: 0 },
    recargos: { nocturno: 0, dominical: 0 },
    bonificaciones: 0,
    comisiones: 0,
    otrosIngresos: 0,
    totalDevengado: 0,
    deducciones: { salud: 0, pension: 0, prestamos: 0, embargos: 0, otras: 0, total: 0 },
    netoPagar: 0,
    aportesEmpleador: {},
    diasTrabajados: 30,
    aplicaAuxilioTransporte: false
  });

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
   * Carga información del empleado seleccionado al formulario
   */
  const loadEmpleadoData = useCallback((empleado) => {
    if (!empleado) return;

    setFormData(prev => ({
      ...prev,
      empleadoId: empleado.id,
      empleadoNombre: empleado.nombreCompleto || '',
      empleadoDocumento: empleado.numeroDocumento || '',
      salarioBase: empleado.salario || 0,
      tipoContrato: empleado.tipoContrato || '',
      cargo: empleado.cargo || '',
      // Si no hay periodo/fecha, establecer valores automáticos
      periodo: prev.periodo || generarPeriodoActual(),
      fechaPago: prev.fechaPago || generarFechaPagoActual()
    }));
  }, []);

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
   * Cálculos automáticos usando normativa colombiana 2025
   */
  useEffect(() => {
    const calcular = async () => {
      try {
        const resultado = await calcularNominaCompleta({
          salarioBase: Number(formData.salarioBase) || 0,
          diasTrabajados: Number(formData.diasTrabajados) || 30,
          horasExtrasDiurnas: Number(formData.horasExtrasDiurnas) || 0,
          horasExtrasNocturnas: Number(formData.horasExtrasNocturnas) || 0,
          horasExtrasDominicales: Number(formData.horasExtrasDominicales) || 0,
          horasRecargoNocturno: Number(formData.horasRecargoNocturno) || 0,
          horasRecargoDominical: Number(formData.horasRecargoDominical) || 0,
          bonificaciones: Number(formData.bonificaciones) || 0,
          comisiones: Number(formData.comisiones) || 0,
          otrosIngresos: Number(formData.otrosIngresos) || 0,
          prestamos: Number(formData.prestamos) || 0,
          embargos: Number(formData.embargos) || 0,
          otrasDeducciones: Number(formData.otrasDeducciones) || 0
        });
        console.log('💰 Cálculo de nómina:', {
          salarioBase: formData.salarioBase,
          diasTrabajados: formData.diasTrabajados,
          resultado
        });
        setCalculatedValues(resultado);
      } catch (error) {
        console.error('❌ Error calculando nómina:', error);
      }
    };
    
    calcular();
  }, [
    formData.salarioBase,
    formData.diasTrabajados,
    formData.horasExtrasDiurnas,
    formData.horasExtrasNocturnas,
    formData.horasExtrasDominicales,
    formData.horasRecargoNocturno,
    formData.horasRecargoDominical,
    formData.bonificaciones,
    formData.comisiones,
    formData.otrosIngresos,
    formData.prestamos,
    formData.embargos,
    formData.otrasDeducciones
  ]);

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

    // Validar días trabajados
    if (formData.diasTrabajados && (Number(formData.diasTrabajados) < 1 || Number(formData.diasTrabajados) > 31)) {
      newErrors.diasTrabajados = 'Los días trabajados deben estar entre 1 y 31';
    }

    // Validar valores numéricos no negativos
    const camposNumericos = [
      'horasExtrasDiurnas',
      'horasExtrasNocturnas', 
      'horasExtrasDominicales',
      'horasRecargoNocturno',
      'horasRecargoDominical',
      'bonificaciones',
      'comisiones',
      'otrosIngresos',
      'prestamos',
      'embargos',
      'otrasDeducciones'
    ];

    camposNumericos.forEach(campo => {
      if (formData[campo] && Number(formData[campo]) < 0) {
        newErrors[campo] = 'El valor no puede ser negativo';
      }
    });

    // Validar que el total a pagar no sea negativo
    if (calculatedValues.netoPagar < 0) {
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
      empleadoNombre: '',
      empleadoDocumento: '',
      tipoContrato: '',
      cargo: '',
      periodo: generarPeriodoActual(),
      fechaPago: generarFechaPagoActual(),
      salarioBase: 0,
      diasTrabajados: 30,
      horasExtrasDiurnas: 0,
      horasExtrasNocturnas: 0,
      horasExtrasDominicales: 0,
      horasRecargoNocturno: 0,
      horasRecargoDominical: 0,
      bonificaciones: 0,
      comisiones: 0,
      otrosIngresos: 0,
      prestamos: 0,
      embargos: 0,
      otrasDeducciones: 0,
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
      empleadoNombre: data?.empleadoNombre || '',
      empleadoDocumento: data?.empleadoDocumento || '',
      tipoContrato: data?.tipoContrato || '',
      cargo: data?.cargo || '',
      periodo: data?.periodo || '',
      fechaPago: data?.fechaPago || '',
      salarioBase: data?.salarioBase || 0,
      diasTrabajados: data?.diasTrabajados || 30,
      horasExtrasDiurnas: data?.horasExtrasDiurnas || 0,
      horasExtrasNocturnas: data?.horasExtrasNocturnas || 0,
      horasExtrasDominicales: data?.horasExtrasDominicales || 0,
      horasRecargoNocturno: data?.horasRecargoNocturno || 0,
      horasRecargoDominical: data?.horasRecargoDominical || 0,
      bonificaciones: data?.bonificaciones || 0,
      comisiones: data?.comisiones || 0,
      otrosIngresos: data?.otrosIngresos || 0,
      prestamos: data?.prestamos || 0,
      embargos: data?.embargos || 0,
      otrasDeducciones: data?.otrasDeducciones || 0,
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
      empleadoId: Number(formData.empleadoId),
      periodo: formData.periodo,
      fechaPago: formData.fechaPago,
      salarioBase: Number(formData.salarioBase),
      diasTrabajados: Number(formData.diasTrabajados),
      horasExtrasDiurnas: Number(formData.horasExtrasDiurnas) || 0,
      horasExtrasNocturnas: Number(formData.horasExtrasNocturnas) || 0,
      horasExtrasDominicales: Number(formData.horasExtrasDominicales) || 0,
      horasRecargoNocturno: Number(formData.horasRecargoNocturno) || 0,
      horasRecargoDominical: Number(formData.horasRecargoDominical) || 0,
      bonificaciones: Number(formData.bonificaciones) || 0,
      comisiones: Number(formData.comisiones) || 0,
      otrosIngresos: Number(formData.otrosIngresos) || 0,
      auxilioTransporte: calculatedValues.auxilioTransporte,
      deduccionSalud: calculatedValues.deducciones.salud,
      deduccionPension: calculatedValues.deducciones.pension,
      prestamos: Number(formData.prestamos) || 0,
      embargos: Number(formData.embargos) || 0,
      otrasDeducciones: Number(formData.otrasDeducciones) || 0,
      totalDevengado: calculatedValues.totalDevengado,
      totalDeducciones: calculatedValues.totalDeducciones,
      netoPagar: calculatedValues.netoPagar,
      observaciones: formData.observaciones || ''
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
    loadEmpleadoData,
    getSubmitData
  };
};
