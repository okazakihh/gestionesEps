/**
 * Página principal del módulo de Configuración
 * Capa de presentación - Páginas
 * 
 * Esta página proporciona la interfaz para gestionar la configuración
 * general del sistema IPS, incluyendo información institucional,
 * parámetros del sistema, facturación y nómina.
 */

import React, { useState } from 'react';
import { Container, Stack, Title, Text, Paper, Alert, Tabs, Button, Group } from '@mantine/core';
import { IconSettings, IconInfoCircle, IconBuilding, IconBell, IconFileInvoice, IconCash, IconPlus, IconShieldLock } from '@tabler/icons-react';
import { MainLayout } from '../../components/ui/MainLayout.jsx';
import { ConfiguracionIPSTab } from '../../components/configuracion/ConfiguracionIPSTab.jsx';
import { ConfiguracionSistemaTab } from '../../components/configuracion/ConfiguracionSistemaTab.jsx';
import { ConfiguracionNotificacionesTab } from '../../components/configuracion/ConfiguracionNotificacionesTab.jsx';
import { ConfiguracionFacturacionTab } from '../../components/configuracion/ConfiguracionFacturacionTab.jsx';
import { ConfiguracionNominaTab } from '../../components/configuracion/ConfiguracionNominaTab.jsx';
import { ConfiguracionPermisosTab } from '../../components/configuracion/ConfiguracionPermisosTab.jsx';
import { CrearConfiguracionModal } from '../../components/configuracion/CrearConfiguracionModal.jsx';

const ConfiguracionPage = () => {
  const [modalOpened, setModalOpened] = useState(false);

  return (
    <MainLayout title="Configuración del Sistema" subtitle="Gestión de configuraciones generales">
      <Container size="100%" px="xl" style={{ maxWidth: '100%' }}>
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <Stack gap="xs">
              <Title order={1} size="h2">
                <IconSettings size={32} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
                Configuración del Sistema IPS
              </Title>
              <Text size="lg" c="dimmed">
                Administra la configuración institucional, parámetros del sistema y preferencias
              </Text>
            </Stack>
            
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => setModalOpened(true)}
              variant="filled"
            >
              Nueva Configuración
            </Button>
          </Group>

          {/* Información de seguridad */}
          <Alert
            icon={<IconInfoCircle size={20} />}
            title="Información Importante"
            color="yellow"
            variant="light"
          >
            <Text size="sm">
              Los cambios en la configuración afectan el funcionamiento global del sistema.
              Asegúrese de revisar cuidadosamente antes de guardar.
            </Text>
          </Alert>

          {/* Tabs de configuración */}
          <Paper shadow="sm" radius="md" withBorder p="md">
            <Tabs defaultValue="ips" variant="pills">
              <Tabs.List>
                <Tabs.Tab 
                  value="ips" 
                  leftSection={<IconBuilding size={16} />}
                >
                  Información IPS
                </Tabs.Tab>
                <Tabs.Tab 
                  value="sistema" 
                  leftSection={<IconSettings size={16} />}
                >
                  Sistema
                </Tabs.Tab>
                <Tabs.Tab 
                  value="notificaciones" 
                  leftSection={<IconBell size={16} />}
                >
                  Notificaciones
                </Tabs.Tab>
                <Tabs.Tab 
                  value="facturacion" 
                  leftSection={<IconFileInvoice size={16} />}
                >
                  Facturación
                </Tabs.Tab>
                <Tabs.Tab 
                  value="nomina" 
                  leftSection={<IconCash size={16} />}
                >
                  Nómina
                </Tabs.Tab>
                <Tabs.Tab 
                  value="permisos" 
                  leftSection={<IconShieldLock size={16} />}
                >
                  Permisos a Módulos
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="ips" pt="lg">
                <ConfiguracionIPSTab />
              </Tabs.Panel>

              <Tabs.Panel value="sistema" pt="lg">
                <ConfiguracionSistemaTab />
              </Tabs.Panel>

              <Tabs.Panel value="notificaciones" pt="lg">
                <ConfiguracionNotificacionesTab />
              </Tabs.Panel>

              <Tabs.Panel value="facturacion" pt="lg">
                <ConfiguracionFacturacionTab />
              </Tabs.Panel>

              <Tabs.Panel value="nomina" pt="lg">
                <ConfiguracionNominaTab />
              </Tabs.Panel>

              <Tabs.Panel value="permisos" pt="lg">
                <ConfiguracionPermisosTab />
              </Tabs.Panel>
            </Tabs>
          </Paper>
          
          {/* Modal para crear configuraciones */}
          <CrearConfiguracionModal 
            opened={modalOpened} 
            onClose={() => setModalOpened(false)} 
          />

          {/* Footer info */}
          <Alert
            icon={<IconInfoCircle size={20} />}
            title="Acerca de las configuraciones"
            color="blue"
            variant="light"
          >
            <Stack gap="xs">
              <Text size="sm">
                <strong>Información IPS:</strong> Datos institucionales que aparecen en facturas, historias clínicas y documentos oficiales.
              </Text>
              <Text size="sm">
                <strong>Sistema:</strong> Parámetros generales del funcionamiento de la aplicación.
              </Text>
              <Text size="sm">
                <strong>Notificaciones:</strong> Configuración de alertas y recordatorios por email.
              </Text>
              <Text size="sm">
                <strong>Facturación:</strong> Parámetros específicos para la generación de facturas.
              </Text>
              <Text size="sm">
                <strong>Nómina:</strong> Parámetros para el cálculo de nómina y prestaciones sociales.
              </Text>
              <Text size="sm">
                <strong>Permisos a Módulos:</strong> Gestión de permisos y accesos por rol a cada módulo del sistema.
              </Text>
            </Stack>
          </Alert>
        </Stack>
      </Container>
    </MainLayout>
  );
};

export default ConfiguracionPage;
