/**
 * ActividadReciente.jsx
 * 
 * Componente para mostrar la actividad reciente del sistema
 * 
 * Capa: Presentación
 */

import React from 'react';
import { Card, Text, Stack, Group, Badge, Timeline, Skeleton } from '@mantine/core';
import { IconClock, IconCalendar, IconCash } from '@tabler/icons-react';

/**
 * Componente de actividad reciente
 */
export const ActividadReciente = ({ actividades = [], loading = false }) => {
  
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diff = ahora - date;
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias}d`;
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  };

  const getEstadoBadgeColor = (estado) => {
    const estados = {
      AGENDADA: 'blue',
      ATENDIDA: 'green',
      CANCELADA: 'red',
      NO_ASISTIO: 'orange',
      Generada: 'cyan',
      ACEPTADA: 'green'
    };
    return estados[estado] || 'gray';
  };

  const getIconComponent = (iconType) => {
    const iconMap = {
      calendar: <IconCalendar size={16} />,
      cash: <IconCash size={16} />
    };
    return iconMap[iconType] || <IconClock size={16} />;
  };

  if (loading) {
    return (
      <Card withBorder padding="lg" radius="md">
        <Text size="lg" fw={700} mb="md">Actividad Reciente</Text>
        <Stack gap="md">
          {[1, 2, 3, 4, 5].map(i => (
            <Group key={i} gap="sm">
              <Skeleton height={40} width={40} circle />
              <Stack gap={4} style={{ flex: 1 }}>
                <Skeleton height={16} width="70%" />
                <Skeleton height={12} width="50%" />
              </Stack>
            </Group>
          ))}
        </Stack>
      </Card>
    );
  }

  if (actividades.length === 0) {
    return (
      <Card withBorder padding="lg" radius="md">
        <Text size="lg" fw={700} mb="md">Actividad Reciente</Text>
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#aaa' }}>
          <IconClock size={48} stroke={1.5} />
          <Text size="sm" c="dimmed" mt="sm">
            No hay actividad reciente
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Card withBorder padding="lg" radius="md">
      <Text size="lg" fw={700} mb="md">Actividad Reciente</Text>
      <Timeline active={actividades.length} bulletSize={32} lineWidth={2}>
        {actividades.map((actividad) => (
          <Timeline.Item
            key={actividad.id}
            bullet={getIconComponent(actividad.icono)}
            title={
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" fw={500} style={{ flex: 1 }}>
                  {actividad.titulo}
                </Text>
                {actividad.estado && (
                  <Badge 
                    size="xs" 
                    color={getEstadoBadgeColor(actividad.estado)}
                    variant="light"
                  >
                    {actividad.estado}
                  </Badge>
                )}
              </Group>
            }
          >
            <Text size="xs" c="dimmed" mt={4}>
              {actividad.descripcion}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              {formatearFecha(actividad.fecha)}
            </Text>
          </Timeline.Item>
        ))}
      </Timeline>
    </Card>
  );
};

export default ActividadReciente;
