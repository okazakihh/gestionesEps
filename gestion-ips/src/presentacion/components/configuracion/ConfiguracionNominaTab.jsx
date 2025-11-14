/**
 * Componente Tab para configuración de nómina
 * Capa de presentación - Componentes
 * 
 * Permite configurar parámetros para el cálculo de nómina
 */

import React, { useState, useEffect } from 'react';
import { 
  Stack, 
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
import { IconDeviceFloppy, IconAlertCircle, IconCash } from '@tabler/icons-react';
import { useConfiguracionManagement } from '../../../negocio/hooks/configuracion/useConfiguracionManagement.js';
import { clearNominaConfigCache } from '../../../negocio/utils/nomina/nominaCalculos.js';
import Swal from 'sweetalert2';

export const ConfiguracionNominaTab = () => {
  const { getConfiguracionByClave, updateConfiguracionByClave } = useConfiguracionManagement();
  
  const [formData, setFormData] = useState({
    salarioMinimo: 1300000,
    auxilioTransporte: 162000,
    porcentajeSalud: 4.0,
    porcentajePension: 4.0,
    diasPeriodo: 30,
    horasLaboralesDia: 8,
    horasLaboralesSemana: 48,
    recargoNocturno: 35,
    recargoFestivo: 75,
    horaExtraDiurna: 25,
    horaExtraNocturna: 75,
    horaExtraFestivaDiurna: 100,
    horaExtraFestivaNocturna: 150
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
      const config = await getConfiguracionByClave('NOMINA');
      
      if (config && config.jsonData) {
        setConfigOriginal(config.jsonData);
        
        setFormData({
          salarioMinimo: config.jsonData.salarioMinimo || 1300000,
          auxilioTransporte: config.jsonData.auxilioTransporte || 162000,
          porcentajeSalud: config.jsonData.porcentajeSalud || 4.0,
          porcentajePension: config.jsonData.porcentajePension || 4.0,
          diasPeriodo: config.jsonData.diasPeriodo || 30,
          horasLaboralesDia: config.jsonData.horasLaboralesDia || 8,
          horasLaboralesSemana: config.jsonData.horasLaboralesSemana || 48,
          recargoNocturno: config.jsonData.recargoNocturno || 35,
          recargoFestivo: config.jsonData.recargoFestivo || 75,
          horaExtraDiurna: config.jsonData.horaExtraDiurna || 25,
          horaExtraNocturna: config.jsonData.horaExtraNocturna || 75,
          horaExtraFestivaDiurna: config.jsonData.horaExtraFestivaDiurna || 100,
          horaExtraFestivaNocturna: config.jsonData.horaExtraFestivaNocturna || 150
        });
      }
    } catch (error) {
      console.error('Error al cargar configuración de nómina:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async () => {
    const result = await Swal.fire({
      title: '¿Guardar configuración de nómina?',
      text: 'Los cambios afectarán el cálculo de todas las nóminas',
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

      console.log('Config Original (Nómina):', configOriginal);
      console.log('Updated Config (Nómina):', updatedConfig);

      // Enviar solo el objeto de configuración
      const result = await updateConfiguracionByClave('NOMINA', updatedConfig);
      
      if (result.success) {
        // Limpiar cache de nómina
        clearNominaConfigCache();
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
        <Text c="dimmed">Cargando configuración de nómina...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Title order={3}>
          <IconCash size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Configuración de Nómina
        </Title>
        <Text size="sm" c="dimmed">
          Configure los parámetros para el cálculo de nómina y prestaciones sociales
        </Text>
      </Stack>

      <Alert
        icon={<IconAlertCircle size={20} />}
        title="Importante"
        color="yellow"
        variant="light"
      >
        <Text size="sm">
          Estos valores deben ser actualizados según la legislación vigente.
          Los cambios afectarán todos los cálculos de nómina futuros.
        </Text>
      </Alert>

      <Paper shadow="xs" p="lg" withBorder>
        <Stack gap="md">
          {/* Valores Base */}
          <Title order={4}>Valores Base</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Salario Mínimo Legal"
                description="Salario mínimo mensual vigente"
                value={formData.salarioMinimo}
                onChange={(value) => handleChange('salarioMinimo', value)}
                min={0}
                thousandSeparator=","
                prefix="$ "
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Auxilio de Transporte"
                description="Auxilio mensual vigente"
                value={formData.auxilioTransporte}
                onChange={(value) => handleChange('auxilioTransporte', value)}
                min={0}
                thousandSeparator=","
                prefix="$ "
              />
            </Grid.Col>
          </Grid>

          {/* Deducciones de Ley */}
          <Title order={4} mt="md">Deducciones de Ley (%)</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Salud"
                description="Porcentaje del empleado"
                value={formData.porcentajeSalud}
                onChange={(value) => handleChange('porcentajeSalud', value)}
                min={0}
                max={100}
                decimalScale={2}
                suffix="%"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Pensión"
                description="Porcentaje del empleado"
                value={formData.porcentajePension}
                onChange={(value) => handleChange('porcentajePension', value)}
                min={0}
                max={100}
                decimalScale={2}
                suffix="%"
              />
            </Grid.Col>
          </Grid>

          {/* Parámetros de Tiempo */}
          <Title order={4} mt="md">Parámetros de Tiempo</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label="Días del Período"
                description="Días del período de nómina"
                value={formData.diasPeriodo}
                onChange={(value) => handleChange('diasPeriodo', value)}
                min={1}
                max={31}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label="Horas Laborales por Día"
                description="Jornada laboral diaria"
                value={formData.horasLaboralesDia}
                onChange={(value) => handleChange('horasLaboralesDia', value)}
                min={1}
                max={24}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label="Horas Laborales por Semana"
                description="Jornada laboral semanal"
                value={formData.horasLaboralesSemana}
                onChange={(value) => handleChange('horasLaboralesSemana', value)}
                min={1}
                max={168}
              />
            </Grid.Col>
          </Grid>

          {/* Recargos (%) */}
          <Title order={4} mt="md">Recargos (%)</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Recargo Nocturno"
                description="% adicional trabajo nocturno"
                value={formData.recargoNocturno}
                onChange={(value) => handleChange('recargoNocturno', value)}
                min={0}
                max={200}
                suffix="%"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Recargo Festivo"
                description="% adicional trabajo festivo"
                value={formData.recargoFestivo}
                onChange={(value) => handleChange('recargoFestivo', value)}
                min={0}
                max={200}
                suffix="%"
              />
            </Grid.Col>
          </Grid>

          {/* Horas Extras (%) */}
          <Title order={4} mt="md">Horas Extras (%)</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Hora Extra Diurna"
                description="% adicional sobre hora ordinaria"
                value={formData.horaExtraDiurna}
                onChange={(value) => handleChange('horaExtraDiurna', value)}
                min={0}
                max={200}
                suffix="%"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Hora Extra Nocturna"
                description="% adicional sobre hora ordinaria"
                value={formData.horaExtraNocturna}
                onChange={(value) => handleChange('horaExtraNocturna', value)}
                min={0}
                max={200}
                suffix="%"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Hora Extra Festiva Diurna"
                description="% adicional sobre hora ordinaria"
                value={formData.horaExtraFestivaDiurna}
                onChange={(value) => handleChange('horaExtraFestivaDiurna', value)}
                min={0}
                max={200}
                suffix="%"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Hora Extra Festiva Nocturna"
                description="% adicional sobre hora ordinaria"
                value={formData.horaExtraFestivaNocturna}
                onChange={(value) => handleChange('horaExtraFestivaNocturna', value)}
                min={0}
                max={200}
                suffix="%"
              />
            </Grid.Col>
          </Grid>
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

export default ConfiguracionNominaTab;
