import React from 'react';
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
  PasswordInput
} from '@mantine/core';

const CreateUserForm = ({ onSubmit, initialData, isEditMode = false, isFromEmployee = false }) => {
  const getInitialValues = () => {
    console.log('🎯 CreateUserForm - isEditMode:', isEditMode, 'initialData:', initialData, 'isFromEmployee:', isFromEmployee);
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
        pais: initialData.contactInfo?.pais || 'COLOMBIA',
        codigoPostal: initialData.contactInfo?.codigoPostal || '',
        rol: initialData.roles?.[0] || 'ADMINISTRATIVO',
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
        pais: initialData.pais || 'COLOMBIA',
        codigoPostal: initialData.codigoPostal || '',
        rol: initialData.rol || 'ADMINISTRATIVO',
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
      pais: 'COLOMBIA',
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
      ciudad: (value) => (value.length < 2 ? 'La ciudad es requerida' : null),
      departamento: (value) => (value.length < 2 ? 'El departamento es requerido' : null),
    },
  });

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
                  data={[
                    { value: 'CC', label: 'Cédula de Ciudadanía' },
                    { value: 'CE', label: 'Cédula de Extranjería' },
                    { value: 'PA', label: 'Pasaporte' },
                    { value: 'TI', label: 'Tarjeta de Identidad' },
                  ]}
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
                  data={[
                    { value: 'M', label: 'Masculino' },
                    { value: 'F', label: 'Femenino' },
                    { value: 'O', label: 'Otro' },
                  ]}
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
                <TextInput
                  label="Ciudad"
                  placeholder="Ingrese ciudad"
                  required
                  {...form.getInputProps('ciudad')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Departamento"
                  placeholder="Ingrese departamento"
                  required
                  {...form.getInputProps('departamento')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="País"
                  data={[
                    { value: 'COLOMBIA', label: 'Colombia' },
                    { value: 'VENEZUELA', label: 'Venezuela' },
                    { value: 'ECUADOR', label: 'Ecuador' },
                    { value: 'PERU', label: 'Perú' },
                    { value: 'BRASIL', label: 'Brasil' },
                  ]}
                  {...form.getInputProps('pais')}
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
                  data={[
                    { value: 'ADMIN', label: 'Admin' },
                    { value: 'ADMINISTRATIVO', label: 'Administrativo' },
                    { value: 'AUXILIAR_ADMINISTRATIVO', label: 'Auxiliar Administrativo' },
                    { value: 'DOCTOR', label: 'Doctor' },
                    { value: 'AUXILIAR_MEDICO', label: 'Auxiliar Médico' },
                  ]}
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