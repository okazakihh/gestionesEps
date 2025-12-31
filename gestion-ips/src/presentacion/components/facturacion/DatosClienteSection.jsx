import React from 'react';
import { Grid, TextInput, Select } from '@mantine/core';
import { IconUser, IconBuilding } from '@tabler/icons-react';

/**
 * Sección de datos del cliente según tipo (Paciente o Entidad)
 * Componente de presentación - UI pura
 */
export const DatosClienteSection = ({
  tipoDestinatario,
  // Para PACIENTE
  nombres,
  apellidos,
  onNombresChange,
  onApellidosChange,
  // Para ENTIDAD
  razonSocial,
  nombreContacto,
  cargoContacto,
  onRazonSocialChange,
  onNombreContactoChange,
  onCargoContactoChange
}) => {
  return (
    <>
      {tipoDestinatario === 'PACIENTE' ? (
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Nombres"
              placeholder="Nombres del paciente"
              value={nombres}
              onChange={onNombresChange}
              leftSection={<IconUser size={18} />}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Apellidos"
              placeholder="Apellidos del paciente"
              value={apellidos}
              onChange={onApellidosChange}
              required
            />
          </Grid.Col>
        </Grid>
      ) : (
        <Grid>
          <Grid.Col span={12}>
            <TextInput
              label="Razón Social"
              placeholder="Nombre de la entidad"
              value={razonSocial}
              onChange={onRazonSocialChange}
              leftSection={<IconBuilding size={18} />}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Nombre del Contacto"
              placeholder="Persona de contacto"
              value={nombreContacto}
              onChange={onNombreContactoChange}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Cargo del Contacto"
              placeholder="Cargo en la empresa"
              value={cargoContacto}
              onChange={onCargoContactoChange}
            />
          </Grid.Col>
        </Grid>
      )}
    </>
  );
};
