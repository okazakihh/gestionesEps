/**
 * NotasContablesTable.jsx
 * 
 * Componente de tabla para mostrar notas crédito y débito con acciones
 * 
 * Capa: Presentación
 */

import React, { useState, useEffect } from 'react';
import {
  Table,
  Text,
  Badge,
  Group,
  ActionIcon,
  Tooltip,
  Loader,
  Paper,
  Stack,
  TextInput,
  Select,
  Button,
  Card,
  Grid
} from '@mantine/core';
import {
  IconEye,
  IconFileDownload,
  IconMail,
  IconSearch,
  IconRefresh,
  IconFileInvoice,
  IconMinus,
  IconPlus
} from '@tabler/icons-react';
import { formatDate, formatCurrency } from '../../../negocio/services/facturacionService';

/**
 * Componente para mostrar notas contables
 * 
 * @param {Object} props
 * @param {Array} props.notas - Array de notas crédito/débito
 * @param {Function} props.onVerNota - Callback para ver detalle de una nota
 * @param {Function} props.onDescargarPDF - Callback para descargar PDF de una nota
 * @param {Function} props.onEnviarEmail - Callback para enviar email con nota
 * @param {Function} props.onActualizar - Callback para refrescar listado
 * @param {boolean} props.loading - Indica si está cargando
 */
