/**
 * Componente Tab para configuración del sistema
 * Capa de presentación - Componentes
 * 
 * Permite configurar parámetros generales del sistema
 */

import React, { useState, useEffect } from 'react';
import { 
  Stack, 
  TextInput, 
  Switch, 
  Button, 
  Group, 
  Grid,
  Title,
  Text,
  Loader,
  Alert,
  Paper,
  NumberInput,
  Textarea
} from '@mantine/core';
import { IconDeviceFloppy, IconAlertCircle, IconSettings } from '@tabler/icons-react';
import { useConfiguracionManagement } from '../../../negocio/hooks/configuracion/useConfiguracionManagement.js';
import Swal from 'sweetalert2';

export const ConfiguracionSistemaTab = () => {
  const { getConfiguracionByClave, updateConfiguracionByClave } = useConfiguracionManagement();
  
  const [formData, setFormData] = useState({
    nombreSistema: '',
    version: '',
    mantenimiento: false,
    mensajeMantenimiento: '',
    limiteIntentosFallidos: 5,
    tiempoBloqueoMinutos: 30,
    tiempoSesionMinutos: 120,
    permitirRegistro: true,
    verificarEmail: true,
    modoDesarrollo: false
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
      const config = await getConfiguracionByClave('SISTEMA_GENERAL');
      
      if (config && config.jsonData) {
        setConfigOriginal(config.jsonData);
        
        setFormData({
          nombreSistema: config.jsonData.nombreSistema || '',
          version: config.jsonData.version || '',
          mantenimiento: config.jsonData.mantenimiento || false,
          mensajeMantenimiento: config.jsonData.mensajeMantenimiento || '',
          limiteIntentosFallidos: config.jsonData.limiteIntentosFallidos || 5,
          tiempoBloqueoMinutos: config.jsonData.tiempoBloqueoMinutos || 30,
          tiempoSesionMinutos: config.jsonData.tiempoSesionMinutos || 120,
          permitirRegistro: config.jsonData.permitirRegistro !== false,
          verificarEmail: config.jsonData.verificarEmail !== false,
          modoDesarrollo: config.jsonData.modoDesarrollo || false
        });
      }
    } catch (error) {
      console.error('Error al cargar configuración del sistema:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async () => {
    const result = await Swal.fire({
      title: '¿Guardar configuración del sistema?',
      text: 'Los cambios afectarán el comportamiento general de la aplicación',
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
      const result = await updateConfiguracionByClave('SISTEMA_GENERAL', updatedConfig);

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
        <Text c="dimmed">Cargando configuración del sistema...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Title order={3}>
          <IconSettings size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Configuración General del Sistema
        </Title>
        <Text size="sm" c="dimmed">
          Configure los parámetros generales de funcionamiento del sistema
        </Text>
      </Stack>

      {formData.mantenimiento && (
        <Alert
          icon={<IconAlertCircle size={20} />}
          title="Modo Mantenimiento Activo"
          color="red"
          variant="filled"
        >
          <Text size="sm">
            El sistema está actualmente en modo mantenimiento. Los usuarios no podrán acceder.
          </Text>
        </Alert>
      )}

      <Paper shadow="xs" p="lg" withBorder>
        <Stack gap="md">
          {/* Información básica */}
          <Title order={4}>Información del Sistema</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Nombre del Sistema"
                placeholder="Sistema de Gestión IPS"
                value={formData.nombreSistema}
                onChange={(e) => handleChange('nombreSistema', e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Versión"
                placeholder="2.1.0"
                value={formData.version}
                onChange={(e) => handleChange('version', e.target.value)}
              />
            </Grid.Col>
          </Grid>

          {/* Modo Mantenimiento */}
          <Title order={4} mt="md">Modo Mantenimiento</Title>
          <Grid>
            <Grid.Col span={12}>
              <Switch
                label="Activar modo mantenimiento"
                description="Bloquea el acceso al sistema para todos los usuarios excepto administradores"
                checked={formData.mantenimiento}
                onChange={(e) => handleChange('mantenimiento', e.currentTarget.checked)}
                color="red"
              />
            </Grid.Col>
            {formData.mantenimiento && (
              <Grid.Col span={12}>
                <Textarea
                  label="Mensaje de Mantenimiento"
                  placeholder="Sistema en mantenimiento. Por favor intente más tarde."
                  value={formData.mensajeMantenimiento}
                  onChange={(e) => handleChange('mensajeMantenimiento', e.target.value)}
                  minRows={2}
                />
              </Grid.Col>
            )}
          </Grid>

          {/* Seguridad */}
          <Title order={4} mt="md">Parámetros de Seguridad</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label="Límite de Intentos Fallidos"
                description="Intentos antes de bloqueo"
                value={formData.limiteIntentosFallidos}
                onChange={(value) => handleChange('limiteIntentosFallidos', value)}
                min={1}
                max={10}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label="Tiempo de Bloqueo"
                description="Minutos de bloqueo"
                value={formData.tiempoBloqueoMinutos}
                onChange={(value) => handleChange('tiempoBloqueoMinutos', value)}
                min={5}
                max={120}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label="Tiempo de Sesión"
                description="Minutos de inactividad"
                value={formData.tiempoSesionMinutos}
                onChange={(value) => handleChange('tiempoSesionMinutos', value)}
                min={15}
                max={480}
              />
            </Grid.Col>
          </Grid>

          {/* Opciones Generales */}
          <Title order={4} mt="md">Opciones Generales</Title>
          <Stack gap="sm">
            <Switch
              label="Permitir Registro de Usuarios"
              description="Los usuarios pueden registrarse automáticamente"
              checked={formData.permitirRegistro}
              onChange={(e) => handleChange('permitirRegistro', e.currentTarget.checked)}
            />
            <Switch
              label="Verificar Email al Registrarse"
              description="Requiere confirmación por correo electrónico"
              checked={formData.verificarEmail}
              onChange={(e) => handleChange('verificarEmail', e.currentTarget.checked)}
            />
            <Switch
              label="Modo Desarrollo"
              description="Activa logs adicionales y herramientas de debugging"
              checked={formData.modoDesarrollo}
              onChange={(e) => handleChange('modoDesarrollo', e.currentTarget.checked)}
              color="orange"
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

export default ConfiguracionSistemaTab;
