import { Paper, TextInput, Select, Group, Button, Text } from '@mantine/core';
import { IconSearch, IconFilter, IconFilterOff } from '@tabler/icons-react';

/**
 * Componente de filtros para nóminas
 * Permite búsqueda y filtrado múltiple
 */
export const NominaFilters = ({
  searchTerm = '',
  empleadoFilter = '',
  periodoFilter = '',
  fechaDesde = '',
  fechaHasta = '',
  estadoFilter = '',
  onSearchChange,
  onEmpleadoFilterChange,
  onPeriodoFilterChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onEstadoFilterChange,
  onClearFilters,
  hasActiveFilters = false,
  totalFiltered = 0,
  totalOriginal = 0,
  statistics = {}
}) => {
  /**
   * Formatea valor monetario
   */
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  return (
    <Paper shadow="xs" p="md" withBorder>
      {/* Búsqueda general */}
      <TextInput
        placeholder="Buscar por empleado, documento, periodo..."
        leftSection={<IconSearch size={16} />}
        value={searchTerm}
        onChange={(e) => onSearchChange?.(e.target.value)}
        mb="md"
      />

      {/* Filtros específicos */}
      <Group grow mb="md">
        <TextInput
          label="Empleado"
          placeholder="Filtrar por nombre o documento"
          value={empleadoFilter}
          onChange={(e) => onEmpleadoFilterChange?.(e.target.value)}
        />

        <TextInput
          label="Periodo"
          placeholder="Ej: 2024-01"
          value={periodoFilter}
          onChange={(e) => onPeriodoFilterChange?.(e.target.value)}
        />

        <Select
          label="Estado"
          placeholder="Seleccionar estado"
          value={estadoFilter}
          onChange={(value) => onEstadoFilterChange?.(value || '')}
          data={[
            { value: '', label: 'Todos' },
            { value: 'activo', label: 'Activas' },
            { value: 'inactivo', label: 'Inactivas' }
          ]}
          clearable
        />
      </Group>

      {/* Rango de fechas */}
      <Group grow mb="md">
        <div>
          <Text size="sm" fw={500} mb={5}>Fecha desde</Text>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => onFechaDesdeChange?.(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ced4da',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <Text size="sm" fw={500} mb={5}>Fecha hasta</Text>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => onFechaHastaChange?.(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ced4da',
              fontSize: '14px'
            }}
          />
        </div>
      </Group>

      {/* Botón limpiar filtros */}
      {hasActiveFilters && (
        <Group justify="flex-end" mb="sm">
          <Button
            variant="light"
            color="gray"
            size="xs"
            leftSection={<IconFilterOff size={14} />}
            onClick={onClearFilters}
          >
            Limpiar filtros
          </Button>
        </Group>
      )}

      {/* Información de resultados */}
      <Paper bg="gray.0" p="xs" radius="sm">
        <Group justify="space-between">
          <Group gap="xl">
            <div>
              <Text size="xs" c="dimmed">Nóminas</Text>
              <Text size="sm" fw={600}>
                {totalFiltered} {totalOriginal !== totalFiltered && `de ${totalOriginal}`}
              </Text>
            </div>

            {statistics.totalPagado !== undefined && (
              <div>
                <Text size="xs" c="dimmed">Total a pagar</Text>
                <Text size="sm" fw={600} c="blue">
                  {formatCurrency(statistics.totalPagado)}
                </Text>
              </div>
            )}

            {statistics.activas !== undefined && (
              <div>
                <Text size="xs" c="dimmed">Activas</Text>
                <Text size="sm" fw={600} c="green">
                  {statistics.activas}
                </Text>
              </div>
            )}

            {statistics.inactivas !== undefined && (
              <div>
                <Text size="xs" c="dimmed">Inactivas</Text>
                <Text size="sm" fw={600} c="red">
                  {statistics.inactivas}
                </Text>
              </div>
            )}
          </Group>

          {hasActiveFilters && (
            <Group gap={4}>
              <IconFilter size={14} />
              <Text size="xs" c="dimmed">
                Filtros activos
              </Text>
            </Group>
          )}
        </Group>
      </Paper>
    </Paper>
  );
};
