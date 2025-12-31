import React from 'react';
import { Paper, Group, Title, Grid, TextInput, Select, Button } from '@mantine/core';
import { IconFilter, IconFilterOff } from '@tabler/icons-react';
import { ESTADO_CITA_OPTIONS } from '/src/negocio/utils/listHelps.js';

/**
 * Componente para los filtros de la agenda
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.filters - Estado de los filtros
 * @param {Function} props.setFilters - Función para actualizar filtros
 * @param {Function} props.clearFilters - Función para limpiar filtros
 * @returns {JSX.Element} Sección de filtros
 */
const AgendaFilters = ({ filters, setFilters, clearFilters }) => {
  return (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconFilter size={20} />
          <Title order={4}>Filtros</Title>
        </Group>
      </Group>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 6, lg: 2.4 }}>
          <TextInput
            label="Fecha Desde"
            type="date"
            value={filters.fechaInicio}
            onChange={(e) => setFilters(prev => ({ ...prev, fechaInicio: e.target.value }))}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 2.4 }}>
          <TextInput
            label="Fecha Hasta"
            type="date"
            value={filters.fechaFin}
            onChange={(e) => setFilters(prev => ({ ...prev, fechaFin: e.target.value }))}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 2.4 }}>
          <Select
            label="Estado"
            placeholder="Todos los estados"
            data={[
              { value: '', label: 'Todos los estados' },
              ...ESTADO_CITA_OPTIONS.map(option => ({
                value: option.value,
                label: option.label
              }))
            ]}
            value={filters.estado}
            onChange={(value) => setFilters(prev => ({ ...prev, estado: value || '' }))}
            clearable
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 2.4 }}>
          <TextInput
            label="Buscar Paciente"
            placeholder="Nombre, documento o teléfono..."
            value={filters.paciente}
            onChange={(e) => setFilters(prev => ({ ...prev, paciente: e.target.value }))}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 12, lg: 2.4 }} style={{ display: 'flex', alignItems: 'flex-end' }}>
          <Button
            variant="default"
            fullWidth
            onClick={clearFilters}
            leftSection={<IconFilterOff size={16} />}
          >
            Limpiar Filtros
          </Button>
        </Grid.Col>
      </Grid>
    </Paper>
  );
};

export default AgendaFilters;
