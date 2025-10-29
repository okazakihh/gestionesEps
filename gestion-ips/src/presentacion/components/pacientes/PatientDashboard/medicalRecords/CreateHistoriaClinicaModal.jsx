import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import { historiasClinicasApiService, pacientesApiService } from '../../../../../data/services/pacientesApiService.js';

const CreateHistoriaClinicaModal = ({ isOpen, onClose, onHistoriaCreated, pacienteId, citaId, citaData }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    pacienteId: pacienteId || '',
    fechaApertura: new Date().toISOString().split('T')[0],
    informacionMedico: {
      medicoResponsable: citaData?.medicoAsignado || '',
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
    antecedentesClinico: {
      antecedentesPersonales: '',
      antecedentesFamiliares: '',
      antecedentesQuirurgicos: '',
      antecedentesAlergicos: ''
    },
    examenClinico: {
      examenFisico: '',
      signosVitales: ''
    },
    diagnosticoTratamiento: {
      diagnosticos: '',
      planTratamiento: ''
    },
    firmaDigital: {
      nombreMedico: citaData?.medicoAsignado || '',
      numeroCedula: '',
      especialidad: citaData?.especialidad || '',
      fechaFirma: new Date().toISOString().split('T')[0]
    },
    activa: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      // Convert form data to JSON string for datosJson
      const datosJson = JSON.stringify({
        informacionMedico: formData.informacionMedico,
        informacionConsulta: formData.informacionConsulta,
        antecedentesClinico: formData.antecedentesClinico,
        examenClinico: formData.examenClinico,
        diagnosticoTratamiento: formData.diagnosticoTratamiento,
        firmaDigital: formData.firmaDigital
      });

      const submitData = {
        fechaApertura: formData.fechaApertura,
        datosJson: datosJson,
        activa: formData.activa
      };

      console.log('Enviando datos de historia clínica:', JSON.stringify(submitData, null, 2));

      const result = await historiasClinicasApiService.createHistoriaClinica(formData.pacienteId, submitData);

      console.log('Respuesta del backend:', result);

      // Actualizar el estado de la cita a ATENDIDO justo después de guardar la historia clínica
      if (citaId) {
        try {
          console.log('Actualizando estado de cita', citaId, 'a ATENDIDO');
          await pacientesApiService.actualizarEstadoCita(citaId, 'ATENDIDO');
          console.log('Estado de cita actualizado exitosamente');
        } catch (citaError) {
          console.error('Error al actualizar estado de cita:', citaError);
          // No fallar la creación de la historia si falla la actualización de cita
        }
      }

      // Mostrar SweetAlert de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Historia Clínica Creadaaaaa!',
        text: `La historia clínica ha sido creada exitosamente para el paciente.`,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#10B981',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      onHistoriaCreated && onHistoriaCreated(result);
      onClose();
    } catch (err) {
      console.error('Error al guardar historia clínica:', err);

      // Mostrar SweetAlert de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al Crear Historia Clínica',
        text: err instanceof Error ? err.message : 'Ha ocurrido un error al guardar la historia clínica. Por favor, inténtelo nuevamente.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#EF4444'
      });

      setError(err instanceof Error ? err.message : 'Error al guardar historia clínica');
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
              {/* Información Básica */}
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
                        className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Médica */}
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
                        className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
                        required
                      />
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

              {/* Información de Consulta */}
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
                        className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
                        placeholder="Describa el motivo de la consulta..."
                        required
                      />
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

              {/* Antecedentes Clínicos */}
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

              {/* Examen Clínico */}
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

              {/* Diagnóstico y Tratamiento */}
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

              {/* Firma Digital */}
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
                        className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
                        required
                      />
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
                        className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
                        required
                      />
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
                        className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
                        required
                      />
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
                        className="mt-1 block w-full rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 text-xs"
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

export default CreateHistoriaClinicaModal;