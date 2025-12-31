/**
 * Componente Tab para configuración de notificaciones
 * Capa de presentación - Componentes
 * 
 * Permite configurar notificaciones por email y SMTP
 */

import React, { useState, useEffect } from 'react';
import { 
  Stack, 
  TextInput, 
  PasswordInput,
  Switch, 
  Button, 
  Group, 
  Grid,
  Title,
  Text,
  Loader,
  Alert,
  Paper,
  NumberInput
} from '@mantine/core';
import { IconDeviceFloppy, IconAlertCircle, IconBell } from '@tabler/icons-react';
import { useConfiguracionManagement } from '../../../negocio/hooks/configuracion/useConfiguracionManagement.js';
import Swal from 'sweetalert2';

export const ConfiguracionNotificacionesTab = () => {
  const { getConfiguracionByClave, updateConfiguracionByClave } = useConfiguracionManagement();
  
  const [formData, setFormData] = useState({
    emailNotificaciones: '',
    habilitarNotificacionesCitas: true,
    habilitarNotificacionesFacturas: true,
    habilitarNotificacionesNomina: true,
    diasAnticipacionCita: 1,
    horaEnvioRecordatorio: '08:00',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpAuth: true,
    smtpStartTls: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configOriginal, setConfigOriginal] = useState(null);

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    setLoading(true);
    try {
      const config = await getConfiguracionByClave('NOTIFICACIONES');
      
      
      if (config && config.jsonData) {
        setConfigOriginal(config.jsonData);
        
        setFormData({
          emailNotificaciones: config.jsonData.emailNotificaciones || '',
          habilitarNotificacionesCitas: config.jsonData.habilitarNotificacionesCitas !== false,
          habilitarNotificacionesFacturas: config.jsonData.habilitarNotificacionesFacturas !== false,
          habilitarNotificacionesNomina: config.jsonData.habilitarNotificacionesNomina !== false,
          diasAnticipacionCita: config.jsonData.diasAnticipacionCita || 1,
          horaEnvioRecordatorio: config.jsonData.horaEnvioRecordatorio || '08:00',
          smtpHost: config.jsonData.smtpHost || '',
          smtpPort: config.jsonData.smtpPort || 587,
          smtpUser: config.jsonData.smtpUser || '',
          smtpPassword: config.jsonData.smtpPassword || '',
          smtpAuth: config.jsonData.smtpAuth !== false,
          smtpStartTls: config.jsonData.smtpStartTls !== false
        });
      }
    } catch (error) {
      console.error('Error al cargar configuración de notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async () => {
    const result = await Swal.fire({
      title: '¿Guardar configuración de notificaciones?',
      text: 'Los cambios afectarán el envío de emails del sistema',
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
      // Hacer merge con la configuración original
      const updatedConfig = {
        ...(configOriginal || {}),
        ...formData
      };


      // Enviar solo el objeto de configuración
      const result = await updateConfiguracionByClave('NOTIFICACIONES', updatedConfig);

      if (result.success) {
        await cargarConfiguracion();
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      // Error ya manejado en el hook
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack align="center" justify="center" style={{ minHeight: '300px' }}>
        <Loader size="lg" />
        <Text c="dimmed">Cargando configuración de notificaciones...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Title order={3}>
          <IconBell size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Configuración de Notificaciones
        </Title>
        <Text size="sm" c="dimmed">
          Configure las notificaciones por email y los recordatorios del sistema
        </Text>
      </Stack>

      <Alert
        icon={<IconAlertCircle size={20} />}
        title="Importante"
        color="blue"
        variant="light"
      >
        <Text size="sm">
          Para enviar notificaciones, asegúrese de configurar correctamente los parámetros SMTP.
          Puede usar Gmail, Outlook u otro proveedor SMTP.
        </Text>
      </Alert>

      <Paper shadow="xs" p="lg" withBorder>
        <Stack gap="md">
          {/* Email General */}
          <Title order={4}>Email de Notificaciones</Title>
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                label="Email de Notificaciones"
                placeholder="notificaciones@ipssaludtotal.com.co"
                description="Email desde el cual se enviarán las notificaciones"
                value={formData.emailNotificaciones}
                onChange={(e) => handleChange('emailNotificaciones', e.target.value)}
                type="email"
              />
            </Grid.Col>
          </Grid>

          {/* Tipos de Notificaciones */}
          <Title order={4} mt="md">Tipos de Notificaciones</Title>
          <Stack gap="sm">
            <Switch
              label="Notificaciones de Citas"
              description="Enviar recordatorios de citas a pacientes"
              checked={formData.habilitarNotificacionesCitas}
              onChange={(e) => handleChange('habilitarNotificacionesCitas', e.currentTarget.checked)}
            />
            <Switch
              label="Notificaciones de Facturas"
              description="Enviar notificaciones de facturas generadas"
              checked={formData.habilitarNotificacionesFacturas}
              onChange={(e) => handleChange('habilitarNotificacionesFacturas', e.currentTarget.checked)}
            />
            <Switch
              label="Notificaciones de Nómina"
              description="Enviar desprendibles de pago a empleados"
              checked={formData.habilitarNotificacionesNomina}
              onChange={(e) => handleChange('habilitarNotificacionesNomina', e.currentTarget.checked)}
            />
          </Stack>

          {/* Parámetros de Recordatorios */}
          {formData.habilitarNotificacionesCitas && (
            <>
              <Title order={4} mt="md">Parámetros de Recordatorios</Title>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="Días de Anticipación"
                    description="Días antes de enviar recordatorio de cita"
                    value={formData.diasAnticipacionCita}
                    onChange={(value) => handleChange('diasAnticipacionCita', value)}
                    min={0}
                    max={7}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Hora de Envío"
                    description="Hora para enviar recordatorios (HH:MM)"
                    value={formData.horaEnvioRecordatorio}
                    onChange={(e) => handleChange('horaEnvioRecordatorio', e.target.value)}
                    placeholder="08:00"
                  />
                </Grid.Col>
              </Grid>
            </>
          )}

          {/* Configuración SMTP */}
          <Title order={4} mt="md">Configuración SMTP</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <TextInput
                label="Servidor SMTP"
                placeholder="smtp.gmail.com"
                value={formData.smtpHost}
                onChange={(e) => handleChange('smtpHost', e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label="Puerto SMTP"
                value={formData.smtpPort}
                onChange={(value) => handleChange('smtpPort', value)}
                min={1}
                max={65535}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Usuario SMTP"
                placeholder="usuario@gmail.com"
                value={formData.smtpUser}
                onChange={(e) => handleChange('smtpUser', e.target.value)}
                type="email"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <PasswordInput
                label="Contraseña SMTP"
                placeholder="••••••••"
                value={formData.smtpPassword}
                onChange={(e) => handleChange('smtpPassword', e.target.value)}
              />
            </Grid.Col>
          </Grid>

          {/* Opciones SMTP */}
          <Stack gap="sm" mt="sm">
            <Switch
              label="Autenticación SMTP"
              description="Requiere autenticación con usuario y contraseña"
              checked={formData.smtpAuth}
              onChange={(e) => handleChange('smtpAuth', e.currentTarget.checked)}
            />
            <Switch
              label="STARTTLS"
              description="Usar STARTTLS para conexión segura"
              checked={formData.smtpStartTls}
              onChange={(e) => handleChange('smtpStartTls', e.currentTarget.checked)}
            />
          </Stack>
        </Stack>
      </Paper>

      <Group justify="flex-end">
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

export default ConfiguracionNotificacionesTab;
