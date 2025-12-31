import React, { useState, useEffect } from 'react';
import { Group, Button, Image, Text, FileInput, Stack } from '@mantine/core';
import { IconUpload, IconTrash } from '@tabler/icons-react';
import { configuracionApiService } from '../../../data/services/configuracionApiService.js';
import { useConfiguracionManagement } from '../../../negocio/hooks/configuracion/useConfiguracionManagement.js';

/**
 * IpsLogoField
 * - props:
 *    - config: current ips config object (optional)
 *    - onSaved: callback(updatedConfig)
 *
 * This component allows uploading an image, converts it to base64 and
 * updates the configuration entry with clave 'IPS_INFO' using the
 * configuracionApiService.updateConfiguracionByClave helper.
 */
const IpsLogoField = ({ config = {}, onSaved = () => {} }) => {
  const { updateConfiguracionByClave } = useConfiguracionManagement();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(config.logo || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPreview(config.logo || '');
  }, [config]);

  // Convert a File to base64
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSave = async () => {
    setError(null);
    if (!file && !preview) {
      setError('Seleccione una imagen para guardar.');
      return;
    }

    setSaving(true);
    try {
      let base64 = preview; // if user didn't change file, keep existing
      if (file) {
        base64 = await fileToBase64(file);
      }

      // Prepare new configuration object - keep other keys intact
      const newConfig = {
        ...(config || {}),
        logo: base64
      };

      // Update using business-layer hook for consistency
      const result = await updateConfiguracionByClave('IPS_INFO', newConfig);
      if (!result || !result.success) {
        throw new Error(result?.error || 'Error updating configuration');
      }

      setPreview(base64);
      setFile(null);
      onSaved && onSaved(newConfig);
    } catch (err) {
      console.error('Error saving IPS logo:', err);
      setError(err?.message || 'Error al guardar el logo');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview('');
  };

  return (
    <Stack spacing="xs">
      <Text size="sm" weight={700}>Logo de la Entidad</Text>
      {preview ? (
        <Group position="left" spacing="sm">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 4, border: '1px solid #e9ecef' }}>
              <Image src={preview} alt="Logo IPS" width={80} height={80} fit="contain" />
            </div>
            <div style={{ marginTop: 8 }}>
              <Button variant="outline" color="red" leftSection={<IconTrash size={16} />} onClick={handleRemove} size="sm">Remover</Button>
            </div>
          </div>
        </Group>
      ) : (
        <Text size="xs" color="dimmed">No hay logo configurado.</Text>
      )}

      <FileInput
        label="Seleccionar imagen"
        placeholder="PNG, JPG, GIF"
        accept="image/*"
        value={file}
        onChange={setFile}
        icon={<IconUpload size={14} />}
      />

      {error && <Text color="red" size="xs">{error}</Text>}

      <Group>
        <Button onClick={handleSave} loading={saving} size="sm">Guardar logo</Button>
      </Group>
    </Stack>
  );
};

export default IpsLogoField;
