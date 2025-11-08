/**
 * Contexto de Tema
 * Gestiona los colores y tema de la aplicación de forma dinámica
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { setThemeForSwal } from '../utils/themedSwal.js';

// Temas predefinidos
export const TEMAS_DISPONIBLES = {
  purpura: {
    nombre: 'Púrpura',
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    mantineColor: 'violet'
  },
  azul: {
    nombre: 'Azul',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    mantineColor: 'blue'
  },
  verde: {
    nombre: 'Verde',
    primaryColor: '#10b981',
    secondaryColor: '#047857',
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    mantineColor: 'green'
  },
  naranja: {
    nombre: 'Naranja',
    primaryColor: '#f97316',
    secondaryColor: '#ea580c',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    mantineColor: 'orange'
  },
  rosa: {
    nombre: 'Rosa',
    primaryColor: '#ec4899',
    secondaryColor: '#db2777',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    mantineColor: 'pink'
  },
  cyan: {
    nombre: 'Cyan',
    primaryColor: '#06b6d4',
    secondaryColor: '#0891b2',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    mantineColor: 'cyan'
  }
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Cargar tema desde localStorage o usar púrpura por defecto
  const [temaActual, setTemaActual] = useState(() => {
    const savedTheme = localStorage.getItem('app_theme');
    return savedTheme || 'cyan';
  });

  // Guardar tema en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('app_theme', temaActual);
  }, [temaActual]);

  const tema = TEMAS_DISPONIBLES[temaActual];

  // Configurar SweetAlert2 con el tema actual
  useEffect(() => {
    setThemeForSwal(tema);
  }, [tema]);

  const cambiarTema = (nuevoTema) => {
    if (TEMAS_DISPONIBLES[nuevoTema]) {
      setTemaActual(nuevoTema);
    }
  };

  const value = {
    temaActual,
    tema,
    temas: TEMAS_DISPONIBLES,
    cambiarTema
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  
  return context;
};
