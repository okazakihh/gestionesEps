import React from 'react';
import { Table, Text, ActionIcon, Tooltip, Loader, Paper, Stack, Pagination, Group } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import { formatDate, formatCurrency } from '../../../negocio/services/facturacionService';

/**
 * CodigosCupsTable.jsx
 * 
 * Componente de tabla para mostrar códigos CUPS con paginación y edición
 * 
 * Props:
 * - codigosCups: Array de códigos CUPS a mostrar
 * - onEditarValor: función para abrir modal de edición de valor
 * - loading: boolean que indica si se están cargando datos
 * - currentPage: página actual (0-indexed)
 * - totalPages: número total de páginas
 * - onPageChange: función para cambiar de página
 * 
 * Capa: Presentación
 */

const CodigosCupsTable = ({
  codigosCups = [],
  onEditarValor,
  loading = false,
  currentPage = 0,
  totalPages = 0,
  onPageChange
}) => {
  /**
   * Extrae y formatea el valor del código CUPS desde datosJson
   */
  const getValorFormateado = (codigoCups) => {
    try {
      const datosJson = JSON.parse(codigoCups.datosJson || '{}');
      const valor = datosJson.valor;
      if (valor !== undefined && valor !== null) {
        return formatCurrency(valor);
      }
      return 'No definido';
    } catch (error) {
      console.error('Error parsing datosJson:', error);
      return 'No definido';
    }
  };

  // Renderizar estado de carga
  if (loading) {
    return (
      <Paper shadow="sm" p="md" withBorder>
        <Stack align="center" py="xl">
          <Loader size="md" />
          <Text size="sm" c="dimmed">Cargando códigos CUPS...</Text>
        </Stack>
      </Paper>
    );
  }

  // Renderizar estado vacío
  if (!loading && codigosCups.length === 0) {
    return (
      <Paper shadow="sm" p="md" withBorder>
        <Stack align="center" py="xl">
          <Text size="sm" c="dimmed">No se encontraron códigos CUPS</Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper shadow="sm" withBorder>
      <div style={{ overflowX: 'auto' }}>
        <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Código CUPS</Table.Th>
              <Table.Th>Nombre</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Valor</Table.Th>
              <Table.Th>Fecha Creación</Table.Th>
              <Table.Th>Fecha Actualización</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {codigosCups.map((codigo) => (
              <Table.Tr key={codigo.id}>
                <Table.Td>
                  <Text size="sm" fw={600} style={{ fontFamily: 'monospace' }}>
                    {codigo.codigoCup}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" style={{ maxWidth: '300px' }}>
                    {codigo.nombreCup}
                  </Text>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text size="sm" fw={500} c="green">
                    {getValorFormateado(codigo)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {formatDate(codigo.fechaCreacion)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {formatDate(codigo.fechaActualizacion)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <Tooltip label="Editar valor del código CUPS" position="top">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => onEditarValor(codigo)}
                        aria-label="Editar valor"
                      >
                        <IconPencil size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Paper 
          p="md" 
          style={{ 
            borderTop: '1px solid #e9ecef',
            backgroundColor: '#f8f9fa'
          }}
        >
          <Group justify="space-between" wrap="wrap">
            <Text size="sm" c="dimmed">
              Página {currentPage + 1} de {totalPages}
            </Text>
            <Pagination
              total={totalPages}
              value={currentPage + 1}
              onChange={(page) => onPageChange(page - 1)}
              size="sm"
              withEdges
            />
          </Group>
        </Paper>
      )}
    </Paper>
  );
};

export default CodigosCupsTable;
