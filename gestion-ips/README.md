# 🎨 Frontend React - Sistema de Gestión IPS

Frontend moderno desarrollado con React 18, TypeScript, Vite y TailwindCSS para el Sistema de Gestión de IPS.

## 🚀 Características

- **React 18** con TypeScript para tipado estático
- **Vite** para desarrollo y build ultrarrápidos  
- **TailwindCSS** + **Shadcn/UI** para diseño moderno
- **React Router** para navegación SPA
- **React Query** para manejo de estado del servidor
- **Zustand** para estado global
- **React Hook Form** + **Zod** para formularios
- **Axios** para consumo de APIs

## 📁 Estructura del Proyecto

```
src/
├── 📁 api/                 # Cliente HTTP y servicios
├── 📁 components/          # Componentes reutilizables
│   └── 📁 ui/             # Componentes base (Shadcn/UI)
├── 📁 context/            # Context API (Auth, etc.)
├── 📁 hooks/              # Custom hooks
├── 📁 pages/              # Páginas/vistas principales
├── 📁 routes/             # Configuración de rutas
├── 📁 stores/             # Stores de Zustand
├── 📁 styles/             # Estilos globales
├── 📁 types/              # Tipos TypeScript
├── 📁 utils/              # Funciones auxiliares
├── 🎨 App.tsx            # Componente principal
└── ⚡ main.tsx           # Punto de entrada
```

## ⚙️ Configuración

### Variables de Entorno
```bash
VITE_API_URL=http://localhost:8080/api
VITE_APP_TITLE=Sistema de Gestión IPS
VITE_APP_VERSION=1.0.0
VITE_ENV=development
```

### Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build           # Build de producción
npm run preview         # Preview del build

# Calidad de código
npm run lint            # Ejecutar ESLint
npm run lint:fix        # Corregir errores automáticamente
npm run format          # Formatear código con Prettier
npm run type-check      # Verificar tipos TypeScript
```

## 🎯 Módulos Implementados

### 🔐 Autenticación
- Login/Logout seguro con JWT
- Context de autenticación global
- Protección de rutas por roles
- Refresh token automático

### 🏥 Gestión IPS
- Multi-tenant (cada IPS independiente)
- Dashboard personalizable
- Configuración por IPS

### 👥 Usuarios
- CRUD completo de usuarios
- Roles y permisos (RBAC)
- Perfil de usuario editable

### 🎨 Componentes UI
- Design system consistente
- Componentes accesibles (Radix UI)
- Tema personalizable (CSS variables)
- Responsive design

## 🛠️ Stack Técnico

### Core
- **React 18.2+** - Library principal
- **TypeScript 5.2+** - Tipado estático
- **Vite 4.4+** - Build tool

### Styling
- **TailwindCSS 3.3+** - Framework CSS
- **Shadcn/UI** - Componentes base
- **Radix UI** - Primitivos accesibles
- **Lucide React** - Iconos

### Estado y Data
- **Zustand 4.4+** - Estado global
- **React Query 3.39+** - Estado del servidor
- **React Hook Form 7.45+** - Formularios
- **Zod 3.22+** - Validación de esquemas

### Routing y HTTP
- **React Router 6.15+** - Navegación
- **Axios 1.5+** - Cliente HTTP

### Desarrollo
- **ESLint** - Linting
- **Prettier** - Formateo
- **TypeScript Compiler** - Type checking

## 🐳 Docker

### Desarrollo
```bash
# Solo frontend
docker build -t ips-frontend .
docker run -p 3000:80 ips-frontend

# Con docker-compose (completo)
docker-compose up frontend
```

### Producción
```bash
# Build optimizado
docker build --target production -t ips-frontend:prod .

# Variables de entorno para producción
docker build --build-arg VITE_API_URL=https://api.ipsystem.co \
  -t ips-frontend:prod .
```

## 📱 Responsive Design

- **Mobile First** - Diseño optimizado para móviles
- **Breakpoints** - sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System** - CSS Grid + Flexbox
- **Componentes Adaptativos** - Se ajustan automáticamente

## 🔒 Seguridad

- **CSP Headers** - Content Security Policy
- **XSS Protection** - Protección contra ataques XSS
- **Token Storage** - JWT en localStorage (configurable)
- **Route Guards** - Protección de rutas sensibles
- **API Validation** - Validación en frontend y backend

## 🚀 Performance

- **Code Splitting** - Lazy loading de rutas
- **Tree Shaking** - Eliminación de código no usado
- **Bundle Optimization** - Chunks optimizados
- **Image Optimization** - Compresión automática
- **Caching Strategy** - Cache de assets y API

## 🧪 Testing (Pendiente)

```bash
# Testing setup (por implementar)
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev vitest jsdom
```

## 📖 Uso

### Desarrollo Local
```bash
cd frontend
npm install
npm run dev
```

### Build Producción
```bash
npm run build
npm run preview  # Preview local del build
```

## 🤝 Contribución

1. Seguir las convenciones de TypeScript
2. Usar Prettier para formateo
3. Validar con ESLint antes de commit
4. Documentar componentes complejos
5. Seguir el patrón de componentes establecido

---

**Desarrollado para IPS colombianas con ❤️ y ⚡**
