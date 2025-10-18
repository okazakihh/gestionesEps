import React from 'react';

/**
 * ConsentimientoInformadoSection - Sección de consentimiento informado
 */
const ConsentimientoInformadoSection = ({ parsedData, validationErrors, onNestedInputChange, disabled = false }) => {
  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Consentimiento Informado</h3>
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            <p className="font-medium mb-2">
              Según la Ley 1581 de 2012 y normas relacionadas con historia clínica, 
              el paciente debe otorgar su consentimiento expreso para:
            </p>
          </div>

          <div className="space-y-3">
            {/* Tratamiento Médico */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="aceptaTratamiento"
                  type="checkbox"
                  checked={parsedData.consentimientoInformado?.aceptaTratamiento || false}
                  onChange={(e) => onNestedInputChange('consentimientoInformado', 'aceptaTratamiento', e.target.checked)}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="aceptaTratamiento" className="font-medium text-gray-700">
                  Tratamiento Médico <span className="text-red-500">*</span>
                </label>
                <p className="text-gray-500">
                  Acepto recibir atención médica y procedimientos diagnósticos necesarios para mi salud.
                </p>
                {validationErrors.consentimientoTratamiento && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.consentimientoTratamiento}</p>
                )}
              </div>
            </div>

            {/* Protección de Datos */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="aceptaPrivacidad"
                  type="checkbox"
                  checked={parsedData.consentimientoInformado?.aceptaPrivacidad || false}
                  onChange={(e) => onNestedInputChange('consentimientoInformado', 'aceptaPrivacidad', e.target.checked)}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="aceptaPrivacidad" className="font-medium text-gray-700">
                  Protección de Datos Personales <span className="text-red-500">*</span>
                </label>
                <p className="text-gray-500">
                  Acepto el tratamiento de mis datos personales según la Ley 1581 de 2012 y normas de protección de datos.
                </p>
                {validationErrors.consentimientoPrivacidad && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.consentimientoPrivacidad}</p>
                )}
              </div>
            </div>

            {/* Datos Sensibles */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="aceptaDatosPersonales"
                  type="checkbox"
                  checked={parsedData.consentimientoInformado?.aceptaDatosPersonales || false}
                  onChange={(e) => onNestedInputChange('consentimientoInformado', 'aceptaDatosPersonales', e.target.checked)}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="aceptaDatosPersonales" className="font-medium text-gray-700">
                  Tratamiento de Datos Sensibles <span className="text-red-500">*</span>
                </label>
                <p className="text-gray-500">
                  Acepto el tratamiento de datos sensibles de salud según la legislación colombiana.
                </p>
                {validationErrors.consentimientoDatos && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.consentimientoDatos}</p>
                )}
              </div>
            </div>

            {/* Uso de Imágenes (Opcional) */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="aceptaImagenes"
                  type="checkbox"
                  checked={parsedData.consentimientoInformado?.aceptaImagenes || false}
                  onChange={(e) => onNestedInputChange('consentimientoInformado', 'aceptaImagenes', e.target.checked)}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="aceptaImagenes" className="font-medium text-gray-700">
                  Uso de Imágenes y Fotografías
                </label>
                <p className="text-gray-500">
                  Acepto el uso de imágenes y fotografías para fines médicos y académicos (opcional).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentimientoInformadoSection;
