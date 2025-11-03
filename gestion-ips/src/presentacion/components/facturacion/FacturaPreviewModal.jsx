import React from 'react';
import { Modal, Text, Button, Group, Paper, Stack, Table, Alert, Divider } from '@mantine/core';
import { IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react';
import { formatDate, formatCurrency } from '../../../negocio/services/facturacionService';

/**
 * FacturaPreviewModal.jsx
 * 
 * Modal para previsualizar una factura antes de guardarla
 * Muestra el resumen de la factura con todas las citas seleccionadas
 * 
 * Props:
 * - opened: boolean que indica si el modal está abierto
 * - onClose: función para cerrar el modal
 * - facturaPreview: objeto con los datos de la previsualización
 * - onSave: función para guardar la factura
 * - loading: boolean que indica si se está guardando
 * 
 * Capa: Presentación
 */

const FacturaPreviewModal = ({
  opened = false,
  onClose,
  facturaPreview = null,
  onSave,
  loading = false
}) => {
  if (!facturaPreview) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="lg" fw={600}>
          Previsualización de Factura - {facturaPreview.numeroFactura}
        </Text>
      }
      size="xl"
      centered
    >
      <Stack gap="md">
        {/* Información general de la factura */}
        <Paper p="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
          <Text size="sm" fw={600} mb="md">
            Información de la Factura
          </Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Número de Factura
              </Text>
              <Text size="sm" fw={500}>
                {facturaPreview.numeroFactura}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Fecha de Emisión
              </Text>
              <Text size="sm" fw={500}>
                {formatDate(facturaPreview.fechaEmision)}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Total
              </Text>
              <Text size="lg" fw={700} c="green">
                {formatCurrency(facturaPreview.total)}
              </Text>
            </div>
          </div>
        </Paper>

        {/* Tabla de servicios */}
        <div>
          <Text size="sm" fw={600} mb="sm">
            Servicios Facturados
          </Text>
          <Paper withBorder>
            <div style={{ overflowX: 'auto' }}>
              <Table striped highlightOnHover fontSize="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Paciente</Table.Th>
                    <Table.Th>Médico</Table.Th>
                    <Table.Th>Procedimiento</Table.Th>
                    <Table.Th>Código CUPS</Table.Th>
                    <Table.Th>Fecha Atención</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Valor</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {facturaPreview.citas.map((cita, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>
                        <div>
                          <Text size="xs" fw={500}>
                            {cita.paciente.nombre}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Doc: {cita.paciente.documento}
                          </Text>
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" style={{ maxWidth: '150px', whiteSpace: 'normal' }}>
                          {cita.medico.nombre}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed" style={{ maxWidth: '180px', whiteSpace: 'normal' }}>
                          {cita.procedimiento}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" style={{ fontFamily: 'monospace' }}>
                          {cita.codigoCups}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" c="dimmed">
                          {formatDate(cita.fechaAtencion)}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>
                        <Text size="xs" fw={600} c="green">
                          {formatCurrency(cita.valor)}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
                <Table.Tfoot>
                  <Table.Tr>
                    <Table.Th colSpan={5} style={{ textAlign: 'right' }}>
                      <Text size="sm" fw={600}>
                        TOTAL:
                      </Text>
                    </Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>
                      <Text size="md" fw={700} c="green">
                        {formatCurrency(facturaPreview.total)}
                      </Text>
                    </Table.Th>
                  </Table.Tr>
                </Table.Tfoot>
              </Table>
            </div>
          </Paper>
        </div>

        {/* Información adicional */}
        <Alert
          icon={<IconAlertCircle size={18} />}
          color="blue"
          variant="light"
        >
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Información Importante
            </Text>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
              <li>Esta factura incluye {facturaPreview.citas.length} servicio(s) médico(s)</li>
              <li>Una vez guardada la factura, las citas seleccionadas ya no aparecerán en la lista de citas atendidas</li>
              <li>La factura tendrá estado "PENDIENTE" hasta que sea procesada</li>
            </ul>
          </Stack>
        </Alert>

        <Divider />

        {/* Botones de acción */}
        <Group justify="flex-end">
          <Button
            variant="light"
            color="gray"
            leftSection={<IconX size={18} />}
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            color="green"
            leftSection={<IconCheck size={18} />}
            onClick={onSave}
            loading={loading}
          >
            Guardar Factura
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default FacturaPreviewModal;
