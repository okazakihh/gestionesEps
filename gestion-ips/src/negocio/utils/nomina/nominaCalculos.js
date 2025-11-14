/**
 * nominaCalculos.js
 * 
 * Cálculos de nómina según normativa colombiana 2025
 * Actualizado a Noviembre 2025
 */

import { configuracionApiService } from '../../../data/services/configuracionApiService.js';

// ========== CACHE DE CONFIGURACIÓN ==========

let cachedNominaConfig = null;

/**
 * Obtener configuración de nómina (con cache)
 */
export const getNominaConfig = async () => {
  if (cachedNominaConfig) return cachedNominaConfig;
  
  try {
    const config = await configuracionApiService.getConfiguracionByClave('NOMINA');
    if (config && config.jsonData) {
      cachedNominaConfig = config.jsonData;
      return cachedNominaConfig;
    }
  } catch (error) {
    console.warn('No se pudo cargar NOMINA, usando configuración por defecto');
  }
  
  // Configuración por defecto
  return {
    salarioMinimo: 1300000,
    auxilioTransporte: 162000,
    porcentajeSalud: 4.0,
    porcentajePension: 4.0,
    diasPeriodo: 30,
    horasLaboralesDia: 8,
    horasLaboralesSemana: 48,
    recargoNocturno: 35,
    recargoFestivo: 75,
    horaExtraDiurna: 25,
    horaExtraNocturna: 75,
    horaExtraFestivaDiurna: 100,
    horaExtraFestivaNocturna: 150
  };
};

/**
 * Limpiar cache (útil cuando se actualiza la configuración)
 */
export const clearNominaConfigCache = () => {
  cachedNominaConfig = null;
};

// ========== CONSTANTES 2025 (Ahora deprecadas, usar getNominaConfig) ==========

/**
 * @deprecated Usar getNominaConfig().salarioMinimo
 * Salario Mínimo Legal Mensual Vigente (SMLMV) 2025
 */
export const SMLMV_2025 = 1423500;

/**
 * @deprecated Usar getNominaConfig().auxilioTransporte
 * Auxilio de transporte 2025
 */
export const AUXILIO_TRANSPORTE_2025 = 200000;

/**
 * Límite para aplicar auxilio de transporte
 */
export const LIMITE_AUXILIO_TRANSPORTE = SMLMV_2025 * 2;

/**
 * Unidad de Valor Tributario (UVT) 2025
 */
export const UVT_2025 = 47065;

/**
 * Porcentajes de seguridad social
 */
export const PORCENTAJES_SEGURIDAD_SOCIAL = {
  // Salud - Empleado (ahora se obtiene de configuración)
  SALUD_EMPLEADO: 0.04, // 4%
  // Pensión - Empleado (ahora se obtiene de configuración)
  PENSION_EMPLEADO: 0.04, // 4%
  // Salud - Empleador
  SALUD_EMPLEADOR: 0.085, // 8.5%
  // Pensión - Empleador
  PENSION_EMPLEADOR: 0.12, // 12%
  // ARL - Empleador (nivel de riesgo I)
  ARL_MINIMO: 0.00522, // 0.522%
  ARL_MAXIMO: 0.0696 // 6.96%
};

/**
 * Porcentajes parafiscales (aplican para empresas con ciertos criterios)
 */
export const PORCENTAJES_PARAFISCALES = {
  SENA: 0.02, // 2%
  ICBF: 0.03, // 3%
  CAJA_COMPENSACION: 0.04 // 4%
};

// ========== FUNCIONES DE CÁLCULO ==========

/**
 * Calcula si aplica auxilio de transporte
 */
export const aplicaAuxilioTransporte = async (salarioBase) => {
  const config = await getNominaConfig();
  return salarioBase <= (config.salarioMinimo * 2);
};

/**
 * Calcula el auxilio de transporte
 */
export const calcularAuxilioTransporte = async (salarioBase) => {
  const config = await getNominaConfig();
  const aplica = await aplicaAuxilioTransporte(salarioBase);
  return aplica ? config.auxilioTransporte : 0;
};

/**
 * Calcula la base de cotización para seguridad social
 * Base = Salario + Auxilio de transporte (si aplica)
 */
export const calcularBaseCotizacion = async (salarioBase) => {
  const auxilioTransporte = await calcularAuxilioTransporte(salarioBase);
  return salarioBase + auxilioTransporte;
};

/**
 * Calcula deducciones de salud (empleado)
 */
export const calcularSalud = async (salarioBase) => {
  const config = await getNominaConfig();
  return Math.round(salarioBase * (config.porcentajeSalud / 100));
};

/**
 * Calcula deducciones de pensión (empleado)
 */
export const calcularPension = async (salarioBase) => {
  const config = await getNominaConfig();
  return Math.round(salarioBase * (config.porcentajePension / 100));
};

/**
 * Calcula total deducciones de seguridad social (empleado)
 */
export const calcularDeduccionesSeguridad = async (salarioBase) => {
  const salud = await calcularSalud(salarioBase);
  const pension = await calcularPension(salarioBase);
  return salud + pension;
};

/**
 * Calcula aportes del empleador
 */
export const calcularAportesEmpleador = (salarioBase, nivelRiesgoARL = 1) => {
  const salud = Math.round(salarioBase * PORCENTAJES_SEGURIDAD_SOCIAL.SALUD_EMPLEADOR);
  const pension = Math.round(salarioBase * PORCENTAJES_SEGURIDAD_SOCIAL.PENSION_EMPLEADOR);
  
  // ARL según nivel de riesgo (por defecto nivel I)
  const porcentajeARL = PORCENTAJES_SEGURIDAD_SOCIAL.ARL_MINIMO;
  const arl = Math.round(salarioBase * porcentajeARL);
  
  return {
    salud,
    pension,
    arl,
    total: salud + pension + arl
  };
};

