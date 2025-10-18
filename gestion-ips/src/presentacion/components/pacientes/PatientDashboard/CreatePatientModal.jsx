import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

// Custom Hooks
import usePacienteForm from '../../../../negocio/hooks/usePacienteForm';

// Utils
import {
  getEmptyPacienteData,
  formatPacienteForAPI,
  validatePacienteForm,
  parsePacienteFromBackend,
} from '../../../../negocio/utils/pacienteUtils';

// Sub-components
import IdentificacionSection from '../PatientForm/IdentificacionSection';
import InformacionPersonalSection from '../PatientForm/InformacionPersonalSection';
import InformacionContactoSection from '../PatientForm/InformacionContactoSection';
import InformacionMedicaSection from '../PatientForm/InformacionMedicaSection';
import ConsentimientoInformadoSection from '../PatientForm/ConsentimientoInformadoSection';
import ContactoEmergenciaSection from '../PatientForm/ContactoEmergenciaSection';

/**
 * CreatePatientModalRefactored - Modal refactorizado para crear/editar pacientes
 * 
 * Componente modular para gestión de pacientes con formulario completo.
 */
const CreatePatientModalRefactored = ({ 
  isOpen, 
  onClose, 
  editingPatient, 
  onPatientCreated, // Callback para actualizar la lista
  prefillDocumentNumber // Número de documento pre-llenado
}) => {
  // ==================== CUSTOM HOOKS ====================
  const { saving, error, createPaciente, updatePaciente, clearError } = usePacienteForm();

  // ==================== LOCAL STATE ====================
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    tipoDocumento: 'CC',
    numeroDocumento: '',
  });
  const [parsedData, setParsedData] = useState(getEmptyPacienteData());

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (isOpen) {
      if (editingPatient) {
        // Modo edición: cargar datos del paciente
        const parsed = parsePacienteFromBackend(editingPatient);
        if (parsed) {
          setFormData({
            tipoDocumento: parsed.tipoDocumento,
            numeroDocumento: parsed.numeroDocumento,
          });
          setParsedData({
            identificacion: {
              tipoDocumento: parsed.tipoDocumento,
              numeroDocumento: parsed.numeroDocumento,
            },
            informacionPersonal: parsed.informacionPersonal,
            informacionContacto: parsed.informacionContacto,
            informacionMedica: parsed.informacionMedica,
            consentimientoInformado: parsed.consentimientoInformado,
            contactoEmergencia: parsed.contactoEmergencia,
          });
        }
      } else {
        // Modo creación: limpiar formulario
        resetForm();
        // Si hay número de documento pre-llenado, establecerlo
        if (prefillDocumentNumber) {
          setFormData(prev => ({
            ...prev,
            numeroDocumento: prefillDocumentNumber,
          }));
        }
      }
      setValidationErrors({});
      clearError();
    }
  }, [isOpen, editingPatient, prefillDocumentNumber]);

  // ==================== HANDLERS ====================
  
  /**
   * Maneja cambios en inputs del nivel superior
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Maneja cambios en inputs anidados
   */
  const handleNestedInputChange = (section, field, value) => {
    setParsedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Limpiar error si existe
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario
    const errors = validatePacienteForm(formData, parsedData);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      Swal.fire({
        title: 'Errores de validación',
        text: 'Por favor revise los campos marcados en rojo',
        icon: 'warning',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    // Formatear datos para el API
    const dataToSend = formatPacienteForAPI(formData, parsedData);

    try {
      let result;
      
      if (editingPatient) {
        // Actualizar paciente existente
        result = await updatePaciente(editingPatient.id, dataToSend);
      } else {
        // Crear nuevo paciente
        result = await createPaciente(dataToSend);
      }

      if (result) {
        await Swal.fire({
          title: '¡Éxito!',
          text: editingPatient 
            ? 'Paciente actualizado correctamente' 
            : 'Paciente creado correctamente',
          icon: 'success',
          confirmButtonColor: '#16a34a',
          timer: 2000,
        });

        // Llamar callback para actualizar la tabla de pacientes
        if (onPatientCreated) {
          onPatientCreated(result);
        }
        
        handleClose();
      } else {
        Swal.fire({
          title: 'Error',
          text: error || 'No se pudo guardar el paciente',
          icon: 'error',
          confirmButtonColor: '#3b82f6',
        });
      }
    } catch (err) {
      console.error('Error saving patient:', err);
      Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al guardar el paciente',
        icon: 'error',
        confirmButtonColor: '#3b82f6',
      });
    }
  };

  /**
   * Reinicia el formulario
   */
  const resetForm = () => {
    setFormData({
      tipoDocumento: 'CC',
      numeroDocumento: '',
    });
    setParsedData(getEmptyPacienteData());
    setValidationErrors({});
    clearError();
  };

  /**
   * Cierra el modal
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ==================== RENDER CONDITIONS ====================
  if (!isOpen) return null;

  // ==================== RENDER ====================
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose}></div>

        {/* Modal Container */}
        <div className="inline-block align-bottom bg-gray-50 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
              </h2>
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Identificación */}
            <IdentificacionSection
              formData={formData}
              parsedData={parsedData}
              validationErrors={validationErrors}
              onInputChange={handleInputChange}
              onNestedInputChange={handleNestedInputChange}
              disabled={saving}
            />

            {/* Información Personal */}
            <InformacionPersonalSection
              parsedData={parsedData}
              validationErrors={validationErrors}
              onNestedInputChange={handleNestedInputChange}
              disabled={saving}
            />

            {/* Información de Contacto */}
            <InformacionContactoSection
              parsedData={parsedData}
              validationErrors={validationErrors}
              onNestedInputChange={handleNestedInputChange}
              disabled={saving}
            />

            {/* Información Médica */}
            <InformacionMedicaSection
              parsedData={parsedData}
              validationErrors={validationErrors}
              onNestedInputChange={handleNestedInputChange}
              disabled={saving}
            />

            {/* Consentimiento Informado */}
            <ConsentimientoInformadoSection
              parsedData={parsedData}
              validationErrors={validationErrors}
              onNestedInputChange={handleNestedInputChange}
              disabled={saving}
            />

            {/* Contacto de Emergencia */}
            <ContactoEmergenciaSection
              parsedData={parsedData}
              validationErrors={validationErrors}
              onNestedInputChange={handleNestedInputChange}
              disabled={saving}
            />

            {/* Actions */}
            <div className="flex items-center justify-end gap-x-6 bg-white px-4 py-4 sm:px-8 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : (editingPatient ? 'Actualizar Paciente' : 'Crear Paciente')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePatientModalRefactored;
