/**
 * Exportaciones de repositorios
 * Infrastructure Layer - Repositories
 */

// Repositorios principales
import { PacienteRepository } from './PacienteRepository.js';
import { CitaMedicaRepository } from './CitaMedicaRepository.js';
import { FacturaRepository } from './FacturaRepository.js';
import { CodigoCupsRepository } from './CodigoCupsRepository.js';
import { EmpleadoRepository } from './EmpleadoRepository.js';

export { PacienteRepository, CitaMedicaRepository, FacturaRepository, CodigoCupsRepository, EmpleadoRepository };

// Factory para crear instancias de repositorios con dependencias
export class RepositoryFactory {
  constructor(services) {
    this.services = services;
  }

  createPacienteRepository() {
    return new PacienteRepository(this.services.pacientesApiService);
  }

  createCitaMedicaRepository() {
    return new CitaMedicaRepository(this.services.citaMedicaApiService);
  }

  createFacturaRepository() {
    return new FacturaRepository(this.services.facturacionApiService);
  }

  createCodigoCupsRepository() {
    return new CodigoCupsRepository(this.services.codigosCupsApiService);
  }

  createEmpleadoRepository() {
    return new EmpleadoRepository(this.services.empleadosApiService);
  }

  // Método para crear todos los repositorios
  createAll() {
    return {
      pacienteRepository: this.createPacienteRepository(),
      citaMedicaRepository: this.createCitaMedicaRepository(),
      facturaRepository: this.createFacturaRepository(),
      codigoCupsRepository: this.createCodigoCupsRepository(),
      empleadoRepository: this.createEmpleadoRepository()
    };
  }
}