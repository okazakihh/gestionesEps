/**
 * ReportesSiigoTab.jsx
 * 
 * Componente para generar reportes de Siigo
 * Incluye reportes de facturación, contabilidad y estadísticas
 * 
 * Capa: Presentación
 */

import React, { useState } from 'react';
import {
  Stack,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Grid,
  Card,
  Badge,
  Alert,
  Select,
  TextInput
} from '@mantine/core';
import {
  IconReportMoney,
  IconDownload,
  IconFileSpreadsheet,
  IconChartBar,
  IconInfoCircle,
  IconCalendar,
  IconCurrencyDollar
} from '@tabler/icons-react';
import { useSiigoIntegration } from '../../../negocio/hooks/facturacion/useSiigoIntegration.js';
import Swal from 'sweetalert2';

export const ReportesSiigoTab = () => {
  const { isConnected, isLoading } = useSiigoIntegration();

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoReporte, setTipoReporte] = useState('facturacion');
  const [generando, setGenerando] = useState(false);

  /**
   * Generar reporte
   */
  const generarReporte = async () => {
    if (!isConnected) {
      await Swal.fire({
        icon: 'warning',
        title: 'Siigo no conectado',
        text: 'Debe conectar Siigo en Configuración antes de continuar.',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

    if (!fechaInicio || !fechaFin) {
      await Swal.fire({
        icon: 'warning',
        title: 'Fechas requeridas',
        text: 'Debe seleccionar el rango de fechas para el reporte.',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

    setGenerando(true);
    try {
      await Swal.fire({
        icon: 'info',
        title: 'Funcionalidad en desarrollo',
        text: 'Los reportes de Siigo estarán disponibles próximamente.',
        confirmButtonColor: '#3B82F6'
      });
    } catch (error) {
      console.error('Error generando reporte:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el reporte.',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setGenerando(false);
    }
  };

  return (
    <Stack gap="md">
      {/* Header */}
      <Paper p="md" withBorder>
        <Group justify="space-between" wrap="wrap">
          <div>
            <Title order={3} size="h4">Reportes de Siigo</Title>
            <Text size="sm" c="dimmed">
              Genera reportes de facturación y contabilidad
            </Text>
          </div>
        </Group>
      </Paper>

      {/* Estado de conexión */}
      {!isConnected && (
        <Alert
          icon={<IconInfoCircle size={20} />}
          title="Siigo no conectado"
          color="yellow"
        >
          Debe configurar y conectar Siigo en <strong>Configuración → Siigo API</strong> para usar esta funcionalidad.
        </Alert>
      )}

      {/* Tarjetas de reportes rápidos */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" withBorder>
            <Group justify="apart" mb="xs">
              <Text fw={500}>Facturas del Mes</Text>
              <IconFileSpreadsheet size={24} color="#3B82F6" />
            </Group>
            <Text size="xs" c="dimmed" mb="md">
              Reporte de todas las facturas del mes actual
            </Text>
            <Button
              variant="light"
              color="blue"
              fullWidth
              leftSection={<IconDownload size={16} />}
              disabled={!isConnected}
            >
              Descargar
            </Button>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" withBorder>
            <Group justify="apart" mb="xs">
              <Text fw={500}>Balance Contable</Text>
              <IconChartBar size={24} color="#10B981" />
            </Group>
            <Text size="xs" c="dimmed" mb="md">
              Balance de ingresos y egresos del período
            </Text>
            <Button
              variant="light"
              color="green"
              fullWidth
              leftSection={<IconDownload size={16} />}
              disabled={!isConnected}
            >
              Descargar
            </Button>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" withBorder>
            <Group justify="apart" mb="xs">
              <Text fw={500}>Estado DIAN</Text>
              <IconCurrencyDollar size={24} color="#F59E0B" />
            </Group>
            <Text size="xs" c="dimmed" mb="md">
              Estado de facturas electrónicas en DIAN
            </Text>
            <Button
              variant="light"
              color="yellow"
              fullWidth
              leftSection={<IconDownload size={16} />}
              disabled={!isConnected}
            >
              Descargar
            </Button>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Generador de reportes personalizados */}
      <Paper p="md" withBorder>
        <Title order={4} size="h5" mb="md">
          Reporte Personalizado
        </Title>

        <Stack gap="md">
          <Select
            label="Tipo de Reporte"
            placeholder="Seleccione el tipo de reporte"
            data={[
              { value: 'facturacion', label: 'Facturación' },
              { value: 'clientes', label: 'Clientes' },
              { value: 'productos', label: 'Productos/Servicios' },
              { value: 'contabilidad', label: 'Contabilidad' },
              { value: 'impuestos', label: 'Impuestos' }
            ]}
            value={tipoReporte}
            onChange={setTipoReporte}
          />

          <Group grow>
            <TextInput
              label="Fecha Inicio"
              placeholder="YYYY-MM-DD"
              type="date"
              value={fechaInicio || ''}
              onChange={(e) => setFechaInicio(e.target.value)}
              leftSection={<IconCalendar size={18} />}
            />
            <TextInput
              label="Fecha Fin"
              placeholder="YYYY-MM-DD"
              type="date"
              value={fechaFin || ''}
              onChange={(e) => setFechaFin(e.target.value)}
              leftSection={<IconCalendar size={18} />}
            />
          </Group>

          <Button
            leftSection={<IconDownload size={18} />}
            onClick={generarReporte}
            loading={generando}
            disabled={!isConnected}
            size="md"
          >
            Generar Reporte
          </Button>
        </Stack>
      </Paper>

      {/* Información */}
      <Alert
        icon={<IconInfoCircle size={20} />}
        title="Sobre los reportes"
        color="blue"
        variant="light"
      >
        <Stack gap="xs">
          <Text size="sm">
            Los reportes se generan directamente desde Siigo con los datos más recientes.
          </Text>
          <Text size="sm">
            Puede exportar los reportes en formato Excel o PDF según su configuración en Siigo.
          </Text>
        </Stack>
      </Alert>
    </Stack>
  );
};
