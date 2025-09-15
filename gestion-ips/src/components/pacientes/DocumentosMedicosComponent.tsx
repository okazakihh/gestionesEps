import React, { useState, useEffect } from 'react';
import { DocumentoMedicoDTO } from '../../types/pacientes';
import { documentosApiService } from '../../services/pacientesApiService';
import ServiceAlert from '../ui/ServiceAlert';

const DocumentosMedicosComponent: React.FC = () => {
  const [documentos, setDocumentos] = useState<DocumentoMedicoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState({
    page: 0,
    size: 10
  });

  useEffect(() => {
    loadDocumentos();
  }, [searchParams]);

  const loadDocumentos = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);
      const response = await documentosApiService.getDocumentos(searchParams);
      setDocumentos(response.content || []);
    } catch (err) {
      const error = err as any;
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setConnectionError(true);
        setError('No se pudo conectar con el servicio de documentos médicos. Verifique que el servidor esté ejecutándose.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar documentos médicos');
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
          <h2 className="text-2xl font-bold text-gray-900">Documentos Médicos</h2>
          <p className="mt-1 text-sm text-gray-600">Gestión de documentos médicos y resultados</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
          Subir Documento
        </button>
      </div>

      {/* Service Alert */}
      {connectionError && (
        <ServiceAlert
          type="error"
          title="Error de Conexión"
          message="No se pudo conectar con el servicio de documentos médicos. Verifique que el servidor esté ejecutándose en el puerto 8082."
          onRetry={loadDocumentos}
          retryLabel="Reintentar Conexión"
        />
      )}

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre de documento..."
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Cargando documentos médicos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tamaño
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documentos.map((documento) => (
                    <tr key={documento.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {documento.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {documento.tipo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {documento.descripcion || 'Sin descripción'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {documento.fechaCreacion ? new Date(documento.fechaCreacion).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {/* Aquí iría el tamaño del archivo si estuviera disponible */}
                        -
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button className="text-orange-600 hover:text-orange-900">
                          Descargar
                        </button>
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

          {documentos.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron documentos médicos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentosMedicosComponent;