import React, { useState } from 'react';
import { Container, Paper, Stack, Title, Text, Button, Group, Tabs, Divider } from '@mantine/core';
import { 
  IconFileInvoice, 
  IconFilter, 
  IconFileDownload, 
  IconPlus,
  IconFileText,
  IconCode
} from '@tabler/icons-react';
import Swal from 'sweetalert2';

// Layout
import { MainLayout } from '../../components/ui/MainLayout.jsx';

// Hooks personalizados
import { useFacturacionManagement } from '../../../negocio/hooks/facturacion/useFacturacionManagement';
import { useCodigosCupsManagement } from '../../../negocio/hooks/facturacion/useCodigosCupsManagement';
import { useFacturaFilters } from '../../../negocio/hooks/facturacion/useFacturaFilters';

// Servicios
import { 
  exportarExcel, 
  generarFacturaPDFFactura,
  generarFacturaPreview
} from '../../../negocio/services/facturacionService';

// Componentes
import {
  CitasTable,
  FacturasTable,
  CodigosCupsTable,
  CitasFilters,
  FacturasFilters,
  CodigosCupsSearch,
  ValorCupsModal,
  FacturaPreviewModal,
  VerFacturaModal
} from '../../components/facturacion';

// Service Worker
import { useServiceWorker } from '../../../serviceWorker.js';
import { facturacionApiService } from '../../../data/services/pacientesApiService.js';

/**
 * FacturacionPage.jsx - REFACTORIZADO
 * 
 * Página principal de facturación médica con arquitectura en capas:
 * - Presentación: Componentes UI reutilizables (tablas, filtros, modales)
 * - Negocio: Hooks personalizados y servicios
 * - Datos: API services
 * 
 * Reducido de 2454 líneas a ~550 líneas mediante composición de componentes
 * 
 * Funcionalidades:
 * - Gestión de citas atendidas con selección múltiple
 * - Creación y gestión de facturas
 * - Filtros avanzados (fechas, paciente, médico, procedimiento)
 * - Exportación a Excel
 * - Generación de PDF para facturas
 * - Gestión de códigos CUPS con paginación
 * - Edición de valores de códigos CUPS
 * - Cache optimizado para rendimiento
 */

