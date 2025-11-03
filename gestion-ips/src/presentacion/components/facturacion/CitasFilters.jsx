import React from 'react';
import { Paper, TextInput, Button, Group, Stack, Badge, Collapse } from '@mantine/core';
import { IconFilter, IconX } from '@tabler/icons-react';

/**
 * CitasFilters.jsx
 * 
 * Componente de panel de filtros para citas atendidas
 * 
 * Props:
 * - opened: boolean que indica si el panel está abierto
 * - fechaInicio: valor del filtro de fecha inicio (string o Date)
 * - fechaFin: valor del filtro de fecha fin (string o Date)
 * - filtroDocumentoPaciente: valor del filtro de documento
 * - filtroMedico: valor del filtro de médico
 * - filtroProcedimiento: valor del filtro de procedimiento
 * - filtroCodigoCups: valor del filtro de código CUPS
 * - onFechaInicioChange: función para cambiar fecha inicio
 * - onFechaFinChange: función para cambiar fecha fin
 * - onDocumentoChange: función para cambiar filtro documento
 * - onMedicoChange: función para cambiar filtro médico
 * - onProcedimientoChange: función para cambiar filtro procedimiento
 * - onCodigoCupsChange: función para cambiar filtro código CUPS
 * - onLimpiar: función para limpiar todos los filtros
 * 
 * Capa: Presentación
 */

const CitasFilters = ({
  opened = false,
  fechaInicio,
  fechaFin,
  filtroDocumentoPaciente = '',
  filtroMedico = '',
  filtroProcedimiento = '',
  filtroCodigoCups = '',
  onFechaInicioChange,
  onFechaFinChange,
  onDocumentoChange,
  onMedicoChange,
  onProcedimientoChange,
  onCodigoCupsChange,
  onLimpiar
}) => {
  // Convertir strings a objetos Date si es necesario
  const parseFecha = (fecha) => {
    if (!fecha) return null;
    if (fecha instanceof Date) return fecha;
    return new Date(fecha);
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = fechaInicio || fechaFin || filtroDocumentoPaciente || filtroMedico || filtroProcedimiento || filtroCodigoCups;

  // Obtener lista de filtros activos para mostrar badges
  const getActiveFiltros = () => {
    const filtros = [];
    if (fechaInicio) {
      filtros.push({ 
        label: 'Desde', 
        value: parseFecha(fechaInicio)?.toLocaleDateString('es-ES') || fechaInicio,
        color: 'blue' 
      });
    }
    if (fechaFin) {
      filtros.push({ 
        label: 'Hasta', 
        value: parseFecha(fechaFin)?.toLocaleDateString('es-ES') || fechaFin,
        color: 'blue' 
      });
    }
    if (filtroDocumentoPaciente) {
      filtros.push({ 
        label: 'Doc. Paciente', 
        value: filtroDocumentoPaciente,
        color: 'green' 
      });
    }
    if (filtroCodigoCups) {
      filtros.push({ 
        label: 'Código CUPS', 
        value: filtroCodigoCups,
        color: 'cyan' 
      });
    }
    if (filtroMedico) {
      filtros.push({ 
        label: 'Médico', 
        value: filtroMedico,
        color: 'violet' 
      });
    }
    if (filtroProcedimiento) {
      filtros.push({ 
        label: 'Procedimiento', 
        value: filtroProcedimiento,
        color: 'orange' 
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
            {/* Filtros de fecha */}
            <Group grow align="flex-start">
              <TextInput
                type="date"
                label="Fecha Inicio"
                placeholder="Seleccionar fecha inicio"
                value={fechaInicio}
                onChange={(e) => onFechaInicioChange(e.currentTarget.value)}
              />
              <TextInput
                type="date"
                label="Fecha Fin"
                placeholder="Seleccionar fecha fin"
                value={fechaFin}
                onChange={(e) => onFechaFinChange(e.currentTarget.value)}
              />
            </Group>

            {/* Filtros de búsqueda de texto */}
            <Group grow>
              <TextInput
                label="Documento Paciente"
                placeholder="Buscar por documento..."
                value={filtroDocumentoPaciente}
                onChange={(e) => onDocumentoChange(e.currentTarget.value)}
                leftSection={<IconFilter size={16} />}
              />
              <TextInput
                label="Código CUPS"
                placeholder="Buscar por código CUPS..."
                value={filtroCodigoCups}
                onChange={(e) => onCodigoCupsChange(e.currentTarget.value)}
                leftSection={<IconFilter size={16} />}
              />
            </Group>

            <Group grow>
              <TextInput
                label="Médico"
                placeholder="Buscar por médico..."
                value={filtroMedico}
                onChange={(e) => onMedicoChange(e.currentTarget.value)}
                leftSection={<IconFilter size={16} />}
              />
              <TextInput
                label="Procedimiento"
                placeholder="Buscar por procedimiento..."
                value={filtroProcedimiento}
                onChange={(e) => onProcedimientoChange(e.currentTarget.value)}
                leftSection={<IconFilter size={16} />}
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

export default CitasFilters;
