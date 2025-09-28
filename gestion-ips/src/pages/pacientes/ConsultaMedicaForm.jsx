import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { consultasApiService } from '../../services/pacientesApiService.js';

const ConsultaMedicaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [historiasClinicas, setHistoriasClinicas] = useState([]);

  const [formData, setFormData] = useState({
    historiaClinicaId: '',
    detalleConsulta: {
      medicoTratante: '',
      especialidad: '',
      fechaConsulta: '',
      proximaCita: ''
    },
    informacionMedico: {
      registroMedico: '',
      especialidad: ''
    },
    informacionConsulta: {
      motivoConsulta: '',
      enfermedadActual: '',
      revisionSistemas: '',
      medicamentosActuales: '',
      observaciones: ''
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

  useEffect(() => {
    loadHistoriasClinicas();
    if (isEditing && id) {
      loadConsulta(parseInt(id));
    }
  }, [id, isEditing]);

  const loadHistoriasClinicas = async () => {
    try {
      // This would need to be implemented in the API service
      // For now, we'll assume clinical histories are loaded elsewhere
    } catch (err) {
      console.error('Error loading clinical histories:', err);
    }
  };

  const loadConsulta = async (consultaId) => {
    try {
      setLoading(true);
      // This would need to be implemented in the API service
      // const consulta = await consultasApiService.getConsultaById(consultaId);
      // setFormData(consulta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar consulta médica');
    } finally {
      setLoading(false);
    }
  };

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

      let result;
      if (isEditing && id) {
        // result = await consultasApiService.updateConsulta(parseInt(id), submitData);
      } else {
        // result = await consultasApiService.createConsulta(submitData);
      }

      navigate('/pacientes/consultas');
    } catch (err) {
      console.error('Error al guardar consulta médica:', err);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {isEditing ? 'Editar Consulta Médica' : 'Nueva Consulta Médica'}
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => navigate('/pacientes/consultas')}
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        {/* Información Básica */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="historiaClinicaId" className="block text-sm font-medium leading-6 text-gray-900">
                  Historia Clínica
                </label>
                <select
                  id="historiaClinicaId"
                  value={formData.historiaClinicaId}
                  onChange={(e) => handleInputChange('historiaClinicaId', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-purple-600 sm:text-sm sm:leading-6"
                  required
                >
                  <option value="">Seleccionar historia clínica...</option>
                  {/* Map clinical histories here */}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Detalle de Consulta */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
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
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
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
                <label htmlFor="revisionSistemas" className="block text-sm font-medium leading-6 text-gray-900">
                  Revisión por Sistemas
                </label>
                <textarea
                  id="revisionSistemas"
                  rows={4}
                  value={formData.informacionConsulta?.revisionSistemas}
                  onChange={(e) => handleNestedInputChange('informacionConsulta', 'revisionSistemas', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                  placeholder="Revisión por sistemas..."
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="medicamentosActuales" className="block text-sm font-medium leading-6 text-gray-900">
                  Medicamentos Actuales
                </label>
                <textarea
                  id="medicamentosActuales"
                  rows={3}
                  value={formData.informacionConsulta?.medicamentosActuales}
                  onChange={(e) => handleNestedInputChange('informacionConsulta', 'medicamentosActuales', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                  placeholder="Liste los medicamentos actuales..."
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
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
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
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
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
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
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
                <label htmlFor="complicaciones" className="block text-sm font-medium leading-6 text-gray-900">
                  Complicaciones
                </label>
                <textarea
                  id="complicaciones"
                  rows={3}
                  value={formData.seguimientoConsulta?.complicaciones}
                  onChange={(e) => handleNestedInputChange('seguimientoConsulta', 'complicaciones', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                  placeholder="Complicaciones presentadas..."
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
        <div className="flex justify-end gap-x-3">
          <button
            type="button"
            onClick={() => navigate('/pacientes/consultas')}
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : (isEditing ? 'Actualizar Consulta' : 'Crear Consulta')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConsultaMedicaForm;