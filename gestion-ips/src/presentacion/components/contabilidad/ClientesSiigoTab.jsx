/**
 * ClientesSiigoTab.jsx
 * 
 * Componente para gestionar clientes de facturas y su sincronización con Siigo
 * Los clientes pueden ser ENTIDADES (EPS, ARL, empresas) o PACIENTES particulares
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
  Table,
  TextInput,
  Badge,
  ActionIcon,
  Tooltip,
  Loader,
  Alert,
  Modal,
  Select,
  Checkbox
} from '@mantine/core';
import {
  IconUsers,
  IconSearch,
  IconRefresh,
  IconUserPlus,
  IconCloudUpload,
  IconEdit,
  IconTrash,
  IconInfoCircle,
  IconCheck,
  IconBuilding,
  IconUser
} from '@tabler/icons-react';
import { useContabilidad } from '../../../negocio/hooks/contabilidad/useContabilidad.js';
import Swal from 'sweetalert2';

export const ClientesSiigoTab = () => {
  const {
    clientes,
    loadingClientes,
    siigoConnected,
    cargarClientes,
    sincronizarCliente,
    sincronizarClientesMasivo,
    buscarClientes
  } = useContabilidad();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpened, setModalOpened] = useState(false);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [seleccionados, setSeleccionados] = useState([]);
  const [sincronizando, setSincronizando] = useState(false);

  // Cargar clientes al montar
  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  // Filtrar clientes por búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setClientesFiltrados(clientes);
    } else {
      const termino = searchTerm.toLowerCase();
      const filtrados = clientes.filter(cliente =>
        cliente.razonSocial?.toLowerCase().includes(termino) ||
        cliente.nombreCompleto?.toLowerCase().includes(termino) ||
        cliente.nombres?.toLowerCase().includes(termino) ||
        cliente.apellidos?.toLowerCase().includes(termino) ||
        cliente.numeroDocumento?.toLowerCase().includes(termino)
      );
      setClientesFiltrados(filtrados);
    }
  }, [clientes, searchTerm]);

  /**
   * Obtener nombre del cliente según tipo
   */
  const getNombreCliente = (cliente) => {
    if (cliente.tipoDestinatario === 'ENTIDAD') {
      return cliente.razonSocial || 'Sin razón social';
    }
    return cliente.nombreCompleto || `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim() || 'Sin nombre';
  };

  /**
   * Sincronizar un cliente
   */
  const handleSincronizar = async (cliente) => {
    if (!siigoConnected) {
      await Swal.fire({
        icon: 'warning',
        title: 'Siigo no conectado',
        text: 'Debe conectar Siigo en Configuración antes de continuar.',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

    const nombreCliente = getNombreCliente(cliente);
    const tipoCliente = cliente.tipoDestinatario === 'ENTIDAD' ? 'entidad' : 'paciente';

    const result = await Swal.fire({
      title: '¿Sincronizar con Siigo?',
      html: `<p>¿Desea sincronizar a <strong>${nombreCliente}</strong> (${tipoCliente}) como cliente en Siigo?</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, sincronizar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setSincronizando(true);
      try {
        await sincronizarCliente(cliente);
        
        await Swal.fire({
          icon: 'success',
          title: '¡Sincronizado!',
          text: 'El cliente se sincronizó correctamente con Siigo.',
          confirmButtonColor: '#10B981',
          timer: 2000,
          timerProgressBar: true
        });
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo sincronizar el cliente.',
          confirmButtonColor: '#EF4444'
        });
      } finally {
        setSincronizando(false);
      }
    }
  };

  /**
   * Sincronización masiva
   */
  const handleSincronizarMasivo = async () => {
    if (seleccionados.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Sin selección',
        text: 'Debe seleccionar al menos un cliente.',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

    // Obtener datos completos de los clientes seleccionados
    const clientesData = clientesFiltrados.filter(c => seleccionados.includes(c.id));

    const result = await Swal.fire({
      title: '¿Sincronización masiva?',
      html: `<p>¿Desea sincronizar <strong>${clientesData.length}</strong> clientes con Siigo?</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, sincronizar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setSincronizando(true);
      Swal.fire({
        title: 'Sincronizando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const resultados = await sincronizarClientesMasivo(clientesData);
        
        Swal.close();
        await Swal.fire({
          icon: 'success',
          title: 'Sincronización completada',
          html: `
            <p><strong>Exitosos:</strong> ${resultados.exitosos.length}</p>
            <p><strong>Fallidos:</strong> ${resultados.fallidos.length}</p>
          `,
          confirmButtonColor: '#10B981'
        });

        setSeleccionados([]);
      } catch (error) {
        Swal.close();
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error en la sincronización masiva.',
          confirmButtonColor: '#EF4444'
        });
      } finally {
        setSincronizando(false);
      }
    }
  };

  /**
   * Seleccionar/deseleccionar todos
   */
  const handleSelectAll = (checked) => {
    if (checked) {
      const noSincronizados = clientesFiltrados
        .filter(c => !c.sincronizado)
        .map(c => c.id);
      setSeleccionados(noSincronizados);
    } else {
      setSeleccionados([]);
    }
  };

  /**
   * Seleccionar individual
   */
  const handleSelect = (clienteId, checked) => {
    if (checked) {
      setSeleccionados([...seleccionados, clienteId]);
    } else {
      setSeleccionados(seleccionados.filter(id => id !== clienteId));
    }
  };

  return (
    <Stack gap="md">
      {/* Header */}
      <Paper p="md" withBorder>
        <Group justify="space-between" wrap="wrap">
          <div>
            <Title order={3} size="h4">Clientes de la IPS</Title>
            <Text size="sm" c="dimmed">
              {clientes.length} clientes registrados • {clientes.filter(c => c.sincronizado).length} sincronizados con Siigo
            </Text>
            <Text size="sm" c="dimmed">
              {clientes.filter(c => c.tipoDestinatario === 'ENTIDAD').length} entidades • {clientes.filter(c => c.tipoDestinatario === 'PACIENTE').length} pacientes particulares
            </Text>
          </div>
          <Group>
            <Button
              leftSection={<IconRefresh size={18} />}
              onClick={cargarClientes}
              loading={loadingClientes}
            >
              Actualizar
            </Button>
            {seleccionados.length > 0 && (
              <Button
                leftSection={<IconCloudUpload size={18} />}
                color="green"
                onClick={handleSincronizarMasivo}
                disabled={!siigoConnected || sincronizando}
              >
                Sincronizar ({seleccionados.length})
              </Button>
            )}
          </Group>
        </Group>
      </Paper>

      {/* Estado de conexión */}
      {!siigoConnected && (
        <Alert
          icon={<IconInfoCircle size={20} />}
          title="Siigo no conectado"
          color="yellow"
        >
          Debe configurar y conectar Siigo en <strong>Configuración �' Siigo API</strong> para sincronizar clientes.
        </Alert>
      )}

      {/* Buscador */}
      <Paper p="md" withBorder>
        <TextInput
          placeholder="Buscar por nombre o documento..."
          leftSection={<IconSearch size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Paper>

      {/* Tabla de clientes */}
      <Paper withBorder>
        <div style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Checkbox
                    onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                    checked={seleccionados.length > 0 && seleccionados.length === clientesFiltrados.filter(c => !c.sincronizado).length}
                  />
                </Table.Th>
                <Table.Th>Tipo</Table.Th>
                <Table.Th>Tipo Doc</Table.Th>
                <Table.Th>Documento</Table.Th>
                <Table.Th>Nombre / Razón Social</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Teléfono</Table.Th>
                <Table.Th>Facturas</Table.Th>
                <Table.Th>Estado Siigo</Table.Th>
                <Table.Th>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loadingClientes ? (
                <Table.Tr>
                  <Table.Td colSpan={10} style={{ textAlign: 'center' }}>
                    <Stack align="center" py="xl">
                      <Loader size="md" />
                      <Text size="sm" c="dimmed">Cargando clientes...</Text>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ) : clientesFiltrados.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={10} style={{ textAlign: 'center' }}>
                    <Text size="sm" c="dimmed" py="md">
                      No hay clientes registrados
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <Table.Tr key={cliente.id}>
                    <Table.Td>
                      <Checkbox
                        checked={seleccionados.includes(cliente.id)}
                        onChange={(e) => handleSelect(cliente.id, e.currentTarget.checked)}
                        disabled={cliente.sincronizado}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label={cliente.tipoDestinatario === 'ENTIDAD' ? 'Entidad (EPS, ARL, Empresa)' : 'Paciente Particular'}>
                        <Badge 
                          color={cliente.tipoDestinatario === 'ENTIDAD' ? 'blue' : 'cyan'} 
                          leftSection={cliente.tipoDestinatario === 'ENTIDAD' ? <IconBuilding size={12} /> : <IconUser size={12} />}
                          size="sm"
                        >
                          {cliente.tipoDestinatario === 'ENTIDAD' ? 'Entidad' : 'Paciente'}
                        </Badge>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{cliente.tipoDocumento || 'CC'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                        {cliente.numeroDocumento}
                        {cliente.digitoVerificacion && `-${cliente.digitoVerificacion}`}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {getNombreCliente(cliente)}
                      </Text>
                      {cliente.nombreContacto && (
                        <Text size="xs" c="dimmed">
                          Contacto: {cliente.nombreContacto}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{cliente.email || 'N/A'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{cliente.telefono || 'N/A'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label={`Total facturado: $${(cliente.totalFacturado || 0).toLocaleString('es-CO')}`}>
                        <Badge color="gray" size="sm">
                          {cliente.cantidadFacturas || 0}
                        </Badge>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td>
                      {cliente.sincronizado ? (
                        <Badge color="green" size="sm" leftSection={<IconCheck size={12} />}>
                          Sincronizado
                        </Badge>
                      ) : (
                        <Badge color="gray" size="sm">
                          Pendiente
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {!cliente.sincronizado && (
                          <Tooltip label="Sincronizar con Siigo">
                            <ActionIcon
                              variant="light"
                              color="green"
                              onClick={() => handleSincronizar(cliente)}
                              disabled={!siigoConnected || sincronizando}
                            >
                              <IconCloudUpload size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </div>
      </Paper>
    </Stack>
  );
};
