// Tipos para las entidades del sistema IPS
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  estado: boolean;
}

export interface Ips extends BaseEntity {
  codigo: string;
  nombre: string;
  nit: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  configuracion?: string;
}

export interface Rol extends BaseEntity {
  nombre: string;
  descripcion?: string;
  permisos: string;
}

export interface Usuario {
  id: string;
  username: string;
  email: string;
  personalInfo?: {
    nombres?: string;
    apellidos?: string;
    documento?: string;
    tipoDocumento?: string;
    telefono?: string;
  };
  contactInfo?: {
    telefono?: string;
    direccion?: string;
    ciudad?: string;
  };
  roles: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  // Campos derivados para compatibilidad
  nombres?: string;
  apellidos?: string;
  documento?: string;
  tipoDocumento?: string;
  telefono?: string;
  ultimoLogin?: string;
  ips?: Ips;
  rol?: Rol;
  activo?: boolean; // Alias para isActive
  estado?: boolean; // Alias para isActive
}

// Tipos para autenticación
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  tipo: string;
  expiracion: number;
  usuario: UsuarioResponse;
}

export interface UsuarioResponse {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  documento: string;
  tipoDocumento: string;
  telefono?: string;
  ultimoLogin?: string;
  createdAt: string;
  estado: boolean;
  ipsId: string;
  ipsNombre: string;
  ipsCodigo: string;
  rolId: string;
  rolNombre: string;
  rolDescripcion?: string;
}

// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// Tipos para formularios
export interface FormErrors {
  [key: string]: string | undefined;
}

// Tipos de documentos colombianos
export type TipoDocumento = 'CC' | 'CE' | 'PA' | 'TI' | 'RC' | 'AS';

// Roles del sistema
export type RolSistema = 'ADMIN' | 'MEDICO' | 'ENFERMERO' | 'FACTURADOR' | 'RECEPCIONISTA';

// Estados de componentes
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Configuración de la aplicación
export interface AppConfig {
  apiUrl: string;
  appTitle: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
}

// Contexto de autenticación
export interface AuthContextType {
  user: UsuarioResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// Tipos para navegación
export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  roles?: RolSistema[];
  children?: MenuItem[];
}

// Tipos para notificaciones
export interface NotificationOptions {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}
