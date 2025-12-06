import React, { useState } from 'react';
import { VerticalNavbar } from './VerticalNavbar.jsx';

export const MainLayout = ({
  children,
  title,
  subtitle
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <VerticalNavbar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
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