const FacturacionPage = () => {
  // ============================================================================
  // HOOKS
  // ============================================================================
  
  // Service Worker para modo offline
  const { isRegistered, isOnline } = useServiceWorker();

  // Hook de gestión de facturación (citas, facturas, selección, cache)
  const {
    citasAtendidas,
    facturas,
    selectedCitas,
    loadingCitas,
    loadingFacturas,
    handleSelectCita,
    handleSelectAllCitas,
    crearFactura: crearFacturaBase,
    loadFacturas,
    loadCitasAtendidas
  } = useFacturacionManagement();

  // Hook de gestión de códigos CUPS
  const {
    codigosCups,
    loading: loadingCups,
    searchTerm,
    updateSearchTerm: setSearchTerm,
    currentPage,
    totalPages,
    totalCodigosCups,
    filteredCount,
    handlePageChange,
    isValorModalOpen,
    selectedCodigoCups,
    handleOpenValorModal,
    handleCloseValorModal,
    handleSaveValor
  } = useCodigosCupsManagement();

  // Hook de filtros (citas y facturas)
  const {
    // Estados de filtros de citas
    fechaInicio,
    fechaFin,
    filtroDocumentoPaciente,
    filtroCodigoCups,
    filtroMedico,
    filtroProcedimiento,
    setFechaInicio,
    setFechaFin,
    setFiltroDocumentoPaciente,
    setFiltroCodigoCups,
    setFiltroMedico,
    setFiltroProcedimiento,
    // Estados de filtros de facturas
    filtroNumeroFactura,
    filtroFechaFacturaInicio,
    filtroFechaFacturaFin,
    setFiltroNumeroFactura,
    setFiltroFechaFacturaInicio,
    setFiltroFechaFacturaFin,
    // UI states
    showFiltrosFecha,
    showFiltrosFactura,
    toggleFiltrosCitas: toggleFiltrosFecha,
    toggleFiltrosFacturas: toggleFiltrosFactura,
    // Funciones de filtrado
    aplicarFiltrosCitas,
    aplicarFiltrosFacturas,
    limpiarFiltrosCitas,
    limpiarFiltrosFacturas
  } = useFacturaFilters();

  // ============================================================================
  // ESTADOS LOCALES
  // ============================================================================
  
  const [isFacturaModalOpen, setIsFacturaModalOpen] = useState(false);
  const [facturaPreview, setFacturaPreview] = useState(null);
  const [isVerFacturaModalOpen, setIsVerFacturaModalOpen] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  // ============================================================================
  // DATOS FILTRADOS
  // ============================================================================
  
  const citasAtendidasFiltradas = aplicarFiltrosCitas(citasAtendidas);
  const facturasFiltradas = aplicarFiltrosFacturas(facturas);

  // ============================================================================
  // FUNCIONES DE MANEJO DE FACTURACIÓN
  // ============================================================================

  /**
   * Crear factura: valida selección, genera preview y abre modal
   */
  const handleCrearFactura = async () => {
    if (selectedCitas.size === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Selección requerida',
        text: 'Debe seleccionar al menos una cita para crear la factura',
        confirmButtonColor: '#F59E0B'
      });
      return;
    }

    try {
      const citasSeleccionadas = citasAtendidasFiltradas.filter(cita => selectedCitas.has(cita.id));
      const facturaData = generarFacturaPreview(citasSeleccionadas);
      setFacturaPreview(facturaData);
      setIsFacturaModalOpen(true);
    } catch (error) {
      console.error('Error creando factura:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear la factura. Inténtelo nuevamente.',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  /**
   * Guardar factura: envía al backend y actualiza listas
   */
  const handleGuardarFactura = async () => {
    try {
      const jsonDataCrudo = JSON.stringify(facturaPreview);
      const response = await facturacionApiService.createFacturacion(jsonDataCrudo);

      if (response && (response.success || response.id)) {
        await Swal.fire({
          icon: 'success',
          title: '¡Factura Creada!',
          text: `La factura ${facturaPreview.numeroFactura} ha sido creada exitosamente.`,
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });

        // Limpiar y recargar
        setIsFacturaModalOpen(false);
        setFacturaPreview(null);
        loadFacturas();
        loadCitasAtendidas();
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('Error guardando factura:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al Guardar',
        text: 'No se pudo guardar la factura. Inténtelo nuevamente.',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  /**
   * Ver detalles de una factura existente
   */
  const handleVerFactura = (factura) => {
    try {
      const facturaData = JSON.parse(factura.jsonData || '{}');
      setFacturaSeleccionada({
        ...factura,
        ...facturaData
      });
      setIsVerFacturaModalOpen(true);
    } catch (error) {
      console.error('Error parsing factura data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar la información de la factura',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  /**
   * Procesar factura: cambiar estado a PAGADA
   */
  const handleProcesarFactura = async (factura) => {
    try {
      const facturaData = JSON.parse(factura.jsonData || '{}');
      const numeroFactura = facturaData.numeroFactura || `FM-${factura.id}`;

      const result = await Swal.fire({
        title: '¿Procesar Factura?',
        text: `¿Estás seguro de marcar la factura ${numeroFactura} como PAGADA?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Sí, procesar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        facturaData.estado = 'PAGADA';
        const response = await facturacionApiService.updateFacturacion(
          factura.id, 
          JSON.stringify(facturaData)
        );

        if (response && (response.success || response.id)) {
          await Swal.fire({
            icon: 'success',
            title: '¡Factura Procesada!',
            text: 'La factura ha sido marcada como PAGADA.',
            confirmButtonColor: '#10B981',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });

          // Cerrar modal si está abierto y recargar
          setIsVerFacturaModalOpen(false);
          setFacturaSeleccionada(null);
          loadFacturas();
        } else {
          throw new Error('Error al actualizar la factura');
        }
      }
    } catch (error) {
      console.error('Error procesando factura:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo procesar la factura. Inténtelo nuevamente.',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  /**
   * Exportar citas filtradas a Excel
   */
  const handleExportarExcel = () => {
    const filtros = {
      fechaInicio,
      fechaFin,
      filtroDocumentoPaciente,
      filtroMedico,
      filtroProcedimiento
    };
    exportarExcel(citasAtendidasFiltradas, filtros);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <MainLayout
      title="Facturación"
      subtitle={`Gestión de códigos CUPS y facturación médica ${!isOnline ? '(Modo Offline)' : ''}`}
      icon={<IconFileInvoice size={28} />}
    >
      <Container size="100%" px="xl" py="md" style={{ maxWidth: '100%' }}>
        <Stack gap="xl">
          
          {/* ============================================================
              TABS PRINCIPALES
              ============================================================ */}
          
          <Tabs defaultValue="facturacion" variant="outline">
            
            {/* ========== TAB 1: FACTURACIÓN ========== */}
            <Tabs.List>
              <Tabs.Tab value="facturacion" leftSection={<IconFileInvoice size={18} />}>
                Facturación
              </Tabs.Tab>
              <Tabs.Tab value="cups" leftSection={<IconCode size={18} />}>
                Códigos CUPS
              </Tabs.Tab>
            </Tabs.List>

            {/* ========== PANEL: FACTURACIÓN ========== */}
            <Tabs.Panel value="facturacion" pt="xl">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                
                {/* ===== COLUMNA IZQUIERDA: CITAS ATENDIDAS ===== */}
                <Stack gap="md">
                  {/* Header */}
                  <Paper p="md" withBorder>
                    <Group justify="space-between" wrap="wrap">
                      <div>
                        <Title order={2} size="h3">
                          Citas Atendidas
                        </Title>
                        <Text size="sm" c="dimmed" mt={4}>
                          Seleccione las citas para crear una factura
                        </Text>
                      </div>
                      <Group gap="sm">
                        <Button
                          variant="light"
                          leftSection={<IconFilter size={18} />}
                          onClick={toggleFiltrosFecha}
                        >
                          Filtros
                        </Button>
                        <Button
                          variant="light"
                          color="green"
                          leftSection={<IconFileDownload size={18} />}
                          onClick={handleExportarExcel}
                          disabled={citasAtendidasFiltradas.length === 0}
                        >
                          Exportar Excel
                        </Button>
                      </Group>
                    </Group>
                  </Paper>

                  {/* Filtros de citas */}
                  <CitasFilters
                    opened={showFiltrosFecha}
                    fechaInicio={fechaInicio}
                    fechaFin={fechaFin}
                    filtroDocumentoPaciente={filtroDocumentoPaciente}
                    filtroCodigoCups={filtroCodigoCups}
                    filtroMedico={filtroMedico}
                    filtroProcedimiento={filtroProcedimiento}
                    onFechaInicioChange={setFechaInicio}
                    onFechaFinChange={setFechaFin}
                    onDocumentoChange={setFiltroDocumentoPaciente}
                    onCodigoCupsChange={setFiltroCodigoCups}
                    onMedicoChange={setFiltroMedico}
                    onProcedimientoChange={setFiltroProcedimiento}
                    onLimpiar={limpiarFiltrosCitas}
                  />

                  {/* Mensaje informativo sobre citas ya facturadas */}
                  {facturas.length > 0 && (
                    <Paper p="sm" withBorder style={{ backgroundColor: '#fef3c7', borderColor: '#fbbf24' }}>
                      <Group gap="xs">
                        <Text size="xs" c="orange" fw={500}>
                          ℹ️ Nota: Las citas que ya han sido facturadas no se muestran en esta lista para evitar doble facturación.
                        </Text>
                      </Group>
                    </Paper>
                  )}

                  {/* Tabla de citas */}
                  <CitasTable
                    citas={citasAtendidasFiltradas}
                    selectedCitas={selectedCitas}
                    onSelectCita={handleSelectCita}
                    onSelectAll={handleSelectAllCitas}
                    loading={loadingCitas}
                    totalCitas={citasAtendidas.length}
                    limit={10}
                  />

                  {/* Botón crear factura */}
                  {selectedCitas.size > 0 && (
                    <Paper p="md" withBorder style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                      <Group justify="space-between">
                        <div>
                          <Text size="sm" fw={600} c="green">
                            {selectedCitas.size} {selectedCitas.size === 1 ? 'cita seleccionada' : 'citas seleccionadas'}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Haga clic en "Crear Factura" para continuar
                          </Text>
                        </div>
                        <Button
                          size="md"
                          color="green"
                          leftSection={<IconPlus size={20} />}
                          onClick={handleCrearFactura}
                        >
                          Crear Factura
                        </Button>
                      </Group>
                    </Paper>
                  )}
                </Stack>

                {/* ===== COLUMNA DERECHA: FACTURAS CREADAS ===== */}
                <Stack gap="md">
                  {/* Header */}
                  <Paper p="md" withBorder>
                    <Group justify="space-between" wrap="wrap">
                      <div>
                        <Title order={2} size="h3">
                          Facturas Creadas
                        </Title>
                        <Text size="sm" c="dimmed" mt={4}>
                          Historial de facturas generadas
                        </Text>
                      </div>
                      <Button
                        variant="light"
                        leftSection={<IconFilter size={18} />}
                        onClick={toggleFiltrosFactura}
                      >
                        Filtros
                      </Button>
                    </Group>
                  </Paper>

                  {/* Filtros de facturas */}
                  <FacturasFilters
                    opened={showFiltrosFactura}
                    filtroNumeroFactura={filtroNumeroFactura}
                    filtroFechaFacturaInicio={filtroFechaFacturaInicio}
                    filtroFechaFacturaFin={filtroFechaFacturaFin}
                    onNumeroFacturaChange={setFiltroNumeroFactura}
                    onFechaInicioChange={setFiltroFechaFacturaInicio}
                    onFechaFinChange={setFiltroFechaFacturaFin}
                    onLimpiar={limpiarFiltrosFacturas}
                  />

                  {/* Tabla de facturas */}
                  <FacturasTable
                    facturas={facturas}
                    facturasFiltered={facturasFiltradas}
                    onVerFactura={handleVerFactura}
                    onGenerarPDF={generarFacturaPDFFactura}
                    onProcesarFactura={handleProcesarFactura}
                    loading={loadingFacturas}
                    limit={10}
                  />
                </Stack>
              </div>
            </Tabs.Panel>

            {/* ========== PANEL: CÓDIGOS CUPS ========== */}
            <Tabs.Panel value="cups" pt="xl">
              <Stack gap="md">
                {/* Header */}
                <Paper p="md" withBorder>
                  <div>
                    <Title order={2} size="h3">
                      Códigos CUPS
                    </Title>
                    <Text size="sm" c="dimmed" mt={4}>
                      Lista de códigos CUPS disponibles para facturación médica
                    </Text>
                  </div>
                </Paper>

                {/* Barra de búsqueda */}
                <CodigosCupsSearch
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  totalCount={totalCodigosCups}
                  filteredCount={filteredCount}
                />

                {/* Tabla de códigos CUPS */}
                <CodigosCupsTable
                  codigosCups={codigosCups}
                  onEditarValor={handleOpenValorModal}
                  loading={loadingCups}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </Stack>
            </Tabs.Panel>
          </Tabs>

          {/* ============================================================
              MODALES
              ============================================================ */}

          {/* Modal: Editar valor de código CUPS */}
          <ValorCupsModal
            opened={isValorModalOpen}
            onClose={handleCloseValorModal}
            codigoCups={selectedCodigoCups}
            onSave={handleSaveValor}
          />

          {/* Modal: Preview de factura antes de guardar */}
          <FacturaPreviewModal
            opened={isFacturaModalOpen}
            onClose={() => setIsFacturaModalOpen(false)}
            facturaPreview={facturaPreview}
            onSave={handleGuardarFactura}
          />

          {/* Modal: Ver detalles de factura guardada */}
          <VerFacturaModal
            opened={isVerFacturaModalOpen}
            onClose={() => {
              setIsVerFacturaModalOpen(false);
              setFacturaSeleccionada(null);
            }}
            factura={facturaSeleccionada}
            onProcesar={handleProcesarFactura}
          />

        </Stack>
      </Container>
    </MainLayout>
  );
};

export default FacturacionPage;
