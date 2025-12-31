/**
 * ReporteFacturacionView.jsx
 * 
 * Vista del reporte de facturación generado
 * 
 * Capa: Presentación
 */

import React from 'react';
import { Card, Text, Grid, Group, Badge, Stack, Table, Button } from '@mantine/core';
import { IconDownload, IconCurrencyDollar } from '@tabler/icons-react';

/**
 * Vista del reporte de facturación
 */
export const ReporteFacturacionView = ({ reporte, onExportar }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getEstadoColor = (estado) => {
    const estados = {
      'ACEPTADA': 'green',
      'RECHAZADA': 'red',
      'PENDIENTE': 'yellow',
      'Sin estado': 'gray'
    };
    return estados[estado] || 'gray';
  };

  return (
    <Stack gap="md">
      {/* Header con período */}
      <Card withBorder padding="lg">
        <Group justify="space-between">
          <Stack gap={4}>
            <Text size="lg" fw={700}>Reporte de Facturación</Text>
            <Text size="sm" c="dimmed">
              Período: {formatDate(reporte.periodo.fechaInicio)} - {formatDate(reporte.periodo.fechaFin)}
            </Text>
          </Stack>
          <Button
            leftSection={<IconDownload size={18} />}
            onClick={onExportar}
            variant="light"
            color="green"
          >
            Exportar Excel
          </Button>
        </Group>
      </Card>

      {/* Tarjetas de resumen */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="md" style={{ backgroundColor: '#eff6ff' }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed" tt="uppercase">Total Facturas</Text>
              <Text size="xl" fw={700} c="blue">{reporte.totalFacturas}</Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="md" style={{ backgroundColor: '#f0fdf4' }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed" tt="uppercase">Total Ingresos</Text>
              <Text size="xl" fw={700} c="green">{formatCurrency(reporte.totalIngresos)}</Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="md" style={{ backgroundColor: '#faf5ff' }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed" tt="uppercase">Promedio por Factura</Text>
              <Text size="xl" fw={700} c="purple">{formatCurrency(reporte.promedioFactura)}</Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Distribuciones */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg">
            <Text size="md" fw={600} mb="md">Por Estado</Text>
            <Stack gap="sm">
              {Object.entries(reporte.facturasPorEstado).map(([estado, cantidad]) => (
                <Group key={estado} justify="space-between">
                  <Badge color={getEstadoColor(estado)} variant="light">
                    {estado}
                  </Badge>
                  <Text fw={600}>{cantidad}</Text>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg">
            <Text size="md" fw={600} mb="md">Por Tipo de Cliente</Text>
            <Stack gap="sm">
              {Object.entries(reporte.facturasPorTipo).map(([tipo, cantidad]) => (
                <Group key={tipo} justify="space-between">
                  <Badge color={tipo === 'ENTIDAD' ? 'blue' : 'orange'} variant="light">
                    {tipo}
                  </Badge>
                  <Text fw={600}>{cantidad}</Text>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Tabla de detalle (primeras 10) */}
      <Card withBorder padding="lg">
        <Text size="md" fw={600} mb="md">Detalle de Facturas (Primeras 10)</Text>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Número</Table.Th>
              <Table.Th>Fecha</Table.Th>
              <Table.Th>Cliente</Table.Th>
              <Table.Th>Tipo</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Total</Table.Th>
              <Table.Th>Estado</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {reporte.detalleFacturas.slice(0, 10).map((factura, index) => (
              <Table.Tr key={index}>
                <Table.Td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {factura.numero}
                </Table.Td>
                <Table.Td>{formatDate(factura.fecha)}</Table.Td>
                <Table.Td>{factura.cliente}</Table.Td>
                <Table.Td>
                  <Badge size="sm" variant="light" color={factura.tipo === 'ENTIDAD' ? 'blue' : 'orange'}>
                    {factura.tipo}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: 'right', fontWeight: 600 }}>
                  {formatCurrency(factura.total)}
                </Table.Td>
                <Table.Td>
                  <Badge size="sm" color={getEstadoColor(factura.estado)} variant="light">
                    {factura.estado}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        {reporte.detalleFacturas.length > 10 && (
          <Text size="xs" c="dimmed" mt="sm" ta="center">
            Mostrando 10 de {reporte.detalleFacturas.length} facturas. Exporta para ver todas.
          </Text>
        )}
      </Card>
    </Stack>
  );
};

export default ReporteFacturacionView;
