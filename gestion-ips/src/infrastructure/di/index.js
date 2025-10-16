/**
 * Exportaciones de Dependency Injection
 * Infrastructure Layer - DI
 */

export { dependencyContainer, initializeContainer } from './DependencyContainer.js';

// Funciones de conveniencia para acceder a dependencias
export const getUseCase = (useCaseName) => dependencyContainer.getUseCase(useCaseName);
export const getRepository = (repositoryName) => dependencyContainer.getRepository(repositoryName);
export const getService = (serviceName) => dependencyContainer.getService(serviceName);

// Casos de uso más usados (para conveniencia)
export const useCases = {
  get obtenerCitasAtendidas() { return dependencyContainer.getUseCase('obtenerCitasAtendidasUseCase'); },
  get crearFactura() { return dependencyContainer.getUseCase('crearFacturaUseCase'); },
  get obtenerFacturas() { return dependencyContainer.getUseCase('obtenerFacturasUseCase'); }
};

// Repositorios más usados (para conveniencia)
export const repositories = {
  get pacientes() { return dependencyContainer.getRepository('pacienteRepository'); },
  get citasMedicas() { return dependencyContainer.getRepository('citaMedicaRepository'); },
  get facturas() { return dependencyContainer.getRepository('facturaRepository'); },
  get codigosCups() { return dependencyContainer.getRepository('codigoCupsRepository'); },
  get empleados() { return dependencyContainer.getRepository('empleadoRepository'); }
};