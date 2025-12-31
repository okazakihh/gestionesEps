/**
 * ProcedimientosFrecuentesCard.jsx
 * 
 * Componente para mostrar los procedimientos más frecuentes
 * 
 * Capa: Presentación
 */

import React from 'react';
import { Card, Text, Stack, Group, Progress, Skeleton } from '@mantine/core';
import { IconTrendingUp } from '@tabler/icons-react';

/**
 * Tarjeta de procedimientos más frecuentes
 */
export const ProcedimientosFrecuentesCard = ({ procedimientos = [], loading = false }) => {
  
  // Calcular el total para los porcentajes
  const total = procedimientos.reduce((sum, p) => sum + p.cantidad, 0);

  const getColorByIndex = (index) => {
    const colors = ['blue', 'green', 'orange', 'purple', 'pink'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Card withBorder padding="lg" radius="md">
        <Text size="lg" fw={700} mb="md">Procedimientos Frecuentes</Text>
        <Stack gap="md">
          {[1, 2, 3, 4, 5].map(i => (
            <Stack key={i} gap="xs">
              <Skeleton height={16} width="70%" />
              <Skeleton height={8} width="100%" />
            </Stack>
          ))}
        </Stack>
      </Card>
    );
  }

  if (procedimientos.length === 0) {
    return (
      <Card withBorder padding="lg" radius="md">
        <Text size="lg" fw={700} mb="md">Procedimientos Frecuentes</Text>
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#aaa' }}>
          <IconTrendingUp size={48} stroke={1.5} />
          <Text size="sm" c="dimmed" mt="sm">
            No hay datos de procedimientos
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Card withBorder padding="lg" radius="md">
      <Text size="lg" fw={700} mb="md">Procedimientos Frecuentes</Text>
      
      <Stack gap="md">
        {procedimientos.map((procedimiento, index) => {
          const porcentaje = total > 0 ? (procedimiento.cantidad / total) * 100 : 0;
          const color = getColorByIndex(index);
          
          return (
            <Stack key={procedimiento.nombre} gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500} truncate style={{ flex: 1 }}>
                  {procedimiento.nombre}
                </Text>
                <Text size="sm" fw={600} c={color}>
                  {procedimiento.cantidad}
                </Text>
              </Group>
              <Progress 
                value={porcentaje} 
                color={color}
                size="sm" 
                radius="xl"
              />
            </Stack>
          );
        })}
      </Stack>
    </Card>
  );
};

export default ProcedimientosFrecuentesCard;
