import React from 'react';
import { MainLayout } from '@/presentacion/components/ui/MainLayout.jsx';
import GestionEmpleadosComponent from '@/presentacion/components/empleados/GestionEmpleadosComponent.jsx';

const EmpleadosPage = () => {
  return (
    <MainLayout title="Módulo de Empleados" subtitle="Gestión de empleados del sistema">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Gestión de Empleados</h1>
          <p className="mt-2 text-lg text-gray-600">
            Módulo completo para la administración de empleados
          </p>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg">
          <GestionEmpleadosComponent />
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Información del Sistema
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Este módulo permite la gestión completa de empleados, incluyendo
                  información personal, laboral y de contacto. Los datos se procesan
                  de forma segura y cumplen con las normativas de protección de datos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EmpleadosPage;