/**
 * ContabilidadSiigoTab.jsx
 * 
 * Componente para gestionar operaciones contables en Siigo
 * Incluye centros de costo, grupos contables, impuestos, etc.
 * 
 * Capa: Presentación
 */

import React, { useState, useEffect } from 'react';
import {
  Stack,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Tabs,
  Table,
  Badge,
  Alert,
  Accordion,
  Grid,
  Card
} from '@mantine/core';
import {
  IconBuildingBank,
  IconRefresh,
  IconInfoCircle,
  IconReceipt,
  IconCoin,
  IconBuildingCommunity,
  IconFileInvoice
} from '@tabler/icons-react';
import { useSiigoIntegration } from '../../../negocio/hooks/facturacion/useSiigoIntegration.js';
import Swal from 'sweetalert2';

export const ContabilidadSiigoTab = () => {
  const {
    isConnected,
    isLoading,
    catalogs,
    loadCatalogs
  } = useSiigoIntegration();

  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadCatalogs();
    }
  }, [isConnected]);

  /**
   * Actualizar datos contables
   */
  const actualizarDatos = async () => {
    if (!isConnected) {
      await Swal.fire({
        icon: 'warning',
        title: 'Siigo no conectado',
        text: 'Debe conectar Siigo en Configuración antes de continuar.',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

    setLoadingData(true);
    try {
      await loadCatalogs();
      await Swal.fire({
        icon: 'success',
        title: 'Datos actualizados',
        text: 'Los catálogos se han actualizado correctamente.',
        confirmButtonColor: '#10B981',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error actualizando datos:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron actualizar los datos de Siigo.',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <Stack gap="md">
      {/* Header */}
      <Paper p="md" withBorder>
        <Group justify="space-between" wrap="wrap">
          <div>
            <Title order={3} size="h4">Contabilidad y Catálogos de Siigo</Title>
            <Text size="sm" c="dimmed">
              Gestiona parámetros contables y catálogos generales
            </Text>
          </div>
          <Button
            leftSection={<IconRefresh size={18} />}
            onClick={actualizarDatos}
            loading={loadingData}
            disabled={!isConnected}
          >
            Actualizar Catálogos
          </Button>
        </Group>
      </Paper>

      {/* Estado de conexión */}
      {!isConnected && (
        <Alert
          icon={<IconInfoCircle size={20} />}
          title="Siigo no conectado"
          color="yellow"
        >
          Debe configurar y conectar Siigo en <strong>Configuración �' Siigo API</strong> para usar esta funcionalidad.
        </Alert>
      )}

      {/* Tabs de catálogos */}
      <Tabs defaultValue="documentos" variant="pills">
        <Tabs.List>
          <Tabs.Tab value="documentos" leftSection={<IconFileInvoice size={16} />}>
            Tipos de Documento
          </Tabs.Tab>
          <Tabs.Tab value="pagos" leftSection={<IconCoin size={16} />}>
            Formas de Pago
          </Tabs.Tab>
          <Tabs.Tab value="impuestos" leftSection={<IconReceipt size={16} />}>
            Impuestos
          </Tabs.Tab>
          <Tabs.Tab value="centros" leftSection={<IconBuildingCommunity size={16} />}>
            Centros de Costo
          </Tabs.Tab>
        </Tabs.List>

        {/* Panel: Tipos de Documento */}
        <Tabs.Panel value="documentos" pt="md">
          <Paper withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Nombre</Table.Th>
                  <Table.Th>Tipo</Table.Th>
                  <Table.Th>Estado</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {catalogs.documentTypes && catalogs.documentTypes.length > 0 ? (
                  catalogs.documentTypes.map((doc) => (
                    <Table.Tr key={doc.id}>
                      <Table.Td>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {doc.id}
                        </Text>
                      </Table.Td>
                      <Table.Td>{doc.name}</Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="light">
                          {doc.type}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="green" size="sm">Activo</Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={4} style={{ textAlign: 'center' }}>
                      <Text size="sm" c="dimmed" py="md">
                        No hay tipos de documento disponibles
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>

        {/* Panel: Formas de Pago */}
        <Tabs.Panel value="pagos" pt="md">
          <Paper withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Nombre</Table.Th>
                  <Table.Th>Tipo</Table.Th>
                  <Table.Th>Estado</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {catalogs.paymentTypes && catalogs.paymentTypes.length > 0 ? (
                  catalogs.paymentTypes.map((pago) => (
                    <Table.Tr key={pago.id}>
                      <Table.Td>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {pago.id}
                        </Text>
                      </Table.Td>
                      <Table.Td>{pago.name}</Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="light" color="cyan">
                          {pago.type || 'Forma de pago'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="green" size="sm">Activo</Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={4} style={{ textAlign: 'center' }}>
                      <Text size="sm" c="dimmed" py="md">
                        No hay formas de pago disponibles
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>

        {/* Panel: Impuestos */}
        <Tabs.Panel value="impuestos" pt="md">
          <Paper withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Nombre</Table.Th>
                  <Table.Th>Porcentaje</Table.Th>
                  <Table.Th>Tipo</Table.Th>
                  <Table.Th>Estado</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {catalogs.taxes && catalogs.taxes.length > 0 ? (
                  catalogs.taxes.map((tax) => (
                    <Table.Tr key={tax.id}>
                      <Table.Td>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {tax.id}
                        </Text>
                      </Table.Td>
                      <Table.Td>{tax.name}</Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={600} c="blue">
                          {tax.percentage}%
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="light" color="orange">
                          {tax.type || 'IVA'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="green" size="sm">Activo</Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={5} style={{ textAlign: 'center' }}>
                      <Text size="sm" c="dimmed" py="md">
                        No hay impuestos disponibles
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>

        {/* Panel: Centros de Costo */}
        <Tabs.Panel value="centros" pt="md">
          <Paper withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Nombre</Table.Th>
                  <Table.Th>Código</Table.Th>
                  <Table.Th>Estado</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {catalogs.costCenters && catalogs.costCenters.length > 0 ? (
                  catalogs.costCenters.map((centro) => (
                    <Table.Tr key={centro.id}>
                      <Table.Td>
                        <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                          {centro.id}
                        </Text>
                      </Table.Td>
                      <Table.Td>{centro.name}</Table.Td>
                      <Table.Td>
                        <Text size="sm" style={{ fontFamily: 'monospace' }}>
                          {centro.code}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="green" size="sm">Activo</Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={4} style={{ textAlign: 'center' }}>
                      <Text size="sm" c="dimmed" py="md">
                        No hay centros de costo disponibles
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};
