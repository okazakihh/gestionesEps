import React from 'react';
import { Alert, Group, Text, Button } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

/**
 * Alerta que muestra cuando un cliente es encontrado
 * Componente de presentación - UI pura
 */
export const ClienteEncontradoAlert = ({ cliente, onLimpiar }) => {
  if (!cliente) return null;

  const nombreCliente = cliente.datos?.nombreCompleto || cliente.datos?.razonSocial;

  return (
    <Alert icon={<IconCheck size={18} />} color="green" variant="light">
      <Group justify="space-between">
        <Text size="sm">
          Cliente encontrado: <strong>{nombreCliente}</strong>
        </Text>
        <Button size="xs" variant="subtle" onClick={onLimpiar}>
          Limpiar
        </Button>
      </Group>
    </Alert>
  );
};
