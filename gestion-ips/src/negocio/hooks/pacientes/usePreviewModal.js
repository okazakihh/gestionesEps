import { useState } from 'react';

/**
 * Hook para gestionar el estado y la lógica de un modal de vista previa de HTML.
 * @returns {{
 *  previewOpen: boolean,
 *  previewHTML: string,
 *  previewTitle: string,
 *  openPreview: Function,
 *  closePreview: Function,
 *  handlePrint: Function
 * }}
 */
export const usePreviewModal = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHTML, setPreviewHTML] = useState('');
  const [previewTitle, setPreviewTitle] = useState('Vista previa');

  const openPreview = (title, html) => {
    setPreviewTitle(title);
    setPreviewHTML(html);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewHTML('');
    setPreviewTitle('Vista previa');
  };

  const handlePrint = () => {
    if (!previewHTML) return;
    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    printWindow.document.write(previewHTML);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
  };

  return { previewOpen, previewHTML, previewTitle, openPreview, closePreview, handlePrint };
};