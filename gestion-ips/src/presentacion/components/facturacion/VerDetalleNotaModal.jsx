/**
 * VerDetalleNotaModal.jsx
 * 
 * Modal para mostrar detalles completos de una nota crédito o débito
 * 
 * Capa: Presentación
 */

import React from 'react';
import {
  Modal,
  Text,
  Badge,
  Group,
  Stack,
  Table,
  Paper,
  Divider,
  Grid,
  Card,
  Timeline
} from '@mantine/core';
import {
  IconFileInvoice,
  IconCalendar,
  IconCreditCard,
  IconFileText,
  IconUser,
  IconCurrencyDollar,
  IconCheck,
  IconClock,
  IconAlertCircle
} from '@tabler/icons-react';
import { formatDate, formatCurrency } from '../../../negocio/services/facturacionService';

/**
 * Modal para ver detalles de una nota contable
 */
const VerDetalleNotaModal = ({ opened, onClose, nota }) => {
  if (!nota) return null;

  // Generar número de nota si no existe
  const numeroNota = nota.numeroNota || nota.numero || nota.number || 
    (nota.id ? `${nota.tipoNota === 'CREDITO' ? 'NC' : 'ND'}-${String(nota.id).padStart(6, '0')}` : 'N/A');

  // Determinar color según tipo de nota
  const tipoColor = nota.tipoNota === 'CREDITO' ? 'red' : 'blue';
  
  // Determinar color según estado
  const getEstadoColor = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'ACEPTADA':
      case 'ACTIVA':
        return 'green';
      case 'PENDIENTE':
        return 'yellow';
      case 'RECHAZADA':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <Text size="lg" fw={700}>
            {tipoIcon} Detalle de Nota {nota.tipoNota === 'CREDITO' ? 'Crédito' : 'Débito'}
          </Text>
          <Badge color={tipoColor} variant="filled">
            {numeroNota}
          </Badge>
        </Group>
      }
      size="xl"
      padding="lg"
    >
      <Stack gap="md">
        {/* Información general */}
        <Card withBorder padding="md">
          <Text size="sm" fw={600} c="dimmed" mb="xs">INFORMACIÓN GENERAL</Text>
          <Grid>
            <Grid.Col span={6}>
              <Group gap="xs">
                <IconFileInvoice size={18} color="#666" />
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">Número de Nota</Text>
                  <Text size="sm" fw={600} style={{ fontFamily: 'monospace' }}>
                    {numeroNota}
                  </Text>
                </Stack>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group gap="xs">
                <IconCalendar size={18} color="#666" />
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">Fecha de Emisión</Text>
                  <Text size="sm" fw={600}>
                    {formatDate(nota.fechaEmision || nota.fechaCreacion || nota.fecha)}
                  </Text>
                </Stack>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group gap="xs">
                <IconFileText size={18} color="#666" />
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">Factura Relacionada</Text>
                  <Text size="sm" fw={600} style={{ fontFamily: 'monospace' }}>
                    {nota.numeroFacturaRelacionada || nota.numeroFacturaOriginal || 'N/A'}
                  </Text>
                </Stack>
              </Group>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group gap="xs">
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">Estado</Text>
                  <Badge color={getEstadoColor(nota.estadoSiigo || nota.estado)} variant="light">
                    {nota.estadoSiigo || nota.estadoDian || nota.estado || 'Pendiente'}
                  </Badge>
                </Stack>
              </Group>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Motivo */}
        <Card withBorder padding="md">
          <Text size="sm" fw={600} c="dimmed" mb="xs">MOTIVO</Text>
          <Group align="flex-start" gap="xs">
            <IconAlertCircle size={18} color="#666" style={{ marginTop: 2 }} />
            <Stack gap={4} style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                {nota.motivo || 'Sin motivo especificado'}
              </Text>
              {nota.motivoDian && (
                <Text size="xs" c="dimmed">
                  Código DIAN: {nota.motivoDian}
                </Text>
              )}
              {nota.observaciones && (
                <Text size="xs" c="dimmed" mt="xs">
                  Observaciones: {nota.observaciones}
                </Text>
              )}
            </Stack>
          </Group>
        </Card>

        {/* Servicios afectados */}
        {nota.serviciosAfectados && nota.serviciosAfectados.length > 0 && (
          <Card withBorder padding="md">
            <Text size="sm" fw={600} c="dimmed" mb="xs">SERVICIOS AFECTADOS</Text>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Código</Table.Th>
                  <Table.Th>Descripción</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Cantidad</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Valor Unit.</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Total</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {nota.serviciosAfectados.map((servicio, index) => (
                  <Table.Tr key={index}>
                    <Table.Td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {servicio.codigo || servicio.codigoCups || 'N/A'}
                    </Table.Td>
                    <Table.Td>{servicio.descripcion || servicio.nombre || 'N/A'}</Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      {servicio.cantidad || 1}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      {formatCurrency(servicio.valorUnitario || servicio.valor || 0)}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }} fw={600}>
                      {formatCurrency((servicio.cantidad || 1) * (servicio.valorUnitario || servicio.valor || 0))}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}

        {/* Items (si no hay serviciosAfectados pero hay items) */}
        {(!nota.serviciosAfectados || nota.serviciosAfectados.length === 0) && nota.items && nota.items.length > 0 && (
          <Card withBorder padding="md">
            <Text size="sm" fw={600} c="dimmed" mb="xs">ITEMS</Text>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Descripción</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Cantidad</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Valor</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {nota.items.map((item, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{item.descripcion || item.description || 'N/A'}</Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      {item.cantidad || item.quantity || 1}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }} fw={600}>
                      {formatCurrency(item.total || item.value || 0)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}

        {/* Totales */}
        <Card withBorder padding="md" style={{ backgroundColor: nota.tipoNota === 'CREDITO' ? '#fef2f2' : '#eff6ff' }}>
          <Grid>
            <Grid.Col span={8}>
              <Text size="sm" fw={600} c="dimmed" mb="xs">TOTALES</Text>
              <Stack gap="xs">
                {nota.subtotal !== undefined && (
                  <Group justify="space-between">
                    <Text size="sm">Subtotal:</Text>
                    <Text size="sm" fw={500}>{formatCurrency(nota.subtotal)}</Text>
                  </Group>
                )}
                {nota.impuestos !== undefined && nota.impuestos > 0 && (
                  <Group justify="space-between">
                    <Text size="sm">Impuestos:</Text>
                    <Text size="sm" fw={500}>{formatCurrency(nota.impuestos)}</Text>
                  </Group>
                )}
                <Divider />
                <Group justify="space-between">
                  <Text size="md" fw={700}>Total {nota.tipoNota === 'CREDITO' ? '(A favor del cliente)' : '(A favor del proveedor)'}:</Text>
                  <Text size="xl" fw={700} c={nota.tipoNota === 'CREDITO' ? 'red' : 'blue'}>
                    {nota.tipoNota === 'CREDITO' ? '-' : '+'} {formatCurrency(nota.total || 0)}
                  </Text>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Información de Siigo */}
        {nota.siigoId && (
          <Card withBorder padding="md">
            <Text size="sm" fw={600} c="dimmed" mb="xs">INFORMACIÓN DE SIIGO</Text>
            <Grid>
              <Grid.Col span={6}>
                <Stack gap={4}>
                  <Text size="xs" c="dimmed">ID Siigo</Text>
                  <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                    {nota.siigoId}
                  </Text>
                </Stack>
              </Grid.Col>
              {nota.cufe && (
                <Grid.Col span={12}>
                  <Stack gap={4}>
                    <Text size="xs" c="dimmed">CUFE</Text>
                    <Text size="xs" style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {nota.cufe}
                    </Text>
                  </Stack>
                </Grid.Col>
              )}
            </Grid>
          </Card>
        )}

        {/* Timeline de estados */}
        {(nota.fechaCreacionDB || nota.fechaActualizacionDB) && (
          <Card withBorder padding="md">
            <Text size="sm" fw={600} c="dimmed" mb="xs">HISTORIAL</Text>
            <Timeline active={1} bulletSize={20} lineWidth={2}>
              {nota.fechaCreacionDB && (
                <Timeline.Item bullet={<IconClock size={12} />} title="Creada">
                  <Text size="xs" c="dimmed">{formatDate(nota.fechaCreacionDB)}</Text>
                </Timeline.Item>
              )}
              {nota.fechaActualizacionDB && nota.fechaActualizacionDB !== nota.fechaCreacionDB && (
                <Timeline.Item bullet={<IconCheck size={12} />} title="Última actualización">
                  <Text size="xs" c="dimmed">{formatDate(nota.fechaActualizacionDB)}</Text>
                </Timeline.Item>
              )}
            </Timeline>
          </Card>
        )}
      </Stack>
    </Modal>
  );
};

export default VerDetalleNotaModal;
