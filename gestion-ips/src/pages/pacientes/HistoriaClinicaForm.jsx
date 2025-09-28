import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { historiasClinicasApiService } from '../../services/pacientesApiService.js';

const HistoriaClinicaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [pacientes, setPacientes] = useState([]);

  const [formData, setFormData] = useState({
    pacienteId: '',
    fechaApertura: '',
    informacionMedico: {
      medicoResponsable: '',
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
    activa: true
  });

  useEffect(() => {
    loadPacientes();
    if (isEditing && id) {
      loadHistoria(parseInt(id));
    }
  }, [id, isEditing]);

  const loadPacientes = async () => {
    try {
      // This would need to be implemented in the API service
      // For now, we'll assume patients are loaded elsewhere
    } catch (err) {
      console.error('Error loading patients:', err);
    }
  };

  const loadHistoria = async (historiaId) => {
    try {
      setLoading(true);
      // This would need to be implemented in the API service
      // const historia = await historiasClinicasApiService.getHistoriaClinicaById(historiaId);
      // setFormData(historia);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar historia clínica');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      let result;
      if (isEditing && id) {
        // result = await historiasClinicasApiService.updateHistoriaClinica(parseInt(id), formData);
      } else {
        // result = await historiasClinicasApiService.createHistoriaClinica(formData);
      }

      navigate('/pacientes/historias');
    } catch (err) {
      console.error('Error al guardar historia clínica:', err);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {isEditing ? 'Editar Historia Clínica' : 'Nueva Historia Clínica'}
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => navigate('/pacientes/historias')}
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
              <div className="sm:col-span-3">
                <label htmlFor="pacienteId" className="block text-sm font-medium leading-6 text-gray-900">
                  Paciente
                </label>
                <select
                  id="pacienteId"
                  value={formData.pacienteId}
                  onChange={(e) => handleInputChange('pacienteId', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm sm:leading-6"
                  required
                >
                  <option value="">Seleccionar paciente...</option>
                  {/* Map patients here */}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="fechaApertura" className="block text-sm font-medium leading-6 text-gray-900">
                  Fecha de Apertura
                </label>
                <input
                  type="date"
                  id="fechaApertura"
                  value={formData.fechaApertura}
                  onChange={(e) => handleInputChange('fechaApertura', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Información Médica */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Información Médica</h3>
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="medicoResponsable" className="block text-sm font-medium leading-6 text-gray-900">
                  Médico Responsable
                </label>
                <input
                  type="text"
                  id="medicoResponsable"
                  value={formData.informacionMedico?.medicoResponsable}
                  onChange={(e) => handleNestedInputChange('informacionMedico', 'medicoResponsable', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="registroMedico" className="block text-sm font-medium leading-6 text-gray-900">
                  Registro Médico
                </label>
                <input
                  type="text"
                  id="registroMedico"
                  value={formData.informacionMedico?.registroMedico}
                  onChange={(e) => handleNestedInputChange('informacionMedico', 'registroMedico', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="especialidad" className="block text-sm font-medium leading-6 text-gray-900">
                  Especialidad
                </label>
                <input
                  type="text"
                  id="especialidad"
                  value={formData.informacionMedico?.especialidad}
                  onChange={(e) => handleNestedInputChange('informacionMedico', 'especialidad', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
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
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
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
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
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
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
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
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
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
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Antecedentes Clínicos */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Antecedentes Clínicos</h3>
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="antecedentesPersonales" className="block text-sm font-medium leading-6 text-gray-900">
                  Antecedentes Personales
                </label>
                <textarea
                  id="antecedentesPersonales"
                  rows={4}
                  value={formData.antecedentesClinico?.antecedentesPersonales}
                  onChange={(e) => handleNestedInputChange('antecedentesClinico', 'antecedentesPersonales', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                  placeholder="Antecedentes personales del paciente..."
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="antecedentesFamiliares" className="block text-sm font-medium leading-6 text-gray-900">
                  Antecedentes Familiares
                </label>
                <textarea
                  id="antecedentesFamiliares"
                  rows={4}
                  value={formData.antecedentesClinico?.antecedentesFamiliares}
                  onChange={(e) => handleNestedInputChange('antecedentesClinico', 'antecedentesFamiliares', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                  placeholder="Antecedentes familiares..."
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="antecedentesQuirurgicos" className="block text-sm font-medium leading-6 text-gray-900">
                  Antecedentes Quirúrgicos
                </label>
                <textarea
                  id="antecedentesQuirurgicos"
                  rows={3}
                  value={formData.antecedentesClinico?.antecedentesQuirurgicos}
                  onChange={(e) => handleNestedInputChange('antecedentesClinico', 'antecedentesQuirurgicos', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                  placeholder="Antecedentes quirúrgicos..."
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="antecedentesAlergicos" className="block text-sm font-medium leading-6 text-gray-900">
                  Antecedentes Alérgicos
                </label>
                <textarea
                  id="antecedentesAlergicos"
                  rows={3}
                  value={formData.antecedentesClinico?.antecedentesAlergicos}
                  onChange={(e) => handleNestedInputChange('antecedentesClinico', 'antecedentesAlergicos', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                  placeholder="Antecedentes alérgicos..."
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
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
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
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
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
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
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
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                  placeholder="Plan de tratamiento..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-x-3">
          <button
            type="button"
            onClick={() => navigate('/pacientes/historias')}
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : (isEditing ? 'Actualizar Historia Clínica' : 'Crear Historia Clínica')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HistoriaClinicaForm;