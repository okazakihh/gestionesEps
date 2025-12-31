/**
 * reportesService.js
 * 
 * Servicio de lógica de negocio para reportes
 * Genera análisis y estadísticas del sistema
 * 
 * Capa: Negocio
 */

import { pacientesApiService, facturacionApiService } from '../../data/services/pacientesApiService';
import * as XLSX from 'xlsx';

/**
 * Obtener reporte de facturación por período
 */
export const obtenerReporteFacturacion = async (fechaInicio, fechaFin) => {
  try {
    const response = await facturacionApiService.getFacturaciones({ page: 0, size: 10000 });
    const facturas = response.content || [];

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    // Filtrar facturas por rango de fechas
    const facturasFiltradas = facturas.filter(factura => {
      const fechaFactura = new Date(factura.fechaCreacion);
      return fechaFactura >= inicio && fechaFactura <= fin;
    });

    // Calcular estadísticas
    const totalFacturas = facturasFiltradas.length;
    let totalIngresos = 0;
    let facturasPorEstado = {};
    let facturasPorTipo = { ENTIDAD: 0, PACIENTE: 0 };
    let detalleFacturas = [];

    facturasFiltradas.forEach(factura => {
      try {
        const facturaData = JSON.parse(factura.jsonData || '{}');
        totalIngresos += facturaData.total || 0;

        // Por estado
        const estado = facturaData.estadoDian || 'Sin estado';
        facturasPorEstado[estado] = (facturasPorEstado[estado] || 0) + 1;

        // Por tipo
        const tipo = facturaData.tipoDestinatario || 'PACIENTE';
        facturasPorTipo[tipo] = (facturasPorTipo[tipo] || 0) + 1;

        // Detalle
        detalleFacturas.push({
          numero: facturaData.numeroFactura || 'N/A',
          fecha: factura.fechaCreacion,
          cliente: facturaData.cliente?.nombreCompleto || facturaData.cliente?.razonSocial || 'N/A',
          tipo: tipo,
          total: facturaData.total || 0,
          estado: estado
        });
      } catch (error) {
        console.error('Error procesando factura:', error);
      }
    });

    return {
      totalFacturas,
      totalIngresos,
      promedioFactura: totalFacturas > 0 ? totalIngresos / totalFacturas : 0,
      facturasPorEstado,
      facturasPorTipo,
      detalleFacturas,
      periodo: { fechaInicio, fechaFin }
    };
  } catch (error) {
    console.error('Error obteniendo reporte de facturación:', error);
    throw error;
  }
};

/**
 * Obtener reporte de citas por período
 */
export const obtenerReporteCitas = async (fechaInicio, fechaFin) => {
  try {
    const response = await pacientesApiService.getCitas({ page: 0, size: 10000 });
    const citas = response.content || [];

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    // Filtrar citas por rango de fechas
    const citasFiltradas = citas.filter(cita => {
      try {
        const citaData = JSON.parse(cita.datosJson || '{}');
        const fechaCita = new Date(citaData.fechaHoraCita || cita.fechaCreacion);
        return fechaCita >= inicio && fechaCita <= fin;
      } catch (error) {
        console.error('Error parseando cita:', error);
        return false;
      }
    });

    // Obtener información de pacientes únicos
    const pacienteIds = [...new Set(citasFiltradas.map(c => c.pacienteId).filter(id => id))];
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
          console.error(`Error obteniendo paciente ${pacienteId}:`, error);
          pacientesMap[pacienteId] = 'Sin nombre';
        }
      })
    );

    // Calcular estadísticas
    const totalCitas = citasFiltradas.length;
    let citasPorEstado = {};
    let citasPorMedico = {};
    let citasPorProcedimiento = {};
    let detalleCitas = [];

    citasFiltradas.forEach(cita => {
      try {
        const citaData = JSON.parse(cita.datosJson || '{}');
        
        // Por estado
        const estado = citaData.estado || 'AGENDADA';
        citasPorEstado[estado] = (citasPorEstado[estado] || 0) + 1;

        // Por médico
        const medico = citaData.medicoAsignado || 'Sin médico';
        citasPorMedico[medico] = (citasPorMedico[medico] || 0) + 1;

        // Por procedimiento
        const procedimiento = citaData.informacionCups?.nombreCup || citaData.motivo || 'Sin especificar';
        citasPorProcedimiento[procedimiento] = (citasPorProcedimiento[procedimiento] || 0) + 1;

        // Detalle
        detalleCitas.push({
          fecha: citaData.fechaHoraCita || cita.fechaCreacion,
          paciente: pacientesMap[cita.pacienteId] || 'N/A',
          medico: medico,
          procedimiento: procedimiento,
          estado: estado
        });
      } catch (error) {
        console.error('Error procesando cita:', error);
      }
    });

    return {
      totalCitas,
      citasPorEstado,
      citasPorMedico,
      citasPorProcedimiento,
      detalleCitas,
      tasaAsistencia: totalCitas > 0 ? ((citasPorEstado.ATENDIDO || 0) / totalCitas * 100).toFixed(1) : 0,
      periodo: { fechaInicio, fechaFin }
    };
  } catch (error) {
    console.error('Error obteniendo reporte de citas:', error);
    throw error;
  }
};

/**
 * Obtener reporte de pacientes
 */
export const obtenerReportePacientes = async () => {
  try {
    const response = await pacientesApiService.getPacientes({ page: 0, size: 10000 });
    const pacientes = response.content || [];

    const totalPacientes = pacientes.length;
    let pacientesPorGenero = { MASCULINO: 0, FEMENINO: 0, OTRO: 0 };
    let pacientesPorRangoEdad = {
      '0-17': 0,
      '18-30': 0,
      '31-50': 0,
      '51-70': 0,
      '70+': 0
    };
    let pacientesPorEPS = {};

    pacientes.forEach(paciente => {
      // Por género
      const genero = paciente.genero || 'OTRO';
      pacientesPorGenero[genero] = (pacientesPorGenero[genero] || 0) + 1;

      // Por edad
      if (paciente.fechaNacimiento) {
        const edad = calcularEdad(paciente.fechaNacimiento);
        if (edad < 18) pacientesPorRangoEdad['0-17']++;
        else if (edad < 31) pacientesPorRangoEdad['18-30']++;
        else if (edad < 51) pacientesPorRangoEdad['31-50']++;
        else if (edad < 71) pacientesPorRangoEdad['51-70']++;
        else pacientesPorRangoEdad['70+']++;
      }

      // Por EPS
      const eps = paciente.eps || 'Sin EPS';
      pacientesPorEPS[eps] = (pacientesPorEPS[eps] || 0) + 1;
    });

    return {
      totalPacientes,
      pacientesPorGenero,
      pacientesPorRangoEdad,
      pacientesPorEPS
    };
  } catch (error) {
    console.error('Error obteniendo reporte de pacientes:', error);
    throw error;
  }
};

/**
 * Obtener reporte comparativo de ingresos
 */
export const obtenerReporteComparativoIngresos = async () => {
  try {
    const response = await facturacionApiService.getFacturaciones({ page: 0, size: 10000 });
    const facturas = response.content || [];

    const hoy = new Date();
    const mesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

    let ingresosMesActual = 0;
    let facturasMesActual = 0;
    let ingresosMesAnterior = 0;
    let facturasMesAnterior = 0;

    facturas.forEach(factura => {
      try {
        const fechaFactura = new Date(factura.fechaCreacion);
        const facturaData = JSON.parse(factura.jsonData || '{}');
        const total = facturaData.total || 0;

        if (fechaFactura >= mesActual) {
          ingresosMesActual += total;
          facturasMesActual++;
        } else if (fechaFactura >= mesAnterior && fechaFactura <= finMesAnterior) {
          ingresosMesAnterior += total;
          facturasMesAnterior++;
        }
      } catch (error) {
        // Ignorar facturas con JSON inválido
      }
    });

    const crecimiento = ingresosMesAnterior > 0 
      ? ((ingresosMesActual - ingresosMesAnterior) / ingresosMesAnterior * 100).toFixed(1)
      : 0;

    return {
      mesActual: {
        ingresos: ingresosMesActual,
        facturas: facturasMesActual,
        promedio: facturasMesActual > 0 ? ingresosMesActual / facturasMesActual : 0
      },
      mesAnterior: {
        ingresos: ingresosMesAnterior,
        facturas: facturasMesAnterior,
        promedio: facturasMesAnterior > 0 ? ingresosMesAnterior / facturasMesAnterior : 0
      },
      crecimiento: parseFloat(crecimiento)
    };
  } catch (error) {
    console.error('Error obteniendo reporte comparativo:', error);
    throw error;
  }
};

