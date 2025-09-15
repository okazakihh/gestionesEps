import React, { useState, useEffect } from 'react';
import { ConsultaMedicaDTO, ConsultaSearchParams } from '../../types/pacientes';
import { consultasApiService } from '../../services/pacientesApiService';
import ServiceAlert from '../ui/ServiceAlert';

const ConsultasMedicasComponent: React.FC = () => {
  const [consultas, setConsultas] = useState<ConsultaMedicaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<ConsultaSearchParams>({
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
      const error = err as any;
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

  const handleSearch = (value: string) => {
    setSearchParams(prev => ({
      ...prev,
      medicoTratante: value || undefined
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consultas Médicas</h2>
          <p className="mt-1 text-sm text-gray-600">Registro y seguimiento de consultas médicas</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
          Nueva Consulta
        </button>
      </div>

      {/* Service Alert */}
      {connectionError && (
        <ServiceAlert
          type="error"
          title="Error de Conexión"
          message="No se pudo conectar con el servicio de consultas médicas. Verifique que el servidor esté ejecutándose en el puerto 8082."
          onRetry={loadConsultas}
          retryLabel="Reintentar Conexión"
        />
      )}

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por médico tratante..."
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Cargando consultas médicas...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Médico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Especialidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consultas.map((consulta) => (
                    <tr key={consulta.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(consulta.detalleConsulta.fechaConsulta).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {consulta.pacienteNombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {consulta.informacionMedico.medicoTratante}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {consulta.informacionMedico.especialidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {consulta.detalleConsulta.tipoConsulta}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button className="text-purple-600 hover:text-purple-900">
                          Ver
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {consultas.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron consultas médicas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultasMedicasComponent;