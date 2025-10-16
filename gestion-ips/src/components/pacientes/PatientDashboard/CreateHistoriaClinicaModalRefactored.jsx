import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useHistoriaClinica } from '../../../presentation/hooks/useHistoriaClinica.js';
import {
  InformacionBasicaSection,
  InformacionMedicaSection,
  InformacionConsultaSection,
  AntecedentesClinicosSection,
  ExamenClinicoSection,
  DiagnosticoTratamientoSection,
  FirmaDigitalSection
} from '../../../presentation/components/historiaClinica/index.js';

const CreateHistoriaClinicaModalRefactored = ({ isOpen, onClose, onHistoriaCreated, pacienteId, citaId, citaData }) => {
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
    if (isOpen && pacienteId && citaData) {
      initializeFromCita(pacienteId, citaData);
    }
  }, [isOpen, pacienteId, citaData, initializeFromCita]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await createHistoriaClinica(citaId);
      onHistoriaCreated && onHistoriaCreated(result);
      onClose();
    } catch (err) {
      // Error ya manejado en el hook
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-3/4 h-3/4">
          {/* Header */}
          <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Nueva Historia Clínica</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
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
        </div>
      </div>
    </div>
  );
};

export default CreateHistoriaClinicaModalRefactored;