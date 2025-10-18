import React from 'react';
import { GENEROS, ESTADOS_CIVILES, ESTRATOS_SOCIOECONOMICOS, NIVELES_EDUCATIVOS, TIPOS_SANGRE } from '@/negocio/utils/loadHelpers.js';

/**
 * InformacionPersonalSection - Sección de información personal del paciente
 */
const InformacionPersonalSection = ({ parsedData, validationErrors, onNestedInputChange, disabled = false }) => {
  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Información Personal</h3>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          {/* Nombres */}
          <div className="sm:col-span-3">
            <label htmlFor="primerNombre" className="block text-sm font-medium leading-6 text-gray-900">
              Primer Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="primerNombre"
              value={parsedData.informacionPersonal?.primerNombre || ''}
              onChange={(e) => onNestedInputChange('informacionPersonal', 'primerNombre', e.target.value)}
              disabled={disabled}
              className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                validationErrors.primerNombre ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
              }`}
            />
            {validationErrors.primerNombre && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.primerNombre}</p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="segundoNombre" className="block text-sm font-medium leading-6 text-gray-900">
              Segundo Nombre
            </label>
            <input
              type="text"
              id="segundoNombre"
              value={parsedData.informacionPersonal?.segundoNombre || ''}
              onChange={(e) => onNestedInputChange('informacionPersonal', 'segundoNombre', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Apellidos */}
          <div className="sm:col-span-3">
            <label htmlFor="primerApellido" className="block text-sm font-medium leading-6 text-gray-900">
              Primer Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="primerApellido"
              value={parsedData.informacionPersonal?.primerApellido || ''}
              onChange={(e) => onNestedInputChange('informacionPersonal', 'primerApellido', e.target.value)}
              disabled={disabled}
              className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                validationErrors.primerApellido ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
              }`}
            />
            {validationErrors.primerApellido && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.primerApellido}</p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="segundoApellido" className="block text-sm font-medium leading-6 text-gray-900">
              Segundo Apellido
            </label>
            <input
              type="text"
              id="segundoApellido"
              value={parsedData.informacionPersonal?.segundoApellido || ''}
              onChange={(e) => onNestedInputChange('informacionPersonal', 'segundoApellido', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Fecha Nacimiento y Género */}
          <div className="sm:col-span-2">
            <label htmlFor="fechaNacimiento" className="block text-sm font-medium leading-6 text-gray-900">
              Fecha de Nacimiento <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="fechaNacimiento"
              value={parsedData.informacionPersonal?.fechaNacimiento || ''}
              onChange={(e) => onNestedInputChange('informacionPersonal', 'fechaNacimiento', e.target.value)}
              disabled={disabled}
              className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                validationErrors.fechaNacimiento ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
              }`}
            />
            {validationErrors.fechaNacimiento && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.fechaNacimiento}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="genero" className="block text-sm font-medium leading-6 text-gray-900">
              Género <span className="text-red-500">*</span>
            </label>
            <select
              id="genero"
              value={parsedData.informacionPersonal?.genero || ''}
              onChange={(e) => onNestedInputChange('informacionPersonal', 'genero', e.target.value)}
              disabled={disabled}
              className={`mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset focus:ring-2 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                validationErrors.genero ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
              }`}
            >
              <option value="">Seleccionar...</option>
              {GENEROS.map(genero => (
                <option key={genero.value} value={genero.value}>
                  {genero.label}
                </option>
              ))}
            </select>
            {validationErrors.genero && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.genero}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="estadoCivil" className="block text-sm font-medium leading-6 text-gray-900">
              Estado Civil
            </label>
            <select
              id="estadoCivil"
              value={parsedData.informacionPersonal?.estadoCivil || ''}
              onChange={(e) => onNestedInputChange('informacionPersonal', 'estadoCivil', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar...</option>
              {ESTADOS_CIVILES.map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          {/* Otros datos */}
          <div className="sm:col-span-2">
            <label htmlFor="nacionalidad" className="block text-sm font-medium leading-6 text-gray-900">
              Nacionalidad
            </label>
            <input
              type="text"
              id="nacionalidad"
              value={parsedData.informacionPersonal?.nacionalidad || ''}
              onChange={(e) => onNestedInputChange('informacionPersonal', 'nacionalidad', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Colombiana"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="telefonoMovil" className="block text-sm font-medium leading-6 text-gray-900">
              Teléfono Móvil
            </label>
            <input
              type="tel"
              id="telefonoMovil"
              value={parsedData.informacionPersonal?.telefonoMovil || ''}
              onChange={(e) => onNestedInputChange('informacionPersonal', 'telefonoMovil', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="estratoSocioeconomico" className="block text-sm font-medium leading-6 text-gray-900">
              Estrato Socioeconómico
            </label>
            <select
              id="estratoSocioeconomico"
              value={parsedData.informacionPersonal?.estratoSocioeconomico || ''}
              onChange={(e) => onNestedInputChange('informacionPersonal', 'estratoSocioeconomico', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar...</option>
              {ESTRATOS_SOCIOECONOMICOS.map(estrato => (
                <option key={estrato.value} value={estrato.value}>
                  {estrato.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="ocupacion" className="block text-sm font-medium leading-6 text-gray-900">
              Ocupación
            </label>
            <input
              type="text"
              id="ocupacion"
              value={parsedData.informacionPersonal?.ocupacion || ''}
              onChange={(e) => onNestedInputChange('informacionPersonal', 'ocupacion', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="nivelEducativo" className="block text-sm font-medium leading-6 text-gray-900">
              Nivel Educativo
            </label>
            <select
              id="nivelEducativo"
              value={parsedData.informacionPersonal?.nivelEducativo || ''}
              onChange={(e) => onNestedInputChange('informacionPersonal', 'nivelEducativo', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar...</option>
              {NIVELES_EDUCATIVOS.map(nivel => (
                <option key={nivel.value} value={nivel.value}>
                  {nivel.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="tipoSangre" className="block text-sm font-medium leading-6 text-gray-900">
              Tipo de Sangre
            </label>
            <select
              id="tipoSangre"
              value={parsedData.informacionPersonal?.tipoSangre || ''}
              onChange={(e) => onNestedInputChange('informacionPersonal', 'tipoSangre', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar...</option>
              {TIPOS_SANGRE.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformacionPersonalSection;
