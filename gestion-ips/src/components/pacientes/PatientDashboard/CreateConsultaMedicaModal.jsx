import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import { historiasClinicasApiService } from '../../../services/pacientesApiService.js';

const CreateConsultaMedicaModal = ({ isOpen, onClose, onConsultaCreated, historiaClinicaId, citaData }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    historiaClinicaId: historiaClinicaId || '',
    detalleConsulta: {
      medicoTratante: citaData?.medicoAsignado || '',
      especialidad: citaData?.especialidad || '',
      fechaConsulta: new Date().toISOString().slice(0, 16), // Formato datetime-local
      proximaCita: ''
    },
    informacionMedico: {
      registroMedico: '',
      especialidad: citaData?.especialidad || ''
    },
    informacionConsulta: {
      motivoConsulta: citaData?.motivo || '',
      enfermedadActual: '',
      revisionSistemas: '',
      medicamentosActuales: '',
      observaciones: citaData?.notas || ''
    },
    examenClinico: {
      examenFisico: '',
      signosVitales: ''
    },
    diagnosticoTratamiento: {
      diagnosticos: '',
      planTratamiento: ''
    },
    seguimientoConsulta: {
      evolucion: '',
      complicaciones: '',
      recomendaciones: ''
    },
    firmaDigital: {
      nombreMedico: citaData?.medicoAsignado || '',
      numeroCedula: '',
      especialidad: citaData?.especialidad || '',
      fechaFirma: new Date().toISOString().split('T')[0]
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      // Convert form data to JSON string for datosJson
      const datosJson = JSON.stringify({
        detalleConsulta: formData.detalleConsulta,
        informacionMedico: formData.informacionMedico,
        informacionConsulta: formData.informacionConsulta,
        examenClinico: formData.examenClinico,
        diagnosticoTratamiento: formData.diagnosticoTratamiento,
        seguimientoConsulta: formData.seguimientoConsulta,
        firmaDigital: formData.firmaDigital
      });

      const submitData = {
        historiaClinicaId: formData.historiaClinicaId,
        datosJson: datosJson
      };

      console.log('Enviando datos de consulta médica:', JSON.stringify(submitData, null, 2));

      const result = await historiasClinicasApiService.crearConsulta(formData.historiaClinicaId, submitData.datosJson);

      console.log('Respuesta del backend:', result);

      // Mostrar SweetAlert de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Consulta Médica Creada!',
        text: `La consulta médica ha sido registrada exitosamente.`,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#8B5CF6',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      onConsultaCreated && onConsultaCreated(result);
      onClose();
    } catch (err) {
      console.error('Error al guardar consulta médica:', err);

      // Mostrar SweetAlert de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al Crear Consulta Médica',
        text: err instanceof Error ? err.message : 'Ha ocurrido un error al guardar la consulta médica. Por favor, inténtelo nuevamente.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#EF4444'
      });

      setError(err instanceof Error ? err.message : 'Error al guardar consulta médica');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section]),
        [field]: value
      }
    }));
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
          <div className="bg-purple-600 px-4 py-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Nueva Consulta Médica</h3>
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
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="text-xs text-red-700">{error}</div>
                  </div>
                )}

                {/* Información del Paciente */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-purple-900">Paciente</h4>
                      <p className="text-xs text-purple-700 mt-1">
                        {citaData?.nombre || 'No disponible'}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
              {/* Información Básica y Detalle de Consulta - Combinadas */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-3 py-3 sm:p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* ID Historia Clínica */}
                    <div>
                      <label htmlFor="historiaClinicaId" className="block text-xs font-medium text-gray-900 mb-1">
                        ID Historia Clínica
                      </label>
                      <input
                        type="text"
                        id="historiaClinicaId"
                        value={formData.historiaClinicaId}
                        readOnly
                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 bg-gray-50 text-xs"
                      />
                    </div>

                    {/* Médico Tratante */}
                    <div>
                      <label htmlFor="medicoTratante" className="block text-xs font-medium text-gray-900 mb-1">
                        Médico Tratante
                      </label>
                      <input
                        type="text"
                        id="medicoTratante"
                        value={formData.detalleConsulta?.medicoTratante}
                        onChange={(e) => handleNestedInputChange('detalleConsulta', 'medicoTratante', e.target.value)}
                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                        required
                      />
                    </div>

                    {/* Especialidad */}
                    <div>
                      <label htmlFor="especialidad" className="block text-xs font-medium text-gray-900 mb-1">
                        Especialidad
                      </label>
                      <input
                        type="text"
                        id="especialidad"
                        value={formData.detalleConsulta?.especialidad}
                        onChange={(e) => handleNestedInputChange('detalleConsulta', 'especialidad', e.target.value)}
                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                      />
                    </div>

                    {/* Fecha de Consulta */}
                    <div>
                      <label htmlFor="fechaConsulta" className="block text-xs font-medium text-gray-900 mb-1">
                        Fecha de Consulta
                      </label>
                      <input
                        type="datetime-local"
                        id="fechaConsulta"
                        value={formData.detalleConsulta?.fechaConsulta}
                        onChange={(e) => handleNestedInputChange('detalleConsulta', 'fechaConsulta', e.target.value)}
                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                        required
                      />
                    </div>

                    {/* Próxima Cita - Full width */}
                    <div className="lg:col-span-2">
                      <label htmlFor="proximaCita" className="block text-xs font-medium text-gray-900 mb-1">
                        Próxima Cita
                      </label>
                      <input
                        type="datetime-local"
                        id="proximaCita"
                        value={formData.detalleConsulta?.proximaCita}
                        onChange={(e) => handleNestedInputChange('detalleConsulta', 'proximaCita', e.target.value)}
                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Consulta y Examen Clínico - Combinadas */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-3 py-3 sm:p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Información de Consulta</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="motivoConsulta" className="block text-xs font-medium text-gray-900 mb-1">
                        Motivo de Consulta
                      </label>
                      <textarea
                        id="motivoConsulta"
                        rows={2}
                        value={formData.informacionConsulta?.motivoConsulta}
                        onChange={(e) => handleNestedInputChange('informacionConsulta', 'motivoConsulta', e.target.value)}
                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                        placeholder="Describa el motivo..."
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="enfermedadActual" className="block text-xs font-medium text-gray-900 mb-1">
                        Enfermedad Actual
                      </label>
                      <textarea
                        id="enfermedadActual"
                        rows={2}
                        value={formData.informacionConsulta?.enfermedadActual}
                        onChange={(e) => handleNestedInputChange('informacionConsulta', 'enfermedadActual', e.target.value)}
                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                        placeholder="Describa la enfermedad..."
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label htmlFor="observaciones" className="block text-xs font-medium text-gray-900 mb-1">
                        Observaciones
                      </label>
                      <textarea
                        id="observaciones"
                        rows={2}
                        value={formData.informacionConsulta?.observaciones}
                        onChange={(e) => handleNestedInputChange('informacionConsulta', 'observaciones', e.target.value)}
                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                        placeholder="Observaciones adicionales..."
                      />
                    </div>
                  </div>

                  <h3 className="text-sm font-medium text-gray-900 mb-3 mt-4">Examen Clínico</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="examenFisico" className="block text-xs font-medium text-gray-900 mb-1">
                        Examen Físico
                      </label>
                      <textarea
                        id="examenFisico"
                        rows={2}
                        value={formData.examenClinico?.examenFisico}
                        onChange={(e) => handleNestedInputChange('examenClinico', 'examenFisico', e.target.value)}
                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                        placeholder="Resultados del examen..."
                      />
                    </div>

                    <div>
                      <label htmlFor="signosVitales" className="block text-xs font-medium text-gray-900 mb-1">
                        Signos Vitales
                      </label>
                      <textarea
                        id="signosVitales"
                        rows={2}
                        value={formData.examenClinico?.signosVitales}
                        onChange={(e) => handleNestedInputChange('examenClinico', 'signosVitales', e.target.value)}
                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                        placeholder="Signos vitales..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnóstico y Tratamiento + Seguimiento - Combinadas */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-3 py-3 sm:p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Diagnóstico y Tratamiento</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label htmlFor="diagnosticos" className="block text-xs font-medium text-gray-900 mb-1">
                        Diagnósticos
                      </label>
                      <textarea
                        id="diagnosticos"
                        rows={2}
                        value={formData.diagnosticoTratamiento?.diagnosticos}
                        onChange={(e) => handleNestedInputChange('diagnosticoTratamiento', 'diagnosticos', e.target.value)}
                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                        placeholder="Diagnósticos realizados..."
                      />
                    </div>

                    <div>
                      <label htmlFor="planTratamiento" className="block text-xs font-medium text-gray-900 mb-1">
                        Plan de Tratamiento
                      </label>
                      <textarea
                        id="planTratamiento"
                        rows={2}
                        value={formData.diagnosticoTratamiento?.planTratamiento}
                        onChange={(e) => handleNestedInputChange('diagnosticoTratamiento', 'planTratamiento', e.target.value)}
                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                        placeholder="Plan de tratamiento..."
                      />
                    </div>
                  </div>

                  <h3 className="text-sm font-medium text-gray-900 mb-3 mt-4">Seguimiento de Consulta</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label htmlFor="evolucion" className="block text-xs font-medium text-gray-900 mb-1">
                        Evolución
                      </label>
                      <textarea
                        id="evolucion"
                        rows={2}
                        value={formData.seguimientoConsulta?.evolucion}
                        onChange={(e) => handleNestedInputChange('seguimientoConsulta', 'evolucion', e.target.value)}
                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                        placeholder="Evolución del paciente..."
                      />
                    </div>

                    <div>
                      <label htmlFor="recomendaciones" className="block text-xs font-medium text-gray-900 mb-1">
                        Recomendaciones
                      </label>
                      <textarea
                        id="recomendaciones"
                        rows={2}
                        value={formData.seguimientoConsulta?.recomendaciones}
                        onChange={(e) => handleNestedInputChange('seguimientoConsulta', 'recomendaciones', e.target.value)}
                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                        placeholder="Recomendaciones médicas..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Firma Digital */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-3 py-4 sm:p-6">
                  <h3 className="text-sm font-medium leading-5 text-gray-900 mb-4">Firma Digital</h3>
                  <div className="grid max-w-2xl grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <label htmlFor="nombreMedicoConsulta" className="block text-xs font-medium leading-5 text-gray-900">
                        Nombre del Médico
                      </label>
                      <input
                        type="text"
                        id="nombreMedicoConsulta"
                        value={formData.firmaDigital?.nombreMedico}
                        onChange={(e) => handleNestedInputChange('firmaDigital', 'nombreMedico', e.target.value)}
                        className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="numeroCedulaConsulta" className="block text-xs font-medium leading-5 text-gray-900">
                        Número de Cédula
                      </label>
                      <input
                        type="text"
                        id="numeroCedulaConsulta"
                        value={formData.firmaDigital?.numeroCedula}
                        onChange={(e) => handleNestedInputChange('firmaDigital', 'numeroCedula', e.target.value)}
                        className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="especialidadFirmaConsulta" className="block text-xs font-medium leading-5 text-gray-900">
                        Especialidad
                      </label>
                      <input
                        type="text"
                        id="especialidadFirmaConsulta"
                        value={formData.firmaDigital?.especialidad}
                        onChange={(e) => handleNestedInputChange('firmaDigital', 'especialidad', e.target.value)}
                        className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="fechaFirmaConsulta" className="block text-xs font-medium leading-5 text-gray-900">
                        Fecha de Firma
                      </label>
                      <input
                        type="date"
                        id="fechaFirmaConsulta"
                        value={formData.firmaDigital?.fechaFirma}
                        onChange={(e) => handleNestedInputChange('firmaDigital', 'fechaFirma', e.target.value)}
                        className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 text-xs"
                        required
                      />
                    </div>
                  </div>

                  {/* Mostrar firma digital */}
                  <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Vista Previa de la Firma Digital</h4>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">
                        {formData.firmaDigital?.nombreMedico || 'Nombre del Médico'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Cédula: {formData.firmaDigital?.numeroCedula || 'Número de Cédula'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Especialidad: {formData.firmaDigital?.especialidad || 'Especialidad'}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Fecha: {formData.firmaDigital?.fechaFirma ? new Date(formData.firmaDigital.fechaFirma).toLocaleDateString('es-CO') : 'Fecha de Firma'}
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
                  className="rounded-md bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Guardando...' : 'Crear Consulta'}
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

export default CreateConsultaMedicaModal;