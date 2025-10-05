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
        seguimientoConsulta: formData.seguimientoConsulta
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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-4/5 h-4/5">
          {/* Header */}
          <div className="bg-purple-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Nueva Consulta Médica</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center min-h-full">
              <div className="w-full max-w-4xl">
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                {/* Información del Paciente */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-purple-900">Paciente</h4>
                      <p className="text-sm text-purple-700 mt-1">
                        {citaData?.nombre || 'No disponible'}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información Básica */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label htmlFor="historiaClinicaId" className="block text-sm font-medium leading-6 text-gray-900">
                        ID Historia Clínica
                      </label>
                      <input
                        type="text"
                        id="historiaClinicaId"
                        value={formData.historiaClinicaId}
                        readOnly
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 bg-gray-50 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalle de Consulta */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Detalle de Consulta</h3>
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="medicoTratante" className="block text-sm font-medium leading-6 text-gray-900">
                        Médico Tratante
                      </label>
                      <input
                        type="text"
                        id="medicoTratante"
                        value={formData.detalleConsulta?.medicoTratante}
                        onChange={(e) => handleNestedInputChange('detalleConsulta', 'medicoTratante', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="especialidad" className="block text-sm font-medium leading-6 text-gray-900">
                        Especialidad
                      </label>
                      <input
                        type="text"
                        id="especialidad"
                        value={formData.detalleConsulta?.especialidad}
                        onChange={(e) => handleNestedInputChange('detalleConsulta', 'especialidad', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="fechaConsulta" className="block text-sm font-medium leading-6 text-gray-900">
                        Fecha de Consulta
                      </label>
                      <input
                        type="datetime-local"
                        id="fechaConsulta"
                        value={formData.detalleConsulta?.fechaConsulta}
                        onChange={(e) => handleNestedInputChange('detalleConsulta', 'fechaConsulta', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="proximaCita" className="block text-sm font-medium leading-6 text-gray-900">
                        Próxima Cita
                      </label>
                      <input
                        type="datetime-local"
                        id="proximaCita"
                        value={formData.detalleConsulta?.proximaCita}
                        onChange={(e) => handleNestedInputChange('detalleConsulta', 'proximaCita', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Consulta */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Información de Consulta</h3>
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label htmlFor="motivoConsulta" className="block text-sm font-medium leading-6 text-gray-900">
                        Motivo de Consulta
                      </label>
                      <textarea
                        id="motivoConsulta"
                        rows={3}
                        value={formData.informacionConsulta?.motivoConsulta}
                        onChange={(e) => handleNestedInputChange('informacionConsulta', 'motivoConsulta', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                        placeholder="Describa el motivo de la consulta..."
                        required
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="enfermedadActual" className="block text-sm font-medium leading-6 text-gray-900">
                        Enfermedad Actual
                      </label>
                      <textarea
                        id="enfermedadActual"
                        rows={3}
                        value={formData.informacionConsulta?.enfermedadActual}
                        onChange={(e) => handleNestedInputChange('informacionConsulta', 'enfermedadActual', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                        placeholder="Describa la enfermedad actual..."
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="observaciones" className="block text-sm font-medium leading-6 text-gray-900">
                        Observaciones
                      </label>
                      <textarea
                        id="observaciones"
                        rows={3}
                        value={formData.informacionConsulta?.observaciones}
                        onChange={(e) => handleNestedInputChange('informacionConsulta', 'observaciones', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                        placeholder="Observaciones adicionales..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Examen Clínico */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Examen Clínico</h3>
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label htmlFor="examenFisico" className="block text-sm font-medium leading-6 text-gray-900">
                        Examen Físico
                      </label>
                      <textarea
                        id="examenFisico"
                        rows={4}
                        value={formData.examenClinico?.examenFisico}
                        onChange={(e) => handleNestedInputChange('examenClinico', 'examenFisico', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                        placeholder="Resultados del examen físico..."
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="signosVitales" className="block text-sm font-medium leading-6 text-gray-900">
                        Signos Vitales
                      </label>
                      <textarea
                        id="signosVitales"
                        rows={3}
                        value={formData.examenClinico?.signosVitales}
                        onChange={(e) => handleNestedInputChange('examenClinico', 'signosVitales', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                        placeholder="Signos vitales..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnóstico y Tratamiento */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Diagnóstico y Tratamiento</h3>
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label htmlFor="diagnosticos" className="block text-sm font-medium leading-6 text-gray-900">
                        Diagnósticos
                      </label>
                      <textarea
                        id="diagnosticos"
                        rows={4}
                        value={formData.diagnosticoTratamiento?.diagnosticos}
                        onChange={(e) => handleNestedInputChange('diagnosticoTratamiento', 'diagnosticos', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                        placeholder="Diagnósticos realizados..."
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="planTratamiento" className="block text-sm font-medium leading-6 text-gray-900">
                        Plan de Tratamiento
                      </label>
                      <textarea
                        id="planTratamiento"
                        rows={4}
                        value={formData.diagnosticoTratamiento?.planTratamiento}
                        onChange={(e) => handleNestedInputChange('diagnosticoTratamiento', 'planTratamiento', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                        placeholder="Plan de tratamiento..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seguimiento de Consulta */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Seguimiento de Consulta</h3>
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label htmlFor="evolucion" className="block text-sm font-medium leading-6 text-gray-900">
                        Evolución
                      </label>
                      <textarea
                        id="evolucion"
                        rows={3}
                        value={formData.seguimientoConsulta?.evolucion}
                        onChange={(e) => handleNestedInputChange('seguimientoConsulta', 'evolucion', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                        placeholder="Evolución del paciente..."
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="recomendaciones" className="block text-sm font-medium leading-6 text-gray-900">
                        Recomendaciones
                      </label>
                      <textarea
                        id="recomendaciones"
                        rows={3}
                        value={formData.seguimientoConsulta?.recomendaciones}
                        onChange={(e) => handleNestedInputChange('seguimientoConsulta', 'recomendaciones', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                        placeholder="Recomendaciones médicas..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm font-semibold leading-6 text-gray-900 px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
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