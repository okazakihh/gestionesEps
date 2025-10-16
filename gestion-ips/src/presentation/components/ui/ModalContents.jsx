/**
 * Contenidos específicos para el Modal Dinámico
 * Presentation Layer - UI Components
 */
import React from 'react';
import { useHistoriaClinica } from '../../hooks/useHistoriaClinica.js';
import {
  InformacionBasicaSection,
  InformacionMedicaSection,
  InformacionConsultaSection,
  AntecedentesClinicosSection,
  ExamenClinicoSection,
  DiagnosticoTratamientoSection,
  FirmaDigitalSection
} from '../historiaClinica/index.js';

// Contenido para previsualización de factura
export const FacturaPreviewContent = ({ data, onClose }) => {
  const { facturaPreview, guardarFactura } = data;

  if (!facturaPreview) return null;

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Información general de la factura */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Información de la Factura</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <strong>Número de Factura:</strong> {facturaPreview.numeroFactura}
            </div>
            <div>
              <strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-ES')}
            </div>
            <div>
              <strong>Total:</strong>
              <span className="text-lg font-bold text-green-600 ml-2">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0
                }).format(facturaPreview.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Tabla de servicios */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Servicios Facturados</h4>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      Paciente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                      Médico
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      Procedimiento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Código CUPS
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Fecha Atención
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {facturaPreview.citas.map((cita, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs text-gray-900">
                        <div className="font-medium text-xs leading-tight">{cita.paciente.nombre}</div>
                        <div className="text-xs text-gray-500 leading-tight">Doc: {cita.paciente.documento}</div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900">
                        <div className="break-words max-w-[160px] text-xs leading-tight">{cita.medico.nombre}</div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        <div className="break-words max-w-[180px] text-xs leading-tight">{cita.procedimiento}</div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500 font-mono">
                        {cita.codigoCups}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {new Date(cita.fechaAtencion).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-3 py-2 text-xs font-medium text-green-600 text-right">
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          minimumFractionDigits: 0
                        }).format(cita.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan="5" className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                      TOTAL:
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-green-600 text-right">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0
                      }).format(facturaPreview.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Información Importante</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Esta factura incluye {facturaPreview.citas.length} servicio(s) médico(s)</li>
            <li>• Una vez guardada la factura, las citas seleccionadas ya no aparecerán en la lista de citas atendidas</li>
            <li>• La factura tendrá estado "PENDIENTE" hasta que sea procesada</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          onClick={guardarFactura}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Guardar Factura
        </button>
      </div>
    </div>
  );
};

// Contenido para vista de factura
export const FacturaViewContent = ({ data, onClose }) => {
  const { facturaSeleccionada, handleProcesarFactura } = data;

  if (!facturaSeleccionada) return null;

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Información general de la factura */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Información de la Factura</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <strong>Número de Factura:</strong><br />
              {facturaSeleccionada.numeroFactura}
            </div>
            <div>
              <strong>Fecha de Emisión:</strong><br />
              {facturaSeleccionada.fechaEmision ? new Date(facturaSeleccionada.fechaEmision).toLocaleDateString('es-ES') : 'Fecha no disponible'}
            </div>
            <div>
              <strong>Estado:</strong><br />
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                facturaSeleccionada.estado === 'PAGADA'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {facturaSeleccionada.estado}
              </span>
            </div>
            <div>
              <strong>Total:</strong><br />
              <span className="text-lg font-bold text-green-600">
                {facturaSeleccionada.total ? new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0
                }).format(facturaSeleccionada.total) : '$ 0'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabla de servicios */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Servicios Facturados</h4>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      Paciente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                      Médico
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                      Procedimiento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Código CUPS
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      Fecha Atención
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {facturaSeleccionada.citas && facturaSeleccionada.citas.map((cita, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="font-medium">{cita.paciente.nombre}</div>
                        <div className="text-xs text-gray-500">Doc: {cita.paciente.documento}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="break-words max-w-[180px]">{cita.medico.nombre}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <div className="break-words max-w-[200px]">{cita.procedimiento}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 font-mono">
                        {cita.codigoCups}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {cita.fechaAtencion ? new Date(cita.fechaAtencion).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-green-600 text-right">
                        {cita.valor ? new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          minimumFractionDigits: 0
                        }).format(cita.valor) : '$ 0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan="5" className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                      TOTAL:
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-green-600 text-right">
                      {facturaSeleccionada.total ? new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0
                      }).format(facturaSeleccionada.total) : '$ 0'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Información del Registro</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <strong>ID de Registro:</strong> {facturaSeleccionada.id}
            </div>
            <div>
              <strong>Fecha de Creación:</strong> {facturaSeleccionada.fechaCreacion ? new Date(facturaSeleccionada.fechaCreacion).toLocaleDateString('es-ES') : 'Fecha no disponible'}
            </div>
            <div>
              <strong>Última Actualización:</strong> {facturaSeleccionada.fechaActualizacion ? new Date(facturaSeleccionada.fechaActualizacion).toLocaleDateString('es-ES') : 'Fecha no disponible'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cerrar
        </button>
        {facturaSeleccionada.estado === 'PENDIENTE' && (
          <button
            onClick={() => {
              onClose();
              handleProcesarFactura({
                id: facturaSeleccionada.id,
                jsonData: JSON.stringify({
                  numeroFactura: facturaSeleccionada.numeroFactura,
                  fechaEmision: facturaSeleccionada.fechaEmision,
                  citas: facturaSeleccionada.citas,
                  total: facturaSeleccionada.total,
                  estado: facturaSeleccionada.estado
                })
              });
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Procesar Factura
          </button>
        )}
      </div>
    </div>
  );
};

// Contenido para edición de valor CUPS
export const ValorCupsContent = ({ data, onClose }) => {
  const { selectedCodigoCups, valorInput, setValorInput, handleSaveValor } = data;

  if (!selectedCodigoCups) return null;

  return (
    <div className="p-6">
      <div className="space-y-4">
        {/* Información del código CUPS */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Código CUPS</h4>
          <p className="text-sm text-gray-600">{selectedCodigoCups.nombreCup}</p>
        </div>

        {/* Campo de valor */}
        <div>
          <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-2">
            Valor (COP)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
              $
            </span>
            <input
              type="number"
              id="valor"
              value={valorInput}
              onChange={(e) => setValorInput(e.target.value)}
              placeholder="0"
              min="0"
              step="1000"
              className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Ingrese el valor en pesos colombianos sin puntos ni comas
          </p>
        </div>

        {/* Vista previa del valor formateado */}
        {valorInput && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>Vista previa:</strong> {new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0
              }).format(parseFloat(valorInput) || 0)}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          onClick={handleSaveValor}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Guardar Valor
        </button>
      </div>
    </div>
  );
};

// Contenido para formulario de historia clínica
export const HistoriaClinicaFormContent = ({ data, onClose }) => {
  const { pacienteId, citaId, citaData } = data;

  // Hook personalizado para historia clínica
  const {
    formData,
    saving,
    error,
    validationErrors,
    initializeFromCita,
    handleInputChange,
    handleNestedInputChange,
    createHistoriaClinica,
    getFirmaPreview
  } = useHistoriaClinica();

  // Inicializar formulario cuando se abre el modal
  React.useEffect(() => {
    if (pacienteId && citaData) {
      initializeFromCita(pacienteId, citaData);
    }
  }, [pacienteId, citaData, initializeFromCita]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await createHistoriaClinica(citaId);
      onClose();
    } catch (err) {
      // Error ya manejado en el hook
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex items-center justify-center min-h-full">
        <div className="w-full max-w-3xl">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Información del Paciente */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-blue-900">Paciente</h4>
                <p className="text-xs text-blue-700 mt-1">
                  {citaData?.nombre || 'No disponible'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <InformacionBasicaSection
              formData={formData}
              handleInputChange={handleInputChange}
              validationErrors={validationErrors}
            />

            <InformacionMedicaSection
              formData={formData}
              handleNestedInputChange={handleNestedInputChange}
              validationErrors={validationErrors}
            />

            <InformacionConsultaSection
              formData={formData}
              handleNestedInputChange={handleNestedInputChange}
              validationErrors={validationErrors}
            />

            <AntecedentesClinicosSection
              formData={formData}
              handleNestedInputChange={handleNestedInputChange}
            />

            <ExamenClinicoSection
              formData={formData}
              handleNestedInputChange={handleNestedInputChange}
            />

            <DiagnosticoTratamientoSection
              formData={formData}
              handleNestedInputChange={handleNestedInputChange}
            />

            <FirmaDigitalSection
              formData={formData}
              handleNestedInputChange={handleNestedInputChange}
              getFirmaPreview={getFirmaPreview}
              validationErrors={validationErrors}
            />

            {/* Submit Buttons */}
            <div className="flex justify-end gap-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold leading-5 text-gray-900 px-3 py-1.5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Crear Historia Clínica'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};