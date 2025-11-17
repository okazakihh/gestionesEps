import React from 'react';
import { Table, Checkbox, Text, Badge, Group, Loader, Paper, Stack } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { formatDate, formatCurrency } from '../../../negocio/services/facturacionService';

/**
 * CitasTable.jsx
 * 
 * Componente de tabla para mostrar citas atendidas con funcionalidad de selección
 * 
 * Props:
 * - citas: Array de citas atendidas filtradas
 * - selectedCitas: Set con IDs de citas seleccionadas
 * - onSelectCita: función para seleccionar/deseleccionar una cita
 * - onSelectAll: función para seleccionar/deseleccionar todas las citas
 * - loading: boolean que indica si se están cargando datos
 * - totalCitas: número total de citas sin filtrar
 * - limit: número máximo de citas a mostrar (default: 10)
 * 
 * Capa: Presentación
 */

const CitasTable = ({
  citas = [],
  selectedCitas = new Set(),
  onSelectCita,
  onSelectAll,
  loading = false,
  totalCitas = 0,
  limit = 10
}) => {
  // Calcular si todas las citas visibles están seleccionadas
  const allSelected = citas.length > 0 && selectedCitas.size === citas.length;
  
  // Calcular el total facturado de las citas filtradas
  const totalFacturado = citas.reduce((total, cita) => total + (cita.valorCita || 0), 0);

  // Obtener solo las citas a mostrar según el límite
  const citasToShow = citas.slice(0, limit);

  // Renderizar estado de carga
  if (loading) {
    return (
      <Paper shadow="sm" p="md" withBorder>
        <Stack align="center" py="xl">
          <Loader size="md" />
          <Text size="sm" c="dimmed">Cargando citas atendidas...</Text>
        </Stack>
      </Paper>
    );
  }

  // Renderizar estado vacío
  if (!loading && citas.length === 0) {
    return (
      <Paper shadow="sm" p="md" withBorder>
        <Stack align="center" py="xl">
          <Text size="sm" c="dimmed">No hay citas atendidas para mostrar</Text>
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
              <Table.Th style={{ width: '50px' }}>
                <Checkbox
                  checked={allSelected}
                  onChange={() => onSelectAll(citas)}
                  aria-label="Seleccionar todas las citas"
                  icon={IconCheck}
                />
              </Table.Th>
              <Table.Th>Fecha</Table.Th>
              <Table.Th>Paciente</Table.Th>
              <Table.Th>Documento</Table.Th>
              <Table.Th>Médico</Table.Th>
              <Table.Th>Procedimiento</Table.Th>
              <Table.Th>Código CUPS</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Valor</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {citasToShow.map((cita) => (
              <Table.Tr 
                key={cita.id}
                style={{ 
                  backgroundColor: selectedCitas.has(cita.id) ? '#f0f9ff' : undefined 
                }}
              >
                <Table.Td>
                  <Checkbox
                    checked={selectedCitas.has(cita.id)}
                    onChange={() => onSelectCita(cita.id)}
                    aria-label={`Seleccionar cita de ${cita.nombrePaciente}`}
                    icon={IconCheck}
                  />
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatDate(cita.fechaAtencion)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>{cita.nombrePaciente}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">{cita.documentoPaciente}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" style={{ maxWidth: '200px' }}>
                    {cita.nombreMedico}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed" style={{ maxWidth: '250px' }}>
                    {cita.nombreProcedimiento}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color="blue" size="sm">
                    {cita.codigoCups}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text size="sm" fw={600} c="green">
                    {formatCurrency(cita.valorCita)}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      {/* Footer con estadísticas */}
      <Paper 
        p="md" 
        style={{ 
          borderTop: '1px solid #e9ecef',
          backgroundColor: '#f8f9fa'
        }}
      >
        <Group justify="space-between" wrap="wrap">
          <div>
            <Text size="sm" c="dimmed">
              Mostrando las últimas {citasToShow.length} citas de {citas.length} filtradas
              {citas.length !== totalCitas && (
                <Text component="span" size="sm" c="blue" ml={5}>
                  (de {totalCitas} totales)
                </Text>
              )}
            </Text>
            {selectedCitas.size > 0 && (
              <Text size="sm" c="blue" fw={500} mt={4}>
                {selectedCitas.size} {selectedCitas.size === 1 ? 'cita seleccionada' : 'citas seleccionadas'}
              </Text>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text size="sm" fw={600}>
              Total facturado: {formatCurrency(totalFacturado)}
            </Text>
          </div>
        </Group>
      </Paper>
    </Paper>
  );
};

export default CitasTable;
