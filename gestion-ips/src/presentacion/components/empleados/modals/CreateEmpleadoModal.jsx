import React from 'react';
import { Modal, Button, Group, Tabs, FileInput, Image, Text } from '@mantine/core';
import { useTheme } from '../../../../negocio/contexts/ThemeContext.jsx';
import EmpleadoPersonalInfoSection from '../forms/EmpleadoPersonalInfoSection';
import EmpleadoContactInfoSection from '../forms/EmpleadoContactInfoSection';
import EmpleadoLaboralInfoSection from '../forms/EmpleadoLaboralInfoSection';
import { IconUpload, IconTrash } from '@tabler/icons-react';

const CreateEmpleadoModal = ({
  opened, 
  onClose, 
  formData, 
  onFieldChange, 
  onSubmit, 
  loading,
  isFormValid = false
}) => {
  const { tema } = useTheme();
  const [firmaFile, setFirmaFile] = React.useState(null);
  const [firmaPreview, setFirmaPreview] = React.useState(null);

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsDataURL(file);
  });

  React.useEffect(() => {
    let mounted = true;
    if (firmaFile) {
      fileToBase64(firmaFile)
        .then((dataUrl) => {
          if (!mounted) return;
          setFirmaPreview(dataUrl);
          if (typeof onFieldChange === 'function') onFieldChange('firmaDigital', dataUrl);
        })
        .catch((err) => console.error('Error creating preview:', err));
    } else {
      setFirmaPreview(formData.firmaDigital || null);
    }
    return () => { mounted = false; };
  }, [firmaFile]);
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Crear Nuevo Empleado"
      size="xl"
      centered
      overlayColor={tema.primaryColor}
      styles={{ header: { backgroundColor: tema.primaryColor, padding: '10px 16px' }, title: { color: 'white' }, close: { color: 'white' } }}
    >
      <Tabs defaultValue="personal">
        <Tabs.List>
          <Tabs.Tab value="personal">Información Personal</Tabs.Tab>
          <Tabs.Tab value="contacto">Información de Contacto</Tabs.Tab>
          <Tabs.Tab value="laboral">Información Laboral</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="personal" pt="md">
          <EmpleadoPersonalInfoSection 
            formData={formData} 
            onFieldChange={onFieldChange} 
          />

          <div className="mt-4">
            <FileInput
              label={formData.firmaDigital ? 'Subir/Reemplazar firma' : 'Subir firma'}
              placeholder="Seleccione una imagen de firma"
              accept="image/png,image/jpeg"
              value={firmaFile}
              onChange={(file) => setFirmaFile(file)}
              icon={<IconUpload size={14} />}
            />

            {firmaPreview && (
              <div className="mt-3 flex items-start gap-3">
                <Image src={firmaPreview} alt="Preview firma" maw={240} style={{ border: '1px solid #ccc', borderRadius: '4px' }} />
                <div>
                  <Button variant="subtle" color="red" onClick={() => { setFirmaFile(null); setFirmaPreview(null); if (typeof onFieldChange === 'function') onFieldChange('firmaDigital', null); }}>
                    <IconTrash size={16} />&nbsp;Quitar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="contacto" pt="md">
          <EmpleadoContactInfoSection 
            formData={formData} 
            onFieldChange={onFieldChange} 
          />
        </Tabs.Panel>

        <Tabs.Panel value="laboral" pt="md">
          <EmpleadoLaboralInfoSection 
            formData={formData} 
            onFieldChange={onFieldChange} 
          />
        </Tabs.Panel>
      </Tabs>

      <Group position="right" mt="xl">
        <Button variant="default" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={onSubmit} 
          loading={loading}
          disabled={!isFormValid || loading}
        >
          Crear Empleado
        </Button>
      </Group>
    </Modal>
  );
};

export default CreateEmpleadoModal;
