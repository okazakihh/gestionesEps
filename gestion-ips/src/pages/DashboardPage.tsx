import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { MainLayout } from '@/components/ui/MainLayout';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <MainLayout
      title="Dashboard"
      subtitle="Bienvenido al Sistema de Gestión IPS"
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Contenido existente */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Login Exitoso!
              </h2>
              <p className="text-gray-600 mb-6">
                La conexión entre el frontend y backend está funcionando correctamente.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  Información del Usuario Autenticado:
                </h3>
                <div className="text-left text-sm text-green-700">
                  <p><strong>ID:</strong> {user?.id}</p>
                  <p><strong>Nombre:</strong> {user?.nombres} {user?.apellidos}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Rol:</strong> {user?.rol}</p>
                  <p><strong>IPS:</strong> {user?.ips}</p>
                  <p><strong>Estado:</strong> {user?.activo ? 'Activo' : 'Inactivo'}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-800 mb-2">
                  Estado de Servicios:
                </h3>
                <div className="text-sm text-blue-700">
                  <p>✅ Frontend React: http://localhost:5173</p>
                  <p>✅ Backend Spring Boot: http://localhost:8080/api</p>
                  <p>✅ PostgreSQL: localhost:5432</p>
                  <p>✅ Autenticación JWT: Funcionando</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-semibold text-gray-900">--</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">🏥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                  <p className="text-2xl font-semibold text-gray-900">--</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                  <p className="text-2xl font-semibold text-gray-900">--</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reportes</p>
                  <p className="text-2xl font-semibold text-gray-900">--</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Placeholder */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Actividad Reciente
            </h3>
            <div className="text-center text-gray-500 py-8">
              <p>No hay actividad reciente para mostrar</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
