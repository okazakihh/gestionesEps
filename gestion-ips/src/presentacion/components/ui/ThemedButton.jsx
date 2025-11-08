/**
 * ThemedButton - Botón con estilo basado en el tema activo
 */

import React from 'react';
import { Button } from '@mantine/core';
import { useTheme } from '../../../negocio/contexts/ThemeContext.jsx';

export const ThemedButton = ({ 
  children, 
  variant = 'filled', 
  gradient = true,
  ...props 
}) => {
  const { tema } = useTheme();

  const getStyles = () => {
    if (variant === 'filled' && gradient) {
      return {
        root: {
          background: tema.gradient,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 12px ${tema.primaryColor}40`
          },
          transition: 'all 0.2s ease'
        }
      };
    }
    
    return {};
  };

  return (
    <Button
      variant={variant}
      color={tema.mantineColor}
      styles={getStyles()}
      {...props}
    >
      {children}
    </Button>
  );
};
