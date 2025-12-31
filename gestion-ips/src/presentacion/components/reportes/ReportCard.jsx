/**
 * ReportCard.jsx
 * 
 * Componente para tarjeta de tipo de reporte
 * 
 * Capa: Presentación
 */

import React from 'react';
import { Card, Text, Group, Button, Stack } from '@mantine/core';
import { IconFileAnalytics } from '@tabler/icons-react';

/**
 * Tarjeta para seleccionar tipo de reporte
 */
export const ReportCard = ({
  icon,
  title,
  description,
  color = 'blue',
  onGenerar,
  loading = false,
  disabled = false
}) => {
  const getColorStyles = (color) => {
    const colors = {
      blue: { bg: '#eff6ff', text: '#3b82f6', border: '#bfdbfe' },
      green: { bg: '#f0fdf4', text: '#22c55e', border: '#bbf7d0' },
      purple: { bg: '#faf5ff', text: '#a855f7', border: '#e9d5ff' },
      orange: { bg: '#fff7ed', text: '#f97316', border: '#fed7aa' },
      pink: { bg: '#fdf2f8', text: '#ec4899', border: '#fbcfe8' }
    };
    return colors[color] || colors.blue;
  };

  const colorStyles = getColorStyles(color);

  return (
    <Card 
      withBorder 
      padding="lg" 
      radius="md"
      style={{ 
        borderColor: colorStyles.border,
        height: '100%'
      }}
    >
      <Stack gap="md" justify="space-between" style={{ height: '100%' }}>
        <Stack gap="sm">
          <div
            style={{
              display: 'inline-flex',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: colorStyles.bg,
              width: 'fit-content',
              color: colorStyles.text
            }}
          >
            {typeof icon === 'string' ? (
              <span style={{ fontSize: '28px' }}>{icon}</span>
            ) : (
              icon
            )}
          </div>
          
          <Text size="lg" fw={700} style={{ color: colorStyles.text }}>
            {title}
          </Text>
          
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        </Stack>

        <Button
          fullWidth
          color={color}
          variant="light"
          leftSection={<IconFileAnalytics size={18} />}
          onClick={onGenerar}
          loading={loading}
          disabled={disabled}
        >
          Generar Reporte
        </Button>
      </Stack>
    </Card>
  );
};

export default ReportCard;
