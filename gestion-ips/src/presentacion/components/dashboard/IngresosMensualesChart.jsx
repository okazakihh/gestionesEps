/**
 * IngresosMensualesChart.jsx
 * 
 * Componente para mostrar gráfica de ingresos mensuales
 * 
 * Capa: Presentación
 */

import React from 'react';
import { Card, Text, Group, Stack, Skeleton } from '@mantine/core';
import { IconChartBar } from '@tabler/icons-react';

/**
 * Gráfica simple de ingresos mensuales (usando barras CSS)
 */
export const IngresosMensualesChart = ({ datos = [], loading = false }) => {
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calcular el máximo para escalar las barras
  const maxIngresos = Math.max(...datos.map(d => d.ingresos), 1);

  if (loading) {
    return (
      <Card withBorder padding="lg" radius="md">
        <Text size="lg" fw={700} mb="md">Ingresos Mensuales</Text>
        <Group gap="xs" align="flex-end" style={{ height: '200px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} height={Math.random() * 150 + 50} style={{ flex: 1 }} />
          ))}
        </Group>
      </Card>
    );
  }

  if (datos.length === 0) {
    return (
      <Card withBorder padding="lg" radius="md">
        <Text size="lg" fw={700} mb="md">Ingresos Mensuales</Text>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
          <IconChartBar size={48} stroke={1.5} />
          <Text size="sm" c="dimmed" mt="sm">
            No hay datos de ingresos
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Card withBorder padding="lg" radius="md">
      <Text size="lg" fw={700} mb="md">Ingresos Mensuales (Últimos 6 meses)</Text>
      
      {/* Gráfica de barras simple */}
      <div style={{ height: '250px', position: 'relative' }}>
        <Group gap="xs" align="flex-end" style={{ height: '100%' }}>
          {datos.map((dato, index) => {
            const altura = maxIngresos > 0 ? (dato.ingresos / maxIngresos) * 200 : 0;
            
            return (
              <Stack 
                key={dato.mes} 
                gap={4} 
                style={{ 
                  flex: 1, 
                  alignItems: 'center',
                  justifyContent: 'flex-end'
                }}
              >
                {/* Valor */}
                <Text 
                  size="xs" 
                  fw={600} 
                  c="dimmed"
                  style={{ 
                    opacity: altura > 30 ? 1 : 0,
                    transition: 'opacity 0.3s'
                  }}
                >
                  {dato.ingresos > 0 ? formatCurrency(dato.ingresos) : ''}
                </Text>
                
                {/* Barra */}
                <div
                  style={{
                    width: '100%',
                    height: `${altura}px`,
                    backgroundColor: index === datos.length - 1 ? '#3b82f6' : '#93c5fd',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  title={`${dato.mes}: ${formatCurrency(dato.ingresos)} (${dato.facturas} facturas)`}
                >
                  {/* Tooltip hover */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#1f2937',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      whiteSpace: 'nowrap',
                      opacity: 0,
                      pointerEvents: 'none',
                      transition: 'opacity 0.2s'
                    }}
                    className="tooltip-content"
                  >
                    {dato.facturas} {dato.facturas === 1 ? 'factura' : 'facturas'}
                  </div>
                </div>
                
                {/* Etiqueta del mes */}
                <Text 
                  size="xs" 
                  c="dimmed" 
                  style={{ 
                    marginTop: '4px',
                    textTransform: 'capitalize'
                  }}
                >
                  {dato.mes}
                </Text>
              </Stack>
            );
          })}
        </Group>
      </div>

      {/* CSS para hover tooltip */}
      <style>{`
        div:hover > .tooltip-content {
          opacity: 1 !important;
        }
      `}</style>
    </Card>
  );
};

export default IngresosMensualesChart;
