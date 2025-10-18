import React, { useState, useEffect } from 'react';
import geografiaApiService from '../../../../data/services/geografiaApiService';

/**
 * InformacionContactoSection - Sección de información de contacto
 */
const InformacionContactoSection = ({ parsedData, validationErrors, onNestedInputChange, disabled = false }) => {
  const [paises, setPaises] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loadingPaises, setLoadingPaises] = useState(false);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  
  // Guardar temporalmente el código del país y departamento seleccionado
  const [paisCodigo, setPaisCodigo] = useState('CO');
  const [departamentoCodigo, setDepartamentoCodigo] = useState('');

  // Cargar países al montar el componente
  useEffect(() => {
    cargarPaises();
  }, []);

  // Cargar departamentos cuando cambia el país
  useEffect(() => {
    const paisSeleccionado = parsedData.informacionContacto?.pais;
    if (paisSeleccionado) {
      cargarDepartamentos(paisSeleccionado);
    } else {
      setDepartamentos([]);
      setCiudades([]);
      setDepartamentoCodigo('');
    }
  }, [parsedData.informacionContacto?.pais]);

  // Cargar ciudades cuando cambia el departamento
  useEffect(() => {
    const departamentoSeleccionado = parsedData.informacionContacto?.departamento;
    if (paisCodigo && departamentoCodigo && departamentoSeleccionado) {
      cargarCiudades(paisCodigo, departamentoCodigo);
    } else {
      setCiudades([]);
    }
  }, [paisCodigo, departamentoCodigo, parsedData.informacionContacto?.departamento]);

  const cargarPaises = async () => {
    try {
      setLoadingPaises(true);
      const data = await geografiaApiService.obtenerPaises();
      console.log('✅ Países cargados:', data?.length || 0);
      setPaises(data || []);
    } catch (error) {
      console.error('❌ Error al cargar países:', error);
      setPaises([]);
    } finally {
      setLoadingPaises(false);
    }
  };

  const cargarDepartamentos = async (paisNombre) => {
    try {
      setLoadingDepartamentos(true);
      console.log('🌎 Cargando departamentos para:', paisNombre);
      
      // Buscar el código del país seleccionado
      const paisSeleccionado = paises.find(p => p.label === paisNombre);
      const codigoPais = paisSeleccionado?.value || 'CO';
      setPaisCodigo(codigoPais);
      
      console.log('📍 Código del país:', codigoPais);
      
      const data = await geografiaApiService.obtenerEstadosPorPais(codigoPais);
      console.log('✅ Departamentos cargados:', data?.length || 0, data);
      setDepartamentos(data || []);
    } catch (error) {
      console.error('❌ Error al cargar departamentos:', error);
      setDepartamentos([]);
    } finally {
      setLoadingDepartamentos(false);
    }
  };

  const cargarCiudades = async (codigoPais, codigoDepto) => {
    try {
      setLoadingCiudades(true);
      console.log('🏙️ Cargando ciudades para país:', codigoPais, '/ depto:', codigoDepto);
      
      const data = await geografiaApiService.obtenerCiudadesPorEstado(codigoPais, codigoDepto);
      console.log('✅ Ciudades cargadas:', data?.length || 0);
      setCiudades(data || []);
    } catch (error) {
      console.error('❌ Error al cargar ciudades:', error);
      setCiudades([]);
    } finally {
      setLoadingCiudades(false);
    }
  };

  const handlePaisChange = (value) => {
    // Encontrar el país seleccionado para obtener su código
    const paisObj = paises.find(p => p.label === value);
    if (paisObj) {
      console.log('🌍 País seleccionado:', paisObj.label, '/ Código:', paisObj.value);
      setPaisCodigo(paisObj.value); // Guardar el código para la API
    }
    onNestedInputChange('informacionContacto', 'pais', value);
    // Limpiar departamento y ciudad cuando cambia el país
    onNestedInputChange('informacionContacto', 'departamento', '');
    onNestedInputChange('informacionContacto', 'ciudad', '');
  };

  const handleDepartamentoChange = (value) => {
    // Encontrar el departamento seleccionado para obtener su código
    const deptoObj = departamentos.find(d => d.label === value);
    if (deptoObj) {
      console.log('📋 Departamento seleccionado:', deptoObj.label, '/ Código:', deptoObj.value);
      setDepartamentoCodigo(deptoObj.value); // Guardar el código para la API
    }
    onNestedInputChange('informacionContacto', 'departamento', value);
    // Limpiar ciudad cuando cambia el departamento
    onNestedInputChange('informacionContacto', 'ciudad', '');
  };

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">Información de Contacto</h3>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          
          {/* Email */}
          <div className="sm:col-span-3">
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={parsedData.informacionContacto?.email || ''}
              onChange={(e) => onNestedInputChange('informacionContacto', 'email', e.target.value)}
              disabled={disabled}
              className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                validationErrors.email ? 'ring-red-500 focus:ring-red-500' : 'ring-gray-300 focus:ring-blue-600'
              }`}
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>

          {/* Teléfono Fijo */}
          <div className="sm:col-span-3">
            <label htmlFor="telefonoFijo" className="block text-sm font-medium leading-6 text-gray-900">
              Teléfono Fijo
            </label>
            <input
              type="tel"
              id="telefonoFijo"
              value={parsedData.informacionContacto?.telefonoFijo || ''}
              onChange={(e) => onNestedInputChange('informacionContacto', 'telefonoFijo', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Dirección */}
          <div className="sm:col-span-6">
            <label htmlFor="direccion" className="block text-sm font-medium leading-6 text-gray-900">
              Dirección
            </label>
            <input
              type="text"
              id="direccion"
              value={parsedData.informacionContacto?.direccion || ''}
              onChange={(e) => onNestedInputChange('informacionContacto', 'direccion', e.target.value)}
              disabled={disabled}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* País */}
          <div className="sm:col-span-2">
            <label htmlFor="pais" className="block text-sm font-medium leading-6 text-gray-900">
              País
            </label>
            <select
              id="pais"
              value={parsedData.informacionContacto?.pais || ''}
              onChange={(e) => handlePaisChange(e.target.value)}
              disabled={disabled || loadingPaises}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingPaises ? 'Cargando países...' : 'Seleccione un país'}
              </option>
              {paises && paises.length > 0 ? (
                paises.map((pais, index) => (
                  <option key={pais.value || pais.label || `pais-${index}`} value={pais.label}>
                    {pais.label}
                  </option>
                ))
              ) : null}
            </select>
          </div>

          {/* Departamento */}
          <div className="sm:col-span-2">
            <label htmlFor="departamento" className="block text-sm font-medium leading-6 text-gray-900">
              Departamento / Estado
            </label>
            <select
              id="departamento"
              value={parsedData.informacionContacto?.departamento || ''}
              onChange={(e) => handleDepartamentoChange(e.target.value)}
              disabled={disabled || loadingDepartamentos || !parsedData.informacionContacto?.pais}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {!parsedData.informacionContacto?.pais
                  ? 'Primero seleccione un país'
                  : loadingDepartamentos
                  ? 'Cargando departamentos...'
                  : 'Seleccione un departamento'}
              </option>
              {departamentos && departamentos.length > 0 ? (
                departamentos.map((depto, index) => (
                  <option key={depto.value || depto.label || `depto-${index}`} value={depto.label}>
                    {depto.label}
                  </option>
                ))
              ) : null}
            </select>
          </div>

          {/* Ciudad */}
          <div className="sm:col-span-2">
            <label htmlFor="ciudad" className="block text-sm font-medium leading-6 text-gray-900">
              Ciudad
            </label>
            <select
              id="ciudad"
              value={parsedData.informacionContacto?.ciudad || ''}
              onChange={(e) => onNestedInputChange('informacionContacto', 'ciudad', e.target.value)}
              disabled={disabled || loadingCiudades || !parsedData.informacionContacto?.departamento}
              className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {!parsedData.informacionContacto?.departamento
                  ? 'Primero seleccione un departamento'
                  : loadingCiudades
                  ? 'Cargando ciudades...'
                  : 'Seleccione una ciudad'}
              </option>
              {ciudades && ciudades.length > 0 ? (
                ciudades.map((ciudad, index) => (
                  <option key={ciudad.value || ciudad.label || `ciudad-${index}`} value={ciudad.label}>
                    {ciudad.label}
                  </option>
                ))
              ) : null}
            </select>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InformacionContactoSection;
