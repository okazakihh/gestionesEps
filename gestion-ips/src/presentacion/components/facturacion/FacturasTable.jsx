import React from 'react';
import { Table, Text, Badge, Group, ActionIcon, Tooltip, Loader, Paper, Stack } from '@mantine/core';
import { 
  IconEye, 
  IconPrinter, 
  IconCheck, 
  IconCloud, 
  IconCloudCheck, 
  IconFileCode,
  IconCloudUpload,
  IconRefresh,
  IconFileDownload,
  IconMail,
  IconFileInvoice
} from '@tabler/icons-react';
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
 * - onEnviarDian: función para enviar a DIAN (facturación electrónica)
 * - onConsultarEstadoDian: función para consultar estado en DIAN
 * - onVerXML: función para ver XML de factura electrónica
 * - onEnviarASiigo: función para enviar factura a Siigo
 * - onConsultarEstadoSiigo: función para consultar estado en Siigo
 * - onDescargarPDFSiigo: función para descargar PDF desde Siigo
 * - onEnviarEmailSiigo: función para enviar email desde Siigo
 * - onCrearNota: función para crear notas crédito/débito (solo si factura está en Siigo)
 * - siigoConnected: boolean que indica si Siigo está conectado
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
  onEnviarASiigo,
  onConsultarEstadoSiigo,
  onDescargarPDFSiigo,
  onEnviarEmailSiigo,
  onCrearNota,
  siigoConnected = false,
  loading = false,
  limit = 10
}) => {
  // Validar que facturasFiltered sea un array
  const facturasArray = Array.isArray(facturasFiltered) ? facturasFiltered : [];
  
  // Calcular el total facturado de las facturas filtradas
  const totalFacturado = facturasArray.reduce((total, factura) => {
    try {
      const facturaData = JSON.parse(factura.jsonData || '{}');
      return total + (facturaData.total || 0);
    } catch (error) {
      console.error('Error parsing factura data:', error);
      return total;
    }
  }, 0);

  // Obtener solo las facturas a mostrar según el límite
  const facturasToShow = facturasArray.slice(0, limit);

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
  if (!loading && facturas.length > 0 && facturasArray.length === 0) {
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
              <Table.Th>Siigo</Table.Th>
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
              const siigoId = facturaData.siigoId;
              const estadoDian = facturaData.estadoDian;

              // Función auxiliar para obtener el badge de estado Siigo
              const getSiigoBadge = () => {
                if (!siigoId) {
                  return (
                    <Badge variant="light" color="gray" size="sm">
                      No enviado
                    </Badge>
                  );
                }
                
                switch (estadoDian) {
                  case 'Aceptado':
                    return (
                      <Badge variant="light" color="green" size="sm">
                        Aceptado
                      </Badge>
                    );
                  case 'Rechazado':
                    return (
                      <Badge variant="light" color="red" size="sm">
                        Rechazado
                      </Badge>
                    );
                  case 'Enviado':
                    return (
                      <Badge variant="light" color="blue" size="sm">
                        Enviado
                      </Badge>
                    );
                  default:
                    return (
                      <Badge variant="light" color="cyan" size="sm">
                        En proceso
                      </Badge>
                    );
                }
              };

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
                    {getSiigoBadge()}
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

                      {/* Botón de Notas Contables (solo si está en Siigo) */}
                      {siigoId && onCrearNota && (
                        <Tooltip label="Crear Nota Crédito/Débito" position="top">
                          <ActionIcon
                            variant="light"
                            color="orange"
                            onClick={() => onCrearNota(factura)}
                            aria-label="Crear Nota"
                          >
                            <IconFileInvoice size={18} />
                          </ActionIcon>
                        </Tooltip>
                      )}

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

                      {/* Botones de integración Siigo (única integración activa) */}
                      {siigoConnected && (
                        siigoId ? (
                          <>
                            <Tooltip label="Consultar estado en Siigo" position="top">
                              <ActionIcon
                                variant="light"
                                color="cyan"
                                onClick={() => onConsultarEstadoSiigo && onConsultarEstadoSiigo(factura)}
                                aria-label="Consultar Siigo"
                              >
                                <IconRefresh size={18} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Descargar PDF desde Siigo" position="top">
                              <ActionIcon
                                variant="light"
                                color="orange"
                                onClick={() => onDescargarPDFSiigo && onDescargarPDFSiigo(factura)}
                                aria-label="Descargar PDF Siigo"
                              >
                                <IconFileDownload size={18} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Enviar por email desde Siigo" position="top">
                              <ActionIcon
                                variant="light"
                                color="pink"
                                onClick={() => onEnviarEmailSiigo && onEnviarEmailSiigo(factura)}
                                aria-label="Enviar email Siigo"
                              >
                                <IconMail size={18} />
                              </ActionIcon>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip label="Enviar a Siigo para facturación electrónica" position="top">
                            <ActionIcon
                              variant="light"
                              color="lime"
                              onClick={() => onEnviarASiigo && onEnviarASiigo(factura)}
                              aria-label="Enviar a Siigo"
                            >
                              <IconCloudUpload size={18} />
                            </ActionIcon>
                          </Tooltip>
                        )
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
            Mostrando las últimas {facturasToShow.length} facturas de {facturasArray.length} filtradas
            {facturasArray.length !== facturas.length && (
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
