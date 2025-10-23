import React from 'react';
import { useAuth } from '../../../data/context/AuthContext.jsx';
import { useNavigationStore } from '../../../data/stores/navigationStore.js';
import { SPANavbar } from '../navigation/SPANavbar.jsx';

export const SPALayout = ({
  children,
  title,
  subtitle
}) => {
  const { isAuthenticated } = useAuth();
  const { currentView } = useNavigationStore();

  // Si no está autenticado y no está en login, no mostrar navbar
  if (!isAuthenticated && currentView !== 'login') {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // Si está en login, mostrar solo el contenido
  if (currentView === 'login') {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  // Layout principal con navbar para usuarios autenticados
  return (
    <div className="flex h-screen bg-gray-50">
      {/* SPA Navbar */}
      <SPANavbar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {(title || subtitle) && (
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              {title && (
                <h1 className="text-2xl font-semibold text-gray-900">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
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
