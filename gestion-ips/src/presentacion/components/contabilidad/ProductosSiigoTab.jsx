/**
 * ProductosSiigoTab.jsx
 * 
 * Componente para gestionar productos/servicios en Siigo
 * Permite sincronizar servicios médicos con Siigo
 * 
 * Capa: Presentación
 */

import React, { useState } from 'react';
import {
  Stack,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Table,
  TextInput,
  Badge,
  ActionIcon,
  Tooltip,
  Alert,
  Modal,
  Select,
  NumberInput
} from '@mantine/core';
import {
  IconPackage,
  IconSearch,
  IconRefresh,
  IconPlus,
  IconCloudUpload,
  IconEdit,
  IconTrash,
  IconInfoCircle
} from '@tabler/icons-react';
import { useSiigoIntegration } from '../../../negocio/hooks/facturacion/useSiigoIntegration.js';
import Swal from 'sweetalert2';

export const ProductosSiigoTab = () => {
  const {
    isConnected,
    isLoading,
    syncServicio
  } = useSiigoIntegration();

  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpened, setModalOpened] = useState(false);

  /**
   * Cargar productos de Siigo
   */
  const cargarProductos = async () => {
    if (!isConnected) {
      await Swal.fire({
        icon: 'warning',
        title: 'Siigo no conectado',
        text: 'Debe conectar Siigo en Configuración antes de continuar.',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

    setLoadingProductos(true);
    try {
      await Swal.fire({
        icon: 'info',
        title: 'Funcionalidad en desarrollo',
        text: 'La gestión de productos estará disponible próximamente.',
        confirmButtonColor: '#3B82F6'
      });
    } catch (error) {
      console.error('Error cargando productos:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los productos de Siigo.',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoadingProductos(false);
    }
  };

  return (
    <Stack gap="md">
      {/* Header */}
      <Paper p="md" withBorder>
        <Group justify="space-between" wrap="wrap">
          <div>
            <Title order={3} size="h4">Productos y Servicios de Siigo</Title>
            <Text size="sm" c="dimmed">
              Gestiona productos y sincroniza servicios médicos
            </Text>
          </div>
          <Group>
            <Button
              leftSection={<IconRefresh size={18} />}
              onClick={cargarProductos}
              loading={loadingProductos}
              disabled={!isConnected}
            >
              Actualizar
            </Button>
            <Button
              leftSection={<IconPlus size={18} />}
              color="green"
              onClick={() => setModalOpened(true)}
              disabled={!isConnected}
            >
              Sincronizar Servicio
            </Button>
          </Group>
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

      {/* Buscador */}
      <Paper p="md" withBorder>
        <TextInput
          placeholder="Buscar por código, nombre o descripción..."
          leftSection={<IconSearch size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Paper>

      {/* Tabla de productos */}
      <Paper withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Código</Table.Th>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Tipo</Table.Th>
              <Table.Th>Precio</Table.Th>
              <Table.Th>IVA</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {productos.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                  <Stack align="center" py="xl">
                    <Text size="sm" c="dimmed">
                      No hay productos sincronizados
                    </Text>
                    <Button
                      size="sm"
                      variant="light"
                      leftSection={<IconCloudUpload size={16} />}
                      onClick={cargarProductos}
                      disabled={!isConnected}
                    >
                      Cargar productos de Siigo
                    </Button>
                  </Stack>
                </Table.Td>
              </Table.Tr>
            ) : (
              productos.map((producto) => (
                <Table.Tr key={producto.id}>
                  <Table.Td>
                    <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                      {producto.codigo}
                    </Text>
                  </Table.Td>
                  <Table.Td>{producto.nombre}</Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light">
                      {producto.tipo}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={600} c="green">
                      ${producto.precio?.toLocaleString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>{producto.iva}%</Table.Td>
                  <Table.Td>
                    <Badge color="green" size="sm">Activo</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Editar">
                        <ActionIcon variant="light" color="blue">
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Eliminar">
                        <ActionIcon variant="light" color="red">
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Modal de sincronización */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Sincronizar Servicio Médico con Siigo"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Configure el servicio para sincronizarlo con Siigo
          </Text>
          
          <Select
            label="Código CUPS"
            placeholder="Seleccionar código CUPS..."
            searchable
            data={[]}
          />

          <NumberInput
            label="Precio"
            placeholder="0.00"
            prefix="$"
            thousandSeparator=","
            decimalScale={2}
          />

          <Select
            label="Grupo contable"
            placeholder="Seleccionar grupo..."
            data={[]}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setModalOpened(false)}>
              Cancelar
            </Button>
            <Button color="green" leftSection={<IconCloudUpload size={18} />}>
              Sincronizar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};
