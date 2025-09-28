import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HistoriaClinicaDTO, HistoriaClinicaSearchParams } from '../../types/pacientes.js';
import { historiasClinicasApiService } from '../../services/pacientesApiService.js';
import { MainLayout } from '../../components/ui/MainLayout.jsx';
import ServiceAlert from '../../components/ui/ServiceAlert.jsx';

const HistoriasClinicasPage = () => {
  const [historias, setHistorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const [searchParams, setSearchParams] = useState({
    page: 0,
    size: 10
  });

  useEffect(() => {
    loadHistorias();
  }, [searchParams]);

  const loadHistorias = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);
      const response = await historiasClinicasApiService.getHistoriasClinicas(searchParams);
      setHistorias(response.content || []);
    } catch (err) {
      const error = err;
      // Detectar errores de conexión
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setConnectionError(true);
        setError('No se pudo conectar con el servicio de historias clínicas. Verifique que el servidor esté ejecutándose.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar historias clínicas');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (numeroHistoria) => {
    setSearchParams(prev => ({
      ...prev,
      numeroHistoria: numeroHistoria || undefined,
      page: 0
    }));
  };

  if (loading) {
    return (
      <MainLayout title="Historias Clínicas" subtitle="Cargando...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Historias Clínicas" subtitle="Error">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar historias clínicas
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
              <div className="mt-4">
                <button
                  onClick={loadHistorias}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Historias Clínicas" subtitle="Ver y gestionar historias clínicas electrónicas">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Historias Clínicas</h1>
            <p className="mt-2 text-sm text-gray-700">
              Gestión de historias clínicas electrónicas conforme a la Resolución 1995 de 1999.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              to="/pacientes/historias/nueva"
              className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Nueva Historia Clínica
            </Link>
          </div>
        </div>

        {/* Service Alert */}
        {connectionError && (
          <div className="mt-6">
            <ServiceAlert
              type="error"
              title="Error de Conexión"
              message="No se pudo conectar con el microservicio de historias clínicas. Verifique que el servidor esté ejecutándose en el puerto 8082."
              onRetry={loadHistorias}
              retryLabel="Reintentar Conexión"
            />
          </div>
        )}

        {/* Search */}
        <div className="mt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por número de historia..."
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        N° Historia
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Paciente
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Fecha Apertura
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Médico Responsable
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Estado
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {historias.map((historia) => (
                      <tr key={historia.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {historia.numeroHistoria}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {historia.pacienteNombre}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {historia.fechaCreacion ? new Date(historia.fechaCreacion).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {historia.informacionMedico?.medicoResponsable || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            historia.activa
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {historia.activa ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            to={`/pacientes/historias/${historia.id}`}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Ver
                          </Link>
                          <Link
                            to={`/pacientes/historias/${historia.id}/editar`}
                            className="text-green-600 hover:text-green-900"
                          >
                            Editar
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {historias.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron historias clínicas.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default HistoriasClinicasPage;