/**
 * ReportesPage.jsx
 * 
 * Página principal de reportes del sistema
 * Implementada con arquitectura en capas limpia
 * 
 * Capa: Presentación
 */

import React, { useState } from 'react';
import { Container, Stack, Grid, Group, Text, Button, Modal } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { 
  IconArrowLeft, 
  IconCalendar,
  IconCash,
  IconUsers,
  IconChartBar,
  IconBuilding,
  IconChartLine
} from '@tabler/icons-react';
import { MainLayout } from '../components/ui/MainLayout.jsx';
import { useReportes } from '../../negocio/hooks/useReportes';
import Swal from 'sweetalert2';

// Componentes
import ReportCard from '../components/reportes/ReportCard';
import ReporteFacturacionView from '../components/reportes/ReporteFacturacionView';
import ReporteCitasView from '../components/reportes/ReporteCitasView';
import ReportePacientesView from '../components/reportes/ReportePacientesView';

export const ReportesPage = () => {
  const {
    loading,
    reporteFacturacion,
    reporteCitas,
    reportePacientes,
    generarReporteFacturacion,
    generarReporteCitas,
    generarReportePacientes,
    exportarExcel,
    limpiarReportes
  } = useReportes();

  const [reporteActivo, setReporteActivo] = useState(null);
  const [modalFechasOpen, setModalFechasOpen] = useState(false);
  const [tipoReporteFechas, setTipoReporteFechas] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  /**
   * Abrir modal de selección de fechas
   */
  const abrirModalFechas = (tipo) => {
    // Establecer fechas por defecto (mes actual)
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    setFechaInicio(inicioMes);
    setFechaFin(hoy);
    setTipoReporteFechas(tipo);
    setModalFechasOpen(true);
  };

  /**
   * Generar reporte con fechas
   */
  const generarReporteConFechas = async () => {
    if (!fechaInicio || !fechaFin) {
      await Swal.fire({
        icon: 'warning',
        title: 'Fechas requeridas',
        text: 'Por favor selecciona el rango de fechas',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

    if (fechaInicio > fechaFin) {
      await Swal.fire({
        icon: 'warning',
        title: 'Fechas inválidas',
        text: 'La fecha de inicio debe ser anterior a la fecha de fin',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

    setModalFechasOpen(false);

    try {
      Swal.fire({
        title: 'Generando reporte...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
      const fechaFinStr = fechaFin.toISOString().split('T')[0];

      if (tipoReporteFechas === 'facturacion') {
        await generarReporteFacturacion(fechaInicioStr, fechaFinStr);
        setReporteActivo('facturacion');
      } else if (tipoReporteFechas === 'citas') {
        await generarReporteCitas(fechaInicioStr, fechaFinStr);
        setReporteActivo('citas');
      }

      Swal.close();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo generar el reporte',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  /**
   * Generar reporte de pacientes
   */
  const handleGenerarReportePacientes = async () => {
    try {
      Swal.fire({
        title: 'Generando reporte...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      await generarReportePacientes();
      setReporteActivo('pacientes');
      Swal.close();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo generar el reporte',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  /**
   * Exportar reporte actual a Excel
   */
  const handleExportar = () => {
    try {
      const fecha = new Date().toISOString().split('T')[0];
      
      if (reporteActivo === 'facturacion') {
        exportarExcel(reporteFacturacion, `reporte-facturacion-${fecha}`, 'facturacion');
      } else if (reporteActivo === 'citas') {
        exportarExcel(reporteCitas, `reporte-citas-${fecha}`, 'citas');
      } else if (reporteActivo === 'pacientes') {
        exportarExcel(reportePacientes, `reporte-pacientes-${fecha}`, 'pacientes');
      }

      Swal.fire({
        icon: 'success',
        title: '¡Exportado!',
        text: 'El reporte se ha descargado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo exportar el reporte',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  /**
   * Volver al selector de reportes
   */
  const volverAlSelector = () => {
    setReporteActivo(null);
    limpiarReportes();
  };

  // Si hay un reporte activo, mostrar su vista
  if (reporteActivo) {
    return (
      <MainLayout
        title="Reportes"
        subtitle="Análisis y estadísticas del sistema"
      >
        <Container size="xl" px="md">
          <Stack gap="lg">
            <Button
              leftSection={<IconArrowLeft size={18} />}
              variant="light"
              onClick={volverAlSelector}
              style={{ width: 'fit-content' }}
            >
              Volver a Reportes
            </Button>

            {reporteActivo === 'facturacion' && reporteFacturacion && (
              <ReporteFacturacionView
                reporte={reporteFacturacion}
                onExportar={handleExportar}
              />
            )}

            {reporteActivo === 'citas' && reporteCitas && (
              <ReporteCitasView
                reporte={reporteCitas}
                onExportar={handleExportar}
              />
            )}

            {reporteActivo === 'pacientes' && reportePacientes && (
              <ReportePacientesView
                reporte={reportePacientes}
                onExportar={handleExportar}
              />
            )}
          </Stack>
        </Container>
      </MainLayout>
    );
  }

  // Vista de selector de reportes
  return (
    <MainLayout
      title="Reportes"
      subtitle="Genera y descarga reportes del sistema"
    >
      <Container size="xl" px="md">
        <Stack gap="lg">
          {/* Descripción */}
          <Text size="sm" c="dimmed">
            Selecciona el tipo de reporte que deseas generar. Los reportes se pueden exportar a Excel para análisis detallado.
          </Text>

          {/* Grid de reportes */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <ReportCard
                icon={<IconCash size={28} />}
                title="Reporte de Facturación"
                description="Análisis detallado de ingresos, facturas emitidas y distribución por tipo de cliente en un período específico."
                color="green"
                onGenerar={() => abrirModalFechas('facturacion')}
                loading={loading && tipoReporteFechas === 'facturacion'}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <ReportCard
                icon={<IconCalendar size={28} />}
                title="Reporte de Citas"
                description="Estadísticas de citas agendadas, atendidas, canceladas y análisis por médico y procedimiento."
                color="blue"
                onGenerar={() => abrirModalFechas('citas')}
                loading={loading && tipoReporteFechas === 'citas'}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <ReportCard
                icon={<IconUsers size={28} />}
                title="Reporte de Pacientes"
                description="Demografía de pacientes, distribución por género, edad, EPS y estadísticas generales."
                color="purple"
                onGenerar={handleGenerarReportePacientes}
                loading={loading && !tipoReporteFechas}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <ReportCard
                icon={<IconChartBar size={28} />}
                title="Reporte Comparativo"
                description="Comparación de ingresos mes actual vs mes anterior con indicadores de crecimiento."
                color="orange"
                onGenerar={() => {}}
                disabled={true}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <ReportCard
                icon={<IconBuilding size={28} />}
                title="Reporte de Servicios"
                description="Análisis de servicios más utilizados, ingresos por servicio y tendencias de uso."
                color="pink"
                onGenerar={() => {}}
                disabled={true}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <ReportCard
                icon={<IconChartLine size={28} />}
                title="Reporte Anual"
                description="Resumen completo del año con métricas de rendimiento, ingresos y análisis de crecimiento."
                color="blue"
                onGenerar={() => {}}
                disabled={true}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>

      {/* Modal de selección de fechas */}
      <Modal
        opened={modalFechasOpen}
        onClose={() => setModalFechasOpen(false)}
        title={
          <Group gap="sm">
            <IconCalendar size={20} />
            <Text fw={600}>Seleccionar Período</Text>
          </Group>
        }
        size="md"
      >
        <Stack gap="md">
          <DatePickerInput
            label="Fecha de Inicio"
            placeholder="Selecciona la fecha de inicio"
            value={fechaInicio}
            onChange={setFechaInicio}
            clearable
            required
          />
          
          <DatePickerInput
            label="Fecha de Fin"
            placeholder="Selecciona la fecha de fin"
            value={fechaFin}
            onChange={setFechaFin}
            clearable
            required
            minDate={fechaInicio}
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={() => setModalFechasOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={generarReporteConFechas}
              loading={loading}
            >
              Generar Reporte
            </Button>
          </Group>
        </Stack>
      </Modal>
    </MainLayout>
  );
};

export default ReportesPage;
