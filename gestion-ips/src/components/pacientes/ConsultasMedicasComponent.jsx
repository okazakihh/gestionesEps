import React, { useState, useEffect } from 'react';
import { ConsultaMedicaDTO, ConsultaSearchParams } from '../../types/pacientes.js';
import { consultasApiService, codigosCupsApiService } from '../../services/pacientesApiService.js';
import ServiceAlert from '../ui/ServiceAlert.jsx';
import { Modal, Button, TextInput, Group, Text, Stack, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Swal from 'sweetalert2';

const ConsultasMedicasComponent = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const [searchParams, setSearchParams] = useState({
    page: 0,
    size: 10
  });

  // Estados para el modal de creación de consulta médica
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [consultaToEdit, setConsultaToEdit] = useState(null);

  // Estados para códigos CUPS
  const [codigosCups, setCodigosCups] = useState([]);
  const [loadingCodigosCups, setLoadingCodigosCups] = useState(false);
  const [selectedCupData, setSelectedCupData] = useState(null);

  // Estados para el formulario de consulta médica
  const [formData, setFormData] = useState({
    historiaClinicaId: '',
    medicoTratante: '',
    especialidad: '',
    registroMedico: '',
    fechaConsulta: '',
    motivoConsulta: '',
    enfermedadActual: '',
    tipoConsulta: 'GENERAL',
    examenFisico: '',
    signosVitales: '',
    diagnosticoPrincipal: '',
    diagnosticosSecundarios: '',
    planManejo: '',
    medicamentosFormulados: '',
    examenesSolicitados: '',
    recomendaciones: '',
    proximaCita: '',
    codigoCups: ''
  });

  useEffect(() => {
    loadConsultas();
    loadCodigosCups();
  }, [searchParams]);

  const loadCodigosCups = async () => {
    try {
      setLoadingCodigosCups(true);
      const response = await codigosCupsApiService.getCodigosCups({ size: 1000 });
      setCodigosCups(response.content || []);
    } catch (error) {
      console.error('Error loading CUPS codes:', error);
    } finally {
      setLoadingCodigosCups(false);
    }
  };

  const loadConsultas = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);
      const response = await consultasApiService.getConsultas(searchParams);
      setConsultas(response.content || []);
    } catch (err) {
      const error = err;
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setConnectionError(true);
        setError('No se pudo conectar con el servicio de consultas médicas. Verifique que el servidor esté ejecutándose.');
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar consultas médicas');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchParams(prev => ({
      ...prev,
      medicoTratante: value || undefined
    }));
  };

  const handleOpenCreateModal = () => {
    setFormData({
      historiaClinicaId: '',
      medicoTratante: '',
      especialidad: '',
      registroMedico: '',
      fechaConsulta: new Date().toISOString().split('T')[0],
      motivoConsulta: '',
      enfermedadActual: '',
      tipoConsulta: 'GENERAL',
      examenFisico: '',
      signosVitales: '',
      diagnosticoPrincipal: '',
      diagnosticosSecundarios: '',
      planManejo: '',
      medicamentosFormulados: '',
      examenesSolicitados: '',
      recomendaciones: '',
      proximaCita: '',
      codigoCups: ''
    });
    setSelectedCupData(null);
    setIsEditMode(false);
    setConsultaToEdit(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-fill fields based on CUPS code selection
    if (field === 'codigoCups' && value) {
      const selectedCup = codigosCups.find(cup => cup.codigoCup === value);
      if (selectedCup && selectedCup.datosJson) {
        try {
          const cupData = JSON.parse(selectedCup.datosJson);
          setSelectedCupData(cupData); // Store CUPS data for display

          const updatedData = {
            ...formData,
            [field]: value,
            // Auto-fill especialidad
            especialidad: cupData.especialidad || formData.especialidad,
            // Auto-fill tipo de consulta basado en el tipo del CUPS
            tipoConsulta: cupData.tipo ? mapCupTypeToConsultaType(cupData.tipo) : formData.tipoConsulta
          };

          setFormData(updatedData);
        } catch (error) {
          console.warn('Error parsing CUPS data:', error);
          setSelectedCupData(null);
        }
      } else {
        setSelectedCupData(null);
      }
    }
  };

  const mapCupTypeToConsultaType = (cupType) => {
    const typeMapping = {
      'Primera vez': 'GENERAL',
      'Control': 'CONTROL',
      'Urgencia': 'URGENCIA',
      'Especializada': 'ESPECIALIZADA'
    };
    return typeMapping[cupType] || 'GENERAL';
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setConsultaToEdit(null);
  };

  const handleCreateConsulta = async () => {
    try {
      setLoading(true);

      const consultaData = {
        historiaClinicaId: parseInt(formData.historiaClinicaId),
        informacionMedico: {
          medicoTratante: formData.medicoTratante,
          especialidad: formData.especialidad,
          registroMedico: formData.registroMedico
        },
        detalleConsulta: {
          fechaConsulta: formData.fechaConsulta,
          motivoConsulta: formData.motivoConsulta,
          enfermedadActual: formData.enfermedadActual,
          tipoConsulta: formData.tipoConsulta,
          codigoCups: formData.codigoCups,
          // Include complete CUPS information if selected
          ...(selectedCupData && {
            informacionCups: selectedCupData
          })
        },
        examenClinico: {
          examenFisico: formData.examenFisico,
          signosVitales: formData.signosVitales
        },
        diagnosticoTratamiento: {
          diagnosticoPrincipal: formData.diagnosticoPrincipal,
          diagnosticosSecundarios: formData.diagnosticosSecundarios,
          planManejo: formData.planManejo,
          medicamentosFormulados: formData.medicamentosFormulados,
          examenesSolicitados: formData.examenesSolicitados,
          recomendaciones: formData.recomendaciones
        },
        seguimiento: {
          proximaCita: formData.proximaCita || undefined
        }
      };

      await consultasApiService.createConsulta(consultaData);

      Swal.fire({
        icon: 'success',
        title: '¡Consulta creada!',
        text: 'La consulta médica ha sido registrada correctamente',
        confirmButtonColor: '#8B5CF6',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });

      setIsModalOpen(false);
      await loadConsultas();

    } catch (error) {
      console.error('Error al crear consulta:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al crear consulta',
        text: error.message || 'Ha ocurrido un error inesperado',
        confirmButtonColor: '#EF4444'
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
          <h2 className="text-2xl font-bold text-gray-900">Consultas Médicas</h2>
          <p className="mt-1 text-sm text-gray-600">Registro y seguimiento de consultas médicas</p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Nueva Consulta
        </Button>
      </div>

      {/* Service Alert */}
      {connectionError && (
        <ServiceAlert
          type="error"
          title="Error de Conexión"
          message="No se pudo conectar con el servicio de consultas médicas. Verifique que el servidor esté ejecutándose en el puerto 8082."
          onRetry={loadConsultas}
          retryLabel="Reintentar Conexión"
        />
      )}

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por médico tratante..."
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Cargando consultas médicas...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Médico
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Especialidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consultas.map((consulta) => (
                    <tr key={consulta.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(consulta.detalleConsulta.fechaConsulta).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {consulta.pacienteNombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {consulta.informacionMedico.medicoTratante}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {consulta.informacionMedico.especialidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {consulta.detalleConsulta.tipoConsulta}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button className="text-purple-600 hover:text-purple-900">
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

          {consultas.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron consultas médicas.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Creación de Consulta Médica */}
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title="Registrar Nueva Consulta Médica"
        size="xl"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="ID de Historia Clínica"
            placeholder="Ingrese el ID de la historia clínica"
            value={formData.historiaClinicaId}
            onChange={(e) => setFormData({...formData, historiaClinicaId: e.target.value})}
            required
          />

          <Group grow>
            <TextInput
              label="Médico Tratante"
              placeholder="Nombre del médico"
              value={formData.medicoTratante}
              onChange={(e) => setFormData({...formData, medicoTratante: e.target.value})}
              required
            />
            <TextInput
              label="Especialidad"
              placeholder="Especialidad médica"
              value={formData.especialidad}
              onChange={(e) => handleInputChange('especialidad', e.target.value)}
              required
            />
          </Group>

          <Group grow>
            <TextInput
              label="Registro Médico"
              placeholder="Número de registro"
              value={formData.registroMedico}
              onChange={(e) => setFormData({...formData, registroMedico: e.target.value})}
            />
            <TextInput
              label="Fecha de Consulta"
              type="date"
              value={formData.fechaConsulta}
              onChange={(e) => setFormData({...formData, fechaConsulta: e.target.value})}
              required
            />
          </Group>

          <TextInput
            label="Motivo de Consulta"
            placeholder="Motivo de la consulta"
            value={formData.motivoConsulta}
            onChange={(e) => setFormData({...formData, motivoConsulta: e.target.value})}
            required
          />

          <TextInput
            label="Enfermedad Actual"
            placeholder="Descripción de la enfermedad actual"
            value={formData.enfermedadActual}
            onChange={(e) => setFormData({...formData, enfermedadActual: e.target.value})}
          />

          <Select
            label="Tipo de Consulta"
            placeholder="Seleccione el tipo"
            data={[
              { value: 'GENERAL', label: 'General' },
              { value: 'ESPECIALIZADA', label: 'Especializada' },
              { value: 'URGENCIA', label: 'Urgencia' },
              { value: 'CONTROL', label: 'Control' }
            ]}
            value={formData.tipoConsulta}
            onChange={(value) => handleInputChange('tipoConsulta', value || 'GENERAL')}
            required
          />

          <Select
            label="Código CUPS *"
            placeholder="Buscar código CUPS..."
            data={codigosCups.map(codigo => ({
              value: codigo.codigoCup,
              label: `${codigo.codigoCup} - ${codigo.nombreCup}`
            }))}
            value={formData.codigoCups}
            onChange={(value) => handleInputChange('codigoCups', value || '')}
            searchable
            clearable={false}
            disabled={loadingCodigosCups}
            required
          />
          {loadingCodigosCups && (
            <Text size="sm" c="dimmed">Cargando códigos CUPS...</Text>
          )}

          {/* Información del Código CUPS seleccionado */}
          {selectedCupData && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Información del Código CUPS</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCupData.categoria && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
                    <TextInput
                      value={selectedCupData.categoria}
                      readOnly
                      className="bg-white"
                      size="sm"
                    />
                  </div>
                )}
                {selectedCupData.especialidad && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Especialidad</label>
                    <TextInput
                      value={selectedCupData.especialidad}
                      readOnly
                      className="bg-white"
                      size="sm"
                    />
                  </div>
                )}
                {selectedCupData.tipo && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                    <TextInput
                      value={selectedCupData.tipo}
                      readOnly
                      className="bg-white"
                      size="sm"
                    />
                  </div>
                )}
                {selectedCupData.ambito && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ámbito</label>
                    <TextInput
                      value={selectedCupData.ambito}
                      readOnly
                      className="bg-white"
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <Group grow>
            <TextInput
              label="Examen Físico"
              placeholder="Resultados del examen físico"
              value={formData.examenFisico}
              onChange={(e) => setFormData({...formData, examenFisico: e.target.value})}
            />
            <TextInput
              label="Signos Vitales"
              placeholder="Presión, temperatura, etc."
              value={formData.signosVitales}
              onChange={(e) => setFormData({...formData, signosVitales: e.target.value})}
            />
          </Group>

          <TextInput
            label="Diagnóstico Principal"
            placeholder="Diagnóstico principal"
            value={formData.diagnosticoPrincipal}
            onChange={(e) => setFormData({...formData, diagnosticoPrincipal: e.target.value})}
            required
          />

          <TextInput
            label="Diagnósticos Secundarios"
            placeholder="Diagnósticos adicionales (opcional)"
            value={formData.diagnosticosSecundarios}
            onChange={(e) => setFormData({...formData, diagnosticosSecundarios: e.target.value})}
          />

          <TextInput
            label="Plan de Manejo"
            placeholder="Plan de tratamiento recomendado"
            value={formData.planManejo}
            onChange={(e) => setFormData({...formData, planManejo: e.target.value})}
          />

          <TextInput
            label="Medicamentos Formulados"
            placeholder="Medicamentos prescritos"
            value={formData.medicamentosFormulados}
            onChange={(e) => setFormData({...formData, medicamentosFormulados: e.target.value})}
          />

          <TextInput
            label="Exámenes Solicitados"
            placeholder="Exámenes médicos solicitados"
            value={formData.examenesSolicitados}
            onChange={(e) => setFormData({...formData, examenesSolicitados: e.target.value})}
          />

          <TextInput
            label="Recomendaciones"
            placeholder="Recomendaciones adicionales"
            value={formData.recomendaciones}
            onChange={(e) => setFormData({...formData, recomendaciones: e.target.value})}
          />

          <TextInput
            label="Próxima Cita"
            type="date"
            placeholder="Fecha de la próxima cita (opcional)"
            value={formData.proximaCita}
            onChange={(e) => setFormData({...formData, proximaCita: e.target.value})}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button
              color="purple"
              onClick={handleCreateConsulta}
              loading={loading}
              disabled={!formData.historiaClinicaId || !formData.medicoTratante || !formData.especialidad || !formData.fechaConsulta || !formData.motivoConsulta || !formData.diagnosticoPrincipal || !formData.codigoCups}
            >
              Crear Consulta
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default ConsultasMedicasComponent;