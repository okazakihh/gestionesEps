import React, { useState } from 'react';
import {
  Table,
  Paper,
  Text,
  Badge,
  ActionIcon,
  Group,
  TextInput,
  Select,
  Stack,
  Title,
  Button,
  ScrollArea,
  Tooltip
} from '@mantine/core';
import {
  IconEdit,
  IconTrash,
  IconRefresh,
  IconSearch,
  IconUser,
  IconBuilding,
  IconPlus,
  IconEye
} from '@tabler/icons-react';
import { 
  TIPO_DOCUMENTO_FACTURACION_OPTIONS, 
  TIPO_PERSONA_OPTIONS 
} from '../../../negocio/utils/listHelps.js';

/**
 * Tabla de visualización de clientes de facturación
 * Componente de presentación - UI pura
 */
const ClientesFacturacionTable = ({
  clientes = [],
  loading = false,
  onEditar,
  onDesactivar,
  onReactivar,
  onNuevo,
  onVerDetalle,
  searchTerm = '',
  onSearch
}) => {
  const [tipoFiltro, setTipoFiltro] = useState('TODOS');

  // Filtrar clientes por tipo
  const clientesFiltrados = clientes.filter(cliente => {
    if (tipoFiltro === 'TODOS') return true;
    return cliente.datos?.tipoPersona === tipoFiltro;
  });

  const formatearTipoDocumento = (tipo) => {
    const tipoEncontrado = TIPO_DOCUMENTO_FACTURACION_OPTIONS.find(t => t.value === tipo);
    return tipoEncontrado ? tipoEncontrado.label : tipo;
  };

  const formatearTelefono = (telefono) => {
    if (!telefono) return '-';
    return telefono;
  };

  return (
    <Stack spacing="md">
      {/* Header con filtros y botón nuevo */}
      <Paper p="md" withBorder>
        <Group position="apart" mb="md">
          <Title order={3}>Clientes de Facturación</Title>
          <Button leftSection={<IconPlus size={16} />} onClick={onNuevo}>
            Nuevo Cliente
          </Button>
        </Group>

        <Group grow>
          <TextInput
            placeholder="Buscar por nombre, documento o email..."
            icon={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
          <Select
            placeholder="Filtrar por tipo"
            data={[
              { value: 'TODOS', label: 'Todos los tipos' },
              ...TIPO_PERSONA_OPTIONS
            ]}
            value={tipoFiltro}
            onChange={setTipoFiltro}
          />
        </Group>
      </Paper>

      {/* Tabla de clientes */}
      <Paper withBorder>
        <ScrollArea>
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Documento</th>
                <th>Nombre/Razón Social</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Ciudad</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                    <Text c="dimmed">Cargando clientes...</Text>
                  </td>
                </tr>
              ) : clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                    <Text c="dimmed">
                      {searchTerm || tipoFiltro !== 'TODOS' 
                        ? 'No se encontraron clientes con los filtros aplicados' 
                        : 'No hay clientes registrados'}
                    </Text>
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => {
                  const datos = cliente.datos;
                  const esActivo = cliente.activo && datos.activo !== false;

                  return (
                    <tr key={cliente.id} style={{ opacity: esActivo ? 1 : 0.6 }}>
                      <td>
                        <Group spacing="xs">
                          {datos.tipoPersona === 'NATURAL' ? (
                            <IconUser size={16} />
                          ) : (
                            <IconBuilding size={16} />
                          )}
                          <Text size="sm">
                            {datos.tipoPersona === 'NATURAL' ? 'Natural' : 'Jurídica'}
                          </Text>
                        </Group>
                      </td>
                      <td>
                        <Text size="sm">
                          {formatearTipoDocumento(datos.tipoDocumento)} {datos.numeroDocumento}
                        </Text>
                      </td>
                      <td>
                        <Text size="sm" weight={500}>
                          {datos.nombreCompleto || datos.razonSocial}
                        </Text>
                        {datos.codigoClienteSiigo && (
                          <Text size="xs" c="dimmed">
                            Código: {datos.codigoClienteSiigo}
                          </Text>
                        )}
                      </td>
                      <td>
                        <Text size="sm">{datos.email || '-'}</Text>
                      </td>
                      <td>
                        <Text size="sm">{formatearTelefono(datos.telefono)}</Text>
                      </td>
                      <td>
                        <Text size="sm">{datos.direccion?.ciudad || '-'}</Text>
                      </td>
                      <td>
                        <Badge
                          color={esActivo ? 'green' : 'gray'}
                          variant="filled"
                        >
                          {esActivo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td>
                        <Group spacing="xs" position="center">
                          <Tooltip label="Ver detalle">
                            <ActionIcon
                              color="cyan"
                              variant="light"
                              onClick={() => onVerDetalle(cliente)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Editar">
                            <ActionIcon
                              color="blue"
                              variant="light"
                              onClick={() => onEditar(cliente)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                          {esActivo ? (
                            <Tooltip label="Desactivar">
                              <ActionIcon
                                color="red"
                                variant="light"
                                onClick={() => onDesactivar(cliente.id)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          ) : (
                            <Tooltip label="Reactivar">
                              <ActionIcon
                                color="green"
                                variant="light"
                                onClick={() => onReactivar(cliente.id)}
                              >
                                <IconRefresh size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </Group>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </ScrollArea>

        {/* Resumen */}
        {!loading && clientesFiltrados.length > 0 && (
          <Group position="apart" p="md" style={{ borderTop: '1px solid #e9ecef' }}>
            <Text size="sm" c="dimmed">
              Mostrando {clientesFiltrados.length} de {clientes.length} clientes
            </Text>
            <Group spacing="xl">
              <Text size="sm">
                <Text component="span" weight={600}>{clientes.filter(c => c.activo).length}</Text> Activos
              </Text>
              <Text size="sm">
                <Text component="span" weight={600}>{clientes.filter(c => !c.activo).length}</Text> Inactivos
              </Text>
            </Group>
          </Group>
        )}
      </Paper>
    </Stack>
  );
};

export default ClientesFacturacionTable;
