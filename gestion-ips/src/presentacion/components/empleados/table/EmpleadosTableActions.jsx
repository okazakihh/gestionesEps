import React from 'react';
import { ActionIcon, Group } from '@mantine/core';

/**
 * Componente de acciones para cada fila de la tabla
 * Capa de presentación
 */
const EmpleadosTableActions = ({ 
  empleado, 
  hasUser, 
  isChecking,
  onView, 
  onEdit, 
  onCreateUser, 
  onDeactivate 
}) => {
  return (
    <Group gap="xs">
      {/* Ver empleado */}
      <ActionIcon
        variant="light"
        color="gray"
        size="sm"
        onClick={() => onView(empleado)}
        title="Ver empleado"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </ActionIcon>

      {/* Editar empleado */}
      <ActionIcon
        variant="light"
        color="blue"
        size="sm"
        onClick={() => onEdit(empleado)}
        title="Editar empleado"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </ActionIcon>

      {/* Crear usuario - solo si no tiene usuario */}
      {hasUser === false && (
        <ActionIcon
          variant="light"
          color="green"
          size="sm"
          onClick={() => onCreateUser(empleado)}
          title="Crear usuario"
          loading={isChecking}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </ActionIcon>
      )}

      {/* Indicador de usuario existente */}
      {hasUser === true && (
        <ActionIcon
          variant="light"
          color="blue"
          size="sm"
          title="Ya tiene usuario creado"
          disabled
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </ActionIcon>
      )}

      {/* Desactivar empleado - solo si está activo */}
      {empleado.activo && (
        <ActionIcon
          variant="light"
          color="orange"
          size="sm"
          onClick={() => onDeactivate(empleado)}
          title="Desactivar empleado"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </ActionIcon>
      )}
    </Group>
  );
};

export default EmpleadosTableActions;
