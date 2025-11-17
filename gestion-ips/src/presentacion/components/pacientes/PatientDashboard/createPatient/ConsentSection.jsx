import React from 'react';
import PropTypes from 'prop-types';
import { Paper, Stack, Title, Text, Checkbox } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

const ConsentSection = ({ parsedData, handleNestedInputChange, validationErrors }) => {
  return (
    <Paper p="md" radius="md" withBorder>
      <Stack gap="md">
        <Title order={3} size="h4">Consentimiento Informado</Title>
        
        <Text size="sm" c="dimmed">
          Según la Ley 1581 de 2012 y normas relacionadas con historia clínica, el paciente debe otorgar su consentimiento expreso para:
        </Text>

        <Stack gap="lg">
          {/* Tratamiento Médico */}
          <Stack gap="xs">
            <Checkbox
              id="aceptaTratamiento"
              checked={parsedData.consentimientoInformado?.aceptaTratamiento || false}
              onChange={(e) => handleNestedInputChange('consentimientoInformado', 'aceptaTratamiento', e.currentTarget.checked)}
              label={
                <Text size="sm" fw={500}>
                  Tratamiento Médico <Text component="span" c="red">*</Text>
                </Text>
              }
              description="Acepto recibir atención médica y procedimientos diagnósticos necesarios para mi salud."
              error={validationErrors.consentimientoTratamiento}
              icon={IconCheck}
            />
          </Stack>

          {/* Protección de Datos Personales */}
          <Stack gap="xs">
            <Checkbox
              id="aceptaPrivacidad"
              checked={parsedData.consentimientoInformado?.aceptaPrivacidad || false}
              onChange={(e) => handleNestedInputChange('consentimientoInformado', 'aceptaPrivacidad', e.currentTarget.checked)}
              label={
                <Text size="sm" fw={500}>
                  Protección de Datos Personales <Text component="span" c="red">*</Text>
                </Text>
              }
              description="Acepto el tratamiento de mis datos personales según la Ley 1581 de 2012 y normas de protección de datos."
              error={validationErrors.consentimientoPrivacidad}
              icon={IconCheck}
            />
          </Stack>

          {/* Tratamiento de Datos Sensibles */}
          <Stack gap="xs">
            <Checkbox
              id="aceptaDatosPersonales"
              checked={parsedData.consentimientoInformado?.aceptaDatosPersonales || false}
              onChange={(e) => handleNestedInputChange('consentimientoInformado', 'aceptaDatosPersonales', e.currentTarget.checked)}
              label={
                <Text size="sm" fw={500}>
                  Tratamiento de Datos Sensibles <Text component="span" c="red">*</Text>
                </Text>
              }
              description="Acepto el tratamiento de datos sensibles de salud según la legislación colombiana."
              error={validationErrors.consentimientoDatos}
              icon={IconCheck}
            />
          </Stack>

          {/* Uso de Imágenes y Fotografías */}
          <Stack gap="xs">
            <Checkbox
              id="aceptaImagenes"
              checked={parsedData.consentimientoInformado?.aceptaImagenes || false}
              onChange={(e) => handleNestedInputChange('consentimientoInformado', 'aceptaImagenes', e.currentTarget.checked)}
              label={<Text size="sm" fw={500}>Uso de Imágenes y Fotografías</Text>}
              description="Acepto el uso de imágenes y fotografías para fines médicos y académicos (opcional)."
              icon={IconCheck}
            />
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
};

ConsentSection.propTypes = {
  parsedData: PropTypes.object,
  handleNestedInputChange: PropTypes.func.isRequired,
  validationErrors: PropTypes.object
};


export default ConsentSection;