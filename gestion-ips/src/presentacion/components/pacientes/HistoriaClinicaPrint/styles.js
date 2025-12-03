/**
 * styles.js
 * 
 * Estilos CSS para impresión de historias clínicas
 */

export const styles = `
    <style>
      @media print {
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 8px; 
          font-size: 9px; 
          line-height: 1.3; 
          color: #111827;
        }
        .header { 
          border-bottom: 2px solid #2563eb; 
          padding-bottom: 8px; 
          margin-bottom: 12px; 
          text-align: center; 
        }
        .institution-info { 
          background: #f0f9ff; 
          padding: 8px; 
          border-radius: 4px; 
          margin-bottom: 10px; 
        }
        .patient-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        .patient-table td {
          border: 1px solid #000;
          padding: 3px 5px;
          font-size: 9px;
        }
        .label-cell {
          background-color: #f0f0f0;
          font-weight: bold;
          width: 15%;
          text-align: left;
        }
        .value-cell {
          background-color: white;
          text-align: left;
          width: 18%;
        }
        .section-header {
          background-color: #e0e0e0;
          padding: 4px 6px;
          font-weight: bold;
          font-size: 10px;
          border: 1px solid #000;
          margin-top: 10px;
          margin-bottom: 5px;
        }
        .consulta { 
          border: 1px solid #000; 
          padding: 6px; 
          margin-bottom: 10px; 
          page-break-inside: avoid; 
        }
        .section-title {
          background: #2563eb; 
          color: white; 
          padding: 5px; 
          font-size: 10px; 
          font-weight: bold; 
          text-align: center; 
          margin-bottom: 8px;
          margin-top: 8px;
        }
        .footer { 
          border-top: 1px solid #000; 
          padding-top: 8px; 
          margin-top: 15px; 
          font-size: 8px; 
        }
        @page { 
          margin: 15mm; 
        }
      }
    </style>
  `;
