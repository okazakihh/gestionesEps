import React from 'react';
import { TextInput, Button, Group } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

/**
 * CodigosCupsSearch.jsx
 * 
 * Componente de barra de búsqueda para códigos CUPS
 * 
 * Props:
 * - searchTerm: valor actual del término de búsqueda
 * - onSearchChange: función para cambiar el término de búsqueda
 * - onSearch: función para ejecutar la búsqueda
 * - loading: boolean que indica si se está buscando
 * 
 * Capa: Presentación
 */

const CodigosCupsSearch = ({
  searchTerm = '',
  onSearchChange,
  onSearch,
  loading = false
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Group gap="md">
        <TextInput
          placeholder="Buscar por código o nombre..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          style={{ flex: 1 }}
          size="md"
        />
        <Button
          type="submit"
          loading={loading}
          leftSection={<IconSearch size={18} />}
          size="md"
        >
          Buscar
        </Button>
      </Group>
    </form>
  );
};

export default CodigosCupsSearch;
