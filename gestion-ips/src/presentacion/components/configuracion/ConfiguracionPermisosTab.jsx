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
import { useRoles } from '../../../negocio/hooks/roles/useRoles.js';
import Swal from 'sweetalert2';

const MODULOS_DISPONIBLES = [
  { 
    key: 'pacientes', 
    label: 'Pacientes',
    acciones: [
      { key: 'ver', label: 'Ver pacientes' },
      { key: 'crear', label: 'Crear paciente' },
      { key: 'editar', label: 'Editar paciente' },
      { key: 'eliminar', label: 'Eliminar paciente' },
      { key: 'programar_cita', label: 'Programar cita' },
      { key: 'editar_cita', label: 'Editar cita' },
      { key: 'cancelar_cita', label: 'Cancelar cita' },
      { key: 'atender_cita', label: 'Atender cita' },
      { key: 'marcar_en_sala', label: 'Marcar en sala de espera' },
      { key: 'marcar_no_presento', label: 'Marcar no se presentó' },
      { key: 'ver_historia', label: 'Ver historia clínica' },
      { key: 'crear_historia', label: 'Crear historia clínica' },
      { key: 'editar_historia', label: 'Editar historia clínica' }
    ]
  },
  { 
    key: 'facturacion', 
    label: 'Facturación',
    acciones: [
      { key: 'ver', label: 'Ver facturas' },
      { key: 'crear', label: 'Crear factura' },
      { key: 'editar', label: 'Editar factura' },
      { key: 'eliminar', label: 'Eliminar factura' },
      { key: 'anular', label: 'Anular factura' },
      { key: 'generar_reportes', label: 'Generar reportes' }
    ]
  },
  { 
    key: 'nomina', 
    label: 'Nómina',
    acciones: [
      { key: 'ver', label: 'Ver nómina' },
      { key: 'crear', label: 'Crear registro' },
      { key: 'editar', label: 'Editar registro' },
      { key: 'eliminar', label: 'Eliminar registro' },
      { key: 'procesar', label: 'Procesar nómina' },
      { key: 'aprobar', label: 'Aprobar nómina' },
      { key: 'generar_reportes', label: 'Generar reportes' }
    ]
  },
  { 
    key: 'usuarios', 
    label: 'Usuarios',
    acciones: [
      { key: 'ver', label: 'Ver usuarios' },
      { key: 'crear', label: 'Crear usuario' },
      { key: 'editar', label: 'Editar usuario' },
      { key: 'eliminar', label: 'Eliminar usuario' },
      { key: 'gestionar_roles', label: 'Gestionar roles' },
      { key: 'cambiar_estado', label: 'Activar/Desactivar' }
    ]
  },
  { 
    key: 'reportes', 
    label: 'Reportes',
    acciones: [
      { key: 'ver', label: 'Ver reportes' },
      { key: 'generar', label: 'Generar reportes' },
      { key: 'exportar', label: 'Exportar reportes' },
      { key: 'programar', label: 'Programar reportes' }
    ]
  },
  { 
    key: 'configuracion', 
    label: 'Configuración',
    acciones: [
      { key: 'ver', label: 'Ver configuración' },
      { key: 'editar', label: 'Editar configuración' },
      { key: 'gestionar_permisos', label: 'Gestionar permisos' },
      { key: 'gestionar_roles', label: 'Gestionar roles' }
    ]
  }
];

