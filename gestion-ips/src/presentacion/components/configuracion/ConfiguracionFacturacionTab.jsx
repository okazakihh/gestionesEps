/**
 * Componente Tab para configuración de facturación
 * Capa de presentación - Componentes
 * 
 * Permite configurar parámetros de facturación del sistema
 */

import React, { useState, useEffect } from 'react';
import { 
  Stack, 
  TextInput, 
  Textarea,
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
import { IconDeviceFloppy, IconAlertCircle, IconFileInvoice } from '@tabler/icons-react';
import { useConfiguracionManagement } from '../../../negocio/hooks/configuracion/useConfiguracionManagement.js';
import { clearFacturacionConfigCache } from '../../../negocio/services/facturacionService.js';
import Swal from 'sweetalert2';

export const ConfiguracionFacturacionTab = () => {
  const { getConfiguracionByClave, updateConfiguracionByClave } = useConfiguracionManagement();
  
  const [formData, setFormData] = useState({
    prefijoFactura: 'FM',
    consecutivoInicial: 1000,
    iva: 0,
    retencionFuente: 0,
    diasVencimientoFactura: 30,
    notasLegales: '',
    incluirFirmaDigital: false,
    formatoNumeroFactura: '{PREFIJO}-{CONSECUTIVO}'
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
      const config = await getConfiguracionByClave('FACTURACION');
      
      if (config && config.jsonData) {
        setConfigOriginal(config.jsonData);
        
        setFormData({
          prefijoFactura: config.jsonData.prefijoFactura || 'FM',
          consecutivoInicial: config.jsonData.consecutivoInicial || 1000,
          iva: config.jsonData.iva || 0,
          retencionFuente: config.jsonData.retencionFuente || 0,
          diasVencimientoFactura: config.jsonData.diasVencimientoFactura || 30,
          notasLegales: config.jsonData.notasLegales || '',
          incluirFirmaDigital: config.jsonData.incluirFirmaDigital || false,
          formatoNumeroFactura: config.jsonData.formatoNumeroFactura || '{PREFIJO}-{CONSECUTIVO}'
        });
      }
    } catch (error) {
      console.error('Error al cargar configuración de facturación:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generar ejemplo de formato con valores actuales
  const generarEjemploFormato = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const prefijo = formData.prefijoFactura || 'FM';
    const consecutivo = String(formData.consecutivoInicial || 1000).padStart(6, '0');
    
    return formData.formatoNumeroFactura
      .replace('{PREFIJO}', prefijo)
      .replace('{prefijo}', prefijo)
      .replace('{CONSECUTIVO}', consecutivo)
      .replace('{consecutivo}', consecutivo)
      .replace('{YEAR}', currentYear.toString())
      .replace('{year}', currentYear.toString())
      .replace('{MES}', currentMonth)
      .replace('{mes}', currentMonth)
      .replace('{MONTH}', currentMonth);
  };

  const handleGuardar = async () => {
    const result = await Swal.fire({
      title: '¿Guardar configuración de facturación?',
      text: 'Los cambios afectarán todas las facturas generadas',
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

      console.log('Config Original (Facturación):', configOriginal);
      console.log('Updated Config (Facturación):', updatedConfig);

      // Enviar solo el objeto de configuración
      const result = await updateConfiguracionByClave('FACTURACION', updatedConfig);
      
      if (result.success) {
        // Limpiar cache de facturación
        clearFacturacionConfigCache();
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
        <Text c="dimmed">Cargando configuración de facturación...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Title order={3}>
          <IconFileInvoice size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Configuración de Facturación
        </Title>
        <Text size="sm" c="dimmed">
          Configure los parámetros para la generación de facturas médicas
        </Text>
      </Stack>

      <Alert
        icon={<IconAlertCircle size={20} />}
        title="Importante"
        color="yellow"
        variant="light"
      >
        <Text size="sm">
          Los cambios en estos parámetros afectarán todas las facturas que se generen a partir de este momento.
          Las facturas ya generadas no se verán afectadas.
        </Text>
      </Alert>

      <Paper shadow="xs" p="lg" withBorder>
        <Stack gap="md">
          {/* Numeración de Facturas */}
          <Title order={4}>Numeración de Facturas</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Prefijo de Factura"
                placeholder="FM"
                description="Ej: FM, FAC, INV"
                value={formData.prefijoFactura}
                onChange={(e) => handleChange('prefijoFactura', e.target.value.toUpperCase())}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label="Consecutivo Inicial"
                description="Número de inicio"
                value={formData.consecutivoInicial}
                onChange={(value) => handleChange('consecutivoInicial', value)}
                min={1}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Formato de Número"
                placeholder="Ejemplo: {PREFIJO}-{YEAR}-{CONSECUTIVO}"
                description="Variables: {PREFIJO}, {CONSECUTIVO}, {YEAR}, {MES}"
                value={formData.formatoNumeroFactura}
                onChange={(e) => handleChange('formatoNumeroFactura', e.target.value)}
              />
            </Grid.Col>
          </Grid>

          {/* Vista previa del formato */}
          {formData.formatoNumeroFactura && (
            <Alert color="blue" variant="light" mt="sm">
              <Text size="sm" fw={500}>
                Vista previa del formato:
              </Text>
              <Text size="lg" fw={700} c="blue">
                {generarEjemploFormato()}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                Este es un ejemplo de cómo se verá el número de factura con la configuración actual
              </Text>
            </Alert>
          )}

          {/* Impuestos y Retenciones */}
          <Title order={4} mt="md">Impuestos y Retenciones</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="IVA (%)"
                description="Porcentaje de IVA aplicable"
                value={formData.iva}
                onChange={(value) => handleChange('iva', value)}
                min={0}
                max={100}
                decimalScale={2}
                suffix="%"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Retención en la Fuente (%)"
                description="Porcentaje de retención"
                value={formData.retencionFuente}
                onChange={(value) => handleChange('retencionFuente', value)}
                min={0}
                max={100}
                decimalScale={2}
                suffix="%"
              />
            </Grid.Col>
          </Grid>

          {/* Términos de Pago */}
          <Title order={4} mt="md">Términos de Pago</Title>
          <Grid>
            <Grid.Col span={12}>
              <NumberInput
                label="Días de Vencimiento"
                description="Días para el pago de la factura"
                value={formData.diasVencimientoFactura}
                onChange={(value) => handleChange('diasVencimientoFactura', value)}
                min={1}
                max={365}
              />
            </Grid.Col>
          </Grid>

          {/* Notas Legales */}
          <Title order={4} mt="md">Información Legal</Title>
          <Grid>
            <Grid.Col span={12}>
              <Textarea
                label="Notas Legales"
                placeholder="Este documento constituye título valor conforme a la Ley..."
                description="Texto que aparecerá al pie de cada factura"
                value={formData.notasLegales}
                onChange={(e) => handleChange('notasLegales', e.target.value)}
                minRows={3}
              />
            </Grid.Col>
          </Grid>

          {/* Opciones Adicionales */}
          <Title order={4} mt="md">Opciones Adicionales</Title>
          <Stack gap="sm">
            <Switch
              label="Incluir Firma Digital"
              description="Agregar firma digital electrónica a las facturas"
              checked={formData.incluirFirmaDigital}
              onChange={(e) => handleChange('incluirFirmaDigital', e.currentTarget.checked)}
            />
          </Stack>

          {/* Vista Previa */}
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Vista Previa del Formato"
            color="blue"
            variant="light"
          >
            <Text size="sm">
              Ejemplo de número de factura: <strong>{formData.prefijoFactura || 'FM'}-{new Date().getFullYear()}-{formData.consecutivoInicial || '1000'}</strong>
            </Text>
          </Alert>
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

export default ConfiguracionFacturacionTab;
