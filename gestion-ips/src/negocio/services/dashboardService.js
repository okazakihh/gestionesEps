/**
 * dashboardService.js
 * 
 * Servicio de lógica de negocio para el dashboard
 * Procesa y agrega datos de diferentes fuentes
 * 
 * Capa: Negocio
 */

import { pacientesApiService, facturacionApiService } from '../../data/services/pacientesApiService';

/**
 * Obtener estadísticas generales del sistema
 */
export const obtenerEstadisticasGenerales = async () => {
  try {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    // Obtener datos en paralelo
    const [pacientes, citas, facturas] = await Promise.all([
      pacientesApiService.getPacientes({ page: 0, size: 10000 }).catch(() => ({ content: [], totalElements: 0 })),
      pacientesApiService.getCitas({ page: 0, size: 10000 }).catch(() => ({ content: [], totalElements: 0 })),
      facturacionApiService.getFacturaciones({ page: 0, size: 10000 }).catch(() => ({ content: [], totalElements: 0 }))
    ]);

    // Calcular estadísticas
    const totalPacientes = pacientes.totalElements || pacientes.content?.length || 0;
    const totalCitas = citas.totalElements || citas.content?.length || 0;
    const totalFacturas = facturas.totalElements || facturas.content?.length || 0;

    // Citas de hoy
    const citasHoy = citas.content?.filter(cita => {
      const fechaCita = new Date(cita.fechaCita);
      return fechaCita.toDateString() === hoy.toDateString();
    }) || [];

    // Citas del mes
    const citasMes = citas.content?.filter(cita => {
      const fechaCita = new Date(cita.fechaCita);
      return fechaCita >= inicioMes && fechaCita <= finMes;
    }) || [];

    // Facturas del mes
    const facturasMes = facturas.content?.filter(factura => {
      const fechaFactura = new Date(factura.fechaCreacion);
      return fechaFactura >= inicioMes && fechaFactura <= finMes;
    }) || [];

    // Calcular ingresos del mes
    const ingresosMes = facturasMes.reduce((sum, factura) => {
      try {
        const facturaData = JSON.parse(factura.jsonData || '{}');
        return sum + (facturaData.total || 0);
      } catch {
        return sum;
      }
    }, 0);

    return {
      totalPacientes,
      totalCitas,
      totalFacturas,
      citasHoy: citasHoy.length,
      citasMes: citasMes.length,
      facturasMes: facturasMes.length,
      ingresosMes,
      citasPendientesHoy: citasHoy.filter(c => c.estado === 'AGENDADA').length,
      citasAtendidas: citas.content?.filter(c => c.estado === 'ATENDIDA').length || 0
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas generales:', error);
    return {
      totalPacientes: 0,
      totalCitas: 0,
      totalFacturas: 0,
      citasHoy: 0,
      citasMes: 0,
      facturasMes: 0,
      ingresosMes: 0,
      citasPendientesHoy: 0,
      citasAtendidas: 0
    };
  }
};

/**
 * Obtener distribución de citas por estado
 */
export const obtenerDistribucionCitas = async () => {
  try {
    const response = await pacientesApiService.getCitas({ page: 0, size: 10000 });
    const citas = response.content || [];

    const distribucion = {
      AGENDADA: 0,
      ATENDIDA: 0,
      CANCELADA: 0,
      NO_ASISTIO: 0
    };

    citas.forEach(cita => {
      const estado = cita.estado || 'AGENDADA';
      distribucion[estado] = (distribucion[estado] || 0) + 1;
    });

    return distribucion;
  } catch (error) {
    console.error('Error obteniendo distribución de citas:', error);
    return { AGENDADA: 0, ATENDIDA: 0, CANCELADA: 0, NO_ASISTIO: 0 };
  }
};

/**
 * Obtener procedimientos más frecuentes
 */
export const obtenerProcedimientosFrecuentes = async (limite = 5) => {
  try {
    const response = await pacientesApiService.getCitas({ page: 0, size: 10000 });
    const citas = response.content || [];

    // Contar procedimientos
    const conteo = {};
    citas.forEach(cita => {
      const procedimiento = cita.procedimiento || 'Sin especificar';
      conteo[procedimiento] = (conteo[procedimiento] || 0) + 1;
    });

    // Convertir a array y ordenar
    const procedimientos = Object.entries(conteo)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, limite);

    return procedimientos;
  } catch (error) {
    console.error('Error obteniendo procedimientos frecuentes:', error);
    return [];
  }
};

/**
 * Obtener actividad reciente (últimas 10 acciones)
 */
