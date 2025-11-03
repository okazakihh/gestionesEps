import React from 'react';
import { Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCalendarOff } from '@tabler/icons-react';

/**
 * Componente para mostrar el estado vacío de la agenda
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.hasCitas - Si hay citas en el sistema
 * @param {boolean} props.hasFilters - Si hay filtros aplicados
 * @param {string} props.userRole - Rol del usuario actual
 * @returns {JSX.Element} Estado vacío
 */
const AgendaEmptyState = ({ hasCitas, hasFilters, userRole }) => {
  return (
    <Stack align="center" gap="md" py={48} style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-md)' }}>
      <ThemeIcon size={60} radius="md" variant="light" color="gray">
        <IconCalendarOff size={36} />
      </ThemeIcon>
      <Text size="sm" fw={500} c="dark">
        {hasCitas ? 'No hay citas que coincidan con los filtros' : 'No hay citas programadas'}
      </Text>
      <Text size="sm" c="dimmed">
        {hasCitas
          ? (userRole === 'DOCTOR' || userRole === 'AUXILIAR_MEDICO')
            ? 'No tienes citas asignadas en este período.'
            : 'Intenta ajustar los filtros de búsqueda.'
          : 'No hay citas programadas en el sistema.'
        }
      </Text>
    </Stack>
  );
};

export default AgendaEmptyState;