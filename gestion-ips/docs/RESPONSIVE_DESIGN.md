# Responsive Design - Sistema de Gestión IPS

## Resumen
La aplicación ahora está optimizada para funcionar en dispositivos móviles, tablets y desktop.

## Características Implementadas

### 1. Navegación Móvil
- **Hamburger Menu**: En móviles (< 1024px), el menú lateral se muestra mediante un botón hamburguesa
- **Sidebar Colapsible**: El sidebar se puede abrir/cerrar con animación suave
- **Overlay**: Fondo oscuro semitransparente cuando el sidebar está abierto en móvil
- **Auto-cierre**: El sidebar se cierra automáticamente al seleccionar una opción

**Archivos modificados:**
- `MainLayout.jsx`: Manejo de estado del sidebar y botón hamburguesa
- `VerticalNavbar.jsx`: Sidebar responsive con transiciones CSS

### 2. Layout Responsive

#### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1280px

#### Grid System
- Facturación usa grid responsive: `gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))'`
- Configuración usa Grid de Mantine: `span={{ base: 12, md: 8 }}`

### 3. Componentes Responsive

#### Containers y Padding
```jsx
// Antes
<Container size="100%" px="xl" />

// Ahora
<Container size="100%" px={{ base: "sm", sm: "md", lg: "xl" }} />
```

#### Tablas
- Todas las tablas tienen `overflowX: 'auto'` para scroll horizontal en móvil
- Se mantiene legibilidad sin comprometer funcionalidad

#### Modales
- `FacturaPrintPreviewModal`: Usa `fullScreen` en móvil
- Padding responsive: `clamp(8px, 2vw, 20px)`
- Botones con tamaño `size="sm"` en móvil
- Font-size ajustable: `clamp(0.75rem, 1.5vw, 1rem)`

#### Formularios
- Inputs con `font-size: 16px !important` para evitar zoom en iOS
- Grid responsive en ConfiguracionIPSTab

### 4. Tipografía Responsive

```css
h1: clamp(1.5rem, 5vw, 2rem)
h2: clamp(1.25rem, 4vw, 1.75rem)
h3: clamp(1.1rem, 3.5vw, 1.5rem)
```

### 5. Estilos CSS Globales

**Archivo**: `src/styles/globals.css`

#### Media Queries Principales

```css
/* Móvil (< 768px) */
@media (max-width: 768px) {
  - Tablas con scroll horizontal
  - Modales ocupan 95vh
  - Textos con clamp()
  - Inputs con tamaño fijo (evita zoom iOS)
}

/* Tablet (769px - 1024px) */
@media (min-width: 769px) and (max-width: 1024px) {
  - Padding ajustado en contenedores
}

/* Landscape en móvil */
@media (max-width: 768px) and (orientation: landscape) {
  - Headers con padding reducido
}
```

### 6. Meta Tags

**Archivo**: `index.html`

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

### 7. PWA Configuration

**Archivo**: `vite.config.js`

```javascript
manifest: {
  display: 'standalone',
  orientation: 'portrait',
  // ... otros ajustes PWA
}
```

## Componentes Principales Actualizados

### Páginas
- ✅ `MainLayout.jsx` - Layout principal con sidebar responsive
- ✅ `DashboardPage.jsx` - Padding responsive
- ✅ `FacturacionPage.jsx` - Grid responsive, containers adaptables
- ✅ `ConfiguracionPage.jsx` - Container responsive
- ✅ `LoginPage.jsx` - Padding responsive en Paper

### Componentes UI
- ✅ `VerticalNavbar.jsx` - Sidebar colapsible con animaciones
- ✅ `FacturaPrintPreviewModal.jsx` - Modal fullscreen en móvil
- ✅ `CitasTable.jsx` - Scroll horizontal
- ✅ `FacturasTable.jsx` - Scroll horizontal
- ✅ `ConfiguracionIPSTab.jsx` - Grid system responsive

## Testing

### Dispositivos Recomendados para Pruebas
1. **iPhone SE (375px)** - Móvil pequeño
2. **iPhone 12 Pro (390px)** - Móvil estándar
3. **iPad (768px)** - Tablet
4. **iPad Pro (1024px)** - Tablet grande
5. **Desktop (1280px+)** - Desktop estándar

### Chrome DevTools
1. Abrir DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Seleccionar dispositivo o ingresar dimensiones personalizadas
4. Probar orientaciones: portrait y landscape

### Checklist de Pruebas
- [ ] Sidebar se oculta en móvil y se muestra con botón hamburguesa
- [ ] Overlay aparece cuando sidebar está abierto en móvil
- [ ] Sidebar se cierra al hacer clic en overlay o en un link
- [ ] Tablas tienen scroll horizontal en móvil
- [ ] Modales ocupan la pantalla completa en móvil
- [ ] Textos son legibles en todos los tamaños
- [ ] Inputs no causan zoom en iOS
- [ ] Botones tienen tamaño adecuado (mínimo 44x44px)
- [ ] Spacing es apropiado en todos los breakpoints
- [ ] Impresión funciona correctamente

## Mejoras Futuras Sugeridas

1. **Touch Gestures**: Swipe para abrir/cerrar sidebar
2. **Orientación**: Mensaje cuando se usa landscape en móvil
3. **Cards**: Convertir algunas tablas a cards en móvil
4. **Lazy Loading**: Cargar imágenes y componentes bajo demanda
5. **Virtual Scrolling**: Para listas muy largas
6. **Skeleton Screens**: Placeholders mientras carga contenido
7. **Bottom Navigation**: Menú inferior alternativo en móvil

## Recursos

- [Mantine Responsive Styles](https://mantine.dev/styles/responsive/)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN - Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [CSS Tricks - Media Queries](https://css-tricks.com/a-complete-guide-to-css-media-queries/)

## Notas de Implementación

### Decisiones de Diseño
1. **Sidebar Fixed en Desktop**: Siempre visible para acceso rápido
2. **Sidebar Overlay en Móvil**: No ocupa espacio cuando está cerrado
3. **Fullscreen Modals en Móvil**: Mejor uso del espacio limitado
4. **Tables con Scroll**: Mantener estructura sin comprometer datos
5. **Clamp() para Tipografía**: Escalado suave sin media queries

### Performance
- Transiciones CSS (no JavaScript) para mejor rendimiento
- `transform` y `opacity` para animaciones (GPU-accelerated)
- `-webkit-overflow-scrolling: touch` para iOS

### Accesibilidad
- Botones con área táctil mínima de 44x44px
- Contraste de colores mantenido
- Touch targets bien espaciados
- Keyboard navigation funcional

## Mantenimiento

Al agregar nuevas páginas o componentes:

1. Usar `Container` con padding responsive:
   ```jsx
   <Container px={{ base: "sm", sm: "md", lg: "xl" }}>
   ```

2. Usar Grid de Mantine para layouts:
   ```jsx
   <Grid>
     <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
   ```

3. Tablas dentro de `<div style={{ overflowX: 'auto' }}>`

4. Probar en al menos 3 breakpoints: móvil, tablet, desktop

---

**Última actualización**: 2024
**Versión**: 1.0.0
