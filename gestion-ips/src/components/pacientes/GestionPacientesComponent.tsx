import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PacienteDTO, PacienteSearchParams } from '../../types/pacientes';
import { pacientesApiService } from '../../services/pacientesApiService';
import ServiceAlert from '../ui/ServiceAlert';

const GestionPacientesComponent: React.FC = () => {
  const [pacientes, setPacientes] = useState<PacienteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<PacienteSearchParams>({
    page: 0,
    size: 10
  });

  useEffect(() => {
    loadPacientes();
  }, [searchParams]);

  const loadPacientes = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);
      const response = await pacientesApiService.getPacientes(searchParams);
      setPacientes(response.content || []);
    } catch (err) {
      const error = err as any;
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setConnectionError(true);
        setError('No se pudo conectar con el servicio de pacientes. Verifique que el servidor esté ejecutándose.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar pacientes');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchParams(prev => ({
      ...prev,
      search: value || undefined
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Pacientes</h2>
          <p className="mt-1 text-sm text-gray-600">Administra la información de los pacientes del sistema</p>
        </div>
        <Link
          to="/pacientes/nuevo"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Nuevo Paciente
        </Link>
      </div>

      {/* Service Alert */}
      {connectionError && (
        <ServiceAlert
          type="error"
          title="Error de Conexión"
          message="No se pudo conectar con el servicio de pacientes. Verifique que el servidor esté ejecutándose en el puerto 8082."
          onRetry={loadPacientes}
          retryLabel="Reintentar Conexión"
        />
      )}

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por número de documento..."
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Cargando pacientes...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pacientes.map((paciente) => (
                    <tr key={paciente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {paciente.numeroDocumento}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {paciente.informacionPersonal?.primerNombre} {paciente.informacionPersonal?.primerApellido}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {paciente.edad || 'N/A'} años
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {paciente.informacionContacto?.telefono || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          paciente.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {paciente.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          to={`/pacientes/${paciente.id}/editar`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </Link>
                        <button className="text-gray-600 hover:text-gray-900">
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pacientes.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron pacientes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionPacientesComponent;