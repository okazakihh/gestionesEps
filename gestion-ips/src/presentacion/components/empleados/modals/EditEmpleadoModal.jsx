import React from 'react';
import { Modal, Button, Group, Tabs } from '@mantine/core';
import { useTheme } from '../../../../negocio/contexts/ThemeContext.jsx';
import EmpleadoPersonalInfoSection from '../forms/EmpleadoPersonalInfoSection';
import EmpleadoContactInfoSection from '../forms/EmpleadoContactInfoSection';
import EmpleadoLaboralInfoSection from '../forms/EmpleadoLaboralInfoSection';
import Swal from 'sweetalert2';
import { Stack, TextInput, FileInput, Text, Image } from '@mantine/core';
import { IconUpload, IconTrash } from '@tabler/icons-react';

const EditEmpleadoModal = ({
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
  const [firmaExistente, setFirmaExistente] = React.useState(null);
  const [firmaPreview, setFirmaPreview] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Reset local state when the modal is closed to ensure clean state on reopen
    if (!opened) {
      setFirmaFile(null);
      setFirmaExistente(null);
      setFirmaPreview(null);
    }
  }, [opened]);

  React.useEffect(() => {
    setFirmaExistente(formData.firmaDigital || null);
  }, [formData]);

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
          if (mounted) {
            setFirmaPreview(dataUrl);
          }
        })
        .catch((err) => {
          console.error('Error generating preview:', err);
        });
    } else {
      // Cuando no hay un archivo nuevo, la previsualización debe estar vacía.
      setFirmaPreview(null);
    }
    return () => { mounted = false; };
  }, [firmaFile]);

  const handleInputChange = (e) => {
    const { name, value } = e.currentTarget || {};
    if (!name) return;
    if (typeof onFieldChange === 'function') onFieldChange(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let firmaFinal = firmaExistente;
      if (firmaFile) {
        firmaFinal = await fileToBase64(firmaFile);
      }

      // Create a new object with the most up-to-date data
      const dataToSubmit = {
        ...formData,
        firmaDigital: firmaFinal || null
      };
      
      // Delegate the actual update logic to the parent via onSubmit
      if (typeof onSubmit === 'function') {
        await onSubmit(dataToSubmit);
      }
      onClose();
    } catch (error) {
      console.error('Error actualizando empleado:', error);
      Swal.fire({ title: 'Error', text: 'No se pudo actualizar el empleado.', icon: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Editar Empleado"
      size="xl"
      centered
      overlayProps={{ color: tema.primaryColor, backgroundOpacity: 0.55, blur: 3 }}
      styles={{ header: { backgroundColor: tema.primaryColor, padding: '10px 16px' }, title: { color: 'white' }, close: { color: 'white' } }}
    >
      <form onSubmit={handleSubmit}>
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

            {firmaExistente && (
              <div className="mt-4">
                <Text size="sm" fw={500}>Firma Actual:</Text>
                <Image src={firmaExistente} alt="Firma existente" maw={240} style={{ border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
            )}

            <div className="mt-3">
              <FileInput
                label={firmaExistente ? 'Reemplazar firma' : 'Subir firma'}
                placeholder="Seleccione una nueva imagen para reemplazar la actual"
                accept="image/png,image/jpeg"
                value={firmaFile}
                onChange={(file) => setFirmaFile(file)}
                icon={<IconUpload size={14} />}
              />

              {firmaPreview && (
                <div className="mt-3 flex items-start gap-3">
                  <Image src={firmaPreview} alt="Preview firma" maw={240} style={{ border: '1px solid #ccc', borderRadius: '4px' }} />
                  <div>
                    <Button variant="subtle" color="red" onClick={() => setFirmaFile(null)}>
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
          <Button variant="default" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" loading={isLoading} disabled={!isFormValid}>Actualizar Empleado</Button>
        </Group>
      </form>
    </Modal>
  );
};

export default EditEmpleadoModal;
