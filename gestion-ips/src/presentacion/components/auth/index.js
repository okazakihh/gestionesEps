/**
 * Exportaciones centralizadas de componentes y hooks de autenticación/permisos
 */

// Componentes de protección
export { ProtectedRoute } from './ProtectedRoute.jsx';
export { PermissionGuard } from './PermissionGuard.jsx';

// Hook combinado
export { useAuthWithPermissions } from '../../../negocio/hooks/auth/useAuthWithPermissions.js';

// Contexto de permisos
export { 
  PermissionsProvider, 
  usePermissionsContext 
} from '../../../negocio/contexts/PermissionsContext.jsx';

// Contexto de autenticación
export { 
  AuthProvider, 
  useAuth 
} from '../../../data/context/AuthContext.jsx';