/**
 * Exportar reporte a Excel
 */
export const exportarReporteExcel = (datos, nombreArchivo, tipo) => {
  try {
    let hojas = [];

    if (tipo === 'facturacion') {
      // Hoja de resumen
      const resumen = [
        ['REPORTE DE FACTURACIÓN'],
        [''],
        ['Período:', `${datos.periodo.fechaInicio} - ${datos.periodo.fechaFin}`],
        ['Total Facturas:', datos.totalFacturas],
        ['Total Ingresos:', datos.totalIngresos],
        ['Promedio por Factura:', datos.promedioFactura],
        [''],
        ['DISTRIBUCIÓN POR ESTADO:'],
        ...Object.entries(datos.facturasPorEstado).map(([estado, cantidad]) => [estado, cantidad]),
        [''],
        ['DISTRIBUCIÓN POR TIPO:'],
        ...Object.entries(datos.facturasPorTipo).map(([tipo, cantidad]) => [tipo, cantidad])
      ];

      // Hoja de detalle
      const detalle = [
        ['Número', 'Fecha', 'Cliente', 'Tipo', 'Total', 'Estado'],
        ...datos.detalleFacturas.map(f => [
          f.numero,
          new Date(f.fecha).toLocaleDateString('es-CO'),
          f.cliente,
          f.tipo,
          f.total,
          f.estado
        ])
      ];

      hojas = [
        { name: 'Resumen', data: resumen },
        { name: 'Detalle', data: detalle }
      ];
    } else if (tipo === 'citas') {
      // Hoja de resumen
      const resumen = [
        ['REPORTE DE CITAS'],
        [''],
        ['Período:', `${datos.periodo.fechaInicio} - ${datos.periodo.fechaFin}`],
        ['Total Citas:', datos.totalCitas],
        ['Tasa de Asistencia:', `${datos.tasaAsistencia}%`],
        [''],
        ['DISTRIBUCIÓN POR ESTADO:'],
        ...Object.entries(datos.citasPorEstado).map(([estado, cantidad]) => [estado, cantidad]),
        [''],
        ['TOP 10 MÉDICOS:'],
        ...Object.entries(datos.citasPorMedico)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([medico, cantidad]) => [medico, cantidad])
      ];

      // Hoja de detalle
      const detalle = [
        ['Fecha', 'Paciente', 'Médico', 'Procedimiento', 'Estado'],
        ...datos.detalleCitas.map(c => [
          new Date(c.fecha).toLocaleDateString('es-CO'),
          c.paciente,
          c.medico,
          c.procedimiento,
          c.estado
        ])
      ];

      hojas = [
        { name: 'Resumen', data: resumen },
        { name: 'Detalle', data: detalle }
      ];
    } else if (tipo === 'pacientes') {
      const resumen = [
        ['REPORTE DE PACIENTES'],
        [''],
        ['Total Pacientes:', datos.totalPacientes],
        [''],
        ['DISTRIBUCIÓN POR GÉNERO:'],
        ...Object.entries(datos.pacientesPorGenero).map(([genero, cantidad]) => [genero, cantidad]),
        [''],
        ['DISTRIBUCIÓN POR RANGO DE EDAD:'],
        ...Object.entries(datos.pacientesPorRangoEdad).map(([rango, cantidad]) => [rango, cantidad]),
        [''],
        ['DISTRIBUCIÓN POR EPS:'],
        ...Object.entries(datos.pacientesPorEPS)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([eps, cantidad]) => [eps, cantidad])
      ];

      hojas = [{ name: 'Resumen', data: resumen }];
    }

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();
    hojas.forEach(hoja => {
      const ws = XLSX.utils.aoa_to_sheet(hoja.data);
      XLSX.utils.book_append_sheet(wb, ws, hoja.name);
    });

    // Descargar archivo
    XLSX.writeFile(wb, `${nombreArchivo}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exportando a Excel:', error);
    throw error;
  }
};

/**
 * Función auxiliar para calcular edad
 */
const calcularEdad = (fechaNacimiento) => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
};

export default {
  obtenerReporteFacturacion,
  obtenerReporteCitas,
  obtenerReportePacientes,
  obtenerReporteComparativoIngresos,
  exportarReporteExcel
};
