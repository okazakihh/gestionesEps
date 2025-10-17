/**
 * Componentes de secciones del formulario de historia clínica
 * Presentation Layer - Components
 */
import React from 'react';

export const InformacionBasicaSection = ({ formData, handleInputChange, validationErrors }) => (
  <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
    <div className="px-3 py-4 sm:p-6">
      <div className="grid max-w-2xl grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="pacienteId" className="block text-xs font-medium leading-5 text-gray-900">
            ID Paciente
          </label>
          <input
            type="text"
            id="pacienteId"
            value={formData.pacienteId}
            readOnly
            className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 bg-gray-50 text-xs"
          />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="fechaApertura" className="block text-xs font-medium leading-5 text-gray-900">
            Fecha de Apertura
          </label>
          <input
            type="date"
            id="fechaApertura"
            value={formData.fechaApertura}
            onChange={(e) => handleInputChange('fechaApertura', e.target.value)}
            className={`mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs ${
              validationErrors.fechaApertura ? 'ring-red-500' : ''
            }`}
            required
          />
          {validationErrors.fechaApertura && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.fechaApertura}</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

export const InformacionMedicaSection = ({ formData, handleNestedInputChange, validationErrors }) => (
  <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
    <div className="px-3 py-4 sm:p-6">
      <h3 className="text-sm font-medium leading-5 text-gray-900 mb-4">Información Médica</h3>
      <div className="grid max-w-2xl grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <label htmlFor="medicoResponsable" className="block text-xs font-medium leading-5 text-gray-900">
            Médico Responsable
          </label>
          <input
            type="text"
            id="medicoResponsable"
            value={formData.informacionMedico?.medicoResponsable}
            onChange={(e) => handleNestedInputChange('informacionMedico', 'medicoResponsable', e.target.value)}
            className={`mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs ${
              validationErrors.medicoResponsable ? 'ring-red-500' : ''
            }`}
            required
          />
          {validationErrors.medicoResponsable && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.medicoResponsable}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="registroMedico" className="block text-xs font-medium leading-5 text-gray-900">
            Registro Médico
          </label>
          <input
            type="text"
            id="registroMedico"
            value={formData.informacionMedico?.registroMedico}
            onChange={(e) => handleNestedInputChange('informacionMedico', 'registroMedico', e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="especialidad" className="block text-xs font-medium leading-5 text-gray-900">
            Especialidad
          </label>
          <input
            type="text"
            id="especialidad"
            value={formData.informacionMedico?.especialidad}
            onChange={(e) => handleNestedInputChange('informacionMedico', 'especialidad', e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
          />
        </div>
      </div>
    </div>
  </div>
);

export const InformacionConsultaSection = ({ formData, handleNestedInputChange, validationErrors }) => (
  <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
    <div className="px-3 py-4 sm:p-6">
      <h3 className="text-sm font-medium leading-5 text-gray-900 mb-4">Información de Consulta</h3>
      <div className="grid max-w-2xl grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <label htmlFor="motivoConsulta" className="block text-xs font-medium leading-5 text-gray-900">
            Motivo de Consulta
          </label>
          <textarea
            id="motivoConsulta"
            rows={2}
            value={formData.informacionConsulta?.motivoConsulta}
            onChange={(e) => handleNestedInputChange('informacionConsulta', 'motivoConsulta', e.target.value)}
            className={`mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs ${
              validationErrors.motivoConsulta ? 'ring-red-500' : ''
            }`}
            placeholder="Describa el motivo de la consulta..."
            required
          />
          {validationErrors.motivoConsulta && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.motivoConsulta}</p>
          )}
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="enfermedadActual" className="block text-xs font-medium leading-5 text-gray-900">
            Enfermedad Actual
          </label>
          <textarea
            id="enfermedadActual"
            rows={2}
            value={formData.informacionConsulta?.enfermedadActual}
            onChange={(e) => handleNestedInputChange('informacionConsulta', 'enfermedadActual', e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
            placeholder="Describa la enfermedad actual..."
          />
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="observaciones" className="block text-xs font-medium leading-5 text-gray-900">
            Observaciones
          </label>
          <textarea
            id="observaciones"
            rows={2}
            value={formData.informacionConsulta?.observaciones}
            onChange={(e) => handleNestedInputChange('informacionConsulta', 'observaciones', e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
            placeholder="Observaciones adicionales..."
          />
        </div>
      </div>
    </div>
  </div>
);

export const AntecedentesClinicosSection = ({ formData, handleNestedInputChange }) => (
  <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
    <div className="px-3 py-4 sm:p-6">
      <h3 className="text-sm font-medium leading-5 text-gray-900 mb-4">Antecedentes Clínicos</h3>
      <div className="grid max-w-2xl grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <label htmlFor="antecedentesPersonales" className="block text-xs font-medium leading-5 text-gray-900">
            Antecedentes Personales
          </label>
          <textarea
            id="antecedentesPersonales"
            rows={2}
            value={formData.antecedentesClinico?.antecedentesPersonales}
            onChange={(e) => handleNestedInputChange('antecedentesClinico', 'antecedentesPersonales', e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
            placeholder="Antecedentes personales del paciente..."
          />
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="antecedentesFamiliares" className="block text-xs font-medium leading-5 text-gray-900">
            Antecedentes Familiares
          </label>
          <textarea
            id="antecedentesFamiliares"
            rows={2}
            value={formData.antecedentesClinico?.antecedentesFamiliares}
            onChange={(e) => handleNestedInputChange('antecedentesClinico', 'antecedentesFamiliares', e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
            placeholder="Antecedentes familiares..."
          />
        </div>
      </div>
    </div>
  </div>
);

export const ExamenClinicoSection = ({ formData, handleNestedInputChange }) => (
  <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
    <div className="px-3 py-4 sm:p-6">
      <h3 className="text-sm font-medium leading-5 text-gray-900 mb-4">Examen Clínico</h3>
      <div className="grid max-w-2xl grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <label htmlFor="examenFisico" className="block text-xs font-medium leading-5 text-gray-900">
            Examen Físico
          </label>
          <textarea
            id="examenFisico"
            rows={2}
            value={formData.examenClinico?.examenFisico}
            onChange={(e) => handleNestedInputChange('examenClinico', 'examenFisico', e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
            placeholder="Resultados del examen físico..."
          />
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="signosVitales" className="block text-xs font-medium leading-5 text-gray-900">
            Signos Vitales
          </label>
          <textarea
            id="signosVitales"
            rows={2}
            value={formData.examenClinico?.signosVitales}
            onChange={(e) => handleNestedInputChange('examenClinico', 'signosVitales', e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
            placeholder="Signos vitales..."
          />
        </div>
      </div>
    </div>
  </div>
);

export const DiagnosticoTratamientoSection = ({ formData, handleNestedInputChange }) => (
  <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
    <div className="px-3 py-4 sm:p-6">
      <h3 className="text-sm font-medium leading-5 text-gray-900 mb-4">Diagnóstico y Tratamiento</h3>
      <div className="grid max-w-2xl grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <label htmlFor="diagnosticos" className="block text-xs font-medium leading-5 text-gray-900">
            Diagnósticos
          </label>
          <textarea
            id="diagnosticos"
            rows={2}
            value={formData.diagnosticoTratamiento?.diagnosticos}
            onChange={(e) => handleNestedInputChange('diagnosticoTratamiento', 'diagnosticos', e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
            placeholder="Diagnósticos realizados..."
          />
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="planTratamiento" className="block text-xs font-medium leading-5 text-gray-900">
            Plan de Tratamiento
          </label>
          <textarea
            id="planTratamiento"
            rows={2}
            value={formData.diagnosticoTratamiento?.planTratamiento}
            onChange={(e) => handleNestedInputChange('diagnosticoTratamiento', 'planTratamiento', e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
            placeholder="Plan de tratamiento..."
          />
        </div>
      </div>
    </div>
  </div>
);

export const FirmaDigitalSection = ({ formData, handleNestedInputChange, getFirmaPreview, validationErrors }) => (
  <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
    <div className="px-3 py-4 sm:p-6">
      <h3 className="text-sm font-medium leading-5 text-gray-900 mb-4">Firma Digital</h3>
      <div className="grid max-w-2xl grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <label htmlFor="nombreMedico" className="block text-xs font-medium leading-5 text-gray-900">
            Nombre del Médico
          </label>
          <input
            type="text"
            id="nombreMedico"
            value={formData.firmaDigital?.nombreMedico}
            onChange={(e) => handleNestedInputChange('firmaDigital', 'nombreMedico', e.target.value)}
            className={`mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs ${
              validationErrors.nombreMedico ? 'ring-red-500' : ''
            }`}
            required
          />
          {validationErrors.nombreMedico && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.nombreMedico}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="numeroCedula" className="block text-xs font-medium leading-5 text-gray-900">
            Número de Cédula
          </label>
          <input
            type="text"
            id="numeroCedula"
            value={formData.firmaDigital?.numeroCedula}
            onChange={(e) => handleNestedInputChange('firmaDigital', 'numeroCedula', e.target.value)}
            className={`mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs ${
              validationErrors.numeroCedula ? 'ring-red-500' : ''
            }`}
            required
          />
          {validationErrors.numeroCedula && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.numeroCedula}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="especialidadFirma" className="block text-xs font-medium leading-5 text-gray-900">
            Especialidad
          </label>
          <input
            type="text"
            id="especialidadFirma"
            value={formData.firmaDigital?.especialidad}
            onChange={(e) => handleNestedInputChange('firmaDigital', 'especialidad', e.target.value)}
            className={`mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs ${
              validationErrors.especialidadFirma ? 'ring-red-500' : ''
            }`}
            required
          />
          {validationErrors.especialidadFirma && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.especialidadFirma}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="fechaFirma" className="block text-xs font-medium leading-5 text-gray-900">
            Fecha de Firma
          </label>
          <input
            type="date"
            id="fechaFirma"
            value={formData.firmaDigital?.fechaFirma}
            onChange={(e) => handleNestedInputChange('firmaDigital', 'fechaFirma', e.target.value)}
            className={`mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs ${
              validationErrors.fechaFirma ? 'ring-red-500' : ''
            }`}
            required
          />
          {validationErrors.fechaFirma && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.fechaFirma}</p>
          )}
        </div>
      </div>

      {/* Mostrar firma digital */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Vista Previa de la Firma Digital</h4>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800">
            {getFirmaPreview().nombreMedico}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Cédula: {getFirmaPreview().numeroCedula}
          </div>
          <div className="text-sm text-gray-600">
            Especialidad: {getFirmaPreview().especialidad}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Fecha: {getFirmaPreview().fechaFirma}
          </div>
          <div className="mt-3 border-t border-gray-300 pt-2">
            <div className="text-xs text-gray-500 italic">
              Firma Digital Autorizada
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);