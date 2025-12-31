/**
 * ReporteCitasView.jsx
 * 
 * Vista del reporte de citas generado
 * 
 * Capa: Presentación
 */

import React from 'react';
import { Card, Text, Grid, Group, Badge, Stack, Table, Button, Progress } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

/**
 * Vista del reporte de citas
 */
export const ReporteCitasView = ({ reporte, onExportar }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getEstadoColor = (estado) => {
    const estados = {
      'AGENDADA': 'blue',
      'ATENDIDA': 'green',
      'CANCELADA': 'red',
      'NO_ASISTIO': 'orange'
    };
    return estados[estado] || 'gray';
  };

  // Top 10 médicos
  const topMedicos = Object.entries(reporte.citasPorMedico)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Top 5 procedimientos
  const topProcedimientos = Object.entries(reporte.citasPorProcedimiento)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxProcedimientos = topProcedimientos[0]?.[1] || 1;

  return (
    <Stack gap="md">
      {/* Header */}
      <Card withBorder padding="lg">
        <Group justify="space-between">
          <Stack gap={4}>
            <Text size="lg" fw={700}>Reporte de Citas</Text>
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
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder padding="md" style={{ backgroundColor: '#eff6ff' }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed" tt="uppercase">Total Citas</Text>
              <Text size="xl" fw={700} c="blue">{reporte.totalCitas}</Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder padding="md" style={{ backgroundColor: '#f0fdf4' }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed" tt="uppercase">Tasa Asistencia</Text>
              <Text size="xl" fw={700} c="green">{reporte.tasaAsistencia}%</Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder padding="md" style={{ backgroundColor: '#fef2f2' }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed" tt="uppercase">Canceladas</Text>
              <Text size="xl" fw={700} c="red">{reporte.citasPorEstado.CANCELADA || 0}</Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder padding="md" style={{ backgroundColor: '#fff7ed' }}>
            <Stack gap="xs">
              <Text size="sm" c="dimmed" tt="uppercase">No Asistió</Text>
              <Text size="xl" fw={700} c="orange">{reporte.citasPorEstado.NO_ASISTIO || 0}</Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Distribución por estado */}
      <Card withBorder padding="lg">
        <Text size="md" fw={600} mb="md">Distribución por Estado</Text>
        <Stack gap="sm">
          {Object.entries(reporte.citasPorEstado).map(([estado, cantidad]) => {
            const porcentaje = reporte.totalCitas > 0 ? (cantidad / reporte.totalCitas * 100).toFixed(1) : 0;
            return (
              <Stack key={estado} gap="xs">
                <Group justify="space-between">
                  <Badge color={getEstadoColor(estado)} variant="light">
                    {estado}
                  </Badge>
                  <Text size="sm" fw={600}>{cantidad} ({porcentaje}%)</Text>
                </Group>
                <Progress value={parseFloat(porcentaje)} color={getEstadoColor(estado)} size="sm" />
              </Stack>
            );
          })}
        </Stack>
      </Card>

      {/* Top procedimientos */}
      <Card withBorder padding="lg">
        <Text size="md" fw={600} mb="md">Procedimientos Más Frecuentes</Text>
        <Stack gap="md">
          {topProcedimientos.map(([procedimiento, cantidad]) => {
            const porcentaje = (cantidad / maxProcedimientos * 100);
            return (
              <Stack key={procedimiento} gap="xs">
                <Group justify="space-between">
                  <Text size="sm" truncate style={{ flex: 1 }}>
                    {procedimiento}
                  </Text>
                  <Text size="sm" fw={600}>{cantidad}</Text>
                </Group>
                <Progress value={porcentaje} color="blue" size="md" />
              </Stack>
            );
          })}
        </Stack>
      </Card>

      {/* Top médicos */}
      <Card withBorder padding="lg">
        <Text size="md" fw={600} mb="md">Top 10 Médicos por Citas</Text>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Posición</Table.Th>
              <Table.Th>Médico</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Citas</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {topMedicos.map(([medico, cantidad], index) => (
              <Table.Tr key={medico}>
                <Table.Td>
                  <Badge variant="filled" color={index < 3 ? 'yellow' : 'gray'} size="lg">
                    {index + 1}
                  </Badge>
                </Table.Td>
                <Table.Td fw={500}>{medico}</Table.Td>
                <Table.Td style={{ textAlign: 'right' }} fw={600}>{cantidad}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Detalle de citas (primeras 10) */}
      <Card withBorder padding="lg">
        <Text size="md" fw={600} mb="md">Detalle de Citas (Primeras 10)</Text>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Fecha</Table.Th>
              <Table.Th>Paciente</Table.Th>
              <Table.Th>Médico</Table.Th>
              <Table.Th>Procedimiento</Table.Th>
              <Table.Th>Estado</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {reporte.detalleCitas.slice(0, 10).map((cita, index) => (
              <Table.Tr key={index}>
                <Table.Td>{formatDate(cita.fecha)}</Table.Td>
                <Table.Td>{cita.paciente}</Table.Td>
                <Table.Td>{cita.medico}</Table.Td>
                <Table.Td>{cita.procedimiento}</Table.Td>
                <Table.Td>
                  <Badge size="sm" color={getEstadoColor(cita.estado)} variant="light">
                    {cita.estado}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        {reporte.detalleCitas.length > 10 && (
          <Text size="xs" c="dimmed" mt="sm" ta="center">
            Mostrando 10 de {reporte.detalleCitas.length} citas. Exporta para ver todas.
          </Text>
        )}
      </Card>
    </Stack>
  );
};

export default ReporteCitasView;
