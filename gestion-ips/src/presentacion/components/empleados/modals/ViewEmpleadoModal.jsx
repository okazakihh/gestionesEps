import React from 'react';
import { Modal, Paper, Text, Badge, Divider, Grid } from '@mantine/core';

const ViewEmpleadoModal = ({ 
  opened, 
  onClose, 
  formData 
}) => {
  const InfoItem = ({ label, value }) => (
    <div className="mb-3">
      <Text size="xs" weight={500} color="dimmed" className="mb-1">
        {label}
      </Text>
      <Text size="sm" weight={400}>
        {value || 'N/A'}
      </Text>
    </div>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Información del Empleado"
      size="xl"
      centered
    >
      <div className="space-y-4">
        {/* Información Personal */}
        <Paper shadow="xs" p="md" withBorder>
          <Text size="md" weight={600} className="mb-3 text-blue-700">
            📋 Información Personal
          </Text>
          <Divider className="mb-3" />
          <Grid>
            <Grid.Col span={6}>
              <InfoItem 
                label="Tipo de Documento" 
                value={formData.tipoDocumento} 
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <InfoItem 
                label="Número de Documento" 
                value={formData.numeroDocumento} 
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <InfoItem 
                label="Primer Nombre" 
                value={formData.primerNombre} 
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <InfoItem 
                label="Segundo Nombre" 
                value={formData.segundoNombre} 
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <InfoItem 
                label="Primer Apellido" 
                value={formData.primerApellido} 
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <InfoItem 
                label="Segundo Apellido" 
                value={formData.segundoApellido} 
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <InfoItem 
                label="Fecha de Nacimiento" 
                value={formData.fechaNacimiento} 
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <InfoItem 
                label="Género" 
                value={formData.genero === 'M' ? 'Masculino' : formData.genero === 'F' ? 'Femenino' : 'Otro'} 
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Información de Contacto */}
        <Paper shadow="xs" p="md" withBorder>
          <Text size="md" weight={600} className="mb-3 text-green-700">
            📞 Información de Contacto
          </Text>
          <Divider className="mb-3" />
          <Grid>
            <Grid.Col span={6}>
              <InfoItem 
                label="Teléfono" 
                value={formData.telefono} 
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <InfoItem 
                label="Email" 
                value={formData.email} 
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <InfoItem 
                label="Dirección" 
                value={formData.direccion} 
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Información Laboral */}
        <Paper shadow="xs" p="md" withBorder>
          <Text size="md" weight={600} className="mb-3 text-purple-700">
            💼 Información Laboral
          </Text>
          <Divider className="mb-3" />
          <Grid>
            <Grid.Col span={6}>
              <div className="mb-3">
                <Text size="xs" weight={500} color="dimmed" className="mb-1">
                  Tipo de Personal
                </Text>
                <Badge 
                  color={formData.tipoPersonal === 'MEDICO' ? 'blue' : 'green'}
                  size="lg"
                  variant="filled"
                >
                  {formData.tipoPersonal === 'MEDICO' ? 'Médico' : 'Administrativo'}
                </Badge>
              </div>
            </Grid.Col>
            <Grid.Col span={6}>
              <InfoItem 
                label="Fecha de Ingreso" 
                value={formData.fechaIngreso} 
              />
            </Grid.Col>
            
            {formData.tipoPersonal === 'MEDICO' ? (
              <>
                <Grid.Col span={6}>
                  <InfoItem 
                    label="Número de Licencia" 
                    value={formData.numeroLicencia} 
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <InfoItem 
                    label="Especialidad" 
                    value={formData.especialidad?.replace(/_/g, ' ')} 
                  />
                </Grid.Col>
              </>
            ) : (
            <Grid.Col span={6}>
              <InfoItem 
                label="Cargo" 
                value={formData.cargo?.replace(/_/g, ' ')} 
              />
            </Grid.Col>
            )}
            <Grid.Col span={6}>
              <InfoItem 
                label="Salario" 
                value={formData.salario ? `$${Number(formData.salario).toLocaleString('es-CO')}` : 'N/A'} 
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <InfoItem 
                label="Tipo de Contrato" 
                value={formData.tipoContrato?.replace(/_/g, ' ')} 
              />
            </Grid.Col>
          </Grid>
        </Paper>
      </div>
    </Modal>
  );
};

export default ViewEmpleadoModal;