import React from 'react';
import { Table, Text, Badge, Group, ActionIcon, Tooltip, Loader, Paper, Stack } from '@mantine/core';
import { IconEye, IconPrinter, IconCheck, IconCloud, IconCloudCheck, IconFileCode } from '@tabler/icons-react';
import { formatDate, formatCurrency } from '../../../negocio/services/facturacionService';

/**
 * FacturasTable.jsx
 * 
 * Componente de tabla para mostrar facturas creadas con acciones
 * 
 * Props:
 * - facturas: Array de facturas guardadas
 * - facturasFiltered: Array de facturas filtradas (para mostrar)
 * - onVerFactura: función para ver detalles de una factura
 * - onGenerarPDF: función para generar PDF de una factura
 * - onProcesarFactura: función para marcar factura como pagada
 * - loading: boolean que indica si se están cargando datos
 * - limit: número máximo de facturas a mostrar (default: 10)
 * 
 * Capa: Presentación
 */

const FacturasTable = ({
  facturas = [],
  facturasFiltered = [],
  onVerFactura,
  onGenerarPDF,
  onProcesarFactura,
  onEnviarDian,
  onConsultarEstadoDian,
  onVerXML,
  loading = false,
  limit = 10
}) => {
  // Calcular el total facturado de las facturas filtradas
  const totalFacturado = facturasFiltered.reduce((total, factura) => {
    try {
      const facturaData = JSON.parse(factura.jsonData || '{}');
      return total + (facturaData.total || 0);
    } catch (error) {
      console.error('Error parsing factura data:', error);
      return total;
    }
  }, 0);

  // Obtener solo las facturas a mostrar según el límite
  const facturasToShow = facturasFiltered.slice(0, limit);

  // Función auxiliar para obtener el color del badge según el estado
  const getEstadoBadgeColor = (estado) => {
    switch (estado) {
      case 'PAGADA':
        return 'green';
      case 'PENDIENTE':
        return 'yellow';
      case 'CANCELADA':
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
          <Text size="sm" c="dimmed">Cargando facturas...</Text>
        </Stack>
      </Paper>
    );
  }

  // Renderizar estado vacío
  if (!loading && facturas.length === 0) {
    return (
      <Paper shadow="sm" p="md" withBorder>
        <Stack align="center" py="xl">
          <Text size="sm" c="dimmed">No hay facturas creadas</Text>
        </Stack>
      </Paper>
    );
  }

  // Renderizar cuando no hay resultados después de filtrar
  if (!loading && facturas.length > 0 && facturasFiltered.length === 0) {
    return (
      <Paper shadow="sm" p="md" withBorder>
        <Stack align="center" py="xl">
          <Text size="sm" c="dimmed">No hay facturas que coincidan con los filtros aplicados</Text>
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
              <Table.Th>Número Factura</Table.Th>
              <Table.Th>Fecha Emisión</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Total</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {facturasToShow.map((factura) => {
              let facturaData = {};
              try {
                facturaData = JSON.parse(factura.jsonData || '{}');
              } catch (error) {
                console.error('Error parsing factura data:', error);
              }

              const numeroFactura = facturaData.numeroFactura || `FM-${factura.id}`;
              const fechaEmision = facturaData.fechaEmision || factura.fechaCreacion;
              const total = facturaData.total || 0;
              const estado = facturaData.estado || 'PENDIENTE';

              return (
                <Table.Tr key={factura.id}>
                  <Table.Td>
                    <Text size="sm" fw={600}>
                      {numeroFactura}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {formatDate(fechaEmision)}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text size="sm" fw={600} c="green">
                      {formatCurrency(total)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge 
                      variant="light" 
                      color={getEstadoBadgeColor(estado)}
                      size="md"
                    >
                      {estado}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      <Tooltip label="Ver detalles de la factura" position="top">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => onVerFactura(factura)}
                          aria-label="Ver detalles"
                        >
                          <IconEye size={18} />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label="Generar PDF de la factura" position="top">
                        <ActionIcon
                          variant="light"
                          color="violet"
                          onClick={() => onGenerarPDF(factura)}
                          aria-label="Generar PDF"
                        >
                          <IconPrinter size={18} />
                        </ActionIcon>
                      </Tooltip>

                      {estado === 'PENDIENTE' && (
                        <Tooltip label="Marcar como pagada" position="top">
                          <ActionIcon
                            variant="light"
                            color="green"
                            onClick={() => onProcesarFactura(factura)}
                            aria-label="Procesar factura"
                          >
                            <IconCheck size={18} />
                          </ActionIcon>
                        </Tooltip>
                      )}

                      {/* Botones de integración DIAN */}
                      {facturaData.cufe ? (
                        <>
                          <Tooltip label="Consultar estado en DIAN" position="top">
                            <ActionIcon
                              variant="light"
                              color="teal"
                              onClick={() => onConsultarEstadoDian && onConsultarEstadoDian(factura, facturaData)}
                              aria-label="Consultar DIAN"
                            >
                              <IconCloudCheck size={18} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Ver XML" position="top">
                            <ActionIcon
                              variant="light"
                              color="grape"
                              onClick={() => onVerXML && onVerXML(factura, facturaData)}
                              aria-label="Ver XML"
                            >
                              <IconFileCode size={18} />
                            </ActionIcon>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip label="Enviar a DIAN (Facturación Electrónica)" position="top">
                          <ActionIcon
                            variant="light"
                            color="indigo"
                            onClick={() => onEnviarDian && onEnviarDian(factura)}
                            aria-label="Enviar a DIAN"
                          >
                            <IconCloud size={18} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
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
          <Text size="sm" c="dimmed">
            Mostrando las últimas {facturasToShow.length} facturas de {facturasFiltered.length} filtradas
            {facturasFiltered.length !== facturas.length && (
              <Text component="span" size="sm" c="blue" ml={5}>
                (de {facturas.length} totales)
              </Text>
            )}
          </Text>
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

export default FacturasTable;
