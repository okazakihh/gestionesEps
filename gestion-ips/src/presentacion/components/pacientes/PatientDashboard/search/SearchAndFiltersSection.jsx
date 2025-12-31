import React from 'react';
import { Group, TextInput, Button } from '@mantine/core';
import { IconSearch, IconFilter } from '@tabler/icons-react';

const SearchAndFiltersSection = ({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  showFilters,
  setShowFilters
}) => {
  return (
    <Group justify="space-between" mb="lg" align="flex-start" wrap="wrap">
      <TextInput
        placeholder="Buscar pacientes por nombre, documento o teléfono..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        leftSection={<IconSearch size={16} />}
        style={{ flex: 1, minWidth: 300, maxWidth: 600 }}
      />
      <Button
        onClick={() => setShowFilters(!showFilters)}
        variant="default"
        leftSection={<IconFilter size={16} />}
      >
        Filtros
      </Button>

      {/* Advanced Filters */}

    </Group>
  );
};

export default SearchAndFiltersSection;
