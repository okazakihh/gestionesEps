import React from 'react';
import { useAuth } from '@/context/AuthContext';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Panel Administrador</h1>
      <p className="mb-4 text-gray-600">Solo usuarios con rol ADMIN pueden ver esto.</p>
      <div className="bg-white shadow rounded p-4">
        <h2 className="font-semibold mb-2">Resumen</h2>
        <ul className="text-sm text-gray-700 list-disc list-inside">
          <li>ID Usuario: {user?.id}</li>
          <li>Rol: {user?.rol}</li>
          <li>Email: {user?.email}</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminPage;
