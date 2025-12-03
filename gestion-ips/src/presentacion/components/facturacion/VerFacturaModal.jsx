import React from 'react';
import { Modal, Text, Button, Group, Paper, Stack, Table, Badge, Divider } from '@mantine/core';
import { useTheme } from '../../../negocio/contexts/ThemeContext.jsx';
import { IconX, IconCheck, IconInfoCircle, IconPrinter } from '@tabler/icons-react';
import { formatDate, formatCurrency } from '../../../negocio/services/facturacionService';
import { generarFacturaHTML } from './FacturaHTML.js';

/**
 * VerFacturaModal.jsx
 * 
 * Modal para ver los detalles completos de una factura guardada
 * 
 * Props:
 * - opened: boolean que indica si el modal está abierto
 * - onClose: función para cerrar el modal
 * - factura: objeto de la factura a mostrar (con jsonData)
 * - onProcesar: función opcional para procesar la factura (marcar como pagada)
 * - loading: boolean que indica si se está procesando
 * 
 * Capa: Presentación
 */

const VerFacturaModal = ({
  opened = false,
  onClose,
  factura = null,
  onProcesar,
  loading = false
}) => {
  const { tema } = useTheme();
  if (!factura) return null;

  // Parsear datos de la factura
  let facturaData = {};
  try {
    facturaData = JSON.parse(factura.jsonData || '{}');
  } catch (error) {
    console.error('Error parsing factura data:', error);
  }

  const numeroFactura = facturaData.numeroFactura || `FM-${factura.id}`;
  const fechaEmision = facturaData.fechaEmision || factura.fechaCreacion;
  const total = facturaData.total || 0;
  const estado = facturaData.estado || 'PENDIENTE';
  const citas = facturaData.citas || [];
  
  // Información del destinatario (cliente)
  const cliente = facturaData.cliente || {};
  const tipoDestinatario = facturaData.tipoDestinatario || 'PACIENTE';
  const formaPago = facturaData.formaPago || 'CONTADO';
  const medioPago = facturaData.medioPago || 'EFECTIVO';
  const observaciones = facturaData.observaciones || '';

  // Determinar el color del badge según el estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PAGADA':
        return 'green';
      case 'PENDIENTE':
        return 'yellow';
      case 'CANCELADA':
        return 'red';
      default:
        return 'gray';
    }
  };

  /**
   * Abre ventana para imprimir factura
   */
  const handlePrintFactura = () => {
    // Generar HTML de la factura (usa ipsConfig por defecto)
    const htmlContent = generarFacturaHTML(factura, facturaData);
    
    // Abrir ventana nueva con la factura
    const ventana = window.open('', '_blank', 'width=800,height=1000');
    
    if (ventana) {
      ventana.document.write(htmlContent);
      ventana.document.close();
    } else {
      alert('Por favor, permita las ventanas emergentes para imprimir la factura.');
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="lg" fw={600}>
          Detalles de Factura - {numeroFactura}
        </Text>
      }
      size="xl"
      centered
      overlayColor={tema.primaryColor}
      styles={{ header: { backgroundColor: tema.primaryColor, padding: '10px 16px' }, title: { color: 'white' }, close: { color: 'white' } }}
    >
      <Stack gap="md">
        {/* Información general de la factura */}
        <Paper p="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
          <Text size="sm" fw={600} mb="md">
            Información de la Factura
          </Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Número de Factura
              </Text>
              <Text size="sm" fw={500}>
                {numeroFactura}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Fecha de Emisión
              </Text>
              <Text size="sm" fw={500}>
                {formatDate(fechaEmision)}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Estado
              </Text>
              <Badge variant="light" color={getEstadoColor(estado)} size="md">
                {estado}
              </Badge>
            </div>
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Total
              </Text>
              <Text size="lg" fw={700} c="green">
                {formatCurrency(total)}
              </Text>
            </div>
          </div>
        </Paper>

        {/* Información del Destinatario */}
        <Paper p="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text size="sm" fw={600}>
              Información del Destinatario
            </Text>
            <Badge 
              variant="light" 
              color={tipoDestinatario === 'ENTIDAD' ? 'blue' : 'cyan'}
              size="lg"
            >
              {tipoDestinatario === 'ENTIDAD' ? '🏢 Entidad' : '👤 Paciente'}
            </Badge>
          </Group>

          {tipoDestinatario === 'PACIENTE' ? (
            // Información de Paciente (Persona Natural)
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <Text size="xs" c="dimmed" mb={4}>Nombre Completo</Text>
                <Text size="sm" fw={500}>{cliente.nombreCompleto || 'N/A'}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" mb={4}>Tipo y Número de Documento</Text>
                <Text size="sm" fw={500}>
                  {cliente.tipoDocumento || 'CC'}: {cliente.numeroDocumento || 'N/A'}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" mb={4}>Dirección</Text>
                <Text size="sm" fw={500}>{cliente.direccion || 'N/A'}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" mb={4}>Ciudad / Departamento</Text>
                <Text size="sm" fw={500}>
                  {cliente.ciudad || 'N/A'} {cliente.departamento ? `/ ${cliente.departamento}` : ''}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" mb={4}>Teléfono</Text>
                <Text size="sm" fw={500}>{cliente.telefono || 'N/A'}</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" mb={4}>Email</Text>
                <Text size="sm" fw={500}>{cliente.email || 'N/A'}</Text>
              </div>
            </div>
          ) : (
            // Información de Entidad (Persona Jurídica)
            <Stack gap="sm">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <Text size="xs" c="dimmed" mb={4}>Razón Social</Text>
                  <Text size="sm" fw={600}>{cliente.razonSocial || cliente.nombreCompleto || 'N/A'}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed" mb={4}>NIT</Text>
                  <Text size="sm" fw={500}>
                    {cliente.numeroDocumento || 'N/A'}
                    {cliente.digitoVerificacion ? `-${cliente.digitoVerificacion}` : ''}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed" mb={4}>Dirección</Text>
                  <Text size="sm" fw={500}>{cliente.direccion || 'N/A'}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed" mb={4}>Ciudad / Departamento</Text>
                  <Text size="sm" fw={500}>
                    {cliente.ciudad || 'N/A'} {cliente.departamento ? `/ ${cliente.departamento}` : ''}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed" mb={4}>Teléfono</Text>
                  <Text size="sm" fw={500}>{cliente.telefono || 'N/A'}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed" mb={4}>Email</Text>
                  <Text size="sm" fw={500}>{cliente.email || 'N/A'}</Text>
                </div>
              </div>
              
              {(cliente.nombreContacto || cliente.cargoContacto) && (
                <>
                  <Divider label="Información de Contacto" labelPosition="center" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    {cliente.nombreContacto && (
                      <div>
                        <Text size="xs" c="dimmed" mb={4}>Nombre del Contacto</Text>
                        <Text size="sm" fw={500}>{cliente.nombreContacto}</Text>
                      </div>
                    )}
                    {cliente.cargoContacto && (
                      <div>
                        <Text size="xs" c="dimmed" mb={4}>Cargo</Text>
                        <Text size="sm" fw={500}>{cliente.cargoContacto}</Text>
                      </div>
                    )}
                  </div>
                </>
              )}
            </Stack>
          )}
        </Paper>

        {/* Información de Pago */}
        {(formaPago || medioPago) && (
          <Paper p="md" withBorder style={{ backgroundColor: '#fef3c7', borderColor: '#fbbf24' }}>
            <Text size="sm" fw={600} mb="md">Información de Pago</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <Text size="xs" c="dimmed" mb={4}>Forma de Pago</Text>
                <Badge variant="light" color="orange">{formaPago}</Badge>
              </div>
              <div>
                <Text size="xs" c="dimmed" mb={4}>Medio de Pago</Text>
                <Badge variant="light" color="yellow">{medioPago}</Badge>
              </div>
              {observaciones && (
                <div style={{ gridColumn: 'span 3' }}>
                  <Text size="xs" c="dimmed" mb={4}>Observaciones</Text>
                  <Text size="sm">{observaciones}</Text>
                </div>
              )}
            </div>
          </Paper>
        )}

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
                  {citas.length > 0 ? (
                    citas.map((cita, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>
                          <div>
                            <Text size="xs" fw={500}>
                              {cita.paciente?.nombre || 'N/A'}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Doc: {cita.paciente?.documento || 'N/A'}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" style={{ maxWidth: '150px', whiteSpace: 'normal' }}>
                            {cita.medico?.nombre || 'N/A'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed" style={{ maxWidth: '180px', whiteSpace: 'normal' }}>
                            {cita.procedimiento || 'N/A'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" style={{ fontFamily: 'monospace' }}>
                            {cita.codigoCups || 'N/A'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {formatDate(cita.fechaAtencion)}
                          </Text>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          <Text size="xs" fw={600} c="green">
                            {formatCurrency(cita.valor || 0)}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
                        <Text size="sm" c="dimmed">
                          No hay servicios registrados
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
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
                        {formatCurrency(total)}
                      </Text>
                    </Table.Th>
                  </Table.Tr>
                </Table.Tfoot>
              </Table>
            </div>
          </Paper>
        </div>

        {/* Información del registro */}
        <Paper p="md" withBorder style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
          <Group gap="xs" mb="sm">
            <IconInfoCircle size={18} color="#1e40af" />
            <Text size="sm" fw={500} c="#1e40af">
              Información del Registro
            </Text>
          </Group>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                ID de Registro
              </Text>
              <Text size="sm" fw={500}>
                {factura.id}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Fecha de Creación
              </Text>
              <Text size="sm" fw={500}>
                {formatDate(factura.fechaCreacion)}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" mb={4}>
                Última Actualización
              </Text>
              <Text size="sm" fw={500}>
                {formatDate(factura.fechaActualizacion)}
              </Text>
            </div>
          </div>
        </Paper>

        <Divider />

        {/* Botones de acción */}
        <Group justify="space-between">
          <Button
            variant="light"
            color="blue"
            leftSection={<IconPrinter size={18} />}
            onClick={handlePrintFactura}
          >
            Imprimir Factura
          </Button>
          
          <Group>
            <Button
              variant="light"
              color="gray"
              leftSection={<IconX size={18} />}
              onClick={onClose}
              disabled={loading}
            >
              Cerrar
            </Button>
            {estado === 'PENDIENTE' && onProcesar && (
              <Button
                color="green"
                leftSection={<IconCheck size={18} />}
                onClick={() => onProcesar(factura)}
                loading={loading}
              >
                Procesar Factura
              </Button>
            )}
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};

export default VerFacturaModal;
