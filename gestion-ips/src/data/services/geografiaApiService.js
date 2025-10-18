/**
 * Servicio para obtener información geográfica de APIs públicas
 * Soporta información de todos los países del mundo
 * 
 * APIs Utilizadas:
 * 1. REST Countries API (https://restcountries.com) - ~250 países con traducciones
 * 2. API Colombia (https://api-colombia.com) - 33 departamentos + 1,122 ciudades de Colombia
 * 3. CountryStateCity API (https://api.countrystatecity.in) - Estados y ciudades de todos los países
 * 
 * Características:
 * - ✅ Cobertura global (todos los países del mundo)
 * - ✅ Cache de 24 horas para reducir llamadas a APIs
 * - ✅ Fallback automático con datos de respaldo
 * - ✅ Soporte para personas de nacionalidad extranjera
 * 
 * Data Layer - Services
 */

const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 horas
const cache = {
  paises: { data: null, timestamp: 0 },
  estados: { data: {}, timestamp: {} }, // Estados/provincias/departamentos por país
  ciudades: { data: {}, timestamp: {} }
};

// Mapeo de códigos ISO2 a nombres de países en español
const PAISES_POPULARES = [
  'CO', 'VE', 'EC', 'PE', 'BR', 'AR', 'CL', 'MX', 'US', 'ES', 
  'PA', 'CR', 'UY', 'PY', 'BO', 'CA', 'CU', 'DO', 'GT', 'HN'
];

/**
 * Obtener lista de países desde REST Countries API
 */
export const obtenerPaises = async () => {
  try {
    // Verificar cache
    const now = Date.now();
    if (cache.paises.data && (now - cache.paises.timestamp) < CACHE_DURATION) {
      return cache.paises.data;
    }

    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,translations');
    
    if (!response.ok) {
      throw new Error('Error al obtener países');
    }

    const data = await response.json();
    
    // Formatear para select
    const paises = data
      .map(pais => ({
        value: pais.cca2,
        label: pais.translations?.spa?.common || pais.name.common
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    // Guardar en cache
    cache.paises = { data: paises, timestamp: now };
    
    return paises;
  } catch (error) {
    console.error('Error obteniendo países:', error);
    // Retornar lista básica de respaldo
    return [
      { value: 'CO', label: 'Colombia' },
      { value: 'VE', label: 'Venezuela' },
      { value: 'EC', label: 'Ecuador' },
      { value: 'PE', label: 'Perú' },
      { value: 'BR', label: 'Brasil' },
      { value: 'AR', label: 'Argentina' },
      { value: 'CL', label: 'Chile' },
      { value: 'MX', label: 'México' },
      { value: 'US', label: 'Estados Unidos' },
      { value: 'ES', label: 'España' }
    ];
  }
};

/**
 * Obtener estados/provincias/departamentos de cualquier país
 * Usa API Colombia para Colombia y CountryStateCity API para otros países
 */
export const obtenerEstadosPorPais = async (codigoPais) => {
  try {
    // Verificar cache
    const now = Date.now();
    const cacheKey = codigoPais;
    if (cache.estados.data[cacheKey] && 
        (now - (cache.estados.timestamp[cacheKey] || 0)) < CACHE_DURATION) {
      return cache.estados.data[cacheKey];
    }

    let estados = [];

    // Para Colombia usar API específica de Colombia
    if (codigoPais === 'CO') {
      const response = await fetch('https://api-colombia.com/api/v1/Department');
      
      if (!response.ok) {
        throw new Error('Error al obtener departamentos de Colombia');
      }

      const data = await response.json();
      
      estados = data
        .map(dept => ({
          value: dept.id.toString(),
          label: dept.name,
          codigo: dept.id
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    } else {
      // Para otros países usar Universal Tutorial API (alternativa gratuita)
      const response = await fetch(`https://api.countrystatecity.in/v1/countries/${codigoPais}/states`, {
        headers: {
          'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA==' // API Key pública de ejemplo
        }
      });

      if (response.ok) {
        const data = await response.json();
        estados = data
          .map(state => ({
            value: state.iso2,
            label: state.name,
            codigo: state.iso2
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
      } else {
        // Si falla, intentar con API alternativa (REST Countries con estados básicos)
        console.warn(`No se pudieron cargar estados para ${codigoPais}, retornando lista vacía`);
        estados = [];
      }
    }

    // Guardar en cache
    cache.estados.data[cacheKey] = estados;
    cache.estados.timestamp[cacheKey] = now;
    
    return estados;
  } catch (error) {
    console.error('Error obteniendo estados:', error);
    
    // Si es Colombia, retornar respaldo
    if (codigoPais === 'CO') {
      return getDepartamentosRespaldo();
    }
    
    return [];
  }
};

/**
 * Mantener compatibilidad con código existente
 */
export const obtenerDepartamentosColombia = () => obtenerEstadosPorPais('CO');

/**
 * Obtener ciudades de un estado/departamento de cualquier país
 */
export const obtenerCiudadesPorEstado = async (codigoPais, codigoEstado) => {
  try {
    // Verificar cache
    const now = Date.now();
    const cacheKey = `${codigoPais}-${codigoEstado}`;
    if (cache.ciudades.data[cacheKey] && 
        (now - (cache.ciudades.timestamp[cacheKey] || 0)) < CACHE_DURATION) {
      return cache.ciudades.data[cacheKey];
    }

    let ciudades = [];

    // Para Colombia usar API específica
    if (codigoPais === 'CO') {
      const response = await fetch(`https://api-colombia.com/api/v1/Department/${codigoEstado}/cities`);
      
      if (!response.ok) {
        throw new Error('Error al obtener ciudades de Colombia');
      }

      const data = await response.json();
      
      ciudades = data
        .map(city => ({
          value: city.id.toString(),
          label: city.name
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    } else {
      // Para otros países usar Country State City API
      const response = await fetch(
        `https://api.countrystatecity.in/v1/countries/${codigoPais}/states/${codigoEstado}/cities`,
        {
          headers: {
            'X-CSCAPI-KEY': 'NHhvOEcyWk50N2Vna3VFTE00bFp3MjFKR0ZEOUhkZlg4RTk1MlJlaA=='
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        ciudades = data
          .map(city => ({
            value: city.id?.toString() || city.name,
            label: city.name
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
      } else {
        console.warn(`No se pudieron cargar ciudades para ${codigoPais}-${codigoEstado}`);
        ciudades = [];
      }
    }

    // Guardar en cache
    cache.ciudades.data[cacheKey] = ciudades;
    cache.ciudades.timestamp[cacheKey] = now;
    
    return ciudades;
  } catch (error) {
    console.error('Error obteniendo ciudades:', error);
    return [];
  }
};

/**
 * Mantener compatibilidad con código existente (solo para Colombia)
 */
export const obtenerCiudadesPorDepartamento = (departamentoId) => 
  obtenerCiudadesPorEstado('CO', departamentoId);

/**
 * Limpiar cache (útil para refrescar datos)
 */
export const limpiarCacheGeografia = () => {
  cache.paises = { data: null, timestamp: 0 };
  cache.departamentos = { data: null, timestamp: 0 };
  cache.ciudades = { data: {}, timestamp: {} };
};

/**
 * Departamentos de respaldo (offline fallback)
 */
const getDepartamentosRespaldo = () => [
  { value: '1', label: 'Amazonas', codigo: 1 },
  { value: '2', label: 'Antioquia', codigo: 2 },
  { value: '3', label: 'Arauca', codigo: 3 },
  { value: '4', label: 'Atlántico', codigo: 4 },
  { value: '5', label: 'Bolívar', codigo: 5 },
  { value: '6', label: 'Boyacá', codigo: 6 },
  { value: '7', label: 'Caldas', codigo: 7 },
  { value: '8', label: 'Caquetá', codigo: 8 },
  { value: '9', label: 'Casanare', codigo: 9 },
  { value: '10', label: 'Cauca', codigo: 10 },
  { value: '11', label: 'Cesar', codigo: 11 },
  { value: '12', label: 'Chocó', codigo: 12 },
  { value: '13', label: 'Córdoba', codigo: 13 },
  { value: '14', label: 'Cundinamarca', codigo: 14 },
  { value: '15', label: 'Guainía', codigo: 15 },
  { value: '16', label: 'Guaviare', codigo: 16 },
  { value: '17', label: 'Huila', codigo: 17 },
  { value: '18', label: 'La Guajira', codigo: 18 },
  { value: '19', label: 'Magdalena', codigo: 19 },
  { value: '20', label: 'Meta', codigo: 20 },
  { value: '21', label: 'Nariño', codigo: 21 },
  { value: '22', label: 'Norte de Santander', codigo: 22 },
  { value: '23', label: 'Putumayo', codigo: 23 },
  { value: '24', label: 'Quindío', codigo: 24 },
  { value: '25', label: 'Risaralda', codigo: 25 },
  { value: '26', label: 'San Andrés y Providencia', codigo: 26 },
  { value: '27', label: 'Santander', codigo: 27 },
  { value: '28', label: 'Sucre', codigo: 28 },
  { value: '29', label: 'Tolima', codigo: 29 },
  { value: '30', label: 'Valle del Cauca', codigo: 30 },
  { value: '31', label: 'Vaupés', codigo: 31 },
  { value: '32', label: 'Vichada', codigo: 32 },
  { value: '33', label: 'Bogotá D.C.', codigo: 33 }
];

/**
 * Obtener información de un país específico
 */
export const obtenerInfoPais = async (codigoPais) => {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${codigoPais}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener información del país');
    }

    const data = await response.json();
    const pais = data[0];
    
    return {
      codigo: pais.cca2,
      nombre: pais.translations?.spa?.common || pais.name.common,
      nombreOficial: pais.translations?.spa?.official || pais.name.official,
      capital: pais.capital?.[0] || '',
      region: pais.region,
      subregion: pais.subregion,
      idiomas: pais.languages ? Object.values(pais.languages) : [],
      moneda: pais.currencies ? Object.keys(pais.currencies)[0] : ''
    };
  } catch (error) {
    console.error('Error obteniendo información del país:', error);
    return null;
  }
};

export const geografiaApiService = {
  obtenerPaises,
  obtenerEstadosPorPais,
  obtenerDepartamentosColombia, // Compatibilidad
  obtenerCiudadesPorEstado,
  obtenerCiudadesPorDepartamento, // Compatibilidad
  obtenerInfoPais,
  limpiarCacheGeografia
};

export default geografiaApiService;
