import React from 'react';
import { Modal, Stack, Group, Button, Code, ScrollArea, Text, Paper } from '@mantine/core';
import { IconDownload, IconCopy, IconX } from '@tabler/icons-react';
import Swal from 'sweetalert2';

/**
 * XMLViewerModal - Modal para visualizar XML de facturas electrónicas DIAN
 * 
 * @param {boolean} opened - Estado de apertura del modal
 * @param {function} onClose - Función para cerrar el modal
 * @param {string} xmlContent - Contenido XML a mostrar
 */
export const XMLViewerModal = ({ opened, onClose, xmlContent }) => {
  
  /**
   * Copiar XML al portapapeles
   */
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      await Swal.fire({
        icon: 'success',
        title: 'XML Copiado',
        text: 'El XML ha sido copiado al portapapeles',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo copiar el XML al portapapeles',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  /**
   * Descargar XML como archivo
   */
  const handleDownloadXML = () => {
    try {
      // Crear blob con el XML
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      // Crear elemento de descarga temporal
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura_electronica_${Date.now()}.xml`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      Swal.fire({
        icon: 'success',
        title: 'XML Descargado',
        text: 'El archivo XML ha sido descargado exitosamente',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } catch (error) {
      console.error('Error descargando XML:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo descargar el archivo XML',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  /**
   * Formatear XML para mejor visualización (agregar indentación)
   */
  const formatXML = (xml) => {
    try {
      const PADDING = '  '; // Dos espacios por nivel
      const reg = /(>)(<)(\/*)/g;
      let formatted = xml.replace(reg, '$1\n$2$3');
      let pad = 0;

      formatted = formatted.split('\n').map((line) => {
        let indent = 0;
        if (line.match(/.+<\/\w[^>]*>$/)) {
          indent = 0;
        } else if (line.match(/^<\/\w/)) {
          if (pad !== 0) {
            pad -= 1;
          }
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
      console.error('Error formateando XML:', error);
      return xml; // Retornar XML sin formatear si hay error
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="XML de Factura Electrónica (UBL 2.1)"
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
        {/* Información */}
        <Paper p="sm" withBorder style={{ backgroundColor: '#F0F9FF', borderColor: '#3B82F6' }}>
          <Text size="sm" c="blue">
            �"� Este es el XML UBL 2.1 conforme a la Resolución 000042 de 2020 de la DIAN
          </Text>
        </Paper>

        {/* Botones de acción */}
        <Group justify="flex-end" gap="sm">
          <Button
            variant="light"
            color="blue"
            leftSection={<IconCopy size={18} />}
            onClick={handleCopyToClipboard}
          >
            Copiar XML
          </Button>
          <Button
            variant="light"
            color="green"
            leftSection={<IconDownload size={18} />}
            onClick={handleDownloadXML}
          >
            Descargar XML
          </Button>
        </Group>

        {/* Visualizador de XML */}
        <ScrollArea h={500} style={{ border: '1px solid #E5E7EB', borderRadius: '8px' }}>
          <Code
            block
            style={{
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre',
              backgroundColor: '#1F2937',
              color: '#10B981',
              padding: '1rem'
            }}
          >
            {formatXML(xmlContent)}
          </Code>
        </ScrollArea>

        {/* Botón cerrar */}
        <Group justify="flex-end">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconX size={18} />}
            onClick={onClose}
          >
            Cerrar
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default XMLViewerModal;
