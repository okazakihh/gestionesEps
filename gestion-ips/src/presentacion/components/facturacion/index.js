/**
 * index.js
 * 
 * Barrel export para componentes de facturación
 * Facilita las importaciones desde otros archivos
 */

// Componentes de tablas
export { default as CitasTable } from './CitasTable';
export { default as FacturasTable } from './FacturasTable';
export { default as CodigosCupsTable } from './CodigosCupsTable';

// Componentes de filtros
export { default as CitasFilters } from './CitasFilters';
export { default as FacturasFilters } from './FacturasFilters';
export { default as CodigosCupsSearch } from './CodigosCupsSearch';

// Componentes de modales
export { default as ValorCupsModal } from './ValorCupsModal';
export { default as FacturaPreviewModal } from './FacturaPreviewModal';
export { default as CrearFacturaElectronicaModal } from './CrearFacturaElectronicaModal';
// export { default as FacturaDianModal } from './FacturaDianModal'; // Deprecado - Solo Siigo
export { default as VerFacturaModal } from './VerFacturaModal';
export { default as XMLViewerModal } from './XMLViewerModal';
// export { default as DianConfigModal } from './DianConfigModal'; // Deprecado - Solo Siigo
// export { default as DianPreviewModal } from './DianPreviewModal'; // Deprecado - Solo Siigo
export { default as VistaGruposFacturacionModal } from './VistaGruposFacturacionModal';
export { default as CrearNotaContableModal } from './CrearNotaContableModal';

// Componentes de utilidad
export { default as ModoFacturacionSelector } from './ModoFacturacionSelector';
