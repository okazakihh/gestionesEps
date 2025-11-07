import { Paper, Text, Group, Stack, Divider, SimpleGrid, Box, Table } from '@mantine/core';
import { forwardRef } from 'react';

/**
 * Componente de Desprendible de Pago (Colilla de Nómina)
 * Según normativa colombiana
 */
export const DesprendiblePago = forwardRef(({ nomina, empresa }, ref) => {
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

  /**
   * Formatea fecha
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Paper 
      ref={ref}
      p="xl" 
      style={{ 
        width: '210mm', 
        minHeight: '297mm',
        margin: '0 auto',
        backgroundColor: 'white',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      }}
    >
      {/* Encabezado de la Empresa */}
      <Box mb="xl" style={{ borderBottom: '3px solid #228BE6', paddingBottom: '1rem' }}>
        <Text size="xl" fw={900} c="blue.7" ta="center">
          {empresa?.nombre || 'NOMBRE DE LA EMPRESA'}
        </Text>
        <Text size="sm" ta="center" c="dimmed">
          NIT: {empresa?.nit || '000.000.000-0'}
        </Text>
        <Text size="sm" ta="center" c="dimmed">
          {empresa?.direccion || 'Dirección de la empresa'}
        </Text>
        <Text size="lg" fw={700} ta="center" mt="md" c="blue.6">
          DESPRENDIBLE DE PAGO
        </Text>
        <Text size="sm" ta="center" c="dimmed">
          Periodo: {nomina.periodo}
        </Text>
      </Box>

      {/* Información del Empleado */}
      <Paper p="md" mb="lg" withBorder>
        <Text size="sm" fw={700} mb="sm" c="blue.7">DATOS DEL EMPLEADO</Text>
        <SimpleGrid cols={2} spacing="xs">
          <Box>
            <Text size="xs" c="dimmed">Nombre:</Text>
            <Text size="sm" fw={600}>{nomina.empleadoNombre || '-'}</Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">Documento:</Text>
            <Text size="sm" fw={600}>{nomina.empleadoDocumento || '-'}</Text>
          </Box>
          {nomina.cargo && (
            <Box>
              <Text size="xs" c="dimmed">Cargo:</Text>
              <Text size="sm">{nomina.cargo}</Text>
            </Box>
          )}
          <Box>
            <Text size="xs" c="dimmed">Fecha de Pago:</Text>
            <Text size="sm">{formatDate(nomina.fechaPago)}</Text>
          </Box>
        </SimpleGrid>
      </Paper>

      {/* Tabla de Devengados */}
      <Paper p="md" mb="md" withBorder>
        <Text size="sm" fw={700} mb="sm" c="green.7">DEVENGADOS</Text>
        <Table striped withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Concepto</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Valor</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Salario Básico ({nomina.diasTrabajados || 30} días)</Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(nomina.salarioBase)}</Table.Td>
            </Table.Tr>
            
            {nomina.auxilioTransporte > 0 && (
              <Table.Tr>
                <Table.Td>Auxilio de Transporte</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(nomina.auxilioTransporte)}</Table.Td>
              </Table.Tr>
            )}

            {nomina.horasExtrasDiurnas > 0 && (
              <Table.Tr>
                <Table.Td>Horas Extras Diurnas ({nomina.horasExtrasDiurnas}h)</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(nomina.valorHorasExtrasDiurnas || 0)}</Table.Td>
              </Table.Tr>
            )}

            {nomina.horasExtrasNocturnas > 0 && (
              <Table.Tr>
                <Table.Td>Horas Extras Nocturnas ({nomina.horasExtrasNocturnas}h)</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(nomina.valorHorasExtrasNocturnas || 0)}</Table.Td>
              </Table.Tr>
            )}

            {nomina.horasExtrasDominicales > 0 && (
              <Table.Tr>
                <Table.Td>Horas Extras Dominicales ({nomina.horasExtrasDominicales}h)</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(nomina.valorHorasExtrasDominicales || 0)}</Table.Td>
              </Table.Tr>
            )}

            {nomina.horasRecargoNocturno > 0 && (
              <Table.Tr>
                <Table.Td>Recargo Nocturno ({nomina.horasRecargoNocturno}h)</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(nomina.valorRecargoNocturno || 0)}</Table.Td>
              </Table.Tr>
            )}

            {nomina.horasRecargoDominical > 0 && (
              <Table.Tr>
                <Table.Td>Recargo Dominical ({nomina.horasRecargoDominical}h)</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(nomina.valorRecargoDominical || 0)}</Table.Td>
              </Table.Tr>
            )}

            {nomina.bonificaciones > 0 && (
              <Table.Tr>
                <Table.Td>Bonificaciones</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(nomina.bonificaciones)}</Table.Td>
              </Table.Tr>
            )}

            {nomina.comisiones > 0 && (
              <Table.Tr>
                <Table.Td>Comisiones</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(nomina.comisiones)}</Table.Td>
              </Table.Tr>
            )}

            {nomina.otrosIngresos > 0 && (
              <Table.Tr>
                <Table.Td>Otros Ingresos</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(nomina.otrosIngresos)}</Table.Td>
              </Table.Tr>
            )}

            <Table.Tr style={{ backgroundColor: '#d3f9d8' }}>
              <Table.Td><Text fw={700}>TOTAL DEVENGADO</Text></Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>
                <Text fw={700}>{formatCurrency(nomina.totalDevengado)}</Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Tabla de Deducciones */}
      <Paper p="md" mb="md" withBorder>
        <Text size="sm" fw={700} mb="sm" c="red.7">DEDUCCIONES</Text>
        <Table striped withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Concepto</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Valor</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Salud (4%)</Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(nomina.deduccionSalud || 0)}</Table.Td>
            </Table.Tr>

            <Table.Tr>
              <Table.Td>Pensión (4%)</Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(nomina.deduccionPension || 0)}</Table.Td>
            </Table.Tr>

            {nomina.prestamos > 0 && (
              <Table.Tr>
                <Table.Td>Préstamos</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(nomina.prestamos)}</Table.Td>
              </Table.Tr>
            )}

            {nomina.embargos > 0 && (
              <Table.Tr>
                <Table.Td>Embargos</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(nomina.embargos)}</Table.Td>
              </Table.Tr>
            )}

            {nomina.otrasDeducciones > 0 && (
              <Table.Tr>
                <Table.Td>Otras Deducciones</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(nomina.otrasDeducciones)}</Table.Td>
              </Table.Tr>
            )}

            <Table.Tr style={{ backgroundColor: '#ffe0e0' }}>
              <Table.Td><Text fw={700}>TOTAL DEDUCCIONES</Text></Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>
                <Text fw={700}>{formatCurrency(nomina.totalDeducciones)}</Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Neto a Pagar */}
      <Paper p="lg" mb="lg" withBorder style={{ backgroundColor: '#228BE6' }}>
        <Group justify="space-between">
          <Text size="lg" fw={900} c="white">NETO A PAGAR</Text>
          <Text size="xl" fw={900} c="white">
            {formatCurrency(nomina.netoPagar)}
          </Text>
        </Group>
      </Paper>

      {/* Aportes del Empleador (Informativo) */}
      {(nomina.aporteEmpleadorSalud || nomina.aporteEmpleadorPension || nomina.aporteEmpleadorARL) && (
        <Paper p="md" mb="lg" withBorder bg="gray.0">
          <Text size="sm" fw={700} mb="sm" c="gray.7">APORTES DEL EMPLEADOR (Informativo)</Text>
          <SimpleGrid cols={3} spacing="xs">
            {nomina.aporteEmpleadorSalud > 0 && (
              <Box>
                <Text size="xs" c="dimmed">Salud (8.5%)</Text>
                <Text size="sm" fw={600}>{formatCurrency(nomina.aporteEmpleadorSalud)}</Text>
              </Box>
            )}
            {nomina.aporteEmpleadorPension > 0 && (
              <Box>
                <Text size="xs" c="dimmed">Pensión (12%)</Text>
                <Text size="sm" fw={600}>{formatCurrency(nomina.aporteEmpleadorPension)}</Text>
              </Box>
            )}
            {nomina.aporteEmpleadorARL > 0 && (
              <Box>
                <Text size="xs" c="dimmed">ARL</Text>
                <Text size="sm" fw={600}>{formatCurrency(nomina.aporteEmpleadorARL)}</Text>
              </Box>
            )}
          </SimpleGrid>
        </Paper>
      )}

      {/* Observaciones */}
      {nomina.observaciones && (
        <Paper p="md" mb="lg" withBorder>
          <Text size="xs" fw={700} mb="xs">Observaciones:</Text>
          <Text size="xs" c="dimmed">{nomina.observaciones}</Text>
        </Paper>
      )}

      {/* Firma y Pie de Página */}
      <Box mt="xl" pt="xl" style={{ borderTop: '1px solid #dee2e6' }}>
        <SimpleGrid cols={2} spacing="xl">
          <Box>
            <div style={{ borderTop: '1px solid black', marginTop: '3rem', paddingTop: '0.5rem' }}>
              <Text size="xs" ta="center" fw={600}>Firma del Empleado</Text>
            </div>
          </Box>
          <Box>
            <div style={{ borderTop: '1px solid black', marginTop: '3rem', paddingTop: '0.5rem' }}>
              <Text size="xs" ta="center" fw={600}>Firma del Empleador</Text>
            </div>
          </Box>
        </SimpleGrid>

        <Text size="xs" ta="center" c="dimmed" mt="xl">
          Este documento es un desprendible de pago y debe ser conservado como soporte de los pagos realizados.
        </Text>
        <Text size="xs" ta="center" c="dimmed">
          Generado el {new Date().toLocaleDateString('es-CO')} - Sistema de Gestión de Nómina
        </Text>
      </Box>
    </Paper>
  );
});

DesprendiblePago.displayName = 'DesprendiblePago';
