import React from 'react';
import { Modal, Text, Button, Group, Paper, Stack, Table, Badge, Divider, Alert } from '@mantine/core';
import { useTheme } from '../../../negocio/contexts/ThemeContext.jsx';
import { 
  IconX, 
  IconCheck, 
  IconInfoCircle, 
  IconPrinter, 
  IconEye,
  IconCloudCheck,
  IconExternalLink,
  IconFileInvoice
} from '@tabler/icons-react';
import { formatDate, formatCurrency } from '../../../negocio/services/facturacionService';
import { generarFacturaHTML } from './FacturaHTML.js';
import { useFacturaPreviewModal } from '../../../negocio/hooks/useFacturaPreviewModal';
import { FacturaPrintPreviewModal } from './FacturaPrintPreviewModal';
import { useIpsConfig } from '../../../negocio/hooks/configuracion/useIpsConfig';

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
  loading = false,
  onCrearNota // Nueva prop para abrir modal de notas
}) => {
  const { tema } = useTheme();
  const { ipsConfig: ipsData } = useIpsConfig();
  const { previewOpen, previewHTML, previewTitle, openPreview, closePreview, handlePrint } = useFacturaPreviewModal();
  
  if (!factura) return null;

  // Parsear datos de la factura
  let facturaData = {};
  try {
    facturaData = JSON.parse(factura.jsonData || '{}');
  } catch (error) {
    console.error('❌ Error parsing factura data:', error);
  }

  const numeroFactura = facturaData.numeroFactura || `FM-${factura.id}`;
  const fechaEmision = facturaData.fechaEmision || facturaData.fecha || factura.fechaCreacion;
  const total = facturaData.total || 0;
  const estado = facturaData.estado || 'PENDIENTE';
  
  // Buscar servicios en diferentes propiedades posibles
  const servicios = facturaData.servicios || facturaData.citas || [];
  
  // Información de Siigo
  const siigoId = facturaData.siigoId;
  const cufe = facturaData.cufe;
  const estadoDian = facturaData.estadoDian;
  const fechaEnvioSiigo = facturaData.fechaEnvioSiigo;
  const pdfUrl = facturaData.pdfUrl;
  const xmlUrl = facturaData.xmlUrl;
  
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
   * Abre modal de preview de la factura
   */
  const handleVerFacturaPreview = () => {
    // Preparar información de la empresa desde la configuración real
    const empresaInfo = ipsData ? {
      nombre: ipsData.nombre || 'IPS',
      nit: ipsData.nit || 'N/A',
      direccion: `${ipsData.direccion || ''}, ${ipsData.ciudad || ''}`,
      telefono: ipsData.telefono || '',
      email: ipsData.email || '',
      datosBancarios: ipsData.datosBancarios || {}
    } : null;
    
    // Generar HTML de la factura con configuración real (si está disponible, sino usa default)
    const htmlContent = generarFacturaHTML(factura, facturaData, empresaInfo);
    
    // Abrir preview modal
    openPreview(htmlContent, `Vista Previa - Factura ${numeroFactura}`);
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
      overlayProps={{ color: tema.primaryColor, backgroundOpacity: 0.55, blur: 3 }}
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

        {/* Información de Siigo / Facturación Electrónica */}
        {siigoId && (
          <Alert
            icon={<IconCloudCheck size={20} />}
            title="Facturación Electrónica - Siigo"
            color="cyan"
            variant="light"
          >
            <Stack gap="sm">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <Text size="xs" c="dimmed" mb={4}>
                    ID Siigo
                  </Text>
                  <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                    {siigoId}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed" mb={4}>
                    Estado DIAN
                  </Text>
                  <Badge 
                    variant="filled" 
                    color={estadoDian === 'Aceptado' ? 'green' : estadoDian === 'Rechazado' ? 'red' : 'blue'}
                    size="md"
                  >
                    {estadoDian || 'En proceso'}
                  </Badge>
                </div>
                {cufe && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Text size="xs" c="dimmed" mb={4}>
                      CUFE (Código Único de Facturación Electrónica)
                    </Text>
                    <Text 
                      size="xs" 
                      fw={500} 
                      style={{ 
                        fontFamily: 'monospace', 
                        wordBreak: 'break-all',
                        backgroundColor: '#f1f3f5',
                        padding: '8px',
                        borderRadius: '4px'
                      }}
                    >
                      {cufe}
                    </Text>
                  </div>
                )}
                {fechaEnvioSiigo && (
                  <div>
                    <Text size="xs" c="dimmed" mb={4}>
                      Fecha de Envío
                    </Text>
                    <Text size="sm" fw={500}>
                      {formatDate(fechaEnvioSiigo)}
                    </Text>
                  </div>
                )}
                <div>
                  <Text size="xs" c="dimmed" mb={4}>
                    Documentos Electrónicos
                  </Text>
                  <Group gap="xs">
                    {pdfUrl && (
                      <Button
                        size="xs"
                        variant="light"
                        color="red"
                        leftSection={<IconExternalLink size={14} />}
                        component="a"
                        href={pdfUrl}
                        target="_blank"
                      >
                        PDF
                      </Button>
                    )}
                    {xmlUrl && (
                      <Button
                        size="xs"
                        variant="light"
                        color="grape"
                        leftSection={<IconExternalLink size={14} />}
                        component="a"
                        href={xmlUrl}
                        target="_blank"
                      >
                        XML
                      </Button>
                    )}
                  </Group>
                </div>
              </div>
            </Stack>
          </Alert>
        )}

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
                  {servicios.length > 0 ? (
                    servicios.map((servicio, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>
                          <div>
                            <Text size="xs" fw={500}>
                              {servicio.paciente || servicio.paciente?.nombre || 'N/A'}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Doc: {servicio.documentoPaciente || servicio.paciente?.documento || 'N/A'}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" style={{ maxWidth: '150px', whiteSpace: 'normal' }}>
                            {servicio.medico || servicio.medico?.nombre || 'N/A'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed" style={{ maxWidth: '180px', whiteSpace: 'normal' }}>
                            {servicio.descripcion || servicio.procedimiento || 'N/A'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" style={{ fontFamily: 'monospace' }}>
                            {servicio.codigoCups || 'N/A'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {formatDate(servicio.fechaAtencion)}
                          </Text>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          <Text size="xs" fw={600} c="green">
                            {formatCurrency(servicio.valorTotal || servicio.valorUnitario || servicio.valor || 0)}
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
          <Group>
            <Button
              variant="light"
              color="blue"
              leftSection={<IconEye size={18} />}
              onClick={handleVerFacturaPreview}
            >
              Vista Previa e Imprimir
            </Button>
            
            {/* Botón para crear notas crédito/débito */}
            {siigoId && onCrearNota && (
              <Button
                variant="light"
                color="orange"
                leftSection={<IconFileInvoice size={18} />}
                onClick={() => onCrearNota(factura)}
              >
                Notas Crédito/Débito
              </Button>
            )}
          </Group>
          
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

      {/* Modal de Preview para Impresión - Con z-index más alto */}
      <FacturaPrintPreviewModal
        opened={previewOpen}
        onClose={closePreview}
        htmlContent={previewHTML}
        title={previewTitle}
        onPrint={handlePrint}
      />
    </Modal>
  );
};

export default VerFacturaModal;
