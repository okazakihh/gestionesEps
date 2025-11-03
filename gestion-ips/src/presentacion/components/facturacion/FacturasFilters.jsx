import React from 'react';
import { Paper, TextInput, Button, Group, Stack, Badge, Collapse } from '@mantine/core';
import { IconFilter, IconX } from '@tabler/icons-react';

/**
 * FacturasFilters.jsx
 * 
 * Componente de panel de filtros para facturas
 * 
 * Props:
 * - opened: boolean que indica si el panel está abierto
 * - filtroNumeroFactura: valor del filtro de número de factura
 * - filtroFechaFacturaInicio: valor del filtro de fecha inicio (string o Date)
 * - filtroFechaFacturaFin: valor del filtro de fecha fin (string o Date)
 * - onNumeroFacturaChange: función para cambiar filtro de número
 * - onFechaInicioChange: función para cambiar fecha inicio
 * - onFechaFinChange: función para cambiar fecha fin
 * - onLimpiar: función para limpiar todos los filtros
 * 
 * Capa: Presentación
 */

const FacturasFilters = ({
  opened = false,
  filtroNumeroFactura = '',
  filtroFechaFacturaInicio,
  filtroFechaFacturaFin,
  onNumeroFacturaChange,
  onFechaInicioChange,
  onFechaFinChange,
  onLimpiar
}) => {
  // Convertir strings a objetos Date si es necesario
  const parseFecha = (fecha) => {
    if (!fecha) return null;
    if (fecha instanceof Date) return fecha;
    return new Date(fecha);
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = filtroNumeroFactura || filtroFechaFacturaInicio || filtroFechaFacturaFin;

  // Obtener lista de filtros activos para mostrar badges
  const getActiveFiltros = () => {
    const filtros = [];
    if (filtroNumeroFactura) {
      filtros.push({ 
        label: 'Número', 
        value: filtroNumeroFactura,
        color: 'blue' 
      });
    }
    if (filtroFechaFacturaInicio) {
      filtros.push({ 
        label: 'Desde', 
        value: parseFecha(filtroFechaFacturaInicio)?.toLocaleDateString('es-ES') || filtroFechaFacturaInicio,
        color: 'green' 
      });
    }
    if (filtroFechaFacturaFin) {
      filtros.push({ 
        label: 'Hasta', 
        value: parseFecha(filtroFechaFacturaFin)?.toLocaleDateString('es-ES') || filtroFechaFacturaFin,
        color: 'violet' 
      });
    }
    return filtros;
  };

  const activeFiltros = getActiveFiltros();

  return (
    <>
      <Collapse in={opened}>
        <Paper p="md" mb="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
          <Stack gap="md">
            {/* Filtros */}
            <Group grow align="flex-start">
              <TextInput
                label="Número Factura"
                placeholder="Buscar por número..."
                value={filtroNumeroFactura}
                onChange={(e) => onNumeroFacturaChange(e.currentTarget.value)}
                leftSection={<IconFilter size={16} />}
              />
              <TextInput
                type="date"
                label="Fecha Inicio"
                placeholder="Seleccionar fecha inicio"
                value={filtroFechaFacturaInicio}
                onChange={(e) => onFechaInicioChange(e.currentTarget.value)}
              />
              <TextInput
                type="date"
                label="Fecha Fin"
                placeholder="Seleccionar fecha fin"
                value={filtroFechaFacturaFin}
                onChange={(e) => onFechaFinChange(e.currentTarget.value)}
              />
            </Group>

            {/* Botón de limpiar filtros */}
            <Group justify="flex-end">
              <Button
                variant="light"
                color="gray"
                leftSection={<IconX size={16} />}
                onClick={onLimpiar}
                disabled={!hasActiveFilters}
              >
                Limpiar Filtros
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Collapse>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <Paper p="md" mb="md" withBorder style={{ backgroundColor: '#f0f9ff', borderColor: '#bfdbfe' }}>
          <Stack gap="xs">
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e40af' }}>
              Filtros activos:
            </div>
            <Group gap="xs">
              {activeFiltros.map((filtro, index) => (
                <Badge 
                  key={index} 
                  variant="light" 
                  color={filtro.color}
                  size="lg"
                >
                  {filtro.label}: {filtro.value}
                </Badge>
              ))}
            </Group>
          </Stack>
        </Paper>
      )}
    </>
  );
};

export default FacturasFilters;
