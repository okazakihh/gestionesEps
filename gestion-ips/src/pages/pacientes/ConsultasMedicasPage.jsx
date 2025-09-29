import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ConsultaMedicaDTO, ConsultaSearchParams } from '../../types/pacientes.js';
import { consultasApiService } from '../../services/pacientesApiService.js';
import { MainLayout } from '../../components/ui/MainLayout.jsx';
import ServiceAlert from '../../components/ui/ServiceAlert.jsx';

const ConsultasMedicasPage = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const [searchParams, setSearchParams] = useState({
    page: 0,
    size: 10
  });

  useEffect(() => {
    loadConsultas();
  }, [searchParams]);

  const loadConsultas = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);
      const response = await consultasApiService.getConsultas(searchParams);
      setConsultas(response.content || []);
    } catch (err) {
      const error = err;
      // Detectar errores de conexión
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setConnectionError(true);
        setError('No se pudo conectar con el servicio de consultas médicas. Verifique que el servidor esté ejecutándose.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar consultas médicas');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Consultas Médicas" subtitle="Cargando...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Consultas Médicas" subtitle="Error">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error al cargar consultas médicas
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
              <div className="mt-4">
                <button
                  onClick={loadConsultas}
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
    <MainLayout title="Consultas Médicas" subtitle="Administrar consultas y tratamientos">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Consultas Médicas</h1>
            <p className="mt-2 text-sm text-gray-700">
              Gestión de consultas médicas y planes de tratamiento.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Link
              to="/pacientes/consultas/nueva"
              className="inline-flex items-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
            >
              Nueva Consulta
            </Link>
          </div>
        </div>

        {/* Service Alert */}
        {connectionError && (
          <div className="mt-6">
            <ServiceAlert
              type="error"
              title="Error de Conexión"
              message="No se pudo conectar con el servicio de consultas médicas. Verifique que el servidor esté ejecutándose en el puerto 8082."
              onRetry={loadConsultas}
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
                placeholder="Buscar por médico tratante..."
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
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
                        Fecha
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Paciente
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Médico
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Especialidad
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Tipo Consulta
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {consultas.map((consulta) => {
                      // Parsear informacionMedico del JSON string
                      let informacionMedico = {};
                      try {
                        if (consulta.datosJson) {
                          const datosParsed = JSON.parse(consulta.datosJson);
                          informacionMedico = datosParsed.informacionMedico || {};
                        }
                      } catch (error) {
                        console.error('Error parsing consulta datosJson:', error);
                      }

                      return (
                        <tr key={consulta.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {consulta.fechaCreacion ? new Date(consulta.fechaCreacion).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {consulta.pacienteNombre || `Consulta #${consulta.id}`}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {informacionMedico.medicoTratante || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {informacionMedico.especialidad || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            General
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <Link
                              to={`/pacientes/consultas/${consulta.id}`}
                              className="text-purple-600 hover:text-purple-900 mr-4"
                            >
                              Ver
                            </Link>
                            <Link
                              to={`/pacientes/consultas/${consulta.id}/editar`}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Editar
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {consultas.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron consultas médicas.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ConsultasMedicasPage;