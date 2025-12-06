import React from 'react';
import { Modal, Button, Group } from '@mantine/core';
import { IconPrinter, IconX } from '@tabler/icons-react';
import { useTheme } from '../../../negocio/contexts/ThemeContext.jsx';

/**
 * FacturaPrintPreviewModal - Modal para previsualizar factura antes de imprimir
 * Similar a PreviewModal de historia clínica
 * 
 * @param {boolean} opened - Estado de apertura del modal
 * @param {function} onClose - Función para cerrar el modal
 * @param {string} htmlContent - Contenido HTML a mostrar
 * @param {string} title - Título del modal
 * @param {function} onPrint - Función para imprimir
 */
export const FacturaPrintPreviewModal = ({
  opened,
  onClose,
  htmlContent,
  title = 'Vista Previa de Factura',
  onPrint
}) => {
  const { tema } = useTheme();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="xl"
      centered
      zIndex={1000}
      fullScreen
      styles={{
        header: {
          backgroundColor: tema.primaryColor,
          padding: '10px 16px'
        },
        title: {
          color: 'white',
          fontWeight: 600,
          fontSize: 'clamp(0.875rem, 2vw, 1.125rem)'
        },
        close: {
          color: 'white'
        },
        body: {
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        },
        content: {
          maxWidth: 'min(1200px, 100vw)'
        }
      }}
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        maxHeight: '80vh'
      }}>
        {/* Vista previa del HTML - Scrollable */}
        <div
          style={{
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: 'clamp(8px, 2vw, 20px)',
            backgroundColor: 'white',
            overflowY: 'auto',
            flex: 1,
            margin: 'clamp(8px, 2vw, 16px)',
            fontSize: 'clamp(0.75rem, 1.5vw, 1rem)'
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Botones de acción - Footer fijo */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: 'clamp(8px, 2vw, 16px)',
          borderTop: '2px solid #dee2e6',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
        }}>
          <Group justify="flex-end" gap="sm" style={{ flexWrap: 'wrap' }}>
            <Button
              variant="light"
              color="gray"
              leftSection={<IconX size={18} />}
              onClick={onClose}
              size="sm"
              style={{ minWidth: 'fit-content' }}
            >
              Cerrar
            </Button>
            <Button
              color={tema.mantineColor}
              leftSection={<IconPrinter size={18} />}
              onClick={onPrint}
              size="sm"
              style={{ minWidth: 'fit-content' }}
            >
              Imprimir Factura
            </Button>
          </Group>
        </div>
      </div>
    </Modal>
  );
};

export default FacturaPrintPreviewModal;
