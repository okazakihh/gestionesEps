/**
 * Contenedor de Dependencias (Dependency Injection Container)
 * Infrastructure Layer - Dependency Injection
 */
import { pacientesApiService, historiasClinicasApiService, consultasApiService, documentosApiService, codigosCupsApiService, facturacionApiService } from '@/data/services/pacientesApiService.js';
import { empleadosApiService } from '@/data/services/empleadosApiService.js';
import { AuthService } from '@/data/services/authService.js';
import { usuarioApiService } from '@/data/services/usuarioApiService.js';

// Importar repositorios
import { PacienteRepository } from '@/data/repositories/PacienteRepository.js';
import { CitaMedicaRepository } from '@/data/repositories/CitaMedicaRepository.js';
import { FacturaRepository } from '@/data/repositories/FacturaRepository.js';
import { CodigoCupsRepository } from '@/data/repositories/CodigoCupsRepository.js';
import { EmpleadoRepository } from '@/data/repositories/EmpleadoRepository.js';

// Importar casos de uso
import { ObtenerCitasAtendidasUseCase } from '@/negocio/useCases/ObtenerCitasAtendidasUseCase.js';
import { CrearFacturaUseCase } from '@/negocio/useCases/CrearFacturaUseCase.js';
import { ObtenerFacturasUseCase } from '@/negocio/useCases/ObtenerFacturasUseCase.js';

class DependencyContainer {
  constructor() {
    this.services = {};
    this.repositories = {};
    this.useCases = {};
    this.initialized = false;
  }

  /**
   * Inicializa el contenedor de dependencias
   */
  initialize() {
    if (this.initialized) return;

    try {
      // 1. Registrar servicios (APIs)
      this._registerServices();

      // 2. Crear repositorios
      this._createRepositories();

      // 3. Crear casos de uso
      this._createUseCases();

      this.initialized = true;
      console.log('? Contenedor de dependencias inicializado correctamente');
    } catch (error) {
      console.error('? Error inicializando contenedor de dependencias:', error);
      throw error;
    }
  }

  /**
   * Registra todos los servicios API
   * @private
   */
  _registerServices() {
    this.services = {
      // Servicios principales
      pacientesApiService,
      historiasClinicasApiService,
      consultasApiService,
      documentosApiService,
      codigosCupsApiService,
      facturacionApiService,
      empleadosApiService,
      authService: AuthService,
      usuarioApiService,

      // Alias para compatibilidad
      citaMedicaApiService: pacientesApiService // Las citas est�n en pacientesApiService
    };

    console.log('?? Servicios registrados:', Object.keys(this.services));
  }

  /**
   * Crea instancias de repositorios
   * @private
   */
  _createRepositories() {
    this.repositories = {
      pacienteRepository: new PacienteRepository(this.services.pacientesApiService),
      citaMedicaRepository: new CitaMedicaRepository(this.services.citaMedicaApiService),
      facturaRepository: new FacturaRepository(this.services.facturacionApiService),
      codigoCupsRepository: new CodigoCupsRepository(this.services.codigosCupsApiService),
      empleadoRepository: new EmpleadoRepository(this.services.empleadosApiService)
    };

    console.log('📦 Repositorios creados:', Object.keys(this.repositories));
  }

  /**
   * Crea instancias de casos de uso
   * @private
   */
  _createUseCases() {
    this.useCases = {
      // Casos de uso de facturaci�n
      obtenerCitasAtendidasUseCase: new ObtenerCitasAtendidasUseCase(
        this.repositories.citaMedicaRepository,
        this.repositories.pacienteRepository,
        this.repositories.codigoCupsRepository,
        this.repositories.empleadoRepository,
        this.repositories.facturaRepository
      ),

      crearFacturaUseCase: new CrearFacturaUseCase(
        this.repositories.facturaRepository,
        this.repositories.citaMedicaRepository
      ),

      obtenerFacturasUseCase: new ObtenerFacturasUseCase(
        this.repositories.facturaRepository
      )
    };

    console.log('?? Casos de uso creados:', Object.keys(this.useCases));
  }

  /**
   * Obtiene un servicio por nombre
   * @param {string} serviceName - Nombre del servicio
   * @returns {*} Instancia del servicio
   */
  getService(serviceName) {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Servicio no encontrado: ${serviceName}`);
    }
    return service;
  }

  /**
   * Obtiene un repositorio por nombre
   * @param {string} repositoryName - Nombre del repositorio
   * @returns {*} Instancia del repositorio
   */
  getRepository(repositoryName) {
    const repository = this.repositories[repositoryName];
    if (!repository) {
      throw new Error(`Repositorio no encontrado: ${repositoryName}`);
    }
    return repository;
  }

  /**
   * Obtiene un caso de uso por nombre
   * @param {string} useCaseName - Nombre del caso de uso
   * @returns {*} Instancia del caso de uso
   */
  getUseCase(useCaseName) {
    const useCase = this.useCases[useCaseName];
    if (!useCase) {
      throw new Error(`Caso de uso no encontrado: ${useCaseName}`);
    }
    return useCase;
  }

  /**
   * Obtiene todos los casos de uso
   * @returns {Object} Objeto con todos los casos de uso
   */
  getAllUseCases() {
    return { ...this.useCases };
  }

  /**
   * Obtiene todos los repositorios
   * @returns {Object} Objeto con todos los repositorios
   */
  getAllRepositories() {
    return { ...this.repositories };
  }

  /**
   * Obtiene todos los servicios
   * @returns {Object} Objeto con todos los servicios
   */
  getAllServices() {
    return { ...this.services };
  }

  /**
   * Verifica si el contenedor est� inicializado
   * @returns {boolean} True si est� inicializado
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Reinicia el contenedor (para testing)
   */
  reset() {
    this.services = {};
    this.repositories = {};
    this.useCases = {};
    this.initialized = false;
  }
}

// Instancia singleton del contenedor
export const dependencyContainer = new DependencyContainer();

// M�todo de conveniencia para inicializar
export const initializeContainer = () => {
  dependencyContainer.initialize();
  return dependencyContainer;
};

// Export por defecto
export default dependencyContainer;