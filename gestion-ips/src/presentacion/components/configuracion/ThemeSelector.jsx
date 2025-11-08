/**
 * ThemeSelector - Componente para seleccionar el tema de la aplicación
 */

import React from 'react';
import { 
  Stack, 
  Title, 
  Text, 
  Paper, 
  Group, 
  Box,
  Button,
  Badge
} from '@mantine/core';
import { IconPalette, IconCheck } from '@tabler/icons-react';
import { useTheme } from '../../../negocio/contexts/ThemeContext.jsx';

export const ThemeSelector = () => {
  const { temaActual, tema, temas, cambiarTema } = useTheme();

  return (
    <Stack gap="lg">
      {/* Header */}
      <Stack gap="xs">
        <Title order={3}>
          <IconPalette size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Tema de la Aplicación
        </Title>
        <Text size="sm" c="dimmed">
          Personaliza los colores de la interfaz según tu preferencia
        </Text>
      </Stack>

      {/* Tema Actual */}
      <Paper p="md" withBorder style={{ background: tema.gradient }}>
        <Stack gap="xs">
          <Text size="sm" fw={600} c="white">
            Tema Actual
          </Text>
          <Text size="lg" fw={700} c="white">
            {tema.nombre}
          </Text>
        </Stack>
      </Paper>

      {/* Selector de Temas */}
      <Stack gap="md">
        <Text fw={600} size="sm">
          Temas Disponibles
        </Text>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {Object.entries(temas).map(([key, temaOption]) => {
            const isActive = key === temaActual;
            
            return (
              <Paper
                key={key}
                p="md"
                withBorder
                style={{
                  cursor: 'pointer',
                  borderColor: isActive ? temaOption.primaryColor : '#e0e0e0',
                  borderWidth: isActive ? 2 : 1,
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => cambiarTema(key)}
              >
                <Stack gap="sm">
                  {/* Indicador de tema activo */}
                  {isActive && (
                    <Badge
                      color="green"
                      variant="filled"
                      size="sm"
                      leftSection={<IconCheck size={12} />}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8
                      }}
                    >
                      Activo
                    </Badge>
                  )}

                  {/* Muestra del gradiente */}
                  <Box
                    style={{
                      height: 80,
                      borderRadius: 8,
                      background: temaOption.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Text size="sm" fw={700} c="white">
                      {temaOption.nombre}
                    </Text>
                  </Box>

                  {/* Colores */}
                  <Group gap="xs" justify="center">
                    <Box
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 4,
                        backgroundColor: temaOption.primaryColor,
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Box
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 4,
                        backgroundColor: temaOption.secondaryColor,
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                  </Group>

                  {/* Botón */}
                  <Button
                    variant={isActive ? 'filled' : 'light'}
                    size="xs"
                    fullWidth
                    style={{
                      background: isActive ? temaOption.gradient : undefined
                    }}
                    disabled={isActive}
                  >
                    {isActive ? 'Seleccionado' : 'Seleccionar'}
                  </Button>
                </Stack>
              </Paper>
            );
          })}
        </div>
      </Stack>

      {/* Info adicional */}
      <Paper p="md" withBorder style={{ backgroundColor: '#f8f9fa' }}>
        <Stack gap="xs">
          <Text size="sm" fw={600}>
            💡 Información
          </Text>
          <Text size="xs" c="dimmed">
            El tema se aplicará inmediatamente en toda la aplicación y se guardará automáticamente para tus próximas sesiones.
          </Text>
        </Stack>
      </Paper>
    </Stack>
  );
};
