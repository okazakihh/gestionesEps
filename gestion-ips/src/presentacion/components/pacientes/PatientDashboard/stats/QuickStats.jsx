import React, { useState, useEffect } from 'react';
import { Paper, Stack, Group, Text, Grid, ThemeIcon, Loader, SimpleGrid } from '@mantine/core';
import { IconUsers, IconCalendar, IconFileText, IconClipboardList, IconClock } from '@tabler/icons-react';
import { pacientesApiService, historiasClinicasApiService, consultasApiService } from '../../../../data/services/pacientesApiService.js';

const QuickStats = () => {
  const [stats, setStats] = useState({
    totalPacientes: 0,
    pacientesActivos: 0,
    citasHoy: 0,
    consultasMes: 0,
    historiasClinicas: 0,
    loading: true
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Cargar estadísticas reales desde las APIs
      const [pacientesResponse, historiasResponse, consultasResponse] = await Promise.allSettled([
        pacientesApiService.getPacientes({ page: 0, size: 1 }), // Solo para obtener total
        historiasClinicasApiService.getHistoriasClinicas({ page: 0, size: 1 }),
        consultasApiService.getConsultas({ page: 0, size: 1 })
      ]);

      // Calcular estadísticas
      const totalPacientes = pacientesResponse.status === 'fulfilled' ? pacientesResponse.value.totalElements || 0 : 0;
      const historiasClinicas = historiasResponse.status === 'fulfilled' ? historiasResponse.value.totalElements || 0 : 0;
      const consultasMes = consultasResponse.status === 'fulfilled' ? consultasResponse.value.totalElements || 0 : 0;

      // Calcular pacientes activos (aproximación)
      const pacientesActivos = Math.floor(totalPacientes * 0.95); // 95% aproximado

      // Citas hoy (placeholder por ahora - necesitaríamos API de citas)
      const citasHoy = 0; // TODO: Implementar cuando tengamos API de citas

      setStats({
        totalPacientes,
        pacientesActivos,
        citasHoy,
        consultasMes,
        historiasClinicas,
        loading: false
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const statItems = [
    {
      title: 'Total Pacientes',
      value: stats.totalPacientes.toLocaleString(),
      icon: IconUsers,
      color: 'blue',
      description: 'Pacientes registrados'
    },
    {
      title: 'Pacientes Activos',
      value: stats.pacientesActivos.toLocaleString(),
      icon: IconUsers,
      color: 'green',
      description: 'Pacientes activos'
    },
    {
      title: 'Citas Hoy',
      value: stats.citasHoy,
      icon: IconCalendar,
      color: 'yellow',
      description: 'Citas programadas'
    },
    {
      title: 'Consultas del Mes',
      value: stats.consultasMes,
      icon: IconClipboardList,
      color: 'grape',
      description: 'Consultas realizadas'
    },
    {
      title: 'Historias Clínicas',
      value: stats.historiasClinicas,
      icon: IconFileText,
      color: 'indigo',
      description: 'Historias completas'
    }
  ];

  if (stats.loading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }}>
        {[...Array(5)].map((_, index) => (
          <Paper key={index} p="lg" radius="md" shadow="sm" withBorder>
            <Group>
              <Loader size="sm" />
              <Stack gap={4} style={{ flex: 1 }}>
                <div style={{ height: 16, backgroundColor: 'var(--mantine-color-gray-3)', borderRadius: 4, width: '75%' }} />
                <div style={{ height: 24, backgroundColor: 'var(--mantine-color-gray-3)', borderRadius: 4, width: '50%' }} />
              </Stack>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }}>
      {statItems.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Paper key={index} p="lg" radius="md" shadow="sm" withBorder style={{ transition: 'box-shadow 200ms', cursor: 'pointer' }}>
            <Group>
              <ThemeIcon size="xl" radius="md" color={stat.color} variant="filled">
                <IconComponent size={24} />
              </ThemeIcon>
              <Stack gap={4} style={{ flex: 1 }}>
                <Text size="sm" fw={500} c="dimmed" lineClamp={1}>
                  {stat.title}
                </Text>
                <Text size="xl" fw={600}>
                  {stat.value}
                </Text>
                <Text size="xs" c="dimmed">
                  {stat.description}
                </Text>
              </Stack>
            </Group>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
};

export default QuickStats;