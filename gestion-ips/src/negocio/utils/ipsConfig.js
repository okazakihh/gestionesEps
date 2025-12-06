/**
 * ipsConfig.js
 * 
 * Configuración centralizada de la información de la IPS
 * Utilizada en facturas, historias clínicas y otros documentos oficiales
 * 
 * Para actualizar la información de la IPS, simplemente modifique los valores aquí
 * y los cambios se reflejarán automáticamente en toda la aplicación
 */

export const ipsConfig = {
  // Información básica de la IPS
  nombre: "IPS SALUD TOTAL",
  descripcion: "Institución Prestadora de Servicios de Salud",
  nit: "900.123.456-7",
  
  // Dirección y ubicación
  direccion: "Calle 123 # 45-67",
  ciudad: "Bucaramanga",
  departamento: "Santander",
  pais: "Colombia",
  codigoPostal: "110111",
  
  // Contacto
  telefono: "+57 (601) 234 5678",
  celular: "+57 300 123 4567",
  email: "contacto@ipssaludtotal.com.co",
  sitioWeb: "www.ipssaludtotal.com.co",
  
  // Información legal y regulatoria
  codigoHabilitacion: "11000012345678",
  resolucionHabilitacion: "Resolución 1234 de 2020",
  nivelAtencion: "II Nivel",
  tipoIPS: "Privada",
  
  // Horarios de atención
  horarioAtencion: "Lunes a Viernes: 7:00 AM - 6:00 PM",
  horarioUrgencias: "24 horas / 7 días",
  
  // Información para facturación
  regimenTributario: "Régimen Común",
  responsabilidadFiscal: "No responsable de IVA",
  actividadEconomica: "8610 - Actividades de hospitales y clínicas con internación",
  
  // Información bancaria para pagos
  datosBancarios: {
    banco: "Bancolombia",
    tipoCuenta: "Cuenta Corriente",
    numeroCuenta: "123-456789-01",
    nequi: "300 123 4567",
    daviplata: "301 234 5678"
  },
  
  // Representante legal
  representanteLegal: {
    nombre: "Dr. Juan Carlos Pérez González",
    cargo: "Director General",
    cedula: "12345678",
    tarjetaProfesional: "12345"
  },
  
  // Logo (ruta relativa o URL)
  logo: "/assets/logo-ips.png",
  
  // Redes sociales
  redesSociales: {
    facebook: "https://facebook.com/ipssaludtotal",
    instagram: "@ipssaludtotal",
    twitter: "@ipssaludtotal",
    linkedin: "IPS Salud Total"
  },
  
  // Colores corporativos (para usar en documentos)
  colores: {
    primario: "#2563eb",      // Azul
    secundario: "#10b981",    // Verde
    acento: "#f59e0b",        // Naranja
    texto: "#1f2937",         // Gris oscuro
    textoClaro: "#6b7280"     // Gris medio
  },
  
  // Versión del sistema
  version: "2.1.0",
  
  // Servicios ofrecidos (opcional)
  servicios: {
    lista: [
      "Consulta Externa",
      "Urgencias 24h",
      "Hospitalización",
      "Cirugía",
      "Laboratorio Clínico",
      "Imágenes Diagnósticas",
      "Rehabilitación"
    ],
    historiaClinicaElectronica: "Sistema de Gestión Médica IPS"
  },
  
  // Notas legales para documentos
  notasLegales: {
    factura: "Este documento constituye título valor conforme a la Ley 1231 de 2008",
    historiaClinica: "Este documento es confidencial y está protegido por la Ley 1581 de 2012 de Protección de Datos Personales",
    consentimiento: "De acuerdo con la Ley 23 de 1981 y la Resolución 1995 de 1999"
  }
};

/**
 * Función auxiliar para obtener la dirección completa formateada
 */
export const getDireccionCompleta = () => {
  return `${ipsConfig.direccion}, ${ipsConfig.ciudad}, ${ipsConfig.departamento}, ${ipsConfig.pais}`;
};

/**
 * Función auxiliar para obtener información de contacto formateada
 */
export const getContactoCompleto = () => {
  return {
    principal: `Tel: ${ipsConfig.telefono} | Cel: ${ipsConfig.celular}`,
    email: ipsConfig.email,
    web: ipsConfig.sitioWeb
  };
};

/**
 * Función auxiliar para obtener el encabezado completo de documentos
 */
export const getEncabezadoDocumento = () => {
  return {
    nombre: ipsConfig.nombre,
    nit: `NIT: ${ipsConfig.nit}`,
    direccion: getDireccionCompleta(),
    telefono: ipsConfig.telefono,
    email: ipsConfig.email,
    web: ipsConfig.sitioWeb,
    habilitacion: ipsConfig.codigoHabilitacion
  };
};

/**
 * Función auxiliar para obtener el pie de página de documentos
 */
export const getPieDocumento = () => {
  return {
    direccion: getDireccionCompleta(),
    contacto: `${ipsConfig.telefono} | ${ipsConfig.email}`,
    web: ipsConfig.sitioWeb,
    horario: ipsConfig.horarioAtencion
  };
};

export default ipsConfig;
