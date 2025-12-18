/**
 * SiigoConfigTab.jsx
 * 
 * Componente para configuración de integración con Siigo
 * Permite autenticar, gestionar credenciales y ver catálogos
 * 
 * Capa: Presentación
 */

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Stack,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Badge,
  Alert,
  Accordion,
  Table,
  ScrollArea,
  Divider,
  SegmentedControl
} from '@mantine/core';
import {
  IconPlugConnected,
  IconPlugConnectedX,
  IconKey,
  IconRefresh,
  IconCheck,
  IconAlertCircle,
  IconDatabase,
  IconCreditCard,
  IconUsers,
  IconFileInvoice,
  IconFlask,
  IconRocket,
  IconInfoCircle
} from '@tabler/icons-react';
import { useSiigoIntegration } from '../../../negocio/hooks/facturacion/useSiigoIntegration.js';
import { useTheme } from '../../../negocio/contexts/ThemeContext.jsx';
import { useIpsConfig } from '../../../negocio/hooks/configuracion/useIpsConfig';
import Swal from 'sweetalert2';

export const SiigoConfigTab = () => {
  const { tema } = useTheme();
  const {
    isConnected,
    isLoading,
    catalogs,
    authenticate,
    disconnect,
    loadCatalogs
  } = useSiigoIntegration();

  const { ipsConfig, updateIpsConfig } = useIpsConfig();

  const [credentials, setCredentials] = useState({
    username: '',
    access_key: ''
  });

  const [showCredentials, setShowCredentials] = useState(false);
  const [siigoMode, setSiigoMode] = useState('DEV');

  // Cargar modo actual desde configuración
  useEffect(() => {
    if (ipsConfig) {
      setSiigoMode(ipsConfig.siigoMode || 'DEV');
    }
  }, [ipsConfig]);

  // Cargar credenciales guardadas
  useEffect(() => {
    const savedUsername = localStorage.getItem('siigo_username');
    if (savedUsername && !showCredentials) {
      setCredentials(prev => ({ ...prev, username: savedUsername }));
    }
  }, [showCredentials]);

  const handleModeChange = async (newMode) => {
    // Si cambia a PROD, mostrar advertencia
    if (newMode === 'PROD') {
      const result = await Swal.fire({
        title: '⚠️ Activar Modo Producción',
        html: `
          <p style="margin-bottom: 12px;">
            Está a punto de activar el modo <strong>PRODUCCIÓN</strong> de Siigo.
          </p>
          <p style="margin-bottom: 8px; color: #dc3545;">
            <strong>ADVERTENCIA:</strong>
          </p>
          <ul style="text-align: left; color: #6c757d; font-size: 0.9em;">
            <li>Todas las facturas se enviarán <strong>realmente</strong> a la DIAN</li>
            <li>Los documentos electrónicos tendrán <strong>validez legal</strong></li>
            <li>Las operaciones tendrán <strong>costos reales</strong></li>
            <li>No se podrán borrar documentos enviados</li>
          </ul>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, activar PRODUCCIÓN',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn-danger',
          cancelButton: 'btn-secondary'
        }
      });

      if (!result.isConfirmed) {
        return; // Usuario canceló
      }
    }

    // Actualizar modo
    setSiigoMode(newMode);
    
    if (ipsConfig) {
      const updatedConfig = { ...ipsConfig, siigoMode: newMode };
      await updateIpsConfig(updatedConfig);
      
      Swal.fire({
        title: newMode === 'DEV' ? '🧪 Modo Desarrollo Activado' : '🚀 Modo Producción Activado',
        text: newMode === 'DEV' 
          ? 'Todas las operaciones se simularán sin costo ni impacto real.'
          : 'Las operaciones ahora se realizarán en el sistema real de Siigo.',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  const handleConnect = async () => {
    if (!credentials.username || !credentials.access_key) {
      return;
    }
    await authenticate(credentials);
  };

  const handleDisconnect = () => {
    disconnect();
    setCredentials({ username: '', access_key: '' });
  };

  const handleRefreshCatalogs = async () => {
    await loadCatalogs();
  };

  return (
    <Stack gap="lg">
      {/* Estado de conexión */}
      <Paper p="md" withBorder>
        <Group justify="space-between">
          <Group>
            {isConnected ? (
              <>
                <IconPlugConnected size={32} color={tema.primaryColor} />
                <div>
                  <Text fw={600} size="lg">Conectado a Siigo</Text>
                  <Text size="sm" c="dimmed">
                    Integración activa con Siigo API
                  </Text>
                </div>
              </>
            ) : (
              <>
                <IconPlugConnectedX size={32} color="gray" />
                <div>
                  <Text fw={600} size="lg">Desconectado</Text>
                  <Text size="sm" c="dimmed">
                    Configure sus credenciales para conectar
                  </Text>
                </div>
              </>
            )}
          </Group>

          <Badge
            size="lg"
            color={isConnected ? 'green' : 'gray'}
            leftSection={isConnected ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
          >
            {isConnected ? 'Conectado' : 'Desconectado'}
          </Badge>
        </Group>
      </Paper>

      {/* Selector de Modo DEV/PROD */}
      <Paper p="md" withBorder style={{ 
        backgroundColor: siigoMode === 'DEV' ? '#e7f5ff' : '#fff5f5',
        borderColor: siigoMode === 'DEV' ? '#339af0' : '#fa5252'
      }}>
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <div>
              <Group gap="xs" mb={4}>
                {siigoMode === 'DEV' ? (
                  <IconFlask size={24} color="#339af0" />
                ) : (
                  <IconRocket size={24} color="#fa5252" />
                )}
                <Title order={3} size="h4">
                  Modo de Operación: {siigoMode === 'DEV' ? 'Desarrollo' : 'Producción'}
                </Title>
              </Group>
              <Text size="sm" c="dimmed">
                {siigoMode === 'DEV' 
                  ? 'Las operaciones se simulan localmente sin costo ni conexión real a Siigo'
                  : 'Las operaciones se ejecutan realmente en Siigo API con validez legal'
                }
              </Text>
            </div>
            <Badge 
              size="lg" 
              color={siigoMode === 'DEV' ? 'blue' : 'red'}
              leftSection={siigoMode === 'DEV' ? <IconFlask size={16} /> : <IconRocket size={16} />}
            >
              {siigoMode}
            </Badge>
          </Group>

          <SegmentedControl
            value={siigoMode}
            onChange={handleModeChange}
            size="md"
            fullWidth
            data={[
              {
                value: 'DEV',
                label: (
                  <Group gap="xs" style={{ padding: '8px' }}>
                    <IconFlask size={20} />
                    <div>
                      <Text fw={600} size="sm">🧪 Desarrollo (Mock)</Text>
                      <Text size="xs" c="dimmed">Sin costos • Pruebas ilimitadas</Text>
                    </div>
                  </Group>
                )
              },
              {
                value: 'PROD',
                label: (
                  <Group gap="xs" style={{ padding: '8px' }}>
                    <IconRocket size={20} />
                    <div>
                      <Text fw={600} size="sm">🚀 Producción (Real)</Text>
                      <Text size="xs" c="dimmed">API Real • Validez legal</Text>
                    </div>
                  </Group>
                )
              }
            ]}
          />

          <Alert 
            icon={<IconInfoCircle />} 
            color={siigoMode === 'DEV' ? 'blue' : 'red'}
            title={siigoMode === 'DEV' ? 'Modo Desarrollo Activo' : 'Modo Producción Activo'}
          >
            {siigoMode === 'DEV' ? (
              <Stack gap="xs">
                <Text size="sm">
                  ✅ Todas las operaciones se simulan sin conexión a Siigo
                </Text>
                <Text size="sm">
                  ✅ Sin costos asociados - Pruebas ilimitadas
                </Text>
                <Text size="sm">
                  ✅ Los CUFEs y documentos son ficticios
                </Text>
                <Text size="sm">
                  ✅ Ideal para desarrollo, pruebas y capacitación
                </Text>
              </Stack>
            ) : (
              <Stack gap="xs">
                <Text size="sm">
                  ⚠️ Las facturas se envían realmente a la DIAN
                </Text>
                <Text size="sm">
                  ⚠️ Los documentos tienen validez legal
                </Text>
                <Text size="sm">
                  ⚠️ Las operaciones tienen costos reales
                </Text>
                <Text size="sm">
                  ⚠️ Use solo para operaciones de producción
                </Text>
              </Stack>
            )}
          </Alert>
        </Stack>
      </Paper>

      {/* Formulario de credenciales */}
      {!isConnected && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Title order={3} size="h4">
                  <IconKey size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Credenciales de Siigo
                </Title>
                <Text size="sm" c="dimmed" mt={4}>
                  Ingrese sus credenciales de Siigo API
                </Text>
              </div>
            </Group>

            <Alert color="blue" icon={<IconAlertCircle />}>
              <Text size="sm">
                Puede obtener sus credenciales en Siigo Nube: <b>Menú &gt; Alianzas &gt; Mi Credencial API</b>
              </Text>
            </Alert>

            <TextInput
              label="Username (Usuario API)"
              placeholder="usuario@empresa.com"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
              leftSection={<IconKey size={16} />}
            />

            <PasswordInput
              label="Access Key (Clave de acceso)"
              placeholder="Ingrese su clave de acceso"
              value={credentials.access_key}
              onChange={(e) => setCredentials({ ...credentials, access_key: e.target.value })}
              required
              leftSection={<IconKey size={16} />}
            />

            <Button
              fullWidth
              onClick={handleConnect}
              loading={isLoading}
              disabled={!credentials.username || !credentials.access_key}
              color={tema.mantineColor}
              size="md"
              leftSection={<IconPlugConnected size={18} />}
            >
              Conectar con Siigo
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Panel de información cuando está conectado */}
      {isConnected && (
        <>
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <div>
                  <Title order={3} size="h4">Configuración Activa</Title>
                  <Text size="sm" c="dimmed" mt={4}>
                    Usuario: {credentials.username || localStorage.getItem('siigo_username')}
                  </Text>
                </div>
                <Group>
                  <Button
                    variant="light"
                    color="blue"
                    leftSection={<IconRefresh size={18} />}
                    onClick={handleRefreshCatalogs}
                    loading={isLoading}
                  >
                    Actualizar Catálogos
                  </Button>
                  <Button
                    variant="light"
                    color="red"
                    leftSection={<IconPlugConnectedX size={18} />}
                    onClick={handleDisconnect}
                  >
                    Desconectar
                  </Button>
                </Group>
              </Group>

              <Alert color="green" icon={<IconCheck />}>
                <Text size="sm">
                  Token de acceso válido. Renovación automática cada 24 horas.
                </Text>
              </Alert>
            </Stack>
          </Paper>

          {/* Catálogos de Siigo */}
          <Paper p="md" withBorder>
            <Title order={3} size="h4" mb="md">
              <IconDatabase size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Catálogos Cargados
            </Title>

            <Accordion variant="separated">
              {/* Tipos de documento */}
              <Accordion.Item value="document-types">
                <Accordion.Control icon={<IconFileInvoice size={20} />}>
                  <Group justify="space-between">
                    <Text>Tipos de Factura</Text>
                    <Badge color="blue" size="sm">{catalogs.documentTypes.length}</Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <ScrollArea h={200}>
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>ID</Table.Th>
                          <Table.Th>Código</Table.Th>
                          <Table.Th>Nombre</Table.Th>
                          <Table.Th>Electrónico</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {catalogs.documentTypes.map((doc) => (
                          <Table.Tr key={doc.id}>
                            <Table.Td>{doc.id}</Table.Td>
                            <Table.Td>{doc.code}</Table.Td>
                            <Table.Td>{doc.name}</Table.Td>
                            <Table.Td>
                              <Badge color={doc.electronic_type ? 'green' : 'gray'} size="sm">
                                {doc.electronic_type || 'No'}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                </Accordion.Panel>
              </Accordion.Item>

              {/* Formas de pago */}
              <Accordion.Item value="payment-types">
                <Accordion.Control icon={<IconCreditCard size={20} />}>
                  <Group justify="space-between">
                    <Text>Formas de Pago</Text>
                    <Badge color="blue" size="sm">{catalogs.paymentTypes.length}</Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <ScrollArea h={200}>
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>ID</Table.Th>
                          <Table.Th>Nombre</Table.Th>
                          <Table.Th>Tipo</Table.Th>
                          <Table.Th>Vencimiento</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {catalogs.paymentTypes.map((payment) => (
                          <Table.Tr key={payment.id}>
                            <Table.Td>{payment.id}</Table.Td>
                            <Table.Td>{payment.name}</Table.Td>
                            <Table.Td>
                              <Badge size="sm">{payment.type}</Badge>
                            </Table.Td>
                            <Table.Td>
                              <Badge color={payment.due_date ? 'orange' : 'gray'} size="sm">
                                {payment.due_date ? 'Sí' : 'No'}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                </Accordion.Panel>
              </Accordion.Item>

              {/* Vendedores */}
              <Accordion.Item value="sellers">
                <Accordion.Control icon={<IconUsers size={20} />}>
                  <Group justify="space-between">
                    <Text>Usuarios/Vendedores</Text>
                    <Badge color="blue" size="sm">{catalogs.sellers.length}</Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <ScrollArea h={200}>
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>ID</Table.Th>
                          <Table.Th>Nombre</Table.Th>
                          <Table.Th>Email</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {catalogs.sellers.map((seller) => (
                          <Table.Tr key={seller.id}>
                            <Table.Td>{seller.id}</Table.Td>
                            <Table.Td>{seller.first_name} {seller.last_name}</Table.Td>
                            <Table.Td>{seller.email}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Paper>

          {/* Documentación */}
          <Paper p="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
            <Title order={4} mb="sm">Documentación</Title>
            <Text size="sm" mb="xs">
              • <b>Límite de peticiones:</b> 100 requests por minuto
            </Text>
            <Text size="sm" mb="xs">
              • <b>Tiempo de respuesta:</b> Promedio &lt; 2 segundos, timeout recomendado 120s
            </Text>
            <Text size="sm" mb="xs">
              • <b>Token válido:</b> 24 horas
            </Text>
            <Text size="sm">
              • <b>Documentación completa:</b>{' '}
              <a
                href="https://siigoapi.docs.apiary.io/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: tema.primaryColor }}
              >
                https://siigoapi.docs.apiary.io/
              </a>
            </Text>
          </Paper>
        </>
      )}
    </Stack>
  );
};

export default SiigoConfigTab;
