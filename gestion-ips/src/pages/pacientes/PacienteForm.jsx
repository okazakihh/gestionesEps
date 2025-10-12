import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PacienteDTO } from '../../types/pacientes.js';
import { pacientesApiService } from '../../services/pacientesApiService.js';
import Swal from 'sweetalert2';

// Función helper para parsear JSON de manera segura
const parseJsonSafely = (jsonString) => {
  if (!jsonString) return {};
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return {};
  }
};

// Función helper para convertir objeto a JSON string
const stringifyJsonSafely = (obj) => {
  if (!obj || Object.keys(obj).length === 0) return null;
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error('Error stringifying JSON:', error);
    return null;
  }
};

const PacienteForm = () => {
  console.log('🏗️ PacienteForm component mounted/rendered');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  console.log('📋 PacienteForm - isEditing:', isEditing, 'id:', id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    numeroDocumento: '',
    tipoDocumento: 'CC',
    informacionPersonalJson: null,
    informacionContactoJson: null,
    informacionMedicaJson: null,
    contactoEmergenciaJson: null,
    activo: true
  });

  // Estado local para los objetos parseados (para facilitar el manejo del formulario)
  const [parsedData, setParsedData] = useState({
    informacionPersonal: {
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      fechaNacimiento: '',
      genero: '',
      estadoCivil: '',
      tipoSangre: ''
    },
    informacionContacto: {
      telefono: '',
      email: '',
      direccion: '',
      ciudad: '',
      departamento: ''
    },
    informacionMedica: {
      eps: '',
      alergias: 'Ninguna',
      medicamentosActuales: 'Ninguno',
      observacionesMedicas: 'Ninguna'
    },
    contactoEmergencia: {
      nombreContacto: '',
      telefonoContacto: '',
      relacion: ''
    }
  });

  useEffect(() => {
    console.log('🔄 useEffect triggered - isEditing:', isEditing, 'id:', id);
    if (isEditing && id) {
      console.log('📞 Llamando loadPaciente con ID:', id);
      loadPaciente(parseInt(id));
    } else {
      console.log('ℹ️ No se llama loadPaciente - creando nuevo paciente');
    }
  }, [id, isEditing]);

  const loadPaciente = async (pacienteId) => {
    try {
      setLoading(true);
      console.log('🔄 loadPaciente called with ID:', pacienteId);
      console.log('🔄 Paso 1: Llamando a la API para obtener paciente con ID:', pacienteId);

      console.log('📡 About to call pacientesApiService.getPacienteById...');
      const paciente = await pacientesApiService.getPacienteById(pacienteId);
      console.log('📡 API call completed, received response');
      console.log('📦 Paso 2: Datos recibidos del backend:', paciente);

      // Extraer y parsear los grupos de información JSON según corresponda
      const informacionPersonalJson = paciente.informacionPersonalJson;
      const informacionContactoJson = paciente.informacionContactoJson;
      const informacionMedicaJson = paciente.informacionMedicaJson;
      const contactoEmergenciaJson = paciente.contactoEmergenciaJson;

      console.log('📋 Paso 3: JSON strings extraídos:');
      console.log('  - informacionPersonalJson:', informacionPersonalJson);
      console.log('  - informacionContactoJson:', informacionContactoJson);
      console.log('  - informacionMedicaJson:', informacionMedicaJson);
      console.log('  - contactoEmergenciaJson:', contactoEmergenciaJson);

      // Transformar cada grupo de información a objetos JSON
      console.log('🔄 Paso 4: Parseando JSON strings...');
      const parsedPersonal = parseJsonSafely(informacionPersonalJson);
      const parsedContacto = parseJsonSafely(informacionContactoJson);
      const parsedMedica = parseJsonSafely(informacionMedicaJson);
      const parsedEmergencia = parseJsonSafely(contactoEmergenciaJson);

      console.log('✅ Paso 5: Objetos JSON parseados:');
      console.log('  - parsedPersonal:', parsedPersonal);
      console.log('  - parsedContacto:', parsedContacto);
      console.log('  - parsedMedica:', parsedMedica);
      console.log('  - parsedEmergencia:', parsedEmergencia);

      setFormData({
        numeroDocumento: paciente.numeroDocumento || '',
        tipoDocumento: paciente.tipoDocumento || 'CC',
        informacionPersonalJson: paciente.informacionPersonalJson,
        informacionContactoJson: paciente.informacionContactoJson,
        informacionMedicaJson: paciente.informacionMedicaJson,
        contactoEmergenciaJson: paciente.contactoEmergenciaJson,
        activo: paciente.activo !== undefined ? paciente.activo : true
      });

      // Extraer datos de cada grupo JSON y asignar valores por defecto para campos faltantes
      const finalParsedData = {
        informacionPersonal: {
          primerNombre: parsedPersonal.primerNombre || '',
          segundoNombre: parsedPersonal.segundoNombre || '',
          primerApellido: parsedPersonal.primerApellido || '',
          segundoApellido: parsedPersonal.segundoApellido || '',
          fechaNacimiento: parsedPersonal.fechaNacimiento || '',
          genero: parsedPersonal.genero || '',
          estadoCivil: parsedPersonal.estadoCivil || '',
          tipoSangre: parsedPersonal.tipoSangre || ''
        },
        informacionContacto: {
          telefono: parsedContacto.telefono || '',
          email: parsedContacto.email || '',
          direccion: parsedContacto.direccion || '',
          ciudad: parsedContacto.ciudad || '',
          departamento: parsedContacto.departamento || ''
        },
        informacionMedica: {
          eps: parsedMedica.eps || '',
          alergias: parsedMedica.alergias || 'Ninguna',
          medicamentosActuales: parsedMedica.medicamentosActuales || 'Ninguno',
          observacionesMedicas: parsedMedica.observacionesMedicas || 'Ninguna'
        },
        contactoEmergencia: {
          nombreContacto: parsedEmergencia.nombreContacto || '',
          telefonoContacto: parsedEmergencia.telefonoContacto || '',
          relacion: parsedEmergencia.relacion || ''
        }
      };

      console.log('🎯 Paso 6: Datos finales asignados a parsedData:', finalParsedData);
      setParsedData(finalParsedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      // Filtrar valores por defecto antes de enviar
      const cleanInformacionMedica = { ...parsedData.informacionMedica };
      if (cleanInformacionMedica.alergias === 'Ninguna') cleanInformacionMedica.alergias = '';
      if (cleanInformacionMedica.medicamentosActuales === 'Ninguno') cleanInformacionMedica.medicamentosActuales = '';
      if (cleanInformacionMedica.observacionesMedicas === 'Ninguna') cleanInformacionMedica.observacionesMedicas = '';

      // Convertir los objetos parsedData a JSON strings antes de enviar
      const dataToSend = {
        ...formData,
        informacionPersonalJson: stringifyJsonSafely(parsedData.informacionPersonal),
        informacionContactoJson: stringifyJsonSafely(parsedData.informacionContacto),
        informacionMedicaJson: stringifyJsonSafely(cleanInformacionMedica),
        contactoEmergenciaJson: stringifyJsonSafely(parsedData.contactoEmergencia)
      };

      console.log('Enviando datos del paciente:', JSON.stringify(dataToSend, null, 2));

      let result;
      if (isEditing && id) {
        result = await pacientesApiService.updatePaciente(parseInt(id), dataToSend);
      } else {
        result = await pacientesApiService.createPaciente(dataToSend);
      }

      console.log('Respuesta del backend:', result);
      navigate('/pacientes');
    } catch (err) {
      console.error('Error al guardar paciente:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar paciente';

      // Mostrar SweetAlert para error de guardado
      await Swal.fire({
        icon: 'error',
        title: isEditing ? 'Error al Actualizar Paciente' : 'Error al Crear Paciente',
        text: errorMessage,
        confirmButtonColor: '#EF4444',
        footer: 'Verifica que todos los campos requeridos estén completos.'
      });

      setError(errorMessage);
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
    setParsedData(prev => ({
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  console.log('🎨 Render: parsedData actual:', parsedData);
  console.log('🎨 Render: Campo primerNombre:', parsedData.informacionPersonal?.primerNombre);
  console.log('🎨 Render: Campo fechaNacimiento:', parsedData.informacionPersonal?.fechaNacimiento);
  console.log('🎨 Render: Campo genero:', parsedData.informacionPersonal?.genero);
  console.log('🎨 Render: Campo telefono:', parsedData.informacionContacto?.telefono);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => navigate('/pacientes')}
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
                <label htmlFor="tipoDocumento" className="block text-sm font-medium leading-6 text-gray-900">
                  Tipo de Documento
                </label>
                <select
                  id="tipoDocumento"
                  value={formData.tipoDocumento}
                  onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="PA">Pasaporte</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="RC">Registro Civil</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="numeroDocumento" className="block text-sm font-medium leading-6 text-gray-900">
                  Número de Documento
                </label>
                <input
                  type="text"
                  id="numeroDocumento"
                  value={formData.numeroDocumento}
                  onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Información Personal */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Información Personal</h3>
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="primerNombre" className="block text-sm font-medium leading-6 text-gray-900">
                  Primer Nombre
                </label>
                <input
                  type="text"
                  id="primerNombre"
                  value={parsedData.informacionPersonal?.primerNombre || ''}
                  onChange={(e) => handleNestedInputChange('informacionPersonal', 'primerNombre', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="segundoNombre" className="block text-sm font-medium leading-6 text-gray-900">
                  Segundo Nombre
                </label>
                <input
                  type="text"
                  id="segundoNombre"
                  value={parsedData.informacionPersonal?.segundoNombre || ''}
                  onChange={(e) => handleNestedInputChange('informacionPersonal', 'segundoNombre', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="primerApellido" className="block text-sm font-medium leading-6 text-gray-900">
                  Primer Apellido
                </label>
                <input
                  type="text"
                  id="primerApellido"
                  value={parsedData.informacionPersonal?.primerApellido || ''}
                  onChange={(e) => handleNestedInputChange('informacionPersonal', 'primerApellido', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="segundoApellido" className="block text-sm font-medium leading-6 text-gray-900">
                  Segundo Apellido
                </label>
                <input
                  type="text"
                  id="segundoApellido"
                  value={parsedData.informacionPersonal?.segundoApellido || ''}
                  onChange={(e) => handleNestedInputChange('informacionPersonal', 'segundoApellido', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="fechaNacimiento" className="block text-sm font-medium leading-6 text-gray-900">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  id="fechaNacimiento"
                  value={parsedData.informacionPersonal?.fechaNacimiento || ''}
                  onChange={(e) => handleNestedInputChange('informacionPersonal', 'fechaNacimiento', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="genero" className="block text-sm font-medium leading-6 text-gray-900">
                  Género
                </label>
                <select
                  id="genero"
                  value={parsedData.informacionPersonal?.genero || ''}
                  onChange={(e) => handleNestedInputChange('informacionPersonal', 'genero', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="estadoCivil" className="block text-sm font-medium leading-6 text-gray-900">
                  Estado Civil
                </label>
                <select
                  id="estadoCivil"
                  value={parsedData.informacionPersonal?.estadoCivil || ''}
                  onChange={(e) => handleNestedInputChange('informacionPersonal', 'estadoCivil', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Seleccionar...</option>
                  <option value="SOLTERO">Soltero</option>
                  <option value="CASADO">Casado</option>
                  <option value="DIVORCIADO">Divorciado</option>
                  <option value="VIUDO">Viudo</option>
                  <option value="UNION_LIBRE">Unión Libre</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Información de Contacto</h3>
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="telefono" className="block text-sm font-medium leading-6 text-gray-900">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="telefono"
                  value={parsedData.informacionContacto?.telefono || ''}
                  onChange={(e) => handleNestedInputChange('informacionContacto', 'telefono', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={parsedData.informacionContacto?.email || ''}
                  onChange={(e) => handleNestedInputChange('informacionContacto', 'email', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="direccion" className="block text-sm font-medium leading-6 text-gray-900">
                  Dirección
                </label>
                <input
                  type="text"
                  id="direccion"
                  value={parsedData.informacionContacto?.direccion || ''}
                  onChange={(e) => handleNestedInputChange('informacionContacto', 'direccion', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="ciudad" className="block text-sm font-medium leading-6 text-gray-900">
                  Ciudad
                </label>
                <input
                  type="text"
                  id="ciudad"
                  value={parsedData.informacionContacto?.ciudad || ''}
                  onChange={(e) => handleNestedInputChange('informacionContacto', 'ciudad', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="departamento" className="block text-sm font-medium leading-6 text-gray-900">
                  Departamento
                </label>
                <input
                  type="text"
                  id="departamento"
                  value={parsedData.informacionContacto?.departamento || ''}
                  onChange={(e) => handleNestedInputChange('informacionContacto', 'departamento', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
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
              <div className="sm:col-span-3">
                <label htmlFor="eps" className="block text-sm font-medium leading-6 text-gray-900">
                  EPS
                </label>
                <input
                  type="text"
                  id="eps"
                  value={parsedData.informacionMedica?.eps || ''}
                  onChange={(e) => handleNestedInputChange('informacionMedica', 'eps', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="Nombre de la EPS..."
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="alergias" className="block text-sm font-medium leading-6 text-gray-900">
                  Alergias
                </label>
                <textarea
                  id="alergias"
                  rows={3}
                  value={parsedData.informacionMedica?.alergias || ''}
                  onChange={(e) => handleNestedInputChange('informacionMedica', 'alergias', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="Describa las alergias del paciente..."
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="medicamentosActuales" className="block text-sm font-medium leading-6 text-gray-900">
                  Medicamentos Actuales
                </label>
                <textarea
                  id="medicamentosActuales"
                  rows={3}
                  value={parsedData.informacionMedica?.medicamentosActuales || ''}
                  onChange={(e) => handleNestedInputChange('informacionMedica', 'medicamentosActuales', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="Liste los medicamentos que toma actualmente..."
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="observacionesMedicas" className="block text-sm font-medium leading-6 text-gray-900">
                  Observaciones Médicas
                </label>
                <textarea
                  id="observacionesMedicas"
                  rows={3}
                  value={parsedData.informacionMedica?.observacionesMedicas || ''}
                  onChange={(e) => handleNestedInputChange('informacionMedica', 'observacionesMedicas', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contacto de Emergencia */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
          <div className="px-4 py-6 sm:p-8">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Contacto de Emergencia</h3>
            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="nombreContacto" className="block text-sm font-medium leading-6 text-gray-900">
                  Nombre del Contacto
                </label>
                <input
                  type="text"
                  id="nombreContacto"
                  value={parsedData.contactoEmergencia?.nombreContacto || ''}
                  onChange={(e) => handleNestedInputChange('contactoEmergencia', 'nombreContacto', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="relacion" className="block text-sm font-medium leading-6 text-gray-900">
                  Relación
                </label>
                <input
                  type="text"
                  id="relacion"
                  value={parsedData.contactoEmergencia?.relacion || ''}
                  onChange={(e) => handleNestedInputChange('contactoEmergencia', 'relacion', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="Padre, Madre, Hermano..."
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="telefonoContacto" className="block text-sm font-medium leading-6 text-gray-900">
                  Teléfono del Contacto
                </label>
                <input
                  type="tel"
                  id="telefonoContacto"
                  value={parsedData.contactoEmergencia?.telefonoContacto || ''}
                  onChange={(e) => handleNestedInputChange('contactoEmergencia', 'telefonoContacto', e.target.value)}
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-x-3">
          <button
            type="button"
            onClick={() => navigate('/pacientes')}
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : (isEditing ? 'Actualizar Paciente' : 'Crear Paciente')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PacienteForm;