const NotasContablesTable = ({
  notas = [],
  onVerNota,
  onDescargarPDF,
  onEnviarEmail,
  onActualizar,
  loading = false
}) => {
  // Estados de filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS'); // TODOS, CREDITO, DEBITO

  // Notas filtradas
  const [notasFiltradas, setNotasFiltradas] = useState([]);

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...notas];

    // Filtrar por tipo
    if (filtroTipo !== 'TODOS') {
      resultado = resultado.filter(nota => nota.tipoNota === filtroTipo);
    }

    // Filtrar por búsqueda (número de nota, factura relacionada, motivo)
    if (busqueda.trim()) {
      const searchLower = busqueda.toLowerCase();
      resultado = resultado.filter(nota => {
        const numeroNota = nota.numeroNota?.toLowerCase() || '';
        const numeroFactura = nota.numeroFacturaRelacionada?.toLowerCase() || '';
        const motivo = nota.motivo?.toLowerCase() || '';
        
        return (
          numeroNota.includes(searchLower) ||
          numeroFactura.includes(searchLower) ||
          motivo.includes(searchLower)
        );
      });
    }

    // Ordenar por fecha (más recientes primero)
    resultado.sort((a, b) => {
      const fechaA = new Date(a.fechaCreacion || a.fecha);
      const fechaB = new Date(b.fechaCreacion || b.fecha);
      return fechaB - fechaA;
    });

    setNotasFiltradas(resultado);
  }, [notas, busqueda, filtroTipo]);

  // Calcular totales
  const totalNotasCredito = notasFiltradas
    .filter(n => n.tipoNota === 'CREDITO')
    .reduce((sum, n) => sum + (n.total || 0), 0);

  const totalNotasDebito = notasFiltradas
    .filter(n => n.tipoNota === 'DEBITO')
    .reduce((sum, n) => sum + (n.total || 0), 0);

  const totalNeto = totalNotasDebito - totalNotasCredito;

  // Función para obtener color del badge según tipo
  const getTipoBadgeColor = (tipo) => {
    return tipo === 'CREDITO' ? 'red' : 'blue';
  };

  // Función para obtener color del badge según estado
  const getEstadoBadgeColor = (estado) => {
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

  // Renderizar estado de carga
  if (loading) {
    return (
      <Paper shadow="sm" p="md" withBorder>
        <Stack align="center" py="xl">
          <Loader size="md" />
          <Text size="sm" c="dimmed">Cargando notas contables...</Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      {/* Filtros y búsqueda */}
      <Card withBorder padding="md">
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              placeholder="Buscar por número de nota, factura o motivo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              leftSection={<IconSearch size={16} />}
              rightSection={
                busqueda && (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={() => setBusqueda('')}
                  >
                    ×
                  </ActionIcon>
                )
              }
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              placeholder="Filtrar por tipo"
              value={filtroTipo}
              onChange={setFiltroTipo}
              data={[
                { value: 'TODOS', label: '�"� Todos los tipos' },
                { value: 'CREDITO', label: '�"� Notas Crédito' },
                { value: 'DEBITO', label: '�"� Notas Débito' }
              ]}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 2 }}>
            <Button
              fullWidth
              leftSection={<IconRefresh size={16} />}
              onClick={onActualizar}
              variant="light"
            >
              Actualizar
            </Button>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Resumen de totales */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder padding="md" style={{ backgroundColor: '#fef2f2' }}>
            <Group justify="space-between">
              <Stack gap={0}>
                <Text size="xs" c="dimmed" tt="uppercase">Notas Crédito</Text>
                <Text size="xl" fw={700} c="red">
                  {formatCurrency(totalNotasCredito)}
                </Text>
              </Stack>
              <IconMinus size={32} color="#ef4444" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder padding="md" style={{ backgroundColor: '#eff6ff' }}>
            <Group justify="space-between">
              <Stack gap={0}>
                <Text size="xs" c="dimmed" tt="uppercase">Notas Débito</Text>
                <Text size="xl" fw={700} c="blue">
                  {formatCurrency(totalNotasDebito)}
                </Text>
              </Stack>
              <IconPlus size={32} color="#3b82f6" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder padding="md" style={{ backgroundColor: totalNeto >= 0 ? '#f0fdf4' : '#fef2f2' }}>
            <Group justify="space-between">
              <Stack gap={0}>
                <Text size="xs" c="dimmed" tt="uppercase">Balance Neto</Text>
                <Text size="xl" fw={700} c={totalNeto >= 0 ? 'green' : 'red'}>
                  {formatCurrency(Math.abs(totalNeto))}
                </Text>
              </Stack>
              <IconFileInvoice size={32} color={totalNeto >= 0 ? '#22c55e' : '#ef4444'} />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Tabla de notas */}
      <Paper shadow="sm" withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Número</Table.Th>
              <Table.Th>Tipo</Table.Th>
              <Table.Th>Fecha</Table.Th>
              <Table.Th>Factura Rel.</Table.Th>
              <Table.Th>Motivo</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Total</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {notasFiltradas.length > 0 ? (
              notasFiltradas.map((nota) => {
                // Generar número de nota si no existe
                const numeroNota = nota.numeroNota || nota.numero || nota.number || 
                  (nota.id ? `${nota.tipoNota === 'CREDITO' ? 'NC' : 'ND'}-${String(nota.id).padStart(6, '0')}` : 'N/A');
                
                return (
                <Table.Tr key={nota.id}>
                  <Table.Td>
                    <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                      {numeroNota}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={getTipoBadgeColor(nota.tipoNota)}
                      variant="light"
                    >
                      {nota.tipoNota === 'CREDITO' ? 'Crédito' : 'Débito'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {formatDate(nota.fechaCreacion || nota.fecha)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" style={{ fontFamily: 'monospace' }}>
                      {nota.numeroFacturaRelacionada || 'N/A'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" lineClamp={1} style={{ maxWidth: '200px' }}>
                      {nota.motivo || 'Sin motivo'}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text
                      size="sm"
                      fw={600}
                      c={nota.tipoNota === 'CREDITO' ? 'red' : 'blue'}
                    >
                      {nota.tipoNota === 'CREDITO' ? '-' : '+'} {formatCurrency(nota.total || 0)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={getEstadoBadgeColor(nota.estadoSiigo || nota.estado)}
                      variant="light"
                      size="sm"
                    >
                      {nota.estadoSiigo || nota.estado || 'Pendiente'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="center">
                      {/* Ver detalle */}
                      <Tooltip label="Ver detalles" position="top">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => onVerNota && onVerNota(nota)}
                        >
                          <IconEye size={18} />
                        </ActionIcon>
                      </Tooltip>

                      {/* Descargar PDF desde Siigo */}
                      {nota.siigoId && onDescargarPDF && (
                        <Tooltip label="Descargar PDF" position="top">
                          <ActionIcon
                            variant="light"
                            color="orange"
                            onClick={() => onDescargarPDF(nota)}
                          >
                            <IconFileDownload size={18} />
                          </ActionIcon>
                        </Tooltip>
                      )}

                      {/* Enviar por email */}
                      {nota.siigoId && onEnviarEmail && (
                        <Tooltip label="Enviar por email" position="top">
                          <ActionIcon
                            variant="light"
                            color="pink"
                            onClick={() => onEnviarEmail(nota)}
                          >
                            <IconMail size={18} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
                );
              })
            ) : (
              <Table.Tr>
                <Table.Td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                  <Stack align="center" gap="xs">
                    <IconFileInvoice size={48} color="#aaa" />
                    <Text size="sm" c="dimmed">
                      {notas.length === 0
                        ? 'No hay notas contables registradas'
                        : 'No se encontraron notas con los filtros aplicados'}
                    </Text>
                  </Stack>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>

        {/* Footer con total de registros */}
        {notasFiltradas.length > 0 && (
          <Group justify="space-between" p="md" style={{ borderTop: '1px solid #e9ecef' }}>
            <Text size="sm" c="dimmed">
              Mostrando {notasFiltradas.length} de {notas.length} notas contables
            </Text>
          </Group>
        )}
      </Paper>
    </Stack>
  );
};

export default NotasContablesTable;
