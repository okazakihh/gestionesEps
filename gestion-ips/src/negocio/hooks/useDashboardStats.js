/**
 * useDashboardStats.js
 * 
 * Hook personalizado para gestionar estadísticas del dashboard
 * Maneja el estado y la carga de datos
 * 
 * Capa: Negocio
 */

import { useState, useEffect, useCallback } from 'react';
import dashboardService from '../services/dashboardService';

/**
 * Hook para cargar y gestionar todas las estadísticas del dashboard
 */
export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    general: null,
    distribucionCitas: null,
    procedimientosFrecuentes: [],
    actividadReciente: [],
    ingresosMensuales: [],
    citasProximas: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  /**
   * Cargar todas las estadísticas
   */
  const cargarEstadisticas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos en paralelo para mejor rendimiento
      const [
        general,
        distribucionCitas,
        procedimientosFrecuentes,
        actividadReciente,
        ingresosMensuales,
        citasProximas
      ] = await Promise.all([
        dashboardService.obtenerEstadisticasGenerales(),
        dashboardService.obtenerDistribucionCitas(),
        dashboardService.obtenerProcedimientosFrecuentes(5),
        dashboardService.obtenerActividadReciente(),
        dashboardService.obtenerIngresosMensuales(),
        dashboardService.obtenerCitasProximas()
      ]);

      setStats({
        general,
        distribucionCitas,
        procedimientosFrecuentes,
        actividadReciente,
        ingresosMensuales,
        citasProximas
      });

      setUltimaActualizacion(new Date());
    } catch (err) {
      console.error('Error cargando estadísticas del dashboard:', err);
      setError(err.message || 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar estadísticas al montar el componente
   */
  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  /**
   * Refrescar estadísticas manualmente
   */
  const refrescar = useCallback(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  return {
    stats,
    loading,
    error,
    ultimaActualizacion,
    refrescar
  };
};

export default useDashboardStats;
