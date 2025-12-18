import React, { useState, useEffect } from 'react';
import { VerticalNavbar } from './VerticalNavbar.jsx';
import { Badge } from '@mantine/core';
import { IconFlask, IconRocket } from '@tabler/icons-react';

export const MainLayout = ({
  children,
  title,
  subtitle
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siigoMode, setSiigoMode] = useState('DEV');

  // Detectar cambios en el modo de Siigo
  useEffect(() => {
    const checkSiigoMode = () => {
      try {
        const config = localStorage.getItem('IPS_INFO');
        if (config) {
          const parsedConfig = JSON.parse(config);
          const configData = typeof parsedConfig.jsonData === 'string' 
            ? JSON.parse(parsedConfig.jsonData) 
            : parsedConfig.jsonData || parsedConfig;
          
          setSiigoMode(configData.siigoMode || 'DEV');
        }
      } catch (error) {
        console.error('Error leyendo modo Siigo:', error);
      }
    };

    // Revisar al montar
    checkSiigoMode();

    // Revisar cada 2 segundos por cambios
    const interval = setInterval(checkSiigoMode, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <VerticalNavbar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {(title || subtitle) && (
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-4 sm:px-6 py-4 flex items-center">
              {/* Botón hamburguesa para móvil */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-3 p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="flex-1">
                {title && (
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Badge de Modo Siigo */}
              <Badge 
                size="lg"
                color={siigoMode === 'DEV' ? 'blue' : 'red'}
                leftSection={siigoMode === 'DEV' ? <IconFlask size={16} /> : <IconRocket size={16} />}
                style={{ 
                  marginLeft: '16px',
                  animation: siigoMode === 'PROD' ? 'pulse 2s infinite' : 'none'
                }}
              >
                Siigo: {siigoMode === 'DEV' ? '🧪 DEV' : '🚀 PROD'}
              </Badge>
            </div>
          </header>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
