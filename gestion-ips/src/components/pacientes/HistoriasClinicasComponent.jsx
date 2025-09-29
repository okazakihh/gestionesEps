import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HistoriaClinicaDTO, HistoriaClinicaSearchParams } from '../../types/pacientes.js';
import { historiasClinicasApiService } from '../../services/pacientesApiService.js';
import { useClinicalHistory } from '../../context/ClinicalHistoryContext.jsx';
import ServiceAlert from '../ui/ServiceAlert.jsx';
import { Modal, Button, TextInput, Textarea, Group, Text, Stack, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';

const HistoriasClinicasComponent = () => {
  const [searchParams] = useSearchParams();
  const pacienteId = searchParams.get('pacienteId');

  // Usar el contexto para obtener los datos del paciente y historia clínica
  const {
    currentPatient: pacienteData,
    currentHistoriaClinica: historiaClinicaData,
    consultas,
    isLoading: contextLoading
  } = useClinicalHistory();

  const [historias, setHistorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const [queryParams, setQueryParams] = useState({
    page: 0,
    size: 10
  });

  // Estados para el modal de creación de historia clínica
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [historiaToEdit, setHistoriaToEdit] = useState(null);

  // Estados para el formulario de consulta médica
  const [formData, setFormData] = useState({
    pacienteId: '',
    // Información del médico
    medicoResponsable: '',
    registroMedico: '',
    especialidad: '',
    // Información de la consulta
    fechaConsulta: new Date().toISOString().split('T')[0],
    horaConsulta: new Date().toTimeString().split(' ')[0].substring(0, 5),
    motivoConsulta: '',
    enfermedadActual: '',
    revisionSistemas: '',
    medicamentosActuales: '',
    // Examen clínico
    examenFisico: '',
    signosVitales: '',
    // Diagnóstico y tratamiento
    diagnosticos: '',
    planTratamiento: '',
    indicaciones: '',
    proximaCita: '',
    observaciones: '',
    // Fórmula médica
    formulaMedica: '',
    // Incapacidad
    incapacidad: '',
    diasIncapacidad: '',
    // Solo para historia inicial
    antecedentesPersonales: '',
    antecedentesFamiliares: '',
    antecedentesQuirurgicos: '',
    antecedentesAlergicos: ''
  });

  useEffect(() => {
    if (pacienteId) {
      // Los datos del paciente ya están cargados en el contexto
      // Solo necesitamos manejar el estado de carga del contexto
      setLoading(contextLoading);
    } else {
      loadHistorias();
    }
  }, [pacienteId, queryParams, contextLoading]);

  const loadHistorias = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);
      const response = await historiasClinicasApiService.getHistoriasClinicas(queryParams);
      setHistorias(response.content || []);
    } catch (err) {
      const error = err;
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setConnectionError(true);
        setError('No se pudo conectar con el servicio de historias clínicas. Verifique que el servidor esté ejecutándose.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar historias clínicas');
      }
    } finally {
      setLoading(false);
    }
  };

  // Usar el contexto para actualizar datos
  const { addConsulta } = useClinicalHistory();

  const handleSearch = (value) => {
    setQueryParams(prev => ({
      ...prev,
      numeroHistoria: value || undefined
    }));
  };

  const handleOpenCreateModal = () => {
    const isInitialHistory = !historiaClinicaData;

    setFormData({
      pacienteId: pacienteId || '',
      // Información del médico
      medicoResponsable: '',
      registroMedico: '',
      especialidad: '',
      // Información de la consulta
      fechaConsulta: new Date().toISOString().split('T')[0],
      horaConsulta: new Date().toTimeString().split(' ')[0].substring(0, 5),
      motivoConsulta: '',
      enfermedadActual: '',
      revisionSistemas: '',
      medicamentosActuales: '',
      // Examen clínico
      examenFisico: '',
      signosVitales: '',
      // Diagnóstico y tratamiento
      diagnosticos: '',
      planTratamiento: '',
      indicaciones: '',
      proximaCita: '',
      observaciones: '',
      // Fórmula médica
      formulaMedica: '',
      // Incapacidad
      incapacidad: '',
      diasIncapacidad: '',
      // Solo para historia inicial
      antecedentesPersonales: isInitialHistory ? '' : undefined,
      antecedentesFamiliares: isInitialHistory ? '' : undefined,
      antecedentesQuirurgicos: isInitialHistory ? '' : undefined,
      antecedentesAlergicos: isInitialHistory ? '' : undefined
    });
    setIsEditMode(false);
    setHistoriaToEdit(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setHistoriaToEdit(null);
  };

  const handleCreateHistoriaClinica = async () => {
    try {
      setLoading(true);

      const isInitialHistory = !historiaClinicaData;

      if (isInitialHistory) {
        // Crear historia clínica inicial - enviar JSON directamente
        const historiaJson = JSON.stringify({
          pacienteId: parseInt(formData.pacienteId || pacienteId),
          fechaApertura: new Date().toISOString(),
          activa: true,
          informacionMedico: {
            medicoResponsable: formData.medicoResponsable,
            registroMedico: formData.registroMedico,
            especialidad: formData.especialidad
          },
          informacionConsulta: {
            motivoConsulta: formData.motivoConsulta,
            enfermedadActual: formData.enfermedadActual,
            revisionSistemas: formData.revisionSistemas,
            medicamentosActuales: formData.medicamentosActuales,
            observaciones: formData.observaciones
          },
          antecedentesClinico: {
            antecedentesPersonales: formData.antecedentesPersonales,
            antecedentesFamiliares: formData.antecedentesFamiliares,
            antecedentesQuirurgicos: formData.antecedentesQuirurgicos,
            antecedentesAlergicos: formData.antecedentesAlergicos
          },
          examenClinico: {
            examenFisico: formData.examenFisico,
            signosVitales: formData.signosVitales
          },
          diagnosticoTratamiento: {
            diagnosticos: formData.diagnosticos,
            planTratamiento: formData.planTratamiento
          }
        });

        await historiasClinicasApiService.createHistoriaClinica(parseInt(formData.pacienteId || pacienteId), historiaJson);

        notifications.show({
          title: '¡Historia Clínica creada!',
          message: 'La historia clínica inicial ha sido registrada correctamente',
          color: 'green',
          autoClose: 5000,
        });
      } else {
        // Crear nueva consulta médica - estructura simplificada como JSON
        const consultaJson = JSON.stringify({
          informacionMedico: {
            medicoTratante: formData.medicoResponsable,
            registroMedico: formData.registroMedico,
            especialidad: formData.especialidad
          },
          detalleConsulta: {
            fechaConsulta: `${formData.fechaConsulta}T${formData.horaConsulta}:00`,
            motivoConsulta: formData.motivoConsulta,
            enfermedadActual: formData.enfermedadActual,
            revisionSistemas: formData.revisionSistemas,
            tipoConsulta: "CONTROL"
          },
          examenClinico: {
            examenFisico: formData.examenFisico,
            signosVitales: formData.signosVitales
          },
          diagnosticoTratamiento: {
            diagnosticoPrincipal: formData.diagnosticos,
            planManejo: formData.planTratamiento,
            medicamentosFormulados: formData.medicamentosActuales,
            recomendaciones: formData.observaciones
          },
          formulaMedica: {
            medicamentos: formData.formulaMedica
          },
          incapacidad: {
            tipo: formData.incapacidad,
            dias: formData.diasIncapacidad ? parseInt(formData.diasIncapacidad) : null
          },
          seguimiento: {
            indicaciones: formData.indicaciones,
            proximaCita: formData.proximaCita ? `${formData.proximaCita}T00:00:00` : null
          }
        });

        // Llamar al endpoint simplificado para crear consulta
        const nuevaConsulta = await historiasClinicasApiService.crearConsulta(historiaClinicaData.id, consultaJson);

        // Agregar la nueva consulta al contexto
        addConsulta(nuevaConsulta);

        notifications.show({
          title: '¡Consulta agregada!',
          message: 'La consulta ha sido registrada en la historia clínica',
          color: 'green',
          autoClose: 5000,
        });
      }

      setIsModalOpen(false);
      if (!pacienteId) {
        await loadHistorias();
      }

    } catch (error) {
      console.error('Error al procesar:', error);
      const action = historiaClinicaData ? 'agregar consulta' : 'crear historia clínica';
      notifications.show({
        title: `Error al ${action}`,
        message: error.message || 'Ha ocurrido un error inesperado',
        color: 'red',
        autoClose: 7000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {pacienteId ? `Historia Clínica - ${pacienteData?.informacionPersonal?.nombreCompleto || 'Paciente'}` : 'Historias Clínicas'}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {pacienteId ? (
              historiaClinicaData ?
                `Historia clínica activa - Número: ${historiaClinicaData.numeroHistoria}` :
                'El paciente no tiene historia clínica registrada'
            ) : 'Gestión de historias clínicas electrónicas'}
          </p>
        </div>
        {pacienteId && pacienteData && (
          <Button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {historiaClinicaData ? 'Agregar Consulta' : 'Crear Historia Clínica'}
          </Button>
        )}
      </div>

      {/* Service Alert */}
      {connectionError && (
        <ServiceAlert
          type="error"
          title="Error de Conexión"
          message={pacienteId
            ? "No se pudo conectar con el servicio de pacientes. Verifique que el servidor esté ejecutándose."
            : "No se pudo conectar con el servicio de historias clínicas. Verifique que el servidor esté ejecutándose en el puerto 8082."
          }
          onRetry={loadHistorias}
          retryLabel="Reintentar Conexión"
        />
      )}

      {/* Content based on mode */}
      {pacienteId ? (
        /* Patient Information Cards */
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Cargando información del paciente...</p>
            </div>
          ) : pacienteData ? (
            <>
              {/* Información Básica del Paciente */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <span className="mr-2">👤</span>
                  Información del Paciente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Nombre Completo:</span>
                    <p className="text-sm text-gray-900">
                      {(() => {
                        // Calcular nombre completo desde campos individuales
                        const info = pacienteData.informacionPersonal || {};
                        const nombres = [info.primerNombre, info.segundoNombre].filter(Boolean).join(' ');
                        const apellidos = [info.primerApellido, info.segundoApellido].filter(Boolean).join(' ');
                        return [nombres, apellidos].filter(Boolean).join(' ') || 'N/A';
                      })()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Fecha de Nacimiento:</span>
                    <p className="text-sm text-gray-900">{pacienteData.informacionPersonal?.fechaNacimiento || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Edad:</span>
                    <p className="text-sm text-gray-900">
                      {(() => {
                        // Calcular edad desde fecha de nacimiento
                        const fechaNacimiento = pacienteData.informacionPersonal?.fechaNacimiento;
                        if (!fechaNacimiento) return 'N/A';

                        try {
                          const nacimiento = new Date(fechaNacimiento);
                          const hoy = new Date();
                          let edad = hoy.getFullYear() - nacimiento.getFullYear();
                          const mes = hoy.getMonth() - nacimiento.getMonth();

                          if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
                            edad--;
                          }

                          return `${edad} años`;
                        } catch (error) {
                          console.error('Error calculando edad:', error);
                          return 'N/A';
                        }
                      })()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Sexo:</span>
                    <p className="text-sm text-gray-900">{pacienteData.informacionPersonal?.genero || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Información Médica */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                  <span className="mr-2">🏥</span>
                  Información Médica
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Alergias:</span>
                    <span className="text-sm text-gray-900 ml-2">{pacienteData.informacionMedica?.alergias || 'Ninguna'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Medicamentos Actuales:</span>
                    <span className="text-sm text-gray-900 ml-2">{pacienteData.informacionMedica?.medicamentosActuales || 'Ninguno'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Observaciones Médicas:</span>
                    <span className="text-sm text-gray-900 ml-2">{pacienteData.informacionMedica?.observacionesMedicas || 'Ninguna'}</span>
                  </div>
                </div>
              </div>

              {/* Historia Clínica - Timeline de Consultas */}
              {historiaClinicaData ? (
                <>
                  {/* Información General de la Historia */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                      <span className="mr-2">📋</span>
                      Historia Clínica - {historiaClinicaData.numeroHistoria}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Estado:</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                          historiaClinicaData.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {historiaClinicaData.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Fecha de Apertura:</span>
                        <p className="text-sm text-gray-900">
                          {historiaClinicaData.fechaApertura ? new Date(historiaClinicaData.fechaApertura).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Total Consultas:</span>
                        <p className="text-sm text-gray-900">{historiaClinicaData.numeroConsultas || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline de Consultas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <span className="mr-2">📅</span>
                      Cronología de Consultas
                    </h3>

                    {/* Preparar todas las consultas para mostrar */}
                    {(() => {
                       const allConsultas = [];

                       // Parsear datos JSON de la historia clínica
                       let historiaData = {};
                       try {
                         historiaData = JSON.parse(historiaClinicaData.datosJson || '{}');
                       } catch (error) {
                         console.error('Error parsing historia clinica JSON:', error);
                       }

                       // Agregar consulta inicial (apertura de historia)
                       allConsultas.push({
                         id: `initial-${historiaClinicaData.id}`,
                         numero: 1,
                         tipo: 'Consulta Inicial',
                         fecha: historiaClinicaData.fechaApertura,
                         medico: historiaData.informacionMedico?.medicoResponsable,
                         especialidad: historiaData.informacionMedico?.especialidad,
                         motivo: historiaData.informacionConsulta?.motivoConsulta || 'Apertura de historia clínica',
                         enfermedadActual: historiaData.informacionConsulta?.enfermedadActual,
                         diagnosticos: historiaData.diagnosticoTratamiento?.diagnosticos,
                         planTratamiento: historiaData.diagnosticoTratamiento?.planTratamiento,
                         antecedentes: historiaData.antecedentesClinico,
                         examenFisico: historiaData.examenClinico?.examenFisico,
                         signosVitales: historiaData.examenClinico?.signosVitales,
                         observaciones: historiaData.informacionConsulta?.observaciones
                       });

                       // Agregar consultas posteriores desde el contexto
                       consultas.forEach((consulta, index) => {
                         try {
                           // Parsear el JSON almacenado en la base de datos
                           const consultaData = JSON.parse(consulta.datosJson || '{}');

                           allConsultas.push({
                             id: consulta.id,
                             numero: index + 2,
                             tipo: 'Consulta Médica',
                             fecha: consultaData.detalleConsulta?.fechaConsulta || consulta.fechaCreacion,
                             medico: consultaData.informacionMedico?.medicoTratante,
                             especialidad: consultaData.informacionMedico?.especialidad,
                             motivo: consultaData.detalleConsulta?.motivoConsulta,
                             enfermedadActual: consultaData.detalleConsulta?.enfermedadActual,
                             diagnosticos: consultaData.diagnosticoTratamiento?.diagnosticoPrincipal,
                             planTratamiento: consultaData.diagnosticoTratamiento?.planManejo,
                             examenFisico: consultaData.examenClinico?.examenFisico,
                             signosVitales: consultaData.examenClinico?.signosVitales,
                             formulaMedica: consultaData.formulaMedica?.medicamentos,
                             incapacidad: consultaData.incapacidad,
                             indicaciones: consultaData.seguimiento?.indicaciones,
                             proximaCita: consultaData.seguimiento?.proximaCita,
                             observaciones: consultaData.diagnosticoTratamiento?.recomendaciones
                           });
                         } catch (error) {
                           console.error('Error parsing consulta JSON:', error);
                           // Fallback con datos básicos
                           allConsultas.push({
                             id: consulta.id,
                             numero: index + 2,
                             tipo: 'Consulta Médica',
                             fecha: consulta.fechaCreacion,
                             medico: 'Error al cargar datos',
                             motivo: 'Datos no disponibles'
                           });
                         }
                       });

                       // Ordenar por fecha
                       allConsultas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

                      return (
                        <>
                          {allConsultas.map((consulta, index) => (
                            <div key={consulta.id} className="relative">
                              {/* Línea de conexión */}
                              {index < allConsultas.length - 1 && (
                                <div className="absolute left-5 top-10 w-0.5 h-full bg-gray-300"></div>
                              )}

                              <div className="flex items-start">
                                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">{consulta.numero}</span>
                                </div>
                                <div className="ml-4 flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-md font-semibold text-gray-900">{consulta.tipo}</h4>
                                    <div className="text-right">
                                      <div className="text-sm text-gray-500">
                                        {consulta.fecha ? new Date(consulta.fecha).toLocaleDateString() : 'Fecha no disponible'}
                                      </div>
                                      {consulta.fecha && (
                                        <div className="text-xs text-gray-400">
                                          {new Date(consulta.fecha).toLocaleTimeString()}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Información del médico */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                                    <div>
                                      <span className="font-medium text-gray-600">Médico:</span>
                                      <p className="text-gray-900">{consulta.medico || 'N/A'}</p>
                                    </div>
                                    {consulta.especialidad && (
                                      <div>
                                        <span className="font-medium text-gray-600">Especialidad:</span>
                                        <p className="text-gray-900">{consulta.especialidad}</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Motivo de consulta */}
                                  <div className="mb-3">
                                    <span className="font-medium text-gray-600 text-sm">Motivo:</span>
                                    <p className="text-gray-900 text-sm mt-1 p-2 bg-gray-50 rounded">{consulta.motivo || 'No especificado'}</p>
                                  </div>

                                  {/* Enfermedad actual */}
                                  {consulta.enfermedadActual && (
                                    <div className="mb-3">
                                      <span className="font-medium text-gray-600 text-sm">Enfermedad Actual:</span>
                                      <p className="text-gray-900 text-sm mt-1 p-2 bg-gray-50 rounded">{consulta.enfermedadActual}</p>
                                    </div>
                                  )}

                                  {/* Revisión por sistemas (solo consultas posteriores) */}
                                  {consulta.revisionSistemas && (
                                    <div className="mb-3">
                                      <span className="font-medium text-gray-600 text-sm">Revisión por Sistemas:</span>
                                      <p className="text-gray-900 text-sm mt-1 p-2 bg-gray-50 rounded">{consulta.revisionSistemas}</p>
                                    </div>
                                  )}

                                  {/* Medicamentos actuales */}
                                  {consulta.medicamentosActuales && (
                                    <div className="mb-3">
                                      <span className="font-medium text-gray-600 text-sm">Medicamentos Actuales:</span>
                                      <p className="text-gray-900 text-sm mt-1 p-2 bg-gray-50 rounded">{consulta.medicamentosActuales}</p>
                                    </div>
                                  )}

                                  {/* Examen clínico */}
                                  {(consulta.examenFisico || consulta.signosVitales) && (
                                    <div className="mb-3 p-3 bg-blue-50 rounded">
                                      <span className="font-medium text-blue-900 text-sm">Examen Clínico:</span>
                                      {consulta.examenFisico && (
                                        <p className="text-blue-800 text-sm mt-1"><strong>Físico:</strong> {consulta.examenFisico}</p>
                                      )}
                                      {consulta.signosVitales && (
                                        <p className="text-blue-800 text-sm mt-1"><strong>Signos Vitales:</strong> {consulta.signosVitales}</p>
                                      )}
                                    </div>
                                  )}

                                  {/* Diagnóstico y tratamiento */}
                                  {(consulta.diagnosticos || consulta.planTratamiento) && (
                                    <div className="mb-3 p-3 bg-green-50 rounded">
                                      <span className="font-medium text-green-900 text-sm">Diagnóstico y Tratamiento:</span>
                                      {consulta.diagnosticos && (
                                        <p className="text-green-800 text-sm mt-1"><strong>Diagnósticos:</strong> {consulta.diagnosticos}</p>
                                      )}
                                      {consulta.planTratamiento && (
                                        <p className="text-green-800 text-sm mt-1"><strong>Plan:</strong> {consulta.planTratamiento}</p>
                                      )}
                                    </div>
                                  )}

                                  {/* Fórmula Médica */}
                                  {consulta.formulaMedica && (
                                    <div className="mb-3 p-3 bg-blue-50 rounded">
                                      <span className="font-medium text-blue-900 text-sm">💊 Fórmula Médica:</span>
                                      <p className="text-blue-800 text-sm mt-1">{consulta.formulaMedica}</p>
                                    </div>
                                  )}

                                  {/* Incapacidad */}
                                  {consulta.incapacidad && (consulta.incapacidad.tipo || consulta.incapacidad.dias) && (
                                    <div className="mb-3 p-3 bg-orange-50 rounded">
                                      <span className="font-medium text-orange-900 text-sm">📄 Incapacidad:</span>
                                      {consulta.incapacidad.tipo && (
                                        <p className="text-orange-800 text-sm mt-1"><strong>Tipo:</strong> {consulta.incapacidad.tipo}</p>
                                      )}
                                      {consulta.incapacidad.dias && (
                                        <p className="text-orange-800 text-sm mt-1"><strong>Días:</strong> {consulta.incapacidad.dias}</p>
                                      )}
                                    </div>
                                  )}

                                  {/* Indicaciones y próxima cita */}
                                  {(consulta.indicaciones || consulta.proximaCita) && (
                                    <div className="mb-3 p-3 bg-yellow-50 rounded">
                                      <span className="font-medium text-yellow-900 text-sm">Seguimiento:</span>
                                      {consulta.indicaciones && (
                                        <p className="text-yellow-800 text-sm mt-1"><strong>Indicaciones:</strong> {consulta.indicaciones}</p>
                                      )}
                                      {consulta.proximaCita && (
                                        <p className="text-yellow-800 text-sm mt-1"><strong>Próxima Cita:</strong> {consulta.proximaCita}</p>
                                      )}
                                    </div>
                                  )}

                                  {/* Antecedentes (solo para consulta inicial) */}
                                  {consulta.antecedentes && (
                                    <div className="mb-3 p-3 bg-purple-50 rounded">
                                      <span className="font-medium text-purple-900 text-sm">Antecedentes Médicos:</span>
                                      {consulta.antecedentes.antecedentesPersonales && (
                                        <p className="text-purple-800 text-sm mt-1"><strong>Personales:</strong> {consulta.antecedentes.antecedentesPersonales}</p>
                                      )}
                                      {consulta.antecedentes.antecedentesFamiliares && (
                                        <p className="text-purple-800 text-sm mt-1"><strong>Familiares:</strong> {consulta.antecedentes.antecedentesFamiliares}</p>
                                      )}
                                      {consulta.antecedentes.antecedentesQuirurgicos && (
                                        <p className="text-purple-800 text-sm mt-1"><strong>Quirúrgicos:</strong> {consulta.antecedentes.antecedentesQuirurgicos}</p>
                                      )}
                                      {consulta.antecedentes.antecedentesAlergicos && (
                                        <p className="text-purple-800 text-sm mt-1"><strong>Alérgicos:</strong> {consulta.antecedentes.antecedentesAlergicos}</p>
                                      )}
                                    </div>
                                  )}

                                  {/* Observaciones */}
                                  {consulta.observaciones && (
                                    <div className="mb-3">
                                      <span className="font-medium text-gray-600 text-sm">Observaciones:</span>
                                      <p className="text-gray-900 text-sm mt-1 p-2 bg-gray-50 rounded">{consulta.observaciones}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Mensaje si solo hay la consulta inicial */}
                          {allConsultas.length === 1 && (
                            <div className="text-center py-8 text-gray-500">
                              <div className="text-4xl mb-2">📝</div>
                              <p>Solo se muestra la consulta inicial</p>
                              <p className="text-sm mt-1">Las consultas posteriores aparecerán aquí automáticamente</p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </>
              ) : (
                /* No hay historia clínica */
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <div className="text-yellow-600 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">No hay Historia Clínica Registrada</h3>
                  <p className="text-sm text-yellow-700 mb-4">
                    Este paciente aún no tiene una historia clínica registrada en el sistema.
                  </p>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Crear Historia Clínica
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No se pudo cargar la información del paciente.</p>
            </div>
          )}
        </div>
      ) : (
        /* Normal List View */
        <>
          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por número de historia..."
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Cargando historias clínicas...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          N° Historia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paciente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Médico
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {historias.map((historia) => (
                        <tr key={historia.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {historia.numeroHistoria}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {historia.pacienteNombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {historia.informacionMedico?.medicoResponsable || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(historia.fechaApertura).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              historia.activa
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {historia.activa ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button className="text-green-600 hover:text-green-900">
                              Ver
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {historias.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No se encontraron historias clínicas.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal de Consulta Médica */}
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title={historiaClinicaData ? "Agregar Nueva Consulta" : "Crear Historia Clínica Inicial"}
        size="xl"
        centered
      >
        <Stack gap="md">
          {pacienteId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-blue-900">Paciente:</span>
                <span className="ml-2 text-sm text-blue-700">{pacienteData?.informacionPersonal?.nombreCompleto || 'Cargando...'}</span>
              </div>
            </div>
          )}

          {/* Información del Médico */}
          <div className="border-t pt-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">👨‍⚕️ Información del Médico</h4>
            <Group grow>
              <TextInput
                label="Médico Responsable"
                placeholder="Nombre completo del médico"
                value={formData.medicoResponsable}
                onChange={(e) => setFormData({...formData, medicoResponsable: e.target.value})}
                required
              />
              <TextInput
                label="Registro Médico"
                placeholder="Número de registro profesional"
                value={formData.registroMedico}
                onChange={(e) => setFormData({...formData, registroMedico: e.target.value})}
                required
              />
            </Group>

            <TextInput
              label="Especialidad"
              placeholder="Especialidad médica"
              value={formData.especialidad}
              onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
              required
            />
          </div>

          {/* Fecha y Hora de Consulta */}
          <div className="border-t pt-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">📅 Fecha y Hora de Consulta</h4>
            <Group grow>
              <TextInput
                label="Fecha de Consulta"
                type="date"
                value={formData.fechaConsulta}
                onChange={(e) => setFormData({...formData, fechaConsulta: e.target.value})}
                required
              />
              <TextInput
                label="Hora de Consulta"
                type="time"
                value={formData.horaConsulta}
                onChange={(e) => setFormData({...formData, horaConsulta: e.target.value})}
                required
              />
            </Group>
          </div>

          {/* Información de la Consulta */}
          <div className="border-t pt-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">📋 Información de la Consulta</h4>
            <Textarea
              label="Motivo de Consulta"
              placeholder="¿Por qué viene el paciente?"
              value={formData.motivoConsulta}
              onChange={(e) => setFormData({...formData, motivoConsulta: e.target.value})}
              required
              minRows={2}
            />

            <Textarea
              label="Enfermedad Actual"
              placeholder="Descripción detallada de la enfermedad actual"
              value={formData.enfermedadActual}
              onChange={(e) => setFormData({...formData, enfermedadActual: e.target.value})}
              minRows={3}
            />

            <Textarea
              label="Revisión por Sistemas"
              placeholder="Revisión de sistemas (cardiovascular, respiratorio, etc.)"
              value={formData.revisionSistemas}
              onChange={(e) => setFormData({...formData, revisionSistemas: e.target.value})}
              minRows={3}
            />

            <Textarea
              label="Medicamentos Actuales"
              placeholder="Medicamentos que toma actualmente el paciente"
              value={formData.medicamentosActuales}
              onChange={(e) => setFormData({...formData, medicamentosActuales: e.target.value})}
              minRows={2}
            />
          </div>

          {/* Examen Clínico */}
          <div className="border-t pt-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">🔍 Examen Clínico</h4>
            <Group grow>
              <Textarea
                label="Examen Físico"
                placeholder="Resultados del examen físico"
                value={formData.examenFisico}
                onChange={(e) => setFormData({...formData, examenFisico: e.target.value})}
                minRows={3}
              />
              <Textarea
                label="Signos Vitales"
                placeholder="TA, FC, FR, Temp, SatO2, etc."
                value={formData.signosVitales}
                onChange={(e) => setFormData({...formData, signosVitales: e.target.value})}
                minRows={3}
              />
            </Group>
          </div>

          {/* Diagnóstico y Tratamiento */}
          <div className="border-t pt-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">💊 Diagnóstico y Tratamiento</h4>
            <Textarea
              label="Diagnósticos"
              placeholder="Diagnósticos médicos identificados"
              value={formData.diagnosticos}
              onChange={(e) => setFormData({...formData, diagnosticos: e.target.value})}
              minRows={2}
            />

            <Textarea
              label="Plan de Tratamiento"
              placeholder="Tratamientos y procedimientos recomendados"
              value={formData.planTratamiento}
              onChange={(e) => setFormData({...formData, planTratamiento: e.target.value})}
              minRows={3}
            />

            <Textarea
              label="Indicaciones"
              placeholder="Indicaciones específicas para el paciente"
              value={formData.indicaciones}
              onChange={(e) => setFormData({...formData, indicaciones: e.target.value})}
              minRows={2}
            />

            <TextInput
              label="Próxima Cita"
              placeholder="Fecha sugerida para la próxima consulta"
              value={formData.proximaCita}
              onChange={(e) => setFormData({...formData, proximaCita: e.target.value})}
            />
          </div>

          {/* Fórmula Médica */}
          <div className="border-t pt-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">💊 Fórmula Médica</h4>
            <Textarea
              label="Medicamentos Formulados"
              placeholder="Detalle los medicamentos prescritos (nombre, dosis, frecuencia, duración)"
              value={formData.formulaMedica}
              onChange={(e) => setFormData({...formData, formulaMedica: e.target.value})}
              minRows={3}
            />
          </div>

          {/* Incapacidad */}
          <div className="border-t pt-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">📄 Incapacidad (si aplica)</h4>
            <Group grow>
              <Textarea
                label="Tipo de Incapacidad"
                placeholder="Ej: Enfermedad general, Accidente laboral, etc."
                value={formData.incapacidad}
                onChange={(e) => setFormData({...formData, incapacidad: e.target.value})}
                minRows={2}
              />
              <TextInput
                label="Días de Incapacidad"
                type="number"
                placeholder="Número de días"
                value={formData.diasIncapacidad}
                onChange={(e) => setFormData({...formData, diasIncapacidad: e.target.value})}
              />
            </Group>
          </div>

          {/* Antecedentes (solo para historia inicial) */}
          {!historiaClinicaData && (
            <div className="border-t pt-4">
              <h4 className="text-md font-semibold text-gray-900 mb-3">📚 Antecedentes Médicos</h4>
              <Textarea
                label="Antecedentes Personales"
                placeholder="Enfermedades previas, cirugías, etc."
                value={formData.antecedentesPersonales}
                onChange={(e) => setFormData({...formData, antecedentesPersonales: e.target.value})}
                minRows={2}
              />

              <Textarea
                label="Antecedentes Familiares"
                placeholder="Enfermedades en familiares directos"
                value={formData.antecedentesFamiliares}
                onChange={(e) => setFormData({...formData, antecedentesFamiliares: e.target.value})}
                minRows={2}
              />

              <Group grow>
                <Textarea
                  label="Antecedentes Quirúrgicos"
                  placeholder="Cirugías previas"
                  value={formData.antecedentesQuirurgicos}
                  onChange={(e) => setFormData({...formData, antecedentesQuirurgicos: e.target.value})}
                  minRows={2}
                />
                <Textarea
                  label="Antecedentes Alérgicos"
                  placeholder="Alergias conocidas"
                  value={formData.antecedentesAlergicos}
                  onChange={(e) => setFormData({...formData, antecedentesAlergicos: e.target.value})}
                  minRows={2}
                />
              </Group>
            </div>
          )}

          {/* Observaciones */}
          <div className="border-t pt-4">
            <Textarea
              label="Observaciones"
              placeholder="Observaciones adicionales de la consulta"
              value={formData.observaciones}
              onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
              minRows={2}
            />
          </div>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button
              color="green"
              onClick={handleCreateHistoriaClinica}
              loading={loading}
              disabled={!(formData.pacienteId || pacienteId) || !formData.medicoResponsable || !formData.registroMedico || !formData.especialidad || !formData.motivoConsulta}
            >
              {historiaClinicaData ? 'Agregar Consulta' : 'Crear Historia Clínica'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default HistoriasClinicasComponent;