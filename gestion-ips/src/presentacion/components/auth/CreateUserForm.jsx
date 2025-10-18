import React, { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import { 
  TextInput, 
  Button, 
  Group, 
  Stack, 
  Select, 
  Title, 
  Paper,
  Grid,
  Fieldset,
  PasswordInput,
  Loader
} from '@mantine/core';
import { TIPOS_DOCUMENTO, GENEROS, ROLES_SISTEMA } from '@/negocio/utils/loadHelpers';
import { 
  obtenerPaises, 
  obtenerEstadosPorPais, 
  obtenerCiudadesPorEstado 
} from '@/data/services/geografiaApiService';

const CreateUserForm = ({ onSubmit, initialData, isEditMode = false, isFromEmployee = false }) => {
  const [paisesDisponibles, setPaisesDisponibles] = useState([]);
  const [departamentosDisponibles, setDepartamentosDisponibles] = useState([]);
  const [ciudadesDisponibles, setCiudadesDisponibles] = useState([]);
  const [loadingPaises, setLoadingPaises] = useState(true);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const getInitialValues = () => {
    console.log('🎯 CreateUserForm - isEditMode:', isEditMode, 'initialData:', initialData, 'isFromEmployee:', isFromEmployee);
    
    // Función helper para normalizar código de país
    const normalizarCodigoPais = (pais) => {
      if (!pais) return 'CO';
      if (pais === 'COLOMBIA') return 'CO';
      return pais;
    };
    
    // Función helper para normalizar rol (conversión de roles obsoletos)
    const normalizarRol = (rol) => {
      if (!rol) return 'ADMINISTRATIVO';
      
      // Mapeo de roles obsoletos a roles válidos
      const rolesObsoletos = {
        'MEDICO': 'DOCTOR',
        'ENFERMERO': 'AUXILIAR_MEDICO',
        'RECEPCIONISTA': 'ADMINISTRATIVO',
        'FACTURADOR': 'ADMINISTRATIVO',
        'FARMACEUTICO': 'ADMINISTRATIVO',
        'AUDITOR': 'ADMINISTRATIVO'
      };
      
      // Si el rol está en la lista de obsoletos, convertirlo
      if (rolesObsoletos[rol]) {
        console.warn(`⚠️ Rol obsoleto detectado: "${rol}" → Convertido a: "${rolesObsoletos[rol]}"`);
        return rolesObsoletos[rol];
      }
      
      // Verificar que sea un rol válido
      const rolesValidos = ['ADMIN', 'ADMINISTRATIVO', 'AUXILIAR_ADMINISTRATIVO', 'DOCTOR', 'AUXILIAR_MEDICO'];
      if (!rolesValidos.includes(rol)) {
        console.warn(`⚠️ Rol no válido detectado: "${rol}" → Usando por defecto: "ADMINISTRATIVO"`);
        return 'ADMINISTRATIVO';
      }
      
      return rol;
    };
    
    if (isEditMode && initialData) {
      return {
        username: initialData.username || '',
        email: initialData.email || '',
        password: '', // Always empty for security
        nombres: initialData.personalInfo?.nombres || '',
        apellidos: initialData.personalInfo?.apellidos || '',
        documento: initialData.personalInfo?.documento || '',
        tipoDocumento: initialData.personalInfo?.tipoDocumento || 'CC',
        fechaNacimiento: initialData.personalInfo?.fechaNacimiento || '',
        genero: initialData.personalInfo?.genero || 'M',
        telefono: initialData.contactInfo?.telefono || '',
        direccion: initialData.contactInfo?.direccion || '',
        ciudad: initialData.contactInfo?.ciudad || '',
        departamento: initialData.contactInfo?.departamento || '',
        pais: normalizarCodigoPais(initialData.contactInfo?.pais),
        codigoPostal: initialData.contactInfo?.codigoPostal || '',
        rol: normalizarRol(initialData.roles?.[0]),
      };
    }
    // Handle initial data for creation mode (from employee)
    if (!isEditMode && initialData) {
      return {
        username: initialData.username || '',
        email: initialData.email || '',
        password: initialData.password || '',
        nombres: initialData.nombres || '',
        apellidos: initialData.apellidos || '',
        documento: initialData.documento || '',
        tipoDocumento: initialData.tipoDocumento || 'CC',
        fechaNacimiento: initialData.fechaNacimiento || '',
        genero: initialData.genero || 'M',
        telefono: initialData.telefono || '',
        direccion: initialData.direccion || '',
        ciudad: initialData.ciudad || '',
        departamento: initialData.departamento || '',
        pais: normalizarCodigoPais(initialData.pais),
        codigoPostal: initialData.codigoPostal || '',
        rol: normalizarRol(initialData.rol),
      };
    }
    return {
      username: '',
      email: '',
      password: '',
      nombres: '',
      apellidos: '',
      documento: '',
      tipoDocumento: 'CC',
      fechaNacimiento: '',
      genero: 'M',
      telefono: '',
      direccion: '',
      ciudad: '',
      departamento: '',
      pais: 'CO', // Usar código ISO2 para Colombia
      codigoPostal: '',
      rol: 'ADMINISTRATIVO',
    };
  };

  const form = useForm({
    initialValues: getInitialValues(),
    validate: {
      username: (value) => (value.length < 3 ? 'El nombre de usuario debe tener al menos 3 caracteres' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
      password: (value) => (isEditMode ? null : (value.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null)),
      nombres: (value) => (value.length < 2 ? 'Los nombres son requeridos' : null),
      apellidos: (value) => (value.length < 2 ? 'Los apellidos son requeridos' : null),
      documento: (value) => (value.length < 5 ? 'El documento debe tener al menos 5 caracteres' : null),
      fechaNacimiento: (value) => (!value ? 'La fecha de nacimiento es requerida' : null),
      telefono: (value) => (value.length < 7 ? 'El teléfono debe tener al menos 7 caracteres' : null),
      ciudad: (value) => (!value || value.toString().length < 1 ? 'La ciudad es requerida' : null),
      departamento: (value) => (!value || value.toString().length < 1 ? 'El departamento es requerido' : null),
    },
  });

  // Cargar países al montar el componente
  useEffect(() => {
    const cargarPaises = async () => {
      setLoadingPaises(true);
      const paises = await obtenerPaises();
      setPaisesDisponibles(paises);
      setLoadingPaises(false);
    };
    cargarPaises();
  }, []);

  // Cargar estados/departamentos cuando cambia el país
  useEffect(() => {
    const cargarEstados = async () => {
      const codigoPais = form.values.pais;
      
      if (codigoPais) {
        setLoadingDepartamentos(true);
        const estados = await obtenerEstadosPorPais(codigoPais);
        setDepartamentosDisponibles(estados);
        setLoadingDepartamentos(false);
        
        // Limpiar departamento y ciudad si cambia el país
        if (form.values.departamento) {
          form.setFieldValue('departamento', '');
        }
        if (form.values.ciudad) {
          form.setFieldValue('ciudad', '');
        }
      } else {
        setDepartamentosDisponibles([]);
        setCiudadesDisponibles([]);
        form.setFieldValue('departamento', '');
        form.setFieldValue('ciudad', '');
      }
    };
    cargarEstados();
  }, [form.values.pais]);

  // Cargar ciudades cuando cambia el departamento/estado
  useEffect(() => {
    const cargarCiudades = async () => {
      const codigoPais = form.values.pais;
      const codigoEstado = form.values.departamento;
      
      if (codigoPais && codigoEstado) {
        setLoadingCiudades(true);
        const ciudades = await obtenerCiudadesPorEstado(codigoPais, codigoEstado);
        setCiudadesDisponibles(ciudades);
        setLoadingCiudades(false);
        
        // Si la ciudad actual no está en la lista del nuevo estado, limpiarla
        if (form.values.ciudad && !ciudades.find(c => c.value === form.values.ciudad)) {
          form.setFieldValue('ciudad', '');
        }
      } else {
        setCiudadesDisponibles([]);
        if (form.values.ciudad) {
          form.setFieldValue('ciudad', '');
        }
      }
    };
    cargarCiudades();
  }, [form.values.departamento]);

  const handleSubmit = (values) => {
    const formattedData = {
      username: values.username,
      email: values.email,
      ...((!isEditMode || values.password) && { password: values.password }),
      personalInfo: {
        nombres: values.nombres,
        apellidos: values.apellidos,
        documento: values.documento,
        tipoDocumento: values.tipoDocumento,
        fechaNacimiento: values.fechaNacimiento,
        genero: values.genero,
      },
      contactInfo: {
        telefono: values.telefono,
        direccion: values.direccion,
        ciudad: values.ciudad,
        departamento: values.departamento,
        pais: values.pais,
        codigoPostal: values.codigoPostal,
      },
      roles: [values.rol],
    };
    onSubmit(formattedData);
  };

  return (
    <Paper p="md" shadow="sm">
      <Title order={2} mb="lg">
        {isEditMode ? 'Editar Usuario' : (isFromEmployee ? 'Crear Usuario desde Empleado' : 'Registrar Usuario')}
      </Title>
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Información de Cuenta */}
          <Fieldset legend="Información de Cuenta">
            <Grid>
              <Grid.Col span={4}>
                <TextInput
                  label="Nombre de usuario"
                  placeholder="Ingrese nombre de usuario"
                  required
                  disabled={isEditMode}
                  {...form.getInputProps('username')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="Correo electrónico"
                  placeholder="usuario@ejemplo.com"
                  type="email"
                  required
                  {...form.getInputProps('email')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <PasswordInput
                  label={isEditMode ? "Nueva Contraseña (opcional)" : "Contraseña"}
                  placeholder={isEditMode ? "Dejar vacío para mantener actual" : "Ingrese contraseña"}
                  required={!isEditMode}
                  {...form.getInputProps('password')}
                />
              </Grid.Col>
            </Grid>
          </Fieldset>

          {/* Información Personal */}
          <Fieldset legend="Información Personal">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Nombres"
                  placeholder="Ingrese nombres"
                  required
                  {...form.getInputProps('nombres')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Apellidos"
                  placeholder="Ingrese apellidos"
                  required
                  {...form.getInputProps('apellidos')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label="Tipo de Documento"
                  data={TIPOS_DOCUMENTO}
                  {...form.getInputProps('tipoDocumento')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="Número de Documento"
                  placeholder="Ingrese número de documento"
                  required
                  {...form.getInputProps('documento')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="Fecha de Nacimiento"
                  placeholder="DD/MM/YYYY"
                  required
                  {...form.getInputProps('fechaNacimiento')}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Select
                  label="Género"
                  data={GENEROS}
                  {...form.getInputProps('genero')}
                />
              </Grid.Col>
            </Grid>
          </Fieldset>

          {/* Información de Contacto */}
          <Fieldset legend="Información de Contacto">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Teléfono"
                  placeholder="Ingrese teléfono"
                  required
                  {...form.getInputProps('telefono')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="País"
                  placeholder="Seleccione país"
                  data={paisesDisponibles}
                  searchable
                  required
                  disabled={loadingPaises}
                  rightSection={loadingPaises ? <Loader size="xs" /> : null}
                  {...form.getInputProps('pais')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Departamento/Estado/Provincia"
                  placeholder={form.values.pais ? "Seleccione departamento/estado" : "Primero seleccione un país"}
                  data={departamentosDisponibles}
                  searchable
                  required
                  disabled={!form.values.pais || loadingDepartamentos}
                  rightSection={loadingDepartamentos ? <Loader size="xs" /> : null}
                  {...form.getInputProps('departamento')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Ciudad"
                  placeholder={form.values.departamento ? "Seleccione ciudad" : "Primero seleccione un departamento"}
                  data={ciudadesDisponibles}
                  searchable
                  required
                  disabled={!form.values.departamento || loadingCiudades}
                  rightSection={loadingCiudades ? <Loader size="xs" /> : null}
                  {...form.getInputProps('ciudad')}
                />
              </Grid.Col>
              <Grid.Col span={8}>
                <TextInput
                  label="Dirección"
                  placeholder="Ingrese dirección completa"
                  {...form.getInputProps('direccion')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="Código Postal"
                  placeholder="Ingrese código postal"
                  {...form.getInputProps('codigoPostal')}
                />
              </Grid.Col>
            </Grid>
          </Fieldset>

          {/* Configuración de Usuario */}
          <Fieldset legend="Configuración de Usuario">
            <Grid>
              <Grid.Col span={12}>
                <Select
                  label="Rol"
                  data={ROLES_SISTEMA}
                  {...form.getInputProps('rol')}
                />
              </Grid.Col>
            </Grid>
          </Fieldset>

          <Group justify="flex-end" mt="md">
            <Button type="submit" size="md">
              {isEditMode ? 'Actualizar Usuario' : 'Registrar Usuario'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default CreateUserForm;