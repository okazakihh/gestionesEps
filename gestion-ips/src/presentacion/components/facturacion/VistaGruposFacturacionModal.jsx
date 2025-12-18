/**
 * VistaGruposFacturacionModal.jsx
 * 
 * Modal para mostrar y gestionar grupos de facturación batch
 * Permite seleccionar qué grupos facturar y ver detalles
 * 
 * Capa: Presentación
 */

import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  Badge,
  Table,
  Checkbox,
  Paper,
  Alert,
  Accordion,
  Divider
} from '@mantine/core';
import {
  IconPackages,
  IconCheck,
  IconX,
  IconFileInvoice,
  IconUsers,
  IconBuilding,
  IconCalendar,
  IconInfoCircle
} from '@tabler/icons-react';
import { formatCurrency, formatDate } from '../../../negocio/services/facturacionService';

/**
 * Modal para vista de grupos de facturación
 */
export const VistaGruposFacturacionModal = ({
  opened,
  onClose,
  grupos = {},
  tipoAgrupacion = 'cliente',
  onFacturarGrupos
}) => {
  const [gruposSeleccionados, setGruposSeleccionados] = useState(new Set());
  const [expandido, setExpandido] = useState(null);

  // Convertir objeto de grupos a array
  const gruposArray = Object.entries(grupos).map(([key, grupo]) => ({
    id: key,
    ...grupo
  }));

  /**
   * Seleccionar/deseleccionar grupo
   */
  const toggleGrupo = (grupoId) => {
    setGruposSeleccionados(prev => {
      const newSet = new Set(prev);
      if (newSet.has(grupoId)) {
        newSet.delete(grupoId);
      } else {
        newSet.add(grupoId);
      }
      return newSet;
    });
  };

  /**
   * Seleccionar todos los grupos
   */
  const toggleTodos = () => {
    if (gruposSeleccionados.size === gruposArray.length) {
      setGruposSeleccionados(new Set());
    } else {
      setGruposSeleccionados(new Set(gruposArray.map(g => g.id)));
    }
  };

  /**
   * Facturar grupos seleccionados
   */
  const handleFacturar = () => {
    const gruposParaFacturar = gruposArray.filter(g => gruposSeleccionados.has(g.id));
    if (onFacturarGrupos) {
      onFacturarGrupos(gruposParaFacturar, tipoAgrupacion);
    }
  };

  /**
   * Obtener icono según tipo de agrupación
   */
  const getIcono = () => {
    switch (tipoAgrupacion) {
      case 'cliente':
        return <IconUsers size={24} />;
      case 'entidad':
        return <IconBuilding size={24} />;
      case 'periodo':
        return <IconCalendar size={24} />;
      default:
        return <IconPackages size={24} />;
    }
  };

  /**
   * Obtener título del grupo
   */
  const getTituloGrupo = (grupo) => {
    switch (tipoAgrupacion) {
      case 'cliente':
        return grupo.nombrePaciente || `Documento: ${grupo.documento}`;
      case 'entidad':
        return grupo.entidad;
      case 'periodo':
        return `Periodo: ${grupo.periodo}`;
      default:
        return `Grupo ${grupo.id}`;
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          {getIcono()}
          <div>
            <Text size="lg" fw={600}>Grupos de Facturación</Text>
            <Text size="sm" c="dimmed">
              {gruposArray.length} grupo(s) encontrado(s) • Agrupación por {tipoAgrupacion}
            </Text>
          </div>
        </Group>
      }
      size="xl"
      centered
    >
      <Stack gap="md">
        {/* Información */}
        <Alert icon={<IconInfoCircle size={18} />} color="blue" variant="light">
          <Text size="sm">
            Selecciona los grupos que deseas facturar. Cada grupo generará una factura consolidada.
          </Text>
        </Alert>

        {/* Resumen */}
        <Paper p="sm" withBorder style={{ backgroundColor: '#f8f9fa' }}>
          <Group justify="space-between">
            <Text size="sm" fw={500}>Resumen de selección:</Text>
            <Group gap="md">
              <Badge color="blue" size="lg">
                {gruposSeleccionados.size} de {gruposArray.length} grupos
              </Badge>
              <Badge color="green" size="lg">
                Total: {formatCurrency(
                  gruposArray
                    .filter(g => gruposSeleccionados.has(g.id))
                    .reduce((sum, g) => sum + g.totalValor, 0)
                )}
              </Badge>
            </Group>
          </Group>
        </Paper>

        {/* Tabla de grupos */}
        <Paper withBorder style={{ maxHeight: '400px', overflow: 'auto' }}>
          <Table striped highlightOnHover>
            <Table.Thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
              <Table.Tr>
                <Table.Th style={{ width: '50px' }}>
                  <Checkbox
                    checked={gruposSeleccionados.size === gruposArray.length && gruposArray.length > 0}
                    indeterminate={gruposSeleccionados.size > 0 && gruposSeleccionados.size < gruposArray.length}
                    onChange={toggleTodos}
                  />
                </Table.Th>
                <Table.Th>Grupo</Table.Th>
                {tipoAgrupacion === 'entidad' && <Table.Th>Pacientes</Table.Th>}
                <Table.Th>Servicios</Table.Th>
                <Table.Th>Total</Table.Th>
                <Table.Th>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {gruposArray.map((grupo) => (
                <Table.Tr key={grupo.id}>
                  <Table.Td>
                    <Checkbox
                      checked={gruposSeleccionados.has(grupo.id)}
                      onChange={() => toggleGrupo(grupo.id)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {getTituloGrupo(grupo)}
                    </Text>
                    {tipoAgrupacion === 'periodo' && grupo.fechaInicio && (
                      <Text size="xs" c="dimmed">
                        {formatDate(grupo.fechaInicio)} - {formatDate(grupo.fechaFin)}
                      </Text>
                    )}
                  </Table.Td>
                  {tipoAgrupacion === 'entidad' && (
                    <Table.Td>
                      <Badge color="cyan" size="sm">
                        {grupo.totalPacientes} paciente(s)
                      </Badge>
                    </Table.Td>
                  )}
                  <Table.Td>
                    <Badge color="gray" size="sm">
                      {grupo.totalServicios} servicio(s)
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={600} c="green">
                      {formatCurrency(grupo.totalValor)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => setExpandido(expandido === grupo.id ? null : grupo.id)}
                    >
                      {expandido === grupo.id ? 'Ocultar' : 'Ver detalle'}
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>

        {/* Detalle del grupo expandido */}
        {expandido && (
          <Paper p="md" withBorder>
            <Text size="sm" fw={600} mb="sm">
              Detalle del Grupo: {getTituloGrupo(gruposArray.find(g => g.id === expandido))}
            </Text>
            <Divider mb="sm" />
            <Table fontSize="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Paciente</Table.Th>
                  <Table.Th>Servicio</Table.Th>
                  <Table.Th>Código CUPS</Table.Th>
                  <Table.Th>Fecha</Table.Th>
                  <Table.Th>Valor</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {gruposArray.find(g => g.id === expandido)?.citas.map((cita, idx) => (
                  <Table.Tr key={idx}>
                    <Table.Td>
                      <Text size="xs">{cita.nombrePaciente}</Text>
                      <Text size="xs" c="dimmed">{cita.documentoPaciente}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{cita.nombreProcedimiento}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" style={{ fontFamily: 'monospace' }}>{cita.codigoCups}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs">{formatDate(cita.fechaAtencion)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" fw={500}>{formatCurrency(cita.valorCita)}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {/* Botones de acción */}
        <Group justify="flex-end">
          <Button
            variant="light"
            color="gray"
            leftSection={<IconX size={18} />}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            color="green"
            leftSection={<IconFileInvoice size={18} />}
            onClick={handleFacturar}
            disabled={gruposSeleccionados.size === 0}
          >
            Facturar {gruposSeleccionados.size} Grupo(s)
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default VistaGruposFacturacionModal;
