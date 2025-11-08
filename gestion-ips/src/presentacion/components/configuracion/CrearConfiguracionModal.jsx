/**
 * Modal para crear nuevas configuraciones
 * Capa de presentación - Componentes
 * 
 * Permite crear configuraciones con:
 * - Tipo de configuración
 * - Clave única
 * - JSON con los datos
 */

import React, { useState } from 'react';
import { 
  Modal, 
  Stack, 
  TextInput, 
  Textarea,
  Select,
  Button, 
  Group,
  Alert
} from '@mantine/core';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import { useConfiguracionManagement } from '../../../negocio/hooks/configuracion/useConfiguracionManagement.js';

const TIPOS_CONFIGURACION = [
  { value: 'IPS_INFO', label: 'Información IPS' },
  { value: 'SISTEMA_GENERAL', label: 'Sistema General' },
  { value: 'NOTIFICACIONES', label: 'Notificaciones' },
  { value: 'FACTURACION', label: 'Facturación' },
  { value: 'NOMINA', label: 'Nómina' },
  { value: 'SEGURIDAD', label: 'Seguridad' },
  { value: 'PERMISOS_MODULOS', label: 'Permisos a Módulos' },
  { value: 'OTRO', label: 'Otro' }
];

export const CrearConfiguracionModal = ({ opened, onClose }) => {
  const { createConfiguracion } = useConfiguracionManagement();
  
  const [formData, setFormData] = useState({
    tipoConfiguracion: '',
    clave: '',
    jsonData: '{}'
  });
  
  const [jsonError, setJsonError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validar JSON cuando cambie el campo
    if (field === 'jsonData') {
      try {
        JSON.parse(value);
        setJsonError(null);
      } catch (e) {
        setJsonError('JSON inválido: ' + e.message);
      }
    }
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.tipoConfiguracion || !formData.clave) {
      return;
    }

    // Validar JSON
    try {
      JSON.parse(formData.jsonData);
    } catch (e) {
      setJsonError('JSON inválido: ' + e.message);
      return;
    }

    setSaving(true);
    try {
      await createConfiguracion(formData);
      
      // Limpiar formulario y cerrar
      setFormData({
        tipoConfiguracion: '',
        clave: '',
        jsonData: '{}'
      });
      setJsonError(null);
      onClose();
    } catch (error) {
      console.error('Error al crear configuración:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setFormData({
        tipoConfiguracion: '',
        clave: '',
        jsonData: '{}'
      });
      setJsonError(null);
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Crear Nueva Configuración"
      size="lg"
      centered
    >
      <Stack gap="md">
        <Select
          label="Tipo de Configuración"
          placeholder="Seleccione el tipo"
          data={TIPOS_CONFIGURACION}
          value={formData.tipoConfiguracion}
          onChange={(value) => handleChange('tipoConfiguracion', value)}
          required
          searchable
        />

        <TextInput
          label="Clave"
          placeholder="ej: IPS_INFO, SISTEMA_PARAMETROS"
          description="Identificador único de la configuración (sin espacios, solo mayúsculas y guiones bajos)"
          value={formData.clave}
          onChange={(e) => handleChange('clave', e.target.value.toUpperCase().replace(/\s+/g, '_'))}
          required
        />

        <Textarea
          label="Datos JSON"
          placeholder='{"clave": "valor", "otra": 123}'
          description="Ingrese un objeto JSON válido con los datos de configuración"
          value={formData.jsonData}
          onChange={(e) => handleChange('jsonData', e.target.value)}
          minRows={10}
          maxRows={20}
          required
          error={jsonError}
          styles={{
            input: {
              fontFamily: 'monospace',
              fontSize: '13px'
            }
          }}
        />

        {jsonError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error en JSON"
            color="red"
            variant="light"
          >
            {jsonError}
          </Alert>
        )}

        <Group justify="flex-end" mt="md">
          <Button 
            variant="subtle" 
            onClick={handleClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleSubmit}
            loading={saving}
            disabled={!formData.tipoConfiguracion || !formData.clave || !!jsonError}
          >
            Crear Configuración
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
