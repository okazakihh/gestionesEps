import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import { pacientesApiService } from '../../../services/pacientesApiService.js';

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

const CreatePatientModal = ({ isOpen, onClose, onPatientCreated }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

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

  const validateForm = () => {
    const errors = {};

    // Basic information validation
    if (!formData.numeroDocumento.trim()) {
      errors.numeroDocumento = 'El número de documento es requerido';
    }

    // Personal information validation
    if (!parsedData.informacionPersonal.primerNombre.trim()) {
      errors.primerNombre = 'El primer nombre es requerido';
    }
    if (!parsedData.informacionPersonal.primerApellido.trim()) {
      errors.primerApellido = 'El primer apellido es requerido';
    }
    if (!parsedData.informacionPersonal.fechaNacimiento) {
      errors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    }
    if (!parsedData.informacionPersonal.genero) {
      errors.genero = 'El género es requerido';
    }

    // Contact information validation
    if (!parsedData.informacionContacto.telefono.trim()) {
      errors.telefono = 'El teléfono es requerido';
    }

    // Email validation if provided
    if (parsedData.informacionContacto.email && !/\S+@\S+\.\S+/.test(parsedData.informacionContacto.email)) {
      errors.email = 'El correo electrónico no es válido';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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

      const result = await pacientesApiService.createPaciente(dataToSend);

      console.log('Respuesta del backend:', result);

      // Procesar la respuesta para mergear los datos correctamente
      const processedResult = processApiResponse(result);

      // Mostrar SweetAlert de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Paciente creado exitosamente!',
        text: `El paciente ${processedResult.nombreCompleto || 'ha sido registrado'} con ID: ${processedResult.id}`,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B82F6'
      });

      // Reset form
      setFormData({
        numeroDocumento: '',
        tipoDocumento: 'CC',
        informacionPersonalJson: null,
        informacionContactoJson: null,
        informacionMedicaJson: null,
        contactoEmergenciaJson: null,
        activo: true
      });

      setParsedData({
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

      onPatientCreated && onPatientCreated(processedResult);
      onClose();
    } catch (err) {
      console.error('Error al guardar paciente:', err);

      // Mostrar SweetAlert de error
      await Swal.fire({
        icon: 'error',
        title: 'Error al crear paciente',
        text: err instanceof Error ? err.message : 'Ha ocurrido un error inesperado. Por favor, inténtelo nuevamente.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#EF4444'
      });

      setError(err instanceof Error ? err.message : 'Error al guardar paciente');
    } finally {
      setSaving(false);
    }
  };

  // Función para procesar la respuesta de la API y mergear los datos correctamente
  const processApiResponse = (response) => {
    try {
      // Si la respuesta tiene datosJson, parsearlo y crear la estructura correcta para PatientList
      if (response.datosJson) {
        const parsedData = parseJsonSafely(response.datosJson);

        // Crear la estructura que espera PatientList.parsePatientData
        // PatientList espera: patient.datosJson -> { datosJson: "string with parsed objects" }
        const patientListStructure = {
          informacionPersonal: parsedData.informacionPersonalJson ? parseJsonSafely(parsedData.informacionPersonalJson) : {},
          informacionContacto: parsedData.informacionContactoJson ? parseJsonSafely(parsedData.informacionContactoJson) : {},
          informacionMedica: parsedData.informacionMedicaJson ? parseJsonSafely(parsedData.informacionMedicaJson) : {},
          contactoEmergencia: parsedData.contactoEmergenciaJson ? parseJsonSafely(parsedData.contactoEmergenciaJson) : {}
        };

        // Crear el objeto merged con la información correcta
        const mergedResponse = {
          ...response,
          // Crear la estructura datosJson que espera PatientList exactamente como la espera
          datosJson: stringifyJsonSafely({
            datosJson: stringifyJsonSafely(patientListStructure)
          }),
          // También mantener los campos individuales por si se necesitan
          informacionPersonalJson: parsedData.informacionPersonalJson || response.informacionPersonalJson,
          informacionContactoJson: parsedData.informacionContactoJson || response.informacionContactoJson,
          informacionMedicaJson: parsedData.informacionMedicaJson || response.informacionMedicaJson,
          contactoEmergenciaJson: parsedData.contactoEmergenciaJson || response.contactoEmergenciaJson,
          // Generar nombre completo si no existe
          nombreCompleto: response.nombreCompleto || generateNombreCompleto(patientListStructure),
          // Formatear fechas
          fechaCreacion: formatDateArray(response.fechaCreacion),
          fechaActualizacion: formatDateArray(response.fechaActualizacion)
        };

        console.log('Processed response structure:', {
          originalDatosJson: response.datosJson,
          parsedData,
          patientListStructure,
          finalDatosJson: mergedResponse.datosJson
        });

        return mergedResponse;
      }

      return response;
    } catch (error) {
      console.error('Error procesando respuesta de API:', error);
      return response;
    }
  };

  // Función para formatear arrays de fecha de LocalDateTime
  const formatDateArray = (dateArray) => {
    if (!Array.isArray(dateArray) || dateArray.length < 6) {
      return dateArray;
    }

    try {
      // LocalDateTime comes as [year, month, day, hour, minute, second, nanosecond]
      const [year, month, day, hour, minute, second] = dateArray;
      return new Date(year, month - 1, day, hour, minute, second);
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return dateArray;
    }
  };

  // Función helper para generar nombre completo desde los datos parseados
  const generateNombreCompleto = (parsedData) => {
    try {
      if (parsedData.informacionPersonalJson) {
        const personalData = parseJsonSafely(parsedData.informacionPersonalJson);
        return `${personalData.primerNombre || ''} ${personalData.segundoNombre || ''} ${personalData.primerApellido || ''} ${personalData.segundoApellido || ''}`.trim();
      }
      return '';
    } catch (error) {
      console.error('Error generando nombre completo:', error);
      return '';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-4/5 h-4/5">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Nuevo Paciente</h3>
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

                <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información Básica */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
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
                        Número de Documento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="numeroDocumento"
                        value={formData.numeroDocumento}
                        onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                          validationErrors.numeroDocumento ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
                        }`}
                      />
                      {validationErrors.numeroDocumento && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.numeroDocumento}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Personal */}
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Información Personal</h3>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="primerNombre" className="block text-sm font-medium leading-6 text-gray-900">
                        Primer Nombre <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="primerNombre"
                        value={parsedData.informacionPersonal?.primerNombre || ''}
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'primerNombre', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
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
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'segundoNombre', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="primerApellido" className="block text-sm font-medium leading-6 text-gray-900">
                        Primer Apellido <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="primerApellido"
                        value={parsedData.informacionPersonal?.primerApellido || ''}
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'primerApellido', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
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
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'segundoApellido', e.target.value)}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="fechaNacimiento" className="block text-sm font-medium leading-6 text-gray-900">
                        Fecha de Nacimiento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="fechaNacimiento"
                        value={parsedData.informacionPersonal?.fechaNacimiento || ''}
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'fechaNacimiento', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
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
                        onChange={(e) => handleNestedInputChange('informacionPersonal', 'genero', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset focus:ring-2 sm:text-sm sm:leading-6 ${
                          validationErrors.genero ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
                        }`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="M">Masculino/a</option>
                        <option value="F">Femenino/a</option>
                        <option value="O">Otro</option>
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
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Información de Contacto</h3>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="telefono" className="block text-sm font-medium leading-6 text-gray-900">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        value={parsedData.informacionContacto?.telefono || ''}
                        onChange={(e) => handleNestedInputChange('informacionContacto', 'telefono', e.target.value)}
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                          validationErrors.telefono ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
                        }`}
                      />
                      {validationErrors.telefono && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.telefono}</p>
                      )}
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
                        className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                          validationErrors.email ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
                        }`}
                      />
                      {validationErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                      )}
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
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Información Médica</h3>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
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
              <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Contacto de Emergencia</h3>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
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
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Guardando...' : 'Crear Paciente'}
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

export default CreatePatientModal;