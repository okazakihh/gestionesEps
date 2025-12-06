import React, { useState, useEffect } from 'react';
import { Modal, Stack, Group, Button, Text, Paper, Divider, Badge, Tabs, Code, ScrollArea, Alert, LoadingOverlay } from '@mantine/core';
import { IconCloud, IconX, IconFileCode, IconBuilding, IconUser, IconReceipt, IconAlertCircle } from '@tabler/icons-react';
import Swal from 'sweetalert2';
import { prepararDatosParaDian, getIpsConfig } from '../../../negocio/services/facturacionService';
import { validarFacturaPreEnvio } from '../../../negocio/services/dianService';

/**
 * DianPreviewModal - Modal para previsualizar datos antes de enviar a DIAN
 * 
 * @param {boolean} opened - Estado de apertura del modal
 * @param {function} onClose - Función para cerrar el modal
 * @param {Object} factura - Factura a enviar
 * @param {function} onConfirm - Función a ejecutar al confirmar envío
 */
export const DianPreviewModal = ({ opened, onClose, factura, onConfirm }) => {
  const [loading, setLoading] = useState(true);
  const [datosPreparados, setDatosPreparados] = useState(null);
  const [xmlPreview, setXmlPreview] = useState('');
  const [erroresValidacion, setErroresValidacion] = useState([]);

  /**
   * Cargar y preparar datos cuando se abre el modal
   */
  useEffect(() => {
    if (opened && factura) {
      cargarDatosPreview();
    }
  }, [opened, factura]);

  /**
   * Cargar datos para previsualización
   */
  const cargarDatosPreview = async () => {
    setLoading(true);
    setErroresValidacion([]);
    
    try {
      // Obtener configuración IPS
      const ipsConfig = await getIpsConfig();
      
      // Parsear datos de la factura
      const facturaData = typeof factura.jsonData === 'string' 
        ? JSON.parse(factura.jsonData) 
        : factura.jsonData;

      // Preparar datos para DIAN
      const datosDian = await prepararDatosParaDian(facturaData, ipsConfig);
      setDatosPreparados(datosDian);

      // Validar factura
      const validacion = validarFacturaPreEnvio(datosDian);
      if (!validacion.valido) {
        setErroresValidacion(validacion.errores);
      }

      // El XML se genera automáticamente en el backend (Siigo)
      setXmlPreview('El XML se generará automáticamente al enviar la factura a Siigo/DIAN');

    } catch (error) {
      console.error('Error preparando preview:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la previsualización: ' + error.message,
        confirmButtonColor: '#EF4444'
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Confirmar envío a DIAN
   */
  const handleConfirmarEnvio = async () => {
    if (erroresValidacion.length > 0) {
      await Swal.fire({
        icon: 'error',
        title: 'Errores de Validación',
        html: `<p>Hay errores que deben corregirse:</p><ul style="text-align: left;">${erroresValidacion.map(e => `<li>${e}</li>`).join('')}</ul>`,
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    onClose();
    onConfirm();
  };

  /**
   * Formatear moneda
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  /**
   * Formatear XML
   */
  const formatXML = (xml) => {
    try {
      const PADDING = '  ';
      const reg = /(>)(<)(\/*)/g;
      let formatted = xml.replace(reg, '$1\n$2$3');
      let pad = 0;

      formatted = formatted.split('\n').map((line) => {
        let indent = 0;
        if (line.match(/.+<\/\w[^>]*>$/)) {
          indent = 0;
        } else if (line.match(/^<\/\w/)) {
          if (pad !== 0) pad -= 1;
        } else if (line.match(/^<\w([^>]*[^\/])?>.*$/)) {
          indent = 1;
        } else {
          indent = 0;
        }

        const padding = PADDING.repeat(pad);
        pad += indent;
        return padding + line;
      }).join('\n');

      return formatted;
    } catch (error) {
      return xml;
    }
  };

  if (!datosPreparados) {
    return (
      <Modal opened={opened} onClose={onClose} size="xl" title="Preparando previsualización...">
        <LoadingOverlay visible={true} />
      </Modal>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Previsualización - Envío a DIAN"
      size="xl"
      styles={{
        title: {
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#1F2937'
        }
      }}
    >
      <Stack gap="md">
        <LoadingOverlay visible={loading} />

        {/* Alertas de validación */}
        {erroresValidacion.length > 0 && (
          <Alert icon={<IconAlertCircle size={20} />} color="red" title="Errores de Validación">
            <Stack gap="xs">
              {erroresValidacion.map((error, idx) => (
                <Text key={idx} size="sm">• {error}</Text>
              ))}
            </Stack>
          </Alert>
        )}

        {erroresValidacion.length === 0 && (
          <Alert color="green" title="Validación Exitosa">
            La factura cumple con todos los requisitos para ser enviada a DIAN
          </Alert>
        )}

        {/* Tabs con información */}
        <Tabs defaultValue="resumen" variant="outline">
          
          {/* TAB: Resumen */}
          <Tabs.List>
            <Tabs.Tab value="resumen" leftSection={<IconReceipt size={18} />}>
              Resumen
            </Tabs.Tab>
            <Tabs.Tab value="emisor" leftSection={<IconBuilding size={18} />}>
              Emisor (IPS)
            </Tabs.Tab>
            <Tabs.Tab value="cliente" leftSection={<IconUser size={18} />}>
              Cliente
            </Tabs.Tab>
            <Tabs.Tab value="xml" leftSection={<IconFileCode size={18} />}>
              XML UBL 2.1
            </Tabs.Tab>
          </Tabs.List>

          {/* Panel: Resumen */}
          <Tabs.Panel value="resumen" pt="md">
            <Stack gap="md">
              <Paper p="md" withBorder>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Número de Factura:</Text>
                    <Text size="sm" fw={600}>{datosPreparados.numeroFactura}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Fecha de Emisión:</Text>
                    <Text size="sm" fw={600}>{new Date(datosPreparados.fechaEmision).toLocaleDateString('es-CO')}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Fecha de Vencimiento:</Text>
                    <Text size="sm" fw={600}>{new Date(datosPreparados.fechaVencimiento).toLocaleDateString('es-CO')}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Medio de Pago:</Text>
                    <Badge color="blue">{datosPreparados.medioPago}</Badge>
                  </Group>
                </Stack>
              </Paper>

              <Divider label="Items de la Factura" labelPosition="center" />

              {datosPreparados.items.map((item, idx) => (
                <Paper key={idx} p="sm" withBorder style={{ backgroundColor: '#F9FAFB' }}>
                  <Group justify="space-between">
                    <div style={{ flex: 1 }}>
                      <Text size="sm" fw={600}>{item.descripcion}</Text>
                      <Text size="xs" c="dimmed">CUPS: {item.codigoCups || 'N/A'}</Text>
                      <Text size="xs" c="dimmed">Cant: {item.cantidad} x {formatCurrency(item.valorUnitario)}</Text>
                    </div>
                    <Text size="sm" fw={600} c="green">
                      {formatCurrency(item.valorTotal)}
                    </Text>
                  </Group>
                </Paper>
              ))}

              <Divider />

              <Paper p="md" withBorder style={{ backgroundColor: '#F0FDF4' }}>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm">Subtotal:</Text>
                    <Text size="sm" fw={500}>{formatCurrency(datosPreparados.subtotal)}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">IVA ({datosPreparados.ivaPercent || 0}%):</Text>
                    <Text size="sm" fw={500}>{formatCurrency(datosPreparados.iva)}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">Retención:</Text>
                    <Text size="sm" fw={500}>{formatCurrency(datosPreparados.retencion)}</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="lg" fw={700}>TOTAL:</Text>
                    <Text size="lg" fw={700} c="green">{formatCurrency(datosPreparados.total)}</Text>
                  </Group>
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>

          {/* Panel: Emisor */}
          <Tabs.Panel value="emisor" pt="md">
            <Paper p="md" withBorder>
              <Stack gap="xs">
                <Text size="lg" fw={600} c="blue">{datosPreparados.emisor.razonSocial}</Text>
                <Divider />
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">NIT:</Text>
                  <Text size="sm" fw={500}>{datosPreparados.emisor.nit}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Dirección:</Text>
                  <Text size="sm" fw={500}>{datosPreparados.emisor.direccion}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Ciudad:</Text>
                  <Text size="sm" fw={500}>{datosPreparados.emisor.ciudad}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Teléfono:</Text>
                  <Text size="sm" fw={500}>{datosPreparados.emisor.telefono}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Email:</Text>
                  <Text size="sm" fw={500}>{datosPreparados.emisor.email}</Text>
                </Group>
              </Stack>
            </Paper>
          </Tabs.Panel>

          {/* Panel: Cliente */}
          <Tabs.Panel value="cliente" pt="md">
            <Paper p="md" withBorder>
              <Stack gap="xs">
                <Text size="lg" fw={600} c="blue">{datosPreparados.cliente.nombreCompleto}</Text>
                <Divider />
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Tipo Documento:</Text>
                  <Badge>{datosPreparados.cliente.tipoDocumento}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Número Documento:</Text>
                  <Text size="sm" fw={500}>{datosPreparados.cliente.numeroDocumento}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Dirección:</Text>
                  <Text size="sm" fw={500}>{datosPreparados.cliente.direccion || 'No especificada'}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Ciudad:</Text>
                  <Text size="sm" fw={500}>{datosPreparados.cliente.ciudad || 'No especificada'}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Teléfono:</Text>
                  <Text size="sm" fw={500}>{datosPreparados.cliente.telefono || 'No especificado'}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Email:</Text>
                  <Text size="sm" fw={500}>{datosPreparados.cliente.email || 'No especificado'}</Text>
                </Group>
              </Stack>
            </Paper>
          </Tabs.Panel>

          {/* Panel: XML */}
          <Tabs.Panel value="xml" pt="md">
            <ScrollArea h={400} style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}>
              <Code
                block
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre',
                  backgroundColor: '#1F2937',
                  color: '#10B981',
                  padding: '1rem'
                }}
              >
                {formatXML(xmlPreview)}
              </Code>
            </ScrollArea>
            <Text size="xs" c="dimmed" mt="xs">
              Este es el XML UBL 2.1 que se enviará a DIAN
            </Text>
          </Tabs.Panel>

        </Tabs>

        {/* Botones de acción */}
        <Group justify="flex-end" gap="sm" mt="md">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconX size={18} />}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            color="indigo"
            leftSection={<IconCloud size={18} />}
            onClick={handleConfirmarEnvio}
            disabled={erroresValidacion.length > 0}
          >
            Confirmar y Enviar a DIAN
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default DianPreviewModal;
