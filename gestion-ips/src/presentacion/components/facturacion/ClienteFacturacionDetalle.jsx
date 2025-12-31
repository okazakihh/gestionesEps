import React from 'react';
import {
  Modal,
  Paper,
  Text,
  Badge,
  Group,
  Stack,
  Divider,
  Grid,
  Title,
  Box
} from '@mantine/core';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconFileText,
  IconBuilding,
  IconCash,
  IconCalendar
} from '@tabler/icons-react';
import { 
  TIPO_DOCUMENTO_FACTURACION_OPTIONS, 
  TIPO_PERSONA_OPTIONS,
  REGIMEN_FISCAL_OPTIONS 
} from '../../../negocio/utils/listHelps.js';

/**
 * Modal de detalle de cliente de facturación
 * Muestra toda la información del cliente de forma organizada
 */
const ClienteFacturacionDetalle = ({ cliente, opened, onClose }) => {
  if (!cliente) return null;

  const datos = cliente.datos || {};
  const direccion = datos.direccion || {};
  const informacionTributaria = datos.informacionTributaria || {};

  // Función helper para obtener el label de un valor en una lista
  const obtenerLabel = (lista, valor) => {
    const item = lista.find(i => i.value === valor);
    return item ? item.label : valor;
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group>
          {datos.tipoPersona === 'NATURAL' ? <IconUser size={24} /> : <IconBuilding size={24} />}
          <div>
            <Title order={3}>Detalle del Cliente</Title>
            <Text size="sm" c="dimmed">
              {datos.nombreCompleto || datos.razonSocial || 'Sin nombre'}
            </Text>
          </div>
        </Group>
      }
      padding="lg"
    >
      <Stack gap="md">
        {/* Estado y tipo de persona */}
        <Group>
          <Badge 
            color={cliente.activo ? 'green' : 'red'} 
            size="lg"
            variant="filled"
          >
            {cliente.activo ? 'Activo' : 'Inactivo'}
          </Badge>
          <Badge 
            color={datos.tipoPersona === 'NATURAL' ? 'blue' : 'violet'} 
            size="lg"
            variant="light"
          >
            {obtenerLabel(TIPO_PERSONA_OPTIONS, datos.tipoPersona)}
          </Badge>
        </Group>

        <Divider label="Información de Identificación" labelPosition="left" />

        {/* Información de identificación */}
        <Grid>
          <Grid.Col span={6}>
            <Paper p="sm" withBorder>
              <Group gap="xs">
                <IconFileText size={18} />
                <Text size="sm" fw={500} c="dimmed">Tipo de Documento</Text>
              </Group>
              <Text size="md" mt={5}>
                {obtenerLabel(TIPO_DOCUMENTO_FACTURACION_OPTIONS, datos.tipoDocumento)}
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper p="sm" withBorder>
              <Group gap="xs">
                <IconFileText size={18} />
                <Text size="sm" fw={500} c="dimmed">Número de Documento</Text>
              </Group>
              <Text size="md" mt={5}>
                {datos.numeroDocumento || 'No especificado'}
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>

        <Divider label="Información Personal" labelPosition="left" />

        {/* Información personal */}
        {datos.tipoPersona === 'NATURAL' ? (
          <Grid>
            <Grid.Col span={6}>
              <Paper p="sm" withBorder>
                <Group gap="xs">
                  <IconUser size={18} />
                  <Text size="sm" fw={500} c="dimmed">Nombres</Text>
                </Group>
                <Text size="md" mt={5}>
                  {datos.nombres || 'No especificado'}
                </Text>
              </Paper>
            </Grid.Col>

            <Grid.Col span={6}>
              <Paper p="sm" withBorder>
                <Group gap="xs">
                  <IconUser size={18} />
                  <Text size="sm" fw={500} c="dimmed">Apellidos</Text>
                </Group>
                <Text size="md" mt={5}>
                  {datos.apellidos || 'No especificado'}
                </Text>
              </Paper>
            </Grid.Col>
          </Grid>
        ) : (
          <Grid>
            <Grid.Col span={12}>
              <Paper p="sm" withBorder>
                <Group gap="xs">
                  <IconBuilding size={18} />
                  <Text size="sm" fw={500} c="dimmed">Razón Social</Text>
                </Group>
                <Text size="md" mt={5}>
                  {datos.razonSocial || 'No especificado'}
                </Text>
              </Paper>
            </Grid.Col>
          </Grid>
        )}

        <Divider label="Información de Contacto" labelPosition="left" />

        {/* Información de contacto */}
        <Grid>
          <Grid.Col span={6}>
            <Paper p="sm" withBorder>
              <Group gap="xs">
                <IconMail size={18} />
                <Text size="sm" fw={500} c="dimmed">Correo Electrónico</Text>
              </Group>
              <Text size="md" mt={5}>
                {datos.email || 'No especificado'}
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper p="sm" withBorder>
              <Group gap="xs">
                <IconPhone size={18} />
                <Text size="sm" fw={500} c="dimmed">Teléfono</Text>
              </Group>
              <Text size="md" mt={5}>
                {datos.telefono || 'No especificado'}
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>

        <Divider label="Dirección" labelPosition="left" />

        {/* Dirección */}
        <Grid>
          <Grid.Col span={12}>
            <Paper p="sm" withBorder>
              <Group gap="xs">
                <IconMapPin size={18} />
                <Text size="sm" fw={500} c="dimmed">Dirección Completa</Text>
              </Group>
              <Text size="md" mt={5}>
                {direccion.calle || 'No especificado'}
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={4}>
            <Paper p="sm" withBorder>
              <Text size="sm" fw={500} c="dimmed">Ciudad</Text>
              <Text size="md" mt={5}>
                {direccion.ciudad || 'No especificado'}
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={4}>
            <Paper p="sm" withBorder>
              <Text size="sm" fw={500} c="dimmed">Departamento</Text>
              <Text size="md" mt={5}>
                {direccion.departamento || 'No especificado'}
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={4}>
            <Paper p="sm" withBorder>
              <Text size="sm" fw={500} c="dimmed">Código Postal</Text>
              <Text size="md" mt={5}>
                {direccion.codigoPostal || 'No especificado'}
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>

        <Divider label="Información Tributaria" labelPosition="left" />

        {/* Información tributaria */}
        <Grid>
          <Grid.Col span={6}>
            <Paper p="sm" withBorder>
              <Group gap="xs">
                <IconCash size={18} />
                <Text size="sm" fw={500} c="dimmed">Régimen Fiscal</Text>
              </Group>
              <Text size="md" mt={5}>
                {obtenerLabel(REGIMEN_FISCAL_OPTIONS, informacionTributaria.regimenFiscal) || 'No especificado'}
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={3}>
            <Paper p="sm" withBorder>
              <Text size="sm" fw={500} c="dimmed">Responsable IVA</Text>
              <Badge 
                color={informacionTributaria.responsableIVA ? 'green' : 'gray'} 
                mt={5}
                variant="light"
              >
                {informacionTributaria.responsableIVA ? 'Sí' : 'No'}
              </Badge>
            </Paper>
          </Grid.Col>

          <Grid.Col span={3}>
            <Paper p="sm" withBorder>
              <Text size="sm" fw={500} c="dimmed">Gran Contribuyente</Text>
              <Badge 
                color={informacionTributaria.granContribuyente ? 'green' : 'gray'} 
                mt={5}
                variant="light"
              >
                {informacionTributaria.granContribuyente ? 'Sí' : 'No'}
              </Badge>
            </Paper>
          </Grid.Col>
        </Grid>

        <Divider label="Información Adicional" labelPosition="left" />

        {/* Información adicional */}
        <Grid>
          <Grid.Col span={12}>
            <Paper p="sm" withBorder>
              <Group gap="xs">
                <IconBuilding size={18} />
                <Text size="sm" fw={500} c="dimmed">Código Cliente Siigo</Text>
              </Group>
              <Text size="md" mt={5}>
                {datos.codigoClienteSiigo || 'No asignado'}
              </Text>
            </Paper>
          </Grid.Col>

          {datos.observaciones && (
            <Grid.Col span={12}>
              <Paper p="sm" withBorder>
                <Text size="sm" fw={500} c="dimmed">Observaciones</Text>
                <Text size="md" mt={5}>
                  {datos.observaciones}
                </Text>
              </Paper>
            </Grid.Col>
          )}
        </Grid>

        <Divider label="Fechas" labelPosition="left" />

        {/* Fechas */}
        <Grid>
          <Grid.Col span={6}>
            <Paper p="sm" withBorder>
              <Group gap="xs">
                <IconCalendar size={18} />
                <Text size="sm" fw={500} c="dimmed">Fecha de Creación</Text>
              </Group>
              <Text size="sm" mt={5}>
                {formatearFecha(cliente.fechaCreacion)}
              </Text>
            </Paper>
          </Grid.Col>

          <Grid.Col span={6}>
            <Paper p="sm" withBorder>
              <Group gap="xs">
                <IconCalendar size={18} />
                <Text size="sm" fw={500} c="dimmed">Última Actualización</Text>
              </Group>
              <Text size="sm" mt={5}>
                {formatearFecha(cliente.fechaActualizacion)}
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Modal>
  );
};

export default ClienteFacturacionDetalle;
