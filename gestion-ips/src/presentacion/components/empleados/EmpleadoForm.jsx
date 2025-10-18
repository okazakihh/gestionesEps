import React, { useState, useEffect } from 'react';
import { TextInput, Select, Group, Stack, Loader } from '@mantine/core';
import { TIPOS_DOCUMENTO, GENEROS, TIPOS_CONTRATO } from '../../../negocio/utils/loadHelpers';
import * as geografiaApiService from '../../../data/services/geografiaApiService';

/**
 * Formulario reutilizable para crear/editar empleados
 */
const EmpleadoForm = ({ formData, setFormData, mode = 'create' }) => {
  // Estados para geografía
  const [paisesDisponibles, setPaisesDisponibles] = useState([]);
  const [departamentosDisponibles, setDepartamentosDisponibles] = useState([]);
  const [ciudadesDisponibles, setCiudesDisponibles] = useState([]);
  
  // Estados de carga
  const [loadingPaises, setLoadingPaises] = useState(true);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);
  const [loadingCiudades, setLoadingCiudades] = useState(false);

  // Cargar países al montar el componente
  useEffect(() => {
    const cargarPaises = async () => {
      try {
        setLoadingPaises(true);
        const paises = await geografiaApiService.obtenerPaises();
        setPaisesDisponibles(paises);
      } catch (error) {
        console.error('Error al cargar países:', error);
      } finally {
        setLoadingPaises(false);
      }
    };
    cargarPaises();
  }, []);

  // Cargar departamentos cuando cambia el país
  useEffect(() => {
    const cargarDepartamentos = async () => {
      if (!formData.pais) {
        setDepartamentosDisponibles([]);
        return;
      }

      try {
        setLoadingDepartamentos(true);
        const codigoPaisNormalizado = normalizarCodigoPais(formData.pais);
        const departamentos = await geografiaApiService.obtenerEstadosPorPais(codigoPaisNormalizado);
        setDepartamentosDisponibles(departamentos);
        
        // NO limpiar departamento/ciudad automáticamente - dejar que el usuario lo cambie manualmente
      } catch (error) {
        console.error('Error al cargar departamentos:', error);
        setDepartamentosDisponibles([]);
      } finally {
        setLoadingDepartamentos(false);
      }
    };
    cargarDepartamentos();
  }, [formData.pais]);

  // Cargar ciudades cuando cambia el departamento
  useEffect(() => {
    const cargarCiudades = async () => {
      if (!formData.pais || !formData.departamento) {
        setCiudesDisponibles([]);
        return;
      }

      try {
        setLoadingCiudades(true);
        const codigoPaisNormalizado = normalizarCodigoPais(formData.pais);
        const ciudades = await geografiaApiService.obtenerCiudadesPorEstado(
          codigoPaisNormalizado,
          formData.departamento
        );
        setCiudesDisponibles(ciudades);
        
        // NO limpiar ciudad automáticamente - dejar que el usuario lo cambie manualmente
      } catch (error) {
        console.error('Error al cargar ciudades:', error);
        setCiudesDisponibles([]);
      } finally {
        setLoadingCiudades(false);
      }
    };
    cargarCiudades();
  }, [formData.pais, formData.departamento]);

  // Función para normalizar código de país
  const normalizarCodigoPais = (pais) => {
    if (!pais) return 'CO';
    if (pais === 'Colombia' || pais === 'COLOMBIA') return 'CO';
    if (pais.length === 2) return pais.toUpperCase();
    return pais;
  };
  return (
    <Stack gap="md">
      {/* Información de Documento */}
      <Group grow>
        <TextInput
          label="Número de Documento"
          placeholder="Ingrese el número de documento"
          value={formData.numeroDocumento}
          onChange={(e) => setFormData({...formData, numeroDocumento: e.target.value})}
          required
          disabled={mode === 'edit'} // No editable en modo edición
        />
        <Select
          label="Tipo de Documento"
          data={TIPOS_DOCUMENTO.map(tipo => ({ value: tipo.value, label: tipo.label }))}
          value={formData.tipoDocumento}
          onChange={(value) => setFormData({...formData, tipoDocumento: value})}
          searchable
        />
      </Group>

      {/* Nombres */}
      <Group grow>
        <TextInput
          label="Primer Nombre"
          placeholder="Primer nombre"
          value={formData.primerNombre}
          onChange={(e) => setFormData({...formData, primerNombre: e.target.value})}
          required
        />
        <TextInput
          label="Segundo Nombre"
          placeholder="Segundo nombre (opcional)"
          value={formData.segundoNombre}
          onChange={(e) => setFormData({...formData, segundoNombre: e.target.value})}
        />
      </Group>

      {/* Apellidos */}
      <Group grow>
        <TextInput
          label="Primer Apellido"
          placeholder="Primer apellido"
          value={formData.primerApellido}
          onChange={(e) => setFormData({...formData, primerApellido: e.target.value})}
          required
        />
        <TextInput
          label="Segundo Apellido"
          placeholder="Segundo apellido (opcional)"
          value={formData.segundoApellido}
          onChange={(e) => setFormData({...formData, segundoApellido: e.target.value})}
        />
      </Group>

      {/* Fecha de Nacimiento y Género */}
      <Group grow>
        <TextInput
          label="Fecha de Nacimiento"
          type="date"
          value={formData.fechaNacimiento}
          onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})}
          required
        />
        <Select
          label="Género"
          data={GENEROS.map(genero => ({ value: genero.value, label: genero.label }))}
          value={formData.genero}
          onChange={(value) => setFormData({...formData, genero: value})}
          required
        />
      </Group>

      {/* Teléfono y Email */}
      <Group grow>
        <TextInput
          label="Teléfono"
          placeholder="Número de teléfono"
          value={formData.telefono}
          onChange={(e) => setFormData({...formData, telefono: e.target.value})}
          required
        />
        <TextInput
          label="Email"
          type="email"
          placeholder="correo@ejemplo.com"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </Group>

      {/* Dirección */}
      <TextInput
        label="Dirección"
        placeholder="Dirección completa"
        value={formData.direccion}
        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
      />

      {/* País, Departamento y Ciudad - Dinámicos */}
      <Select
        label="País"
        placeholder="Seleccione el país"
        data={paisesDisponibles}
        value={formData.pais}
        onChange={(value) => setFormData({
          ...formData, 
          pais: value,
          departamento: '',
          ciudad: ''
        })}
        searchable
        rightSection={loadingPaises ? <Loader size="xs" /> : null}
        disabled={loadingPaises}
        required
      />

      <Group grow>
        <Select
          label="Departamento/Estado"
          placeholder="Seleccione departamento"
          data={departamentosDisponibles}
          value={formData.departamento}
          onChange={(value) => setFormData({
            ...formData,
            departamento: value,
            ciudad: ''
          })}
          searchable
          rightSection={loadingDepartamentos ? <Loader size="xs" /> : null}
          disabled={!formData.pais || loadingDepartamentos || departamentosDisponibles.length === 0}
          required
        />
        <Select
          label="Ciudad"
          placeholder="Seleccione ciudad"
          data={ciudadesDisponibles}
          value={formData.ciudad}
          onChange={(value) => setFormData({...formData, ciudad: value})}
          searchable
          rightSection={loadingCiudades ? <Loader size="xs" /> : null}
          disabled={!formData.departamento || loadingCiudades || ciudadesDisponibles.length === 0}
          required
        />
      </Group>

      {/* Tipo de Personal */}
      <Select
        label="Tipo de Personal"
        placeholder="Seleccione el tipo de personal"
        data={[
          { value: 'MEDICO', label: 'Personal Médico' },
          { value: 'ADMINISTRATIVO', label: 'Personal Administrativo' }
        ]}
        value={formData.tipoPersonal}
        onChange={(value) => setFormData({
          ...formData, 
          tipoPersonal: value, 
          tipoMedico: '', 
          especialidad: '', 
          dependencia: ''
        })}
        required
      />

      {/* Campos condicionales para Personal Médico */}
      {formData.tipoPersonal === 'MEDICO' && (
        <Group grow>
          <Select
            label="Tipo de Médico"
            placeholder="Seleccione el tipo"
            data={[
              { value: 'DOCTOR', label: 'Doctor' },
              { value: 'AUXILIAR', label: 'Auxiliar' }
            ]}
            value={formData.tipoMedico}
            onChange={(value) => setFormData({...formData, tipoMedico: value})}
            required
          />
          <TextInput
            label="Especialidad"
            placeholder="Especialidad médica"
            value={formData.especialidad}
            onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
            required
          />
        </Group>
      )}

      {/* Campo condicional para Personal Administrativo */}
      {formData.tipoPersonal === 'ADMINISTRATIVO' && (
        <TextInput
          label="Dependencia"
          placeholder="Dependencia administrativa"
          value={formData.dependencia}
          onChange={(e) => setFormData({...formData, dependencia: e.target.value})}
          required
        />
      )}

      {/* Cargo y Salario */}
      <Group grow>
        <TextInput
          label="Cargo"
          placeholder="Cargo del empleado"
          value={formData.cargo}
          onChange={(e) => setFormData({...formData, cargo: e.target.value})}
        />
        <TextInput
          label="Salario"
          type="number"
          placeholder="Salario mensual"
          value={formData.salario}
          onChange={(e) => setFormData({...formData, salario: e.target.value})}
        />
      </Group>

      {/* Fecha de Contratación y Tipo de Contrato */}
      <Group grow>
        <TextInput
          label="Fecha de Contratación"
          type="date"
          value={formData.fechaContratacion}
          onChange={(e) => setFormData({...formData, fechaContratacion: e.target.value})}
        />
        <Select
          label="Tipo de Contrato"
          data={TIPOS_CONTRATO.map(tipo => ({ value: tipo.value, label: tipo.label }))}
          value={formData.tipoContrato}
          onChange={(value) => setFormData({...formData, tipoContrato: value})}
        />
      </Group>
    </Stack>
  );
};

export default EmpleadoForm;
