import React from 'react';
import { Group, Text } from '@mantine/core';
import { useTheme } from '../../../negocio/contexts/ThemeContext';

/**
 * Título de sección estandarizado con ícono y color de tema.
 * @param {object} props
 * @param {React.ElementType} props.icon - El componente de ícono a mostrar.
 * @param {string} props.title - El texto del título.
 * @param {string} [props.color] - Un color opcional para sobrescribir el del tema.
 */
const SectionTitle = ({ icon: Icon, title, color }) => {
  const { tema } = useTheme();

  return (
    <div style={{ backgroundColor: color || tema.primaryColor, padding: '4px 8px', marginBottom: '8px', borderRadius: '2px' }}>
      <Group gap="xs">
        <Icon size={14} style={{ color: 'white' }} />
        <Text size="xs" fw={700} style={{ color: 'white', textTransform: 'uppercase' }}>
          {title}
        </Text>
      </Group>
    </div>
  );
};

export default SectionTitle;
