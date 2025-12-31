import React from 'react';

/**
 * Componente de layout para el Dashboard de Pacientes.
 * Define la estructura de dos columnas (sidebar y contenido principal).
 */
const DashboardLayout = ({ sidebar, mainContent }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Columna Izquierda (Sidebar) */}
      <div className="lg:col-span-1">
        {sidebar}
      </div>

      {/* Contenido Principal */}
      <div className="lg:col-span-3 space-y-6">
        {mainContent}
      </div>
    </div>
  );
};

export default DashboardLayout;
