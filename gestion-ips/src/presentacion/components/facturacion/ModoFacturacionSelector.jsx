/**
 * ModoFacturacionSelector.jsx
 * 
 * Componente para seleccionar modo de facturación: Individual o Batch (Agrupada)
 * Muestra sugerencias inteligentes de agrupación
 * 
 * Capa: Presentación
 */

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Button,
  Badge,
  SegmentedControl,
  Alert,
  Divider,
  Card,
  SimpleGrid
} from '@mantine/core';
import {
  IconFileInvoice,
  IconPackages,
  IconUsers,
  IconBuilding,
  IconCalendar,
  IconInfoCircle,
  IconCheck,
  IconAlertTriangle
} from '@tabler/icons-react';
import { generarSugerenciasAgrupacion } from '../../../negocio/services/batchFacturacionService';

/**
 * Componente selector de modo de facturación
 */
export const ModoFacturacionSelector = ({
  citasSeleccionadas = [],
  modoActual = 'individual',
  onCambiarModo,
  onContinuar
}) => {
  const [modo, setModo] = useState(modoActual);
  const [sugerencias, setSugerencias] = useState(null);
  const [criterioAgrupacion, setCriterioAgrupacion] = useState('cliente');

  // Generar sugerencias cuando cambian las citas
  useEffect(() => {
    if (citasSeleccionadas.length > 0) {
      const sug = generarSugerenciasAgrupacion(citasSeleccionadas);
      setSugerencias(sug);
    }
  }, [citasSeleccionadas]);

  const handleCambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    if (onCambiarModo) {
      onCambiarModo(nuevoModo, criterioAgrupacion);
    }
  };

  const handleCambiarCriterio = (nuevoCriterio) => {
    setCriterioAgrupacion(nuevoCriterio);
    if (onCambiarModo && modo === 'batch') {
      onCambiarModo('batch', nuevoCriterio);
    }
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        {/* Título */}
        <Group>
          <IconPackages size={24} />
          <div>
            <Text size="lg" fw={600}>Modo de Facturación</Text>
            <Text size="sm" c="dimmed">
              {citasSeleccionadas.length} servicio(s) seleccionado(s)
            </Text>
          </div>
        </Group>

        <Divider />

        {/* Selector de modo */}
        <SegmentedControl
          value={modo}
          onChange={handleCambiarModo}
          fullWidth
          data={[
            {
              value: 'individual',
              label: (
                <Group gap="xs" justify="center">
                  <IconFileInvoice size={18} />
                  <span>Individual</span>
                </Group>
              )
            },
            {
              value: 'batch',
              label: (
                <Group gap="xs" justify="center">
                  <IconPackages size={18} />
                  <span>Agrupada (Batch)</span>
                  {sugerencias && (sugerencias.porCliente.ahorro > 0 || sugerencias.porEntidad.ahorro > 0) && (
                    <Badge size="xs" color="green">Ahorra facturas</Badge>
                  )}
                </Group>
              )
            }
          ]}
          size="md"
        />

        {/* Descripción del modo */}
        {modo === 'individual' ? (
          <Alert icon={<IconFileInvoice size={18} />} color="blue" variant="light">
            <Text size="sm">
              Crear una factura por cada servicio seleccionado. 
              Útil para pacientes particulares o facturación simple.
            </Text>
          </Alert>
        ) : (
          <Stack gap="sm">
            <Alert icon={<IconPackages size={18} />} color="green" variant="light">
              <Text size="sm" mb="xs">
                Agrupar múltiples servicios en facturas consolidadas. 
                Ideal para facturación a EPS, ARL o empresas.
              </Text>
            </Alert>

            {/* Selector de criterio de agrupación */}
            <Text size="sm" fw={500}>Agrupar por:</Text>
            <SegmentedControl
              value={criterioAgrupacion}
              onChange={handleCambiarCriterio}
              fullWidth
              data={[
                {
                  value: 'cliente',
                  label: (
                    <Group gap="xs" justify="center">
                      <IconUsers size={16} />
                      <span>Cliente</span>
                    </Group>
                  )
                },
                {
                  value: 'entidad',
                  label: (
                    <Group gap="xs" justify="center">
                      <IconBuilding size={16} />
                      <span>Entidad</span>
                    </Group>
                  )
                },
                {
                  value: 'periodo',
                  label: (
                    <Group gap="xs" justify="center">
                      <IconCalendar size={16} />
                      <span>Periodo</span>
                    </Group>
                  )
                }
              ]}
            />

            {/* Sugerencias de agrupación */}
            {sugerencias && (
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs">
                {/* Por Cliente */}
                <Card padding="sm" withBorder>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconUsers size={16} color={criterioAgrupacion === 'cliente' ? '#10B981' : '#6B7280'} />
                      <Text size="xs" fw={500}>Por Cliente</Text>
                    </Group>
                    <Text size="xs" c="dimmed">{sugerencias.porCliente.descripcion}</Text>
                    {sugerencias.porCliente.ahorro > 0 && (
                      <Badge size="xs" color="green" leftSection={<IconCheck size={12} />}>
                        Ahorra {sugerencias.porCliente.ahorro}
                      </Badge>
                    )}
                  </Stack>
                </Card>

                {/* Por Entidad */}
                <Card padding="sm" withBorder>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconBuilding size={16} color={criterioAgrupacion === 'entidad' ? '#10B981' : '#6B7280'} />
                      <Text size="xs" fw={500}>Por Entidad</Text>
                    </Group>
                    <Text size="xs" c="dimmed">{sugerencias.porEntidad.descripcion}</Text>
                    {sugerencias.porEntidad.ahorro > 0 && (
                      <Badge size="xs" color="green" leftSection={<IconCheck size={12} />}>
                        Ahorra {sugerencias.porEntidad.ahorro}
                      </Badge>
                    )}
                  </Stack>
                </Card>

                {/* Por Periodo */}
                <Card padding="sm" withBorder>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconCalendar size={16} color={criterioAgrupacion === 'periodo' ? '#10B981' : '#6B7280'} />
                      <Text size="xs" fw={500}>Por Periodo</Text>
                    </Group>
                    <Text size="xs" c="dimmed">{sugerencias.porPeriodo.descripcion}</Text>
                    {sugerencias.porPeriodo.ahorro > 0 && (
                      <Badge size="xs" color="green" leftSection={<IconCheck size={12} />}>
                        Ahorra {sugerencias.porPeriodo.ahorro}
                      </Badge>
                    )}
                  </Stack>
                </Card>
              </SimpleGrid>
            )}
          </Stack>
        )}

        {/* Advertencias */}
        {modo === 'batch' && citasSeleccionadas.length < 2 && (
          <Alert icon={<IconAlertTriangle size={18} />} color="yellow">
            <Text size="sm">
              Necesitas seleccionar al menos 2 servicios para usar el modo agrupado.
            </Text>
          </Alert>
        )}

        {/* Botón continuar */}
        <Group justify="flex-end">
          <Button
            onClick={() => onContinuar(modo, criterioAgrupacion)}
            disabled={modo === 'batch' && citasSeleccionadas.length < 2}
            size="md"
          >
            Continuar
          </Button>
        </Group>

        {/* Información adicional */}
        <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
          <Text size="xs">
            <strong>Modo Individual:</strong> {citasSeleccionadas.length} factura(s) • 
            <strong> Modo Agrupado:</strong> {sugerencias ? 
              (criterioAgrupacion === 'cliente' ? sugerencias.porCliente.grupos :
               criterioAgrupacion === 'entidad' ? sugerencias.porEntidad.grupos :
               sugerencias.porPeriodo.grupos) : 0} factura(s)
          </Text>
        </Alert>
      </Stack>
    </Paper>
  );
};

export default ModoFacturacionSelector;