export const obtenerActividadReciente = async () => {
  try {
    const [citas, facturas] = await Promise.all([
      pacientesApiService.getCitas({ page: 0, size: 5 }).catch(() => ({ content: [] })),
      facturacionApiService.getFacturaciones({ page: 0, size: 5 }).catch(() => ({ content: [] }))
    ]);

    const actividades = [];

    // Obtener información de pacientes para las citas
    const pacienteIds = [...new Set((citas.content || []).map(c => c.pacienteId).filter(id => id))];
    const pacientesMap = {};

    await Promise.all(
      pacienteIds.map(async (pacienteId) => {
        try {
          const paciente = await pacientesApiService.getPacienteById(pacienteId);
          if (paciente && paciente.datosJson) {
            const datosPaciente = JSON.parse(paciente.datosJson || '{}');
            const infoPersonal = JSON.parse(datosPaciente.informacionPersonalJson || '{}');
            pacientesMap[pacienteId] = `${infoPersonal.primerNombre || ''} ${infoPersonal.primerApellido || ''}`.trim() || 'Sin nombre';
          }
        } catch (error) {
          pacientesMap[pacienteId] = 'Sin nombre';
        }
      })
    );

    // Agregar citas recientes
    (citas.content || []).forEach(cita => {
      try {
        const citaData = JSON.parse(cita.datosJson || '{}');
        const nombrePaciente = pacientesMap[cita.pacienteId] || 'Paciente';
        const procedimiento = citaData.informacionCups?.nombreCup || citaData.motivo || 'Procedimiento no especificado';
        
        actividades.push({
          id: `cita-${cita.id}`,
          tipo: 'cita',
          titulo: `Cita agendada - ${nombrePaciente}`,
          descripcion: procedimiento,
          fecha: cita.fechaCreacion,
          estado: citaData.estado || 'AGENDADA',
          icono: 'calendar'
        });
      } catch (error) {
        console.error('Error procesando cita:', error);
      }
    });

    // Agregar facturas recientes
    (facturas.content || []).forEach(factura => {
      try {
        const facturaData = JSON.parse(factura.jsonData || '{}');
        actividades.push({
          id: `factura-${factura.id}`,
          tipo: 'factura',
          titulo: `Factura generada - ${facturaData.numeroFactura || 'N/A'}`,
          descripcion: `Total: $${(facturaData.total || 0).toLocaleString()}`,
          fecha: factura.fechaCreacion,
          estado: facturaData.estadoDian || 'Generada',
          icono: 'cash'
        });
      } catch (error) {
        // Ignorar facturas con JSON inválido
      }
    });

    // Ordenar por fecha más reciente
    actividades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return actividades.slice(0, 10);
  } catch (error) {
    console.error('Error obteniendo actividad reciente:', error);
    return [];
  }
};

/**
 * Obtener datos para gráfica de ingresos mensuales (últimos 6 meses)
 */
export const obtenerIngresosMensuales = async () => {
  try {
    const response = await facturacionApiService.getFacturaciones({ page: 0, size: 10000 });
    const facturas = response.content || [];

    const hoy = new Date();
    const meses = [];

    // Generar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      meses.push({
        mes: fecha.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }),
        mesNumero: fecha.getMonth(),
        año: fecha.getFullYear(),
        ingresos: 0,
        facturas: 0
      });
    }

    // Calcular ingresos por mes
    facturas.forEach(factura => {
      try {
        const fechaFactura = new Date(factura.fechaCreacion);
        const facturaData = JSON.parse(factura.jsonData || '{}');
        
        const mesFactura = fechaFactura.getMonth();
        const añoFactura = fechaFactura.getFullYear();
        
        // Buscar el mes correspondiente
        const mesIndex = meses.findIndex(m => 
          m.mesNumero === mesFactura && m.año === añoFactura
        );

        if (mesIndex !== -1) {
          meses[mesIndex].ingresos += facturaData.total || 0;
          meses[mesIndex].facturas += 1;
        }
      } catch (error) {
        // Ignorar facturas con JSON inválido
      }
    });

    return meses;
  } catch (error) {
    console.error('Error obteniendo ingresos mensuales:', error);
    return [];
  }
};

/**
 * Obtener citas próximas (próximos 7 días)
 */
export const obtenerCitasProximas = async () => {
  try {
    const response = await pacientesApiService.getCitas({ page: 0, size: 1000 });
    const citas = response.content || [];

    const hoy = new Date();
    const proximos7Dias = new Date(hoy);
    proximos7Dias.setDate(hoy.getDate() + 7);

    const citasProximas = citas.filter(cita => {
      if (cita.estado !== 'AGENDADA') return false;
      const fechaCita = new Date(cita.fechaCita);
      return fechaCita >= hoy && fechaCita <= proximos7Dias;
    });

    // Ordenar por fecha
    citasProximas.sort((a, b) => new Date(a.fechaCita) - new Date(b.fechaCita));

    return citasProximas.slice(0, 10);
  } catch (error) {
    console.error('Error obteniendo citas próximas:', error);
    return [];
  }
};

export default {
  obtenerEstadisticasGenerales,
  obtenerDistribucionCitas,
  obtenerProcedimientosFrecuentes,
  obtenerActividadReciente,
  obtenerIngresosMensuales,
  obtenerCitasProximas
};
