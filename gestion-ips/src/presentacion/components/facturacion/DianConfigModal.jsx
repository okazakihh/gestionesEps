/**
 * DianConfigModal.jsx
 * 
 * Modal para configurar y gestionar la integración con DIAN
 * Permite cambiar entre ambiente de pruebas y producción
 */

import { useState, useEffect } from 'react';
import { Modal, Group, Stack, Text, Badge, Button, Alert, TextInput, Select, PasswordInput } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconCloud, IconServer } from '@tabler/icons-react';
import { obtenerInfoAmbienteDian } from '../../../negocio/services/facturacionService';
import { setDianEnvironment, clearDianCache } from '../../../negocio/services/dianService';

export const DianConfigModal = ({ opened, onClose }) => {
  const [ambienteInfo, setAmbienteInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (opened) {
      cargarInfoAmbiente();
    }
  }, [opened]);

  const cargarInfoAmbiente = async () => {
    setLoading(true);
    const info = await obtenerInfoAmbienteDian();
    setAmbienteInfo(info);
    setLoading(false);
  };

  const cambiarAmbiente = async (nuevoAmbiente) => {
    try {
      setDianEnvironment(nuevoAmbiente);
      clearDianCache();
      await cargarInfoAmbiente();
    } catch (error) {
      console.error('Error cambiando ambiente:', error);
    }
  };

  if (loading) {
    return (
      <Modal opened={opened} onClose={onClose} title="Configuración DIAN" size="lg">
        <Text>Cargando...</Text>
      </Modal>
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Configuración Facturación Electrónica DIAN" size="lg">
      <Stack spacing="md">
        {/* Estado actual */}
        <Alert 
          icon={ambienteInfo?.isTestMode ? <IconCloud size={16} /> : <IconServer size={16} />}
          title="Ambiente Actual"
          color={ambienteInfo?.isTestMode ? 'blue' : 'green'}
        >
          <Group position="apart">
            <div>
              <Text size="sm" weight={500}>{ambienteInfo?.name}</Text>
              <Text size="xs" color="dimmed">{ambienteInfo?.endpoint}</Text>
            </div>
            <Badge color={ambienteInfo?.isTestMode ? 'blue' : 'green'} size="lg">
              {ambienteInfo?.isTestMode ? 'PRUEBAS' : 'PRODUCCIÓN'}
            </Badge>
          </Group>
        </Alert>

        {/* Información de credenciales */}
        <Stack spacing="xs">
          <Text size="sm" weight={500}>Credenciales Activas:</Text>
          <Group spacing="xs">
            <Text size="sm" color="dimmed">NIT:</Text>
            <Text size="sm">{ambienteInfo?.nit}</Text>
          </Group>
          <Group spacing="xs">
            <Text size="sm" color="dimmed">Razón Social:</Text>
            <Text size="sm">{ambienteInfo?.razonSocial}</Text>
          </Group>
        </Stack>

        {/* Cambiar ambiente */}
        {ambienteInfo?.isTestMode && (
          <Alert icon={<IconAlertCircle size={16} />} title="Ambiente de Pruebas" color="yellow">
            <Text size="sm" mb="sm">
              Estás usando credenciales públicas de prueba de la DIAN. 
              Las facturas enviadas NO son válidas legalmente.
            </Text>
            <Text size="xs" color="dimmed">
              Para facturación real, configura el ambiente de producción con las credenciales del cliente.
            </Text>
          </Alert>
        )}

        {!ambienteInfo?.isTestMode && (
          <Alert icon={<IconCheck size={16} />} title="Ambiente de Producción" color="green">
            <Text size="sm">
              Facturación electrónica activa. Las facturas enviadas son válidas ante la DIAN.
            </Text>
          </Alert>
        )}

        {/* Botones de acción */}
        <Group position="apart" mt="md">
          <Button
            variant="light"
            color={ambienteInfo?.environment === 'habilitacion' ? 'blue' : 'gray'}
            onClick={() => cambiarAmbiente('habilitacion')}
            disabled={ambienteInfo?.environment === 'habilitacion'}
          >
            Usar Ambiente Pruebas
          </Button>
          <Button
            variant="light"
            color={ambienteInfo?.environment === 'produccion' ? 'green' : 'gray'}
            onClick={() => cambiarAmbiente('produccion')}
            disabled={ambienteInfo?.environment === 'produccion'}
          >
            Usar Ambiente Producción
          </Button>
        </Group>

        {/* Información adicional */}
        <Stack spacing="xs" mt="md">
          <Text size="xs" weight={500} color="dimmed">Información Técnica:</Text>
          <Text size="xs" color="dimmed">
            • Ambiente de Habilitación: Credenciales públicas de prueba DIAN
          </Text>
          <Text size="xs" color="dimmed">
            • Ambiente de Producción: Requiere registro previo en DIAN
          </Text>
          <Text size="xs" color="dimmed">
            • Formato: UBL 2.1 según Resolución 000042 de 2020
          </Text>
        </Stack>

        <Button onClick={onClose} fullWidth mt="md">
          Cerrar
        </Button>
      </Stack>
    </Modal>
  );
};

export default DianConfigModal;
