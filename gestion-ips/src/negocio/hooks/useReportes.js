/**
 * useReportes.js
 * 
 * Hook personalizado para gestionar reportes
 * Maneja el estado y generación de reportes
 * 
 * Capa: Negocio
 */

import { useState, useCallback } from 'react';
import reportesService from '../services/reportesService';

/**
 * Hook para gestionar reportes del sistema
 */
export const useReportes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Reportes generados
  const [reporteFacturacion, setReporteFacturacion] = useState(null);
  const [reporteCitas, setReporteCitas] = useState(null);
  const [reportePacientes, setReportePacientes] = useState(null);
  const [reporteComparativo, setReporteComparativo] = useState(null);

  /**
   * Generar reporte de facturación
   */
  const generarReporteFacturacion = useCallback(async (fechaInicio, fechaFin) => {
    try {
      setLoading(true);
      setError(null);
      const reporte = await reportesService.obtenerReporteFacturacion(fechaInicio, fechaFin);
      setReporteFacturacion(reporte);
      return reporte;
    } catch (err) {
      console.error('Error generando reporte de facturación:', err);
      setError(err.message || 'Error al generar el reporte');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generar reporte de citas
   */
  const generarReporteCitas = useCallback(async (fechaInicio, fechaFin) => {
    try {
      setLoading(true);
      setError(null);
      const reporte = await reportesService.obtenerReporteCitas(fechaInicio, fechaFin);
      setReporteCitas(reporte);
      return reporte;
    } catch (err) {
      console.error('Error generando reporte de citas:', err);
      setError(err.message || 'Error al generar el reporte');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generar reporte de pacientes
   */
  const generarReportePacientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const reporte = await reportesService.obtenerReportePacientes();
      setReportePacientes(reporte);
      return reporte;
    } catch (err) {
      console.error('Error generando reporte de pacientes:', err);
      setError(err.message || 'Error al generar el reporte');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generar reporte comparativo de ingresos
   */
  const generarReporteComparativo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const reporte = await reportesService.obtenerReporteComparativoIngresos();
      setReporteComparativo(reporte);
      return reporte;
    } catch (err) {
      console.error('Error generando reporte comparativo:', err);
      setError(err.message || 'Error al generar el reporte');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Exportar reporte a Excel
   */
  const exportarExcel = useCallback((datos, nombreArchivo, tipo) => {
    try {
      reportesService.exportarReporteExcel(datos, nombreArchivo, tipo);
      return true;
    } catch (err) {
      console.error('Error exportando reporte:', err);
      setError(err.message || 'Error al exportar el reporte');
      throw err;
    }
  }, []);

  /**
   * Limpiar reportes
   */
  const limpiarReportes = useCallback(() => {
    setReporteFacturacion(null);
    setReporteCitas(null);
    setReportePacientes(null);
    setReporteComparativo(null);
    setError(null);
  }, []);

  return {
    // Estados
    loading,
    error,
    reporteFacturacion,
    reporteCitas,
    reportePacientes,
    reporteComparativo,
    
    // Funciones
    generarReporteFacturacion,
    generarReporteCitas,
    generarReportePacientes,
    generarReporteComparativo,
    exportarExcel,
    limpiarReportes
  };
};

export default useReportes;
