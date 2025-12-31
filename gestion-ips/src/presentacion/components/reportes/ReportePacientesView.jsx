/**
 * ReportePacientesView.jsx
 * 
 * Vista del reporte de pacientes generado
 * 
 * Capa: Presentación
 */

import React from 'react';
import { Card, Text, Grid, Group, Stack, RingProgress, Button, Table } from '@mantine/core';
import { IconDownload, IconUsers } from '@tabler/icons-react';

/**
 * Vista del reporte de pacientes
 */
export const ReportePacientesView = ({ reporte, onExportar }) => {
  
  // Calcular porcentajes de género
  const totalGenero = Object.values(reporte.pacientesPorGenero).reduce((a, b) => a + b, 0);
  const generoData = Object.entries(reporte.pacientesPorGenero).map(([genero, cantidad]) => ({
    label: genero,
    value: cantidad,
    percentage: totalGenero > 0 ? (cantidad / totalGenero * 100).toFixed(1) : 0,
    color: genero === 'MASCULINO' ? '#3b82f6' : genero === 'FEMENINO' ? '#ec4899' : '#a855f7'
  }));

  // Top 10 EPS
  const topEPS = Object.entries(reporte.pacientesPorEPS)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <Stack gap="md">
      {/* Header */}
      <Card withBorder padding="lg">
        <Group justify="space-between">
          <Stack gap={4}>
            <Text size="lg" fw={700}>Reporte de Pacientes</Text>
            <Text size="sm" c="dimmed">
              Estadísticas generales de la base de pacientes
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

      {/* Total pacientes */}
      <Card withBorder padding="lg" style={{ backgroundColor: '#eff6ff' }}>
        <Group>
          <div style={{ color: '#3b82f6' }}>
            <IconUsers size={48} />
          </div>
          <Stack gap={4}>
            <Text size="sm" c="dimmed" tt="uppercase">Total Pacientes Registrados</Text>
            <Text size="2xl" fw={700} c="blue">{reporte.totalPacientes}</Text>
          </Stack>
        </Group>
      </Card>

      {/* Distribución por género */}
      <Card withBorder padding="lg">
        <Text size="md" fw={600} mb="lg">Distribución por Género</Text>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Group justify="center">
              <RingProgress
                size={200}
                thickness={20}
                sections={generoData.map(g => ({
                  value: parseFloat(g.percentage),
                  color: g.color,
                  tooltip: `${g.label}: ${g.value} (${g.percentage}%)`
                }))}
                label={
                  <div style={{ textAlign: 'center' }}>
                    <Text size="sm" fw={700}>{totalGenero}</Text>
                    <Text size="xs" c="dimmed">Total</Text>
                  </div>
                }
              />
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="md" justify="center" style={{ height: '100%' }}>
              {generoData.map(genero => (
                <Group key={genero.label} justify="space-between">
                  <Group gap="sm">
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: genero.color
                      }}
                    />
                    <Text size="sm" fw={500}>{genero.label}</Text>
                  </Group>
                  <Text size="sm" fw={600}>
                    {genero.value} ({genero.percentage}%)
                  </Text>
                </Group>
              ))}
            </Stack>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Distribución por rango de edad */}
      <Card withBorder padding="lg">
        <Text size="md" fw={600} mb="md">Distribución por Rango de Edad</Text>
        <Grid>
          {Object.entries(reporte.pacientesPorRangoEdad).map(([rango, cantidad]) => {
            const total = Object.values(reporte.pacientesPorRangoEdad).reduce((a, b) => a + b, 0);
            const porcentaje = total > 0 ? (cantidad / total * 100).toFixed(1) : 0;
            return (
              <Grid.Col key={rango} span={{ base: 6, sm: 4, md: 2.4 }}>
                <Card withBorder padding="sm" style={{ textAlign: 'center' }}>
                  <Text size="xl" fw={700} c="blue">{cantidad}</Text>
                  <Text size="xs" c="dimmed">{rango} años</Text>
                  <Text size="xs" c="dimmed">({porcentaje}%)</Text>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      </Card>

      {/* Top 10 EPS */}
      <Card withBorder padding="lg">
        <Text size="md" fw={600} mb="md">Top 10 EPS con Más Pacientes</Text>
        <Table striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Posición</Table.Th>
              <Table.Th>EPS</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Pacientes</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Porcentaje</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {topEPS.map(([eps, cantidad], index) => {
              const porcentaje = (cantidad / reporte.totalPacientes * 100).toFixed(1);
              return (
                <Table.Tr key={eps}>
                  <Table.Td>
                    <Text fw={700} c={index < 3 ? 'blue' : 'dimmed'}>
                      #{index + 1}
                    </Text>
                  </Table.Td>
                  <Table.Td fw={500}>{eps}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }} fw={600}>{cantidad}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }} c="dimmed">{porcentaje}%</Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
};

export default ReportePacientesView;
