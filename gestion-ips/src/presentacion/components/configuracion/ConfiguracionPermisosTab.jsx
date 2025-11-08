/**
 * Componente Tab para configuración de permisos a módulos
 * Capa de presentación - Componentes
 * 
 * Permite gestionar qué roles tienen acceso a cada módulo
 * y qué permisos específicos (read, write, delete) tienen
 */

import React, { useState, useEffect } from 'react';
import { 
  Stack, 
  Title,
  Text,
  Table,
  Switch,
  Paper,
  Alert,
  Button,
  Group,
  Badge,
  Loader,
  Grid
} from '@mantine/core';
import { IconShieldLock, IconAlertCircle, IconDeviceFloppy, IconRefresh } from '@tabler/icons-react';
import { useConfiguracionManagement } from '../../../negocio/hooks/configuracion/useConfiguracionManagement.js';
import Swal from 'sweetalert2';

const ROLES_DISPONIBLES = [
  { key: 'ADMIN', label: 'Administrador', color: 'red' },
  { key: 'ADMINISTRATIVO', label: 'Administrativo', color: 'blue' },
  { key: 'AUXILIAR_ADMINISTRATIVO', label: 'Auxiliar Administrativo', color: 'cyan' },
  { key: 'DOCTOR', label: 'Doctor', color: 'green' },
  { key: 'AUXILIAR_MEDICO', label: 'Auxiliar Médico', color: 'teal' }
];

const MODULOS_DISPONIBLES = [
  { key: 'pacientes', label: 'Pacientes' },
  { key: 'facturacion', label: 'Facturación' },
  { key: 'nomina', label: 'Nómina' },
  { key: 'usuarios', label: 'Usuarios' },
  { key: 'reportes', label: 'Reportes' },
  { key: 'configuracion', label: 'Configuración' }
];

const PERMISOS_ACCIONES = ['read', 'write', 'delete'];

export const ConfiguracionPermisosTab = () => {
  const { 
    configuraciones, 
    loading, 
    error, 
    getConfiguracionByClave, 
    updateConfiguracionByClave 
  } = useConfiguracionManagement();

  const [permisos, setPermisos] = useState({});
  const [loadingPermisos, setLoadingPermisos] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar configuración de permisos
  useEffect(() => {
    cargarPermisos();
  }, []);

  const cargarPermisos = async () => {
    setLoadingPermisos(true);
    try {
      const config = await getConfiguracionByClave('PERMISOS_MODULOS');
      
      if (config && config.jsonData) {
        setPermisos(config.jsonData);
      } else {
        // Inicializar con estructura vacía
        inicializarPermisosDefecto();
      }
    } catch (error) {
      console.error('Error al cargar permisos:', error);
      inicializarPermisosDefecto();
    } finally {
      setLoadingPermisos(false);
    }
  };

  const inicializarPermisosDefecto = () => {
    const permisosDefault = {};
    
    ROLES_DISPONIBLES.forEach(rol => {
      permisosDefault[rol.key] = {};
      MODULOS_DISPONIBLES.forEach(modulo => {
        permisosDefault[rol.key][modulo.key] = {
          read: false,
          write: false,
          delete: false
        };
      });
    });

    setPermisos(permisosDefault);
  };

  const handlePermisoChange = (rol, modulo, accion, valor) => {
    setPermisos(prev => ({
      ...prev,
      [rol]: {
        ...prev[rol],
        [modulo]: {
          ...prev[rol][modulo],
          [accion]: valor
        }
      }
    }));
  };

  const handleGuardar = async () => {
    const result = await Swal.fire({
      title: '¿Guardar cambios en permisos?',
      text: 'Esto afectará el acceso de los usuarios al sistema',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      // Enviar solo el objeto de permisos
      await updateConfiguracionByClave('PERMISOS_MODULOS', permisos);

      await Swal.fire({
        title: '¡Permisos actualizados!',
        text: 'Los cambios se han guardado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudieron guardar los permisos',
        icon: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingPermisos) {
    return (
      <Stack align="center" justify="center" style={{ minHeight: '300px' }}>
        <Loader size="lg" />
        <Text c="dimmed">Cargando permisos...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      <Stack gap="xs">
        <Title order={3}>
          <IconShieldLock size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Permisos a Módulos por Rol
        </Title>
        <Text size="sm" c="dimmed">
          Configure qué roles tienen acceso a cada módulo del sistema y qué acciones pueden realizar
        </Text>
      </Stack>

      {/* Alerta informativa */}
      <Alert
        icon={<IconAlertCircle size={20} />}
        title="Importante"
        color="yellow"
        variant="light"
      >
        <Text size="sm">
          Los cambios en los permisos afectan inmediatamente el acceso de los usuarios.
          <br />
          <strong>Read:</strong> Ver información | <strong>Write:</strong> Crear/Editar | <strong>Delete:</strong> Eliminar
        </Text>
      </Alert>

      {/* Tabla de permisos */}
      <Paper shadow="xs" p="md" withBorder>
        <Stack gap="md">
          {ROLES_DISPONIBLES.map(rol => (
            <Paper key={rol.key} shadow="xs" p="md" withBorder>
              <Stack gap="md">
                <Group>
                  <Badge color={rol.color} size="lg" variant="filled">
                    {rol.label}
                  </Badge>
                </Group>

                <Table striped highlightOnHover withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Módulo</Table.Th>
                      <Table.Th style={{ textAlign: 'center' }}>Leer</Table.Th>
                      <Table.Th style={{ textAlign: 'center' }}>Escribir</Table.Th>
                      <Table.Th style={{ textAlign: 'center' }}>Eliminar</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {MODULOS_DISPONIBLES.map(modulo => (
                      <Table.Tr key={modulo.key}>
                        <Table.Td>
                          <Text fw={500}>{modulo.label}</Text>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          <Switch
                            checked={permisos[rol.key]?.[modulo.key]?.read || false}
                            onChange={(e) => handlePermisoChange(
                              rol.key, 
                              modulo.key, 
                              'read', 
                              e.currentTarget.checked
                            )}
                            color="green"
                          />
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          <Switch
                            checked={permisos[rol.key]?.[modulo.key]?.write || false}
                            onChange={(e) => handlePermisoChange(
                              rol.key, 
                              modulo.key, 
                              'write', 
                              e.currentTarget.checked
                            )}
                            color="blue"
                          />
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          <Switch
                            checked={permisos[rol.key]?.[modulo.key]?.delete || false}
                            onChange={(e) => handlePermisoChange(
                              rol.key, 
                              modulo.key, 
                              'delete', 
                              e.currentTarget.checked
                            )}
                            color="red"
                          />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>

      {/* Botones de acción */}
      <Group justify="flex-end">
        <Button
          variant="subtle"
          leftSection={<IconRefresh size={16} />}
          onClick={cargarPermisos}
          disabled={saving}
        >
          Recargar
        </Button>
        <Button
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={handleGuardar}
          loading={saving}
        >
          Guardar Cambios
        </Button>
      </Group>
    </Stack>
  );
};
