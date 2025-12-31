/**
 * DashboardPage.jsx
 * 
 * Página principal del dashboard con estadísticas y métricas
 * Implementada con arquitectura en capas limpia
 * 
 * Capa: Presentación
 */

import React from 'react';
import { Container, Grid, Stack, Group, Button, Text, ActionIcon, Tooltip } from '@mantine/core';
import { 
  IconRefresh, 
  IconTrendingUp, 
  IconTrendingDown,
  IconUsers,
  IconCalendar,
  IconCash,
  IconCheck
} from '@tabler/icons-react';
import { MainLayout } from '../components/ui/MainLayout.jsx';
import { useDashboardStats } from '../../negocio/hooks/useDashboardStats';

// Componentes de presentación
import StatsCard from '../components/dashboard/StatsCard';
import ActividadReciente from '../components/dashboard/ActividadReciente';
import CitasProximasCard from '../components/dashboard/CitasProximasCard';
import ProcedimientosFrecuentesCard from '../components/dashboard/ProcedimientosFrecuentesCard';
import IngresosMensualesChart from '../components/dashboard/IngresosMensualesChart';

export const DashboardPage = () => {
  const { stats, loading, ultimaActualizacion, refrescar } = useDashboardStats();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatearUltimaActualizacion = () => {
    if (!ultimaActualizacion) return '';
    return ultimaActualizacion.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MainLayout
      title="Dashboard"
      subtitle="Resumen general del sistema"
    >
      <Container size="xl" px="md">
        <Stack gap="lg">
          {/* Header con botón de refrescar */}
          <Group justify="space-between" align="center">
            <div>
              <Text size="xl" fw={700}>
                Estadísticas Generales
              </Text>
              {ultimaActualizacion && (
                <Text size="xs" c="dimmed">
                  Última actualización: {formatearUltimaActualizacion()}
                </Text>
              )}
            </div>
            <Tooltip label="Actualizar datos">
              <ActionIcon 
                variant="light" 
                color="blue" 
                size="lg"
                onClick={refrescar}
                loading={loading}
              >
                <IconRefresh size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* Tarjetas de estadísticas principales */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <StatsCard
                icon={<IconUsers size={24} />}
                title="Total Pacientes"
                value={stats.general?.totalPacientes?.toLocaleString() || '0'}
                subtitle="Pacientes registrados"
                color="blue"
                loading={loading}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <StatsCard
                icon={<IconCalendar size={24} />}
                title="Citas Hoy"
                value={stats.general?.citasHoy?.toString() || '0'}
                subtitle={`${stats.general?.citasPendientesHoy || 0} pendientes`}
                color="green"
                loading={loading}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <StatsCard
                icon={<IconCash size={24} />}
                title="Ingresos del Mes"
                value={formatCurrency(stats.general?.ingresosMes || 0)}
                subtitle={`${stats.general?.facturasMes || 0} facturas`}
                color="purple"
                loading={loading}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <StatsCard
                icon={<IconCheck size={24} />}
                title="Citas Atendidas"
                value={stats.general?.citasAtendidas?.toLocaleString() || '0'}
                subtitle="Total histórico"
                color="orange"
                loading={loading}
              />
            </Grid.Col>
          </Grid>

          {/* Gráfica de ingresos mensuales */}
          <Grid>
            <Grid.Col span={12}>
              <IngresosMensualesChart 
                datos={stats.ingresosMensuales} 
                loading={loading}
              />
            </Grid.Col>
          </Grid>

          {/* Sección de detalles */}
          <Grid>
            {/* Procedimientos frecuentes */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <ProcedimientosFrecuentesCard 
                procedimientos={stats.procedimientosFrecuentes}
                loading={loading}
              />
            </Grid.Col>

            {/* Próximas citas */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <CitasProximasCard 
                citas={stats.citasProximas}
                loading={loading}
              />
            </Grid.Col>
          </Grid>

          {/* Actividad reciente */}
          <Grid>
            <Grid.Col span={12}>
              <ActividadReciente 
                actividades={stats.actividadReciente}
                loading={loading}
              />
            </Grid.Col>
          </Grid>

        </Stack>
      </Container>
    </MainLayout>
  );
};