export const ConfiguracionPermisosTab = () => {
  const { 
    getConfiguracionByClave, 
    updateConfiguracionByClave 
  } = useConfiguracionManagement();

  // Hook para cargar roles desde la API
  const { roles, loading: loadingRoles, error: errorRoles } = useRoles();

  const [permisos, setPermisos] = useState({});
  const [loadingPermisos, setLoadingPermisos] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar configuración de permisos cuando los roles estén disponibles
  useEffect(() => {
    if (!loadingRoles) {
      if (roles.length > 0) {
        cargarPermisos();
      } else {
        // Si no hay roles después de cargar, inicializar con valores por defecto
        setLoadingPermisos(false);
      }
    }
  }, [loadingRoles, roles]);

  const cargarPermisos = async () => {
    setLoadingPermisos(true);
    try {
      const config = await getConfiguracionByClave('PERMISOS_MODULOS');
      
      if (config && config.jsonData) {
        // Mergear permisos guardados con roles actuales
        const permisosGuardados = config.jsonData;
        const permisosActualizados = {};
        
        // Para cada rol disponible en la API
        roles.forEach(rol => {
          if (permisosGuardados[rol.key]) {
            // Si existe en la configuración guardada, usarlo
            permisosActualizados[rol.key] = permisosGuardados[rol.key];
          } else {
            // Si es un rol nuevo, inicializarlo
            permisosActualizados[rol.key] = {};
            MODULOS_DISPONIBLES.forEach(modulo => {
              permisosActualizados[rol.key][modulo.key] = {};
              modulo.acciones.forEach(accion => {
                permisosActualizados[rol.key][modulo.key][accion.key] = false;
              });
            });
          }
          
          // Asegurar que todos los módulos y acciones existen para cada rol
          MODULOS_DISPONIBLES.forEach(modulo => {
            if (!permisosActualizados[rol.key][modulo.key]) {
              permisosActualizados[rol.key][modulo.key] = {};
            }
            // Asegurar que todas las acciones del módulo existen
            modulo.acciones.forEach(accion => {
              if (permisosActualizados[rol.key][modulo.key][accion.key] === undefined) {
                permisosActualizados[rol.key][modulo.key][accion.key] = false;
              }
            });
          });
        });
        
        setPermisos(permisosActualizados);
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
    
    // Usar roles cargados desde la API
    roles.forEach(rol => {
      permisosDefault[rol.key] = {};
      MODULOS_DISPONIBLES.forEach(modulo => {
        permisosDefault[rol.key][modulo.key] = {};
        // Inicializar todas las acciones del módulo en false
        modulo.acciones.forEach(accion => {
          permisosDefault[rol.key][modulo.key][accion.key] = false;
        });
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

  if (loadingRoles || loadingPermisos) {
    return (
      <Stack align="center" justify="center" style={{ minHeight: '300px' }}>
        <Loader size="lg" />
        <Text c="dimmed">
          {loadingRoles ? 'Cargando roles...' : 'Cargando permisos...'}
        </Text>
      </Stack>
    );
  }

  if (errorRoles) {
    return (
      <Alert
        icon={<IconAlertCircle size={20} />}
        title="Error al cargar roles"
        color="red"
        variant="filled"
      >
        <Text size="sm">{errorRoles}</Text>
        <Text size="sm">Se usarán los roles por defecto.</Text>
      </Alert>
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
          Los cambios en los permisos afectan inmediatamente el acceso de los usuarios al sistema.
        </Text>
      </Alert>

      {/* Permisos por Rol */}
      <Stack gap="lg">
        {roles.map(rol => (
          <Paper key={rol.key} shadow="md" p="md" withBorder>
            <Stack gap="md">
              {/* Header del Rol */}
              <Group>
                <Badge color={rol.color} size="lg" variant="filled">
                  {rol.label}
                </Badge>
              </Group>

              {/* Permisos por Módulo */}
              <Stack gap="lg">
                {MODULOS_DISPONIBLES.map(modulo => (
                  <Paper key={modulo.key} p="sm" withBorder style={{ backgroundColor: '#f8f9fa' }}>
                    <Stack gap="sm">
                      {/* Título del Módulo */}
                      <Text fw={700} size="md" c="blue">
                        {modulo.label}
                      </Text>

                      {/* Grid de Acciones */}
                      <Grid gutter="xs">
                        {modulo.acciones.map(accion => (
                          <Grid.Col key={accion.key} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                            <Paper p="xs" withBorder style={{ backgroundColor: 'white' }}>
                              <Group justify="space-between" wrap="nowrap">
                                <Text size="sm" style={{ flex: 1, minWidth: 0 }}>
                                  {accion.label}
                                </Text>
                                <Switch
                                  size="sm"
                                  checked={permisos[rol.key]?.[modulo.key]?.[accion.key] || false}
                                  onChange={(e) => handlePermisoChange(
                                    rol.key,
                                    modulo.key,
                                    accion.key,
                                    e.currentTarget.checked
                                  )}
                                  color="green"
                                />
                              </Group>
                            </Paper>
                          </Grid.Col>
                        ))}
                      </Grid>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>

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
