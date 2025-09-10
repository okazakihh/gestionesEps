import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/ui/MainLayout';
import { UsuariosTable } from '@/components/ui/UsuariosTable';
import { usuarioApiService } from '@/services/usuarioApiService';
import { Usuario } from '@/types';
import CreateUserForm from '@/components/auth/CreateUserForm';

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await usuarioApiService.getAllUsuarios();

      if (response.success && response.data) {
        setUsuarios(response.data);
      } else {
        setError(response.error || 'Error al cargar usuarios');
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error de conexión al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    // TODO: Implementar edición de usuario
    console.log('Editar usuario:', usuario);
  };

  const handleDelete = (usuario: Usuario) => {
    // TODO: Implementar eliminación de usuario
    console.log('Eliminar usuario:', usuario);
  };

  const handleCreateUser = (data: any) => {
    console.log('User data submitted:', data);
    // TODO: Implement user creation logic here
  };

  return (
    <MainLayout title="Gestión de Usuarios" subtitle="Administrar usuarios del sistema">
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Lista de Usuarios</h2>
            <p className="text-sm text-gray-600 mt-1">
              {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} encontrado{usuarios.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={loadUsuarios}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isLoading ? 'Cargando...' : 'Actualizar'}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Registrar Usuario
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error al cargar usuarios
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        <UsuariosTable
          usuarios={usuarios}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
              <CreateUserForm onSubmit={handleCreateUser} />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UsuariosPage;
