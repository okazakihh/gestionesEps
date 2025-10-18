import { useState, useEffect } from 'react';
import { pacientesApiService } from '../../data/services/pacientesApiService';

/**
 * Hook para gestión de citas médicas
 */
export const useCitas = (searchParams = {}) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});

  const loadCitas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pacientesApiService.getCitasPendientes(searchParams);
      console.log('📋 Citas cargadas desde API:', response);
      console.log('📋 Total de citas:', response.content?.length || 0);
      
      // Parsear datosJson de cada cita
      const citasParsed = (response.content || []).map(cita => {
        try {
          if (cita.datosJson) {
            const datosJson = typeof cita.datosJson === 'string' 
              ? JSON.parse(cita.datosJson) 
              : cita.datosJson;
            
            // Extraer fecha y hora de fechaHoraCita
            let fecha = null;
            let horaInicio = null;
            let horaFin = null;
            
            if (cita.fechaHoraCita || datosJson.fechaHoraCita) {
              const fechaHoraCita = cita.fechaHoraCita || datosJson.fechaHoraCita;
              // fechaHoraCita viene en formato "2025-10-16T08:00"
              const [fechaParte, horaParte] = fechaHoraCita.split('T');
              fecha = fechaParte;
              horaInicio = horaParte;
              
              // Calcular horaFin usando duracion
              const duracion = cita.duracion || datosJson.duracion || 30;
              if (horaParte) {
                const [horas, minutos] = horaParte.split(':').map(Number);
                const inicioEnMinutos = horas * 60 + minutos;
                const finEnMinutos = inicioEnMinutos + duracion;
                const horasListo = Math.floor(finEnMinutos / 60);
                const minutosListo = finEnMinutos % 60;
                horaFin = `${String(horasListo).padStart(2, '0')}:${String(minutosListo).padStart(2, '0')}`;
              }
            }
            
            // Combinar datos del DTO con datos del JSON
            return {
              ...cita,
              ...datosJson,
              // Mantener campos importantes del DTO
              id: cita.id,
              pacienteId: cita.pacienteId,
              pacienteNombre: cita.pacienteNombre,
              activa: cita.activa,
              // Agregar campos calculados
              fecha: fecha,
              horaInicio: horaInicio,
              horaFin: horaFin
            };
          }
          return cita;
        } catch (parseError) {
          console.error('Error parseando datosJson de cita:', cita.id, parseError);
          return cita;
        }
      });
      
      if (citasParsed.length > 0) {
        console.log('📋 Primera cita parseada (ejemplo):', citasParsed[0]);
      }
      
      setCitas(citasParsed);
    } catch (err) {
      const error = err;
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setError('No se pudo conectar con el servicio de citas médicas. Verifique que el servidor esté ejecutándose.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar citas pendientes');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCitas();
  }, [JSON.stringify(searchParams)]);

  const updateCitaEstado = async (citaId, nuevoEstado) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [citaId]: true }));
      await pacientesApiService.updateCitaEstado(citaId, nuevoEstado);
      await loadCitas();
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar estado de cita:', error);
      return { success: false, error: error.message || 'Error al actualizar el estado de la cita' };
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [citaId]: false }));
    }
  };

  const marcarComoAtendida = async (citaId) => {
    return await updateCitaEstado(citaId, 'COMPLETADA');
  };

  const cancelarCita = async (citaId, motivo = '') => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [citaId]: true }));
      await pacientesApiService.cancelarCita(citaId, motivo);
      await loadCitas();
      return { success: true };
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      return { success: false, error: error.message || 'Error al cancelar la cita' };
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [citaId]: false }));
    }
  };

  return {
    citas,
    loading,
    error,
    updatingStatus,
    loadCitas,
    updateCitaEstado,
    marcarComoAtendida,
    cancelarCita
  };
};
