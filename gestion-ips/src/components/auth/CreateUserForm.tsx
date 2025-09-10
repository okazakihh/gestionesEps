import React, { useState } from 'react';

interface PersonalInfo {
  nombres?: string;
  apellidos?: string;
  documento?: string;
  tipoDocumento?: string;
  telefono?: string;
}

interface ContactInfo {
  telefono?: string;
  direccion?: string;
  ciudad?: string;
}

interface CreateUserFormProps {
  onSubmit: (data: {
    username: string;
    email: string;
    personalInfo: PersonalInfo;
    contactInfo: ContactInfo;
    roles: string[];
    isActive: boolean;
  }) => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    personalInfo: PersonalInfo;
    contactInfo: ContactInfo;
    roles: string[];
    isActive: boolean;
  }>({
    username: '',
    email: '',
    personalInfo: {
      nombres: '',
      apellidos: '',
      documento: '',
      tipoDocumento: '',
      telefono: '',
    },
    contactInfo: {
      telefono: '',
      direccion: '',
      ciudad: '',
    },
    roles: [],
    isActive: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const [section, key] = name.split('.');

    if (key) {
      if (section === 'personalInfo') {
        setFormData((prev) => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            [key]: value,
          },
        }));
      } else if (section === 'contactInfo') {
        setFormData((prev) => ({
          ...prev,
          contactInfo: {
            ...prev.contactInfo,
            [key]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">Registrar Usuario</h2>

      <input
        type="text"
        name="username"
        placeholder="Nombre de usuario"
        value={formData.username}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2"
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Correo electrónico"
        value={formData.email}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2"
        required
      />

      <fieldset>
        <legend className="font-medium">Información Personal</legend>
        <input
          type="text"
          name="personalInfo.nombres"
          placeholder="Nombres"
          value={formData.personalInfo.nombres}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          name="personalInfo.apellidos"
          placeholder="Apellidos"
          value={formData.personalInfo.apellidos}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          name="personalInfo.documento"
          placeholder="Documento"
          value={formData.personalInfo.documento}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          name="personalInfo.tipoDocumento"
          placeholder="Tipo de Documento"
          value={formData.personalInfo.tipoDocumento}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          name="personalInfo.telefono"
          placeholder="Teléfono"
          value={formData.personalInfo.telefono}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </fieldset>

      <fieldset>
        <legend className="font-medium">Información de Contacto</legend>
        <input
          type="text"
          name="contactInfo.telefono"
          placeholder="Teléfono"
          value={formData.contactInfo.telefono}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          name="contactInfo.direccion"
          placeholder="Dirección"
          value={formData.contactInfo.direccion}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          name="contactInfo.ciudad"
          placeholder="Ciudad"
          value={formData.contactInfo.ciudad}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      </fieldset>

      <select
        name="roles"
        multiple
        value={formData.roles}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            roles: Array.from(e.target.selectedOptions, (option) => option.value),
          }))
        }
        className="w-full border rounded px-3 py-2"
      >
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              isActive: e.target.checked,
            }))
          }
          className="border rounded"
        />
        <span>Activo</span>
      </label>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Registrar
      </button>
    </form>
  );
};

export default CreateUserForm;