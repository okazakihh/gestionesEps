import React from 'react';
import { TextInput, ActionIcon, Loader } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

/**
 * Campo de búsqueda de cliente por documento
 * Componente de presentación - UI pura
 */
export const BuscarClienteInput = ({
  value,
  onChange,
  onBuscar,
  buscando = false,
  placeholder = 'Ej: 1234567890',
  label = 'Número de Documento',
  required = true
}) => {
  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      withAsterisk={required}
      styles={{
        input: {
          paddingRight: '50px' // Espacio para el icono
        }
      }}
      rightSection={
        buscando ? (
          <Loader size="xs" />
        ) : (
          <ActionIcon
            variant="light"
            color="blue"
            onClick={onBuscar}
            disabled={!value.trim()}
          >
            <IconSearch size={16} />
          </ActionIcon>
        )
      }
      description="Ingrese el documento y haga clic en el botón de búsqueda"
    />
  );
};
