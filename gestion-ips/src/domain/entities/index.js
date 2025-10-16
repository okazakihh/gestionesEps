/**
 * Exportaciones de entidades de dominio
 * Punto central para importar todas las entidades
 */

// Entidades principales
export { Paciente, InformacionPersonal, InformacionContacto, InformacionMedica } from './Paciente.js';
export { CitaMedica, FiltrosCitaMedica } from './CitaMedica.js';
export { Factura, FiltrosFactura, DetalleCitaFactura } from './Factura.js';
export { CodigoCups, FiltrosCodigoCups, ActualizacionValorCups } from './CodigoCups.js';

// Tipos y constantes
export const ESTADOS_CITA = CitaMedica.ESTADOS;
export const ESTADOS_FACTURA = Factura.ESTADOS;