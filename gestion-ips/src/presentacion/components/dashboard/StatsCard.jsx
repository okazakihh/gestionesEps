/**
 * StatsCard.jsx
 * 
 * Componente reutilizable para tarjetas de estadísticas
 * 
 * Capa: Presentación
 */

import React from 'react';
import { Card, Text, Group, Stack, Skeleton } from '@mantine/core';

/**
 * Tarjeta de estadística con icono y valor
 */
export const StatsCard = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color = 'blue',
  loading = false,
  trend,
  onClick
}) => {
  const getColorStyles = (color) => {
    const colors = {
      blue: { bg: '#eff6ff', text: '#3b82f6' },
      green: { bg: '#f0fdf4', text: '#22c55e' },
      yellow: { bg: '#fefce8', text: '#eab308' },
      purple: { bg: '#faf5ff', text: '#a855f7' },
      red: { bg: '#fef2f2', text: '#ef4444' },
      orange: { bg: '#fff7ed', text: '#f97316' }
    };
    return colors[color] || colors.blue;
  };

  const colorStyles = getColorStyles(color);

  if (loading) {
    return (
      <Card withBorder padding="lg" radius="md">
        <Stack gap="sm">
          <Skeleton height={40} width={40} circle />
          <Skeleton height={20} width="60%" />
          <Skeleton height={32} width="80%" />
        </Stack>
      </Card>
    );
  }

  return (
    <Card 
      withBorder 
      padding="lg" 
      radius="md"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      className="hover:shadow-md transition-shadow"
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack gap="xs" style={{ flex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: colorStyles.bg,
              width: 'fit-content',
              color: colorStyles.text
            }}
          >
            {typeof icon === 'string' ? (
              <span style={{ fontSize: '24px' }}>{icon}</span>
            ) : (
              icon
            )}
          </div>
          
          <Text size="sm" c="dimmed" fw={500}>
            {title}
          </Text>
          
          <Text size="xl" fw={700} style={{ color: colorStyles.text }}>
            {value}
          </Text>
          
          {subtitle && (
            <Text size="xs" c="dimmed">
              {subtitle}
            </Text>
          )}

          {trend && (
            <Group gap={4}>
              <Text size="xs" fw={500} c={trend.direction === 'up' ? 'green' : 'red'}>
                {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
              </Text>
              <Text size="xs" c="dimmed">
                {trend.label}
              </Text>
            </Group>
          )}
        </Stack>
      </Group>
    </Card>
  );
};

export default StatsCard;
