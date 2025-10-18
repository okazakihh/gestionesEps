import React from 'react';

/**
 * ContactoEmergenciaSection - Sección de contacto de emergencia
 */
const ContactoEmergenciaSection = ({ parsedData, validationErrors, onNestedInputChange, disabled = false }) => {
  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Contacto de Emergencia</h3>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          
          {/* Nombre del Contacto */}
          <div className="sm:col-span-4">
            <label htmlFor="nombreContacto" className="block text-sm font-medium leading-6 text-gray-900">
              Nombre del Contacto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombreContacto"
              value={parsedData.contactoEmergencia?.nombreContacto || ''}
              onChange={(e) => onNestedInputChange('contactoEmergencia', 'nombreContacto', e.target.value)}
              disabled={disabled}
              className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                validationErrors.nombreContactoEmergencia ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
              }`}
              placeholder="Nombre completo del contacto de emergencia"
            />
            {validationErrors.nombreContactoEmergencia && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.nombreContactoEmergencia}</p>
            )}
          </div>

          {/* Relación */}
          <div className="sm:col-span-2">
            <label htmlFor="relacion" className="block text-sm font-medium leading-6 text-gray-900">
              Relación
            </label>
            <input
              type="text"
              id="relacion"
              value={parsedData.contactoEmergencia?.relacion || ''}
              onChange={(e) => onNestedInputChange('contactoEmergencia', 'relacion', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Ej: Hijo, Madre, Esposo..."
            />
          </div>

          {/* Teléfono de Contacto */}
          <div className="sm:col-span-3">
            <label htmlFor="telefonoContacto" className="block text-sm font-medium leading-6 text-gray-900">
              Teléfono de Contacto <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="telefonoContacto"
              value={parsedData.contactoEmergencia?.telefonoContacto || ''}
              onChange={(e) => onNestedInputChange('contactoEmergencia', 'telefonoContacto', e.target.value)}
              disabled={disabled}
              className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                validationErrors.telefonoContactoEmergencia ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
              }`}
              placeholder="Número de teléfono"
            />
            {validationErrors.telefonoContactoEmergencia && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.telefonoContactoEmergencia}</p>
            )}
          </div>

          {/* Nota informativa */}
          <div className="sm:col-span-6">
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-blue-700">
                    Este contacto será notificado en caso de emergencias médicas. 
                    Asegúrese de que la información sea correcta y esté actualizada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactoEmergenciaSection;
