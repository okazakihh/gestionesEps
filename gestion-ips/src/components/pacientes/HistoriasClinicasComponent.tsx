import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HistoriaClinicaDTO, HistoriaClinicaSearchParams } from '../../types/pacientes';
import { historiasClinicasApiService } from '../../services/pacientesApiService';
import ServiceAlert from '../ui/ServiceAlert';
import { Modal, Button, TextInput, Group, Text, Stack, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';

const HistoriasClinicasComponent: React.FC = () => {
  const [historias, setHistorias] = useState<HistoriaClinicaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<HistoriaClinicaSearchParams>({
    page: 0,
    size: 10
  });

  // Estados para el modal de creación de historia clínica
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [historiaToEdit, setHistoriaToEdit] = useState<HistoriaClinicaDTO | null>(null);

  // Estados para el formulario de historia clínica
  const [formData, setFormData] = useState({
    pacienteId: '',
    medicoResponsable: '',
    registroMedico: '',
    especialidad: '',
    enfermedadActual: '',
    antecedentesPersonales: '',
    antecedentesFamiliares: '',
    antecedentesQuirurgicos: '',
    antecedentesAlergicos: '',
    examenFisico: '',
    signosVitales: '',
    diagnostico: '',
    planTratamiento: '',
    observaciones: ''
  });

  useEffect(() => {
    loadHistorias();
  }, [searchParams]);

  const loadHistorias = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);
      const response = await historiasClinicasApiService.getHistoriasClinicas(searchParams);
      setHistorias(response.content || []);
    } catch (err) {
      const error = err as any;
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

  const handleSearch = (value: string) => {
    setSearchParams(prev => ({
      ...prev,
      numeroHistoria: value || undefined
    }));
  };

  const handleOpenCreateModal = () => {
    setFormData({
      pacienteId: '',
      medicoResponsable: '',
      registroMedico: '',
      especialidad: '',
      enfermedadActual: '',
      antecedentesPersonales: '',
      antecedentesFamiliares: '',
      antecedentesQuirurgicos: '',
      antecedentesAlergicos: '',
      examenFisico: '',
      signosVitales: '',
      diagnostico: '',
      planTratamiento: '',
      observaciones: ''
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

      const historiaData = {
        pacienteId: parseInt(formData.pacienteId),
        fechaApertura: new Date().toISOString(),
        activa: true,
        informacionMedico: {
          medicoResponsable: formData.medicoResponsable,
          registroMedico: formData.registroMedico,
          especialidad: formData.especialidad
        },
        informacionConsulta: {
          motivoConsulta: 'Consulta inicial',
          enfermedadActual: formData.enfermedadActual,
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
          diagnosticos: formData.diagnostico,
          planTratamiento: formData.planTratamiento
        }
      };

      await historiasClinicasApiService.createHistoriaClinica(historiaData);

      notifications.show({
        title: '¡Historia Clínica creada!',
        message: 'La historia clínica ha sido registrada correctamente',
        color: 'green',
        autoClose: 5000,
      });

      setIsModalOpen(false);
      await loadHistorias();

    } catch (error: any) {
      console.error('Error al crear historia clínica:', error);
      notifications.show({
        title: 'Error al crear historia clínica',
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
          <h2 className="text-2xl font-bold text-gray-900">Historias Clínicas</h2>
          <p className="mt-1 text-sm text-gray-600">Gestión de historias clínicas electrónicas</p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Nueva Historia
        </Button>
      </div>

      {/* Service Alert */}
      {connectionError && (
        <ServiceAlert
          type="error"
          title="Error de Conexión"
          message="No se pudo conectar con el servicio de historias clínicas. Verifique que el servidor esté ejecutándose en el puerto 8082."
          onRetry={loadHistorias}
          retryLabel="Reintentar Conexión"
        />
      )}

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

      {/* Modal de Creación de Historia Clínica */}
      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title="Crear Nueva Historia Clínica"
        size="xl"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="ID del Paciente"
            placeholder="Ingrese el ID del paciente"
            value={formData.pacienteId}
            onChange={(e) => setFormData({...formData, pacienteId: e.target.value})}
            required
          />

          <Group grow>
            <TextInput
              label="Médico Responsable"
              placeholder="Nombre del médico"
              value={formData.medicoResponsable}
              onChange={(e) => setFormData({...formData, medicoResponsable: e.target.value})}
              required
            />
            <TextInput
              label="Registro Médico"
              placeholder="Número de registro"
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

          <TextInput
            label="Enfermedad Actual"
            placeholder="Descripción de la enfermedad actual"
            value={formData.enfermedadActual}
            onChange={(e) => setFormData({...formData, enfermedadActual: e.target.value})}
          />

          <TextInput
            label="Antecedentes Personales"
            placeholder="Antecedentes médicos personales"
            value={formData.antecedentesPersonales}
            onChange={(e) => setFormData({...formData, antecedentesPersonales: e.target.value})}
          />

          <TextInput
            label="Antecedentes Familiares"
            placeholder="Antecedentes médicos familiares"
            value={formData.antecedentesFamiliares}
            onChange={(e) => setFormData({...formData, antecedentesFamiliares: e.target.value})}
          />

          <Group grow>
            <TextInput
              label="Antecedentes Quirúrgicos"
              placeholder="Cirugías previas"
              value={formData.antecedentesQuirurgicos}
              onChange={(e) => setFormData({...formData, antecedentesQuirurgicos: e.target.value})}
            />
            <TextInput
              label="Antecedentes Alérgicos"
              placeholder="Alergias conocidas"
              value={formData.antecedentesAlergicos}
              onChange={(e) => setFormData({...formData, antecedentesAlergicos: e.target.value})}
            />
          </Group>

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
            label="Diagnóstico"
            placeholder="Diagnóstico médico"
            value={formData.diagnostico}
            onChange={(e) => setFormData({...formData, diagnostico: e.target.value})}
          />

          <TextInput
            label="Plan de Tratamiento"
            placeholder="Plan de tratamiento recomendado"
            value={formData.planTratamiento}
            onChange={(e) => setFormData({...formData, planTratamiento: e.target.value})}
          />

          <TextInput
            label="Observaciones"
            placeholder="Observaciones adicionales"
            value={formData.observaciones}
            onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button
              color="green"
              onClick={handleCreateHistoriaClinica}
              loading={loading}
              disabled={!formData.pacienteId || !formData.medicoResponsable || !formData.registroMedico || !formData.especialidad}
            >
              Crear Historia Clínica
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default HistoriasClinicasComponent;