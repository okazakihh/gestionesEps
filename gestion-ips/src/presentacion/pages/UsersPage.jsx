import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MainLayout } from '../components/ui/MainLayout.jsx';
import CreateUserForm from '../components/auth/CreateUserForm.jsx';
import { Modal, Table, Badge, ActionIcon, Group, Text, TextInput, Button, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Usuario } from '../../data/types/index.js';
import Swal from 'sweetalert2';

const UsuariosPage = () => {
  const location = useLocation();
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [confirmationText, setConfirmationText] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    loadUsuarios();
  }, []);

  // Check for employee data from navigation state
  useEffect(() => {
    if (location.state?.createUserFromEmployee && location.state?.employeeData) {
      console.log('📥 Datos del empleado recibidos:', location.state.employeeData);
      setEmployeeData(location.state.employeeData);
      setIsModalOpen(true);
      // Clear the state to prevent re-opening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Effect to filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsuarios(usuarios);
    } else {
      const filtered = usuarios.filter(usuario => 
        usuario.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.personalInfo?.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.personalInfo?.apellidos?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsuarios(filtered);
    }
  }, [usuarios, searchTerm]);

  const loadUsuarios = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Import the service dynamically to avoid circular dependency issues
      const { usuarioApiService } = await import('../../data/services/usuarioApiService.js');
      const response = await usuarioApiService.getAllUsuarios();

      if (response.success && response.data) {
        setUsuarios(response.data);
      } else {
        setError(response.error || 'Error al cargar usuarios');
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error de conexión al cargar usuarios');

      // Mostrar SweetAlert para error de carga
      await Swal.fire({
        icon: 'error',
        title: 'Error al Cargar Usuarios',
        text: 'No se pudieron cargar los usuarios. Verifica tu conexión a internet.',
        confirmButtonColor: '#EF4444',
        footer: 'Si el problema persiste, contacta al administrador del sistema.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (usuario) => {
    setUserToEdit(usuario);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = (usuario) => {
    setUserToDelete(usuario);
    setConfirmationText('');
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    const expectedUsername = userToDelete.username || userToDelete.email;
    if (confirmationText !== expectedUsername) {
      notifications.show({
        title: 'Error de confirmación',
        message: 'El texto ingresado no coincide con el nombre de usuario',
        color: 'orange',
        autoClose: 5000,
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const { usuarioApiService } = await import('../../data/services/usuarioApiService.js');
      const response = await usuarioApiService.deleteUsuario(expectedUsername);
      
      if (response.success) {
        // Mostrar SweetAlert de éxito
        await Swal.fire({
          icon: 'success',
          title: '¡Usuario Eliminado!',
          text: `El usuario ${expectedUsername} ha sido eliminado correctamente.`,
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });

        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        setConfirmationText('');
        await loadUsuarios();
      } else {
        throw new Error(response.error || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);

      // Mostrar SweetAlert para error de eliminación
      await Swal.fire({
        icon: 'error',
        title: 'Error al Eliminar Usuario',
        text: 'No se pudo eliminar el usuario seleccionado.',
        confirmButtonColor: '#EF4444',
        footer: 'Verifica que el usuario no tenga dependencias activas.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    setConfirmationText('');
  };

  const handleCreateUser = async (data) => {
    try {
      setIsLoading(true);
      
      if (isEditMode && userToEdit) {
        // Update existing user
        const { usuarioApiService } = await import('../../data/services/usuarioApiService.js');
        const response = await usuarioApiService.updateUsuario(userToEdit.username || userToEdit.email, data);
        
        if (response.success) {
          // Mostrar SweetAlert de éxito
          await Swal.fire({
            icon: 'success',
            title: '¡Usuario Actualizado!',
            text: 'Los datos del usuario se han actualizado correctamente.',
            confirmButtonColor: '#10B981',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });

          // Close modal and refresh user list
          setIsModalOpen(false);
          setIsEditMode(false);
          setUserToEdit(null);
          await loadUsuarios();
        } else {
          throw new Error(response.error || 'Error al actualizar usuario');
        }
      } else {
        // Create new user
        const { AuthService } = await import('../../data/services/authService.js');
        const response = await AuthService.register(data);
        
        console.log('Usuario registrado exitosamente:', response);

        // Mostrar SweetAlert de éxito
        await Swal.fire({
          icon: 'success',
          title: '¡Usuario Registrado!',
          text: 'El usuario ha sido registrado correctamente.',
          confirmButtonColor: '#10B981',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });

        // Close modal and refresh user list
        setIsModalOpen(false);
        await loadUsuarios();
      }
      
    } catch (error) {
      console.error('Error al procesar usuario:', error);

      // Mostrar SweetAlert para error de creación/actualización
      await Swal.fire({
        icon: 'error',
        title: isEditMode ? 'Error al Actualizar Usuario' : 'Error al Registrar Usuario',
        text: error.message || 'Ha ocurrido un error inesperado.',
        confirmButtonColor: '#EF4444',
        footer: isEditMode ? 'Verifica los datos e intenta nuevamente.' : 'Verifica que el usuario no exista y que todos los campos sean válidos.'
      });

      setError(error.message || (isEditMode ? 'Error al actualizar usuario' : 'Error al registrar usuario'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setUserToEdit(null);
    setEmployeeData(null);
  };

  return (
    <MainLayout title="Gestión de Usuarios" subtitle="Administrar usuarios del sistema">
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Lista de Usuarios</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredUsuarios.length} de {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} {searchTerm ? 'encontrado' : 'mostrado'}{filteredUsuarios.length !== 1 ? 's' : ''}
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

        {/* Search Bar */}
        <div className="mb-6">
          <div className="max-w-md">
            <TextInput
              placeholder="Buscar por usuario, email, nombres o apellidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftSection={
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              rightSection={
                searchTerm && (
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => setSearchTerm('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                )
              }
            />
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

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre</Table.Th>
              <Table.Th>Usuario</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Rol</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={5} style={{ textAlign: 'center' }}>
                  Cargando usuarios...
                </Table.Td>
              </Table.Tr>
            ) : filteredUsuarios.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} className="text-center py-8 text-gray-500">
                  {searchTerm ? `No se encontraron usuarios que coincidan con "${searchTerm}"` : 'No hay usuarios registrados'}
                </Table.Td>
              </Table.Tr>
            ) : (
              filteredUsuarios.map((usuario) => (
                <Table.Tr key={usuario.id}>
                  <Table.Td>
                    {`${usuario.personalInfo?.nombres || usuario.nombres || ''} ${usuario.personalInfo?.apellidos || usuario.apellidos || ''}`}
                  </Table.Td>
                  <Table.Td>{usuario.username}</Table.Td>
                  <Table.Td>{usuario.email}</Table.Td>
                  <Table.Td>
                    <Badge color={
                      (usuario.roles?.[0] || usuario.rol?.toString()) === 'ADMIN' ? 'red' :
                      (usuario.roles?.[0] || usuario.rol?.toString()) === 'DOCTOR' ? 'green' :
                      (usuario.roles?.[0] || usuario.rol?.toString()) === 'ADMINISTRATIVO' ? 'blue' :
                      (usuario.roles?.[0] || usuario.rol?.toString()) === 'AUXILIAR_ADMINISTRATIVO' ? 'cyan' :
                      (usuario.roles?.[0] || usuario.rol?.toString()) === 'AUXILIAR_MEDICO' ? 'lime' : 'gray'
                    }>
                      {(() => {
                        const role = usuario.roles?.[0] || usuario.rol?.toString() || 'ADMINISTRATIVO';
                        const roleLabels = {
                          'ADMIN': 'Admin',
                          'ADMINISTRATIVO': 'Administrativo',
                          'AUXILIAR_ADMINISTRATIVO': 'Aux. Admin',
                          'DOCTOR': 'Doctor',
                          'AUXILIAR_MEDICO': 'Aux. Médico'
                        };
                        return roleLabels[role] || role;
                      })()}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        size="sm"
                        onClick={() => handleEdit(usuario)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        size="sm"
                        onClick={() => handleDelete(usuario)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>

        <Modal
          opened={isModalOpen}
          onClose={handleCloseModal}
          title=""
          size="xl"
          centered
        >
          <CreateUserForm
            onSubmit={handleCreateUser}
            initialData={employeeData || (isEditMode ? userToEdit : undefined)}
            isEditMode={isEditMode}
            isFromEmployee={!!employeeData}
          />
        </Modal>

        {/* Modal de confirmación para eliminar usuario */}
        <Modal
          opened={isDeleteModalOpen}
          onClose={cancelDelete}
          title="Confirmar eliminación de usuario"
          size="md"
          centered
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Esta acción no se puede deshacer. Para confirmar la eliminación, 
              escriba el nombre de usuario exacto del usuario que desea eliminar.
            </Text>
            
            {userToDelete && (
              <Text fw={500} size="sm">
                Usuario a eliminar: <Text span c="red" fw={700}>
                  {userToDelete.username || userToDelete.email}
                </Text>
              </Text>
            )}
            
            <TextInput
              label="Confirme escribiendo el nombre de usuario"
              placeholder={userToDelete?.username || userToDelete?.email || ''}
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              error={confirmationText && confirmationText !== (userToDelete?.username || userToDelete?.email) ? 
                'El texto no coincide' : undefined}
            />
            
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={cancelDelete}>
                Cancelar
              </Button>
              <Button 
                color="red" 
                onClick={confirmDelete}
                disabled={confirmationText !== (userToDelete?.username || userToDelete?.email)}
                loading={isLoading}
              >
                Eliminar Usuario
              </Button>
            </Group>
          </Stack>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default UsuariosPage;
