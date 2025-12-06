import { useState } from 'react';

/**
 * Hook personalizado para manejar el modal de vista previa de facturas
 * Similar a usePreviewModal de historia clínica
 * 
 * @returns {Object} Estado y funciones para controlar el modal de preview
 */
export const useFacturaPreviewModal = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHTML, setPreviewHTML] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  /**
   * Abrir modal de preview con contenido HTML
   * @param {string} htmlContent - Contenido HTML a mostrar
   * @param {string} title - Título del modal
   */
  const openPreview = (htmlContent, title = 'Vista Previa de Factura') => {
    setPreviewHTML(htmlContent);
    setPreviewTitle(title);
    setPreviewOpen(true);
  };

  /**
   * Cerrar modal de preview
   */
  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewHTML('');
    setPreviewTitle('');
  };

  /**
   * Imprimir desde el modal de preview
   */
  const handlePrint = () => {
    if (!previewHTML) return;

    const ventana = window.open('', '_blank', 'width=800,height=1000');
    
    if (ventana) {
      ventana.document.write(previewHTML);
      ventana.document.close();
      
      // Esperar a que cargue el contenido antes de imprimir
      ventana.onload = () => {
        ventana.focus();
        ventana.print();
      };
    } else {
      alert('Por favor, permita las ventanas emergentes para imprimir la factura.');
    }
  };

  return {
    previewOpen,
    previewHTML,
    previewTitle,
    openPreview,
    closePreview,
    handlePrint
  };
};
