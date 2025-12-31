/**
 * CitasProximasCard.jsx
 * 
 * Componente para mostrar las próximas citas agendadas
 * 
 * Capa: Presentación
 */

import React from 'react';
import { Card, Text, Stack, Group, Badge, Skeleton, Avatar } from '@mantine/core';
import { IconCalendar, IconClock } from '@tabler/icons-react';

/**
 * Tarjeta de citas próximas
 */
export const CitasProximasCard = ({ citas = [], loading = false }) => {
  
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatearHora = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getIniciales = (nombres, apellidos) => {
    const inicial1 = nombres?.charAt(0) || '';
    const inicial2 = apellidos?.charAt(0) || '';
    return (inicial1 + inicial2).toUpperCase();
  };

  if (loading) {
    return (
      <Card withBorder padding="lg" radius="md">
        <Text size="lg" fw={700} mb="md">Próximas Citas</Text>
        <Stack gap="sm">
          {[1, 2, 3, 4].map(i => (
            <Group key={i} gap="sm">
              <Skeleton height={40} width={40} circle />
              <Stack gap={4} style={{ flex: 1 }}>
                <Skeleton height={16} width="80%" />
                <Skeleton height={12} width="60%" />
              </Stack>
            </Group>
          ))}
        </Stack>
      </Card>
    );
  }

  if (citas.length === 0) {
    return (
      <Card withBorder padding="lg" radius="md">
        <Text size="lg" fw={700} mb="md">Próximas Citas</Text>
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#aaa' }}>
          <IconCalendar size={48} stroke={1.5} />
          <Text size="sm" c="dimmed" mt="sm">
            No hay citas agendadas próximamente
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={700}>Próximas Citas</Text>
        <Badge variant="light" color="blue">
          {citas.length} {citas.length === 1 ? 'cita' : 'citas'}
        </Badge>
      </Group>
      
      <Stack gap="sm">
        {citas.map((cita) => (
          <Card key={cita.id} withBorder padding="sm" radius="sm">
            <Group gap="sm" wrap="nowrap">
              <Avatar 
                color="blue" 
                radius="xl"
                size="md"
              >
                {getIniciales(cita.pacienteNombres, cita.pacienteApellidos)}
              </Avatar>
              
              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={600} truncate>
                  {cita.pacienteNombres} {cita.pacienteApellidos}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {cita.procedimiento || 'Procedimiento no especificado'}
                </Text>
                <Group gap="xs" mt={2}>
                  <Group gap={4}>
                    <IconCalendar size={12} color="#666" />
                    <Text size="xs" c="dimmed">
                      {formatearFecha(cita.fechaCita)}
                    </Text>
                  </Group>
                  <Group gap={4}>
                    <IconClock size={12} color="#666" />
                    <Text size="xs" c="dimmed">
                      {formatearHora(cita.fechaCita)}
                    </Text>
                  </Group>
                </Group>
              </Stack>
            </Group>
          </Card>
        ))}
      </Stack>
    </Card>
  );
};

export default CitasProximasCard;
