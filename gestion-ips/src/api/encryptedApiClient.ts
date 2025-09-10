// Archivo residual del experimento de gateway. Re-exporta el apiClient estándar para evitar refactors.
// Re-exporta el cliente estándar (el gateway ha sido removido)
export { apiClient as default, apiClient } from './apiClient';