/**
 * Calcula valor de horas extras diurnas (25% recargo)
 */
export const calcularHoraExtraDiurna = (salarioBase, horasExtrasDiurnas = 0) => {
  const valorHoraOrdinaria = salarioBase / 240; // 30 días * 8 horas
  const valorHoraExtraDiurna = valorHoraOrdinaria * 1.25;
  return Math.round(valorHoraExtraDiurna * horasExtrasDiurnas);
};

/**
 * Calcula valor de horas extras nocturnas (75% recargo)
 */
export const calcularHoraExtraNocturna = (salarioBase, horasExtrasNocturnas = 0) => {
  const valorHoraOrdinaria = salarioBase / 240;
  const valorHoraExtraNocturna = valorHoraOrdinaria * 1.75;
  return Math.round(valorHoraExtraNocturna * horasExtrasNocturnas);
};

/**
 * Calcula valor de horas extras dominicales/festivas (100% recargo)
 */
export const calcularHoraExtraDominical = (salarioBase, horasExtrasDominicales = 0) => {
  const valorHoraOrdinaria = salarioBase / 240;
  const valorHoraExtraDominical = valorHoraOrdinaria * 2.0;
  return Math.round(valorHoraExtraDominical * horasExtrasDominicales);
};

/**
 * Calcula recargo nocturno (35% del valor hora ordinaria)
 */
export const calcularRecargoNocturno = (salarioBase, horasRecargoNocturno = 0) => {
  const valorHoraOrdinaria = salarioBase / 240;
  const valorRecargoNocturno = valorHoraOrdinaria * 0.35;
  return Math.round(valorRecargoNocturno * horasRecargoNocturno);
};

/**
 * Calcula recargo dominical/festivo (75% adicional)
 */
export const calcularRecargoDominical = (salarioBase, horasRecargoDominical = 0) => {
  const valorHoraOrdinaria = salarioBase / 240;
  const valorRecargoDominical = valorHoraOrdinaria * 0.75;
  return Math.round(valorRecargoDominical * horasRecargoDominical);
};

/**
 * Calcula nómina completa
 */
export const calcularNominaCompleta = async (datos) => {
  const {
    salarioBase = 0,
    horasExtrasDiurnas = 0,
    horasExtrasNocturnas = 0,
    horasExtrasDominicales = 0,
    horasRecargoNocturno = 0,
    horasRecargoDominical = 0,
    bonificaciones = 0,
    comisiones = 0,
    otrosIngresos = 0,
    prestamos = 0,
    embargos = 0,
    otrasDeducciones = 0,
    diasTrabajados = 30
  } = datos;

  // Ajustar salario si no trabajó todos los días
  const salarioAjustado = diasTrabajados < 30 
    ? Math.round((salarioBase / 30) * diasTrabajados)
    : salarioBase;

  // DEVENGADOS
  const auxilioTransporte = await calcularAuxilioTransporte(salarioBase);
  const valorHorasExtrasDiurnas = calcularHoraExtraDiurna(salarioBase, horasExtrasDiurnas);
  const valorHorasExtrasNocturnas = calcularHoraExtraNocturna(salarioBase, horasExtrasNocturnas);
  const valorHorasExtrasDominicales = calcularHoraExtraDominical(salarioBase, horasExtrasDominicales);
  const valorRecargoNocturno = calcularRecargoNocturno(salarioBase, horasRecargoNocturno);
  const valorRecargoDominical = calcularRecargoDominical(salarioBase, horasRecargoDominical);

  const totalDevengado = 
    salarioAjustado +
    auxilioTransporte +
    valorHorasExtrasDiurnas +
    valorHorasExtrasNocturnas +
    valorHorasExtrasDominicales +
    valorRecargoNocturno +
    valorRecargoDominical +
    bonificaciones +
    comisiones +
    otrosIngresos;

  // DEDUCCIONES
  const salud = await calcularSalud(salarioAjustado);
  const pension = await calcularPension(salarioAjustado);
  const totalDeduccionesSeguridad = salud + pension;
  const totalOtrasDeducciones = prestamos + embargos + otrasDeducciones;
  const totalDeducciones = totalDeduccionesSeguridad + totalOtrasDeducciones;

  // NETO A PAGAR
  const netoPagar = totalDevengado - totalDeducciones;

  // APORTES EMPLEADOR
  const aportesEmpleador = calcularAportesEmpleador(salarioAjustado);

  return {
    // Devengados
    salarioBase: salarioAjustado,
    salarioProporcional: salarioAjustado, // Salario ajustado por días trabajados
    auxilioTransporte,
    horasExtras: {
      diurnas: valorHorasExtrasDiurnas,
      nocturnas: valorHorasExtrasNocturnas,
      dominicales: valorHorasExtrasDominicales
    },
    recargos: {
      nocturno: valorRecargoNocturno,
      dominical: valorRecargoDominical
    },
    bonificaciones,
    comisiones,
    otrosIngresos,
    totalDevengado,

    // Deducciones
    deducciones: {
      salud,
      pension,
      prestamos,
      embargos,
      otras: otrasDeducciones,
      total: totalDeducciones
    },

    // Neto
    netoPagar,

    // Info empleador
    aportesEmpleador,
    
    // Información adicional
    diasTrabajados,
    aplicaAuxilioTransporte: aplicaAuxilioTransporte(salarioBase)
  };
};

/**
 * Formatea valor en pesos colombianos
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0);
};
