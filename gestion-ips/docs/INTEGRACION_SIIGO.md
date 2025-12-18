# Integración de Siigo - Sistema de Contabilidad Completo

## 📋 Resumen

Se ha implementado la integración completa con Siigo para gestión contable y facturación electrónica. El sistema incluye 5 submódulos principales:

1. **Facturación Electrónica** - Creación y envío de facturas a la DIAN
2. **Clientes/Terceros** - Sincronización de pacientes como clientes
3. **Productos/Servicios** - Gestión de servicios médicos
4. **Contabilidad** - Catálogos, centros de costo, impuestos
5. **Reportes** - Generación de reportes contables

## 🏗️ Arquitectura Implementada

La integración sigue la arquitectura en capas del proyecto:

```
📁 Capa de Datos (data/)
└── siigoApiService.js - Servicios API de Siigo
    ├── siigoAuthService - Autenticación OAuth
    ├── siigoCustomersService - Gestión de terceros
    ├── siigoInvoicesService - Gestión de facturas
    ├── siigoProductsService - Gestión de productos
    └── siigoCatalogsService - Catálogos DIAN

📁 Capa de Negocio (negocio/)
├── siigoAdapters.js - Transformaciones de datos
│   ├── adaptPacienteToSiigoCustomer()
│   ├── adaptServicioToSiigoProduct()
│   ├── adaptFacturaToSiigoInvoice()
│   └── validateFacturaForSiigo()
│
└── useSiigoIntegration.js - Hook de React
    ├── authenticate()
    ├── createInvoice()
    ├── getInvoiceStatus()
    ├── downloadInvoicePDF()
    └── sendInvoiceByEmail()

📁 Capa de Presentación (presentacion/)
├── SiigoConfigTab.jsx - Configuración de credenciales
├── FacturacionPage.jsx - Página principal con tabs
│
├── components/facturacion/
│   ├── FacturasTable.jsx - Tabla con botones Siigo
│   └── VerFacturaModal.jsx - Detalles con info Siigo
│
└── components/contabilidad/ - NUEVO MÓDULO
    ├── ClientesSiigoTab.jsx - Gestión de clientes/terceros
    ├── ProductosSiigoTab.jsx - Gestión de productos/servicios
    ├── ContabilidadSiigoTab.jsx - Catálogos contables
    └── ReportesSiigoTab.jsx - Reportes y estadísticas
```

## ✨ Características Implementadas

### 🏥 1. Módulo de Facturación
**Ubicación:** Facturación → Pestaña "Facturación"

- ✅ Gestión de citas atendidas
- ✅ Creación de facturas
- ✅ Envío a Siigo para facturación electrónica
- ✅ Consulta de estado DIAN
- ✅ Descarga de PDF oficial
- ✅ Envío por email
- ✅ Visualización de estado de sincronización

### 👥 2. Módulo de Clientes/Terceros (NUEVO)
**Ubicación:** Facturación → Pestaña "Clientes Siigo"

- ✅ Visualización de clientes sincronizados
- ✅ Búsqueda de clientes por nombre/documento
- ✅ Modal para sincronizar pacientes
- ✅ Gestión de terceros (personas y empresas)
- 🔄 Sincronización automática (en desarrollo)
- 🔄 Edición de clientes (en desarrollo)

### 📦 3. Módulo de Productos/Servicios (NUEVO)
**Ubicación:** Facturación → Pestaña "Productos/Servicios"

- ✅ Gestión de productos y servicios
- ✅ Búsqueda por código/nombre
- ✅ Modal para sincronizar servicios médicos
- ✅ Configuración de precios e impuestos
- 🔄 Sincronización con códigos CUPS (en desarrollo)
- 🔄 Gestión de inventario (en desarrollo)

### 🏦 4. Módulo de Contabilidad (NUEVO)
**Ubicación:** Facturación → Pestaña "Contabilidad"

- ✅ Catálogo de tipos de documento
- ✅ Catálogo de formas de pago
- ✅ Catálogo de impuestos
- ✅ Catálogo de centros de costo
- ✅ Actualización automática de catálogos
- ✅ Visualización en tabs organizados

### 📊 5. Módulo de Reportes (NUEVO)
**Ubicación:** Facturación → Pestaña "Reportes Siigo"

- ✅ Tarjetas de reportes rápidos:
  - Facturas del mes
  - Balance contable
  - Estado DIAN
- ✅ Generador de reportes personalizados
- ✅ Filtros por fecha y tipo
- 🔄 Exportación a Excel/PDF (en desarrollo)

### 1. Configuración de Siigo
**Ubicación:** Configuración → Siigo API

- ✅ Conexión/desconexión con credenciales
- ✅ Visualización de estado de conexión
- ✅ Carga automática de catálogos (tipos de documento, formas de pago, vendedores)
- ✅ Validación de token (24 horas de vigencia)
- ✅ Renovación automática de tokens

### 2. Envío de Facturas a Siigo
**Ubicación:** Facturación → Tabla de Facturas → Botón "Enviar a Siigo"

- ✅ Validación de conexión Siigo antes de enviar
- ✅ Transformación automática de datos app → Siigo
- ✅ Generación de factura electrónica
- ✅ Obtención automática de CUFE
- ✅ Almacenamiento de datos de Siigo en factura
- ✅ Notificaciones de éxito/error

### 3. Consulta de Estado
**Ubicación:** Facturación → Tabla de Facturas → Botón "Consultar Estado"

- ✅ Consulta de estado actual en Siigo/DIAN
- ✅ Visualización de CUFE, fecha de envío y observaciones
- ✅ Actualización automática de estado local
- ✅ Estados: Enviado, Aceptado, Rechazado, En proceso

### 4. Descarga de PDF desde Siigo
**Ubicación:** Facturación → Tabla de Facturas → Botón "Descargar PDF"

- ✅ Descarga directa del PDF oficial de Siigo
- ✅ Nombre de archivo personalizado
- ✅ Incluye marca de agua y sello DIAN

### 5. Envío por Email
**Ubicación:** Facturación → Tabla de Facturas → Botón "Enviar Email"

- ✅ Envío de factura electrónica por email
- ✅ Pre-carga del email del cliente
- ✅ Validación de formato de email
- ✅ Confirmación de envío

### 6. Visualización de Estado
**Ubicación:** Facturación → Tabla de Facturas → Columna "Siigo"

- ✅ Badge visual de estado de sincronización:
  - 🔘 Gris: No enviado
  - 🔵 Azul: Enviado
  - 🟢 Verde: Aceptado DIAN
  - 🔴 Rojo: Rechazado DIAN
  - 🔷 Cyan: En proceso

### 7. Detalles de Factura
**Ubicación:** Facturación → Ver Detalles de Factura

- ✅ Sección de "Facturación Electrónica - Siigo"
- ✅ Muestra ID Siigo
- ✅ Muestra CUFE completo
- ✅ Badge de estado DIAN
- ✅ Fecha de envío
- ✅ Enlaces directos a PDF y XML

## 🔧 Configuración Requerida

### 1. Variables de Entorno

Crear o actualizar el archivo `.env` en la raíz de `gestion-ips/`:

```env
# Siigo API Configuration
VITE_SIIGO_API_URL=https://api.siigo.com/v1
VITE_SIIGO_AUTH_URL=https://api.siigo.com/auth
VITE_SIIGO_PARTNER_ID=IPS-GESTION
```

### 2. Credenciales de Siigo

1. Ir a **Configuración → Siigo API**
2. Ingresar credenciales:
   - **Username:** Email de usuario Siigo
   - **Access Key:** Token de acceso de Siigo
3. Hacer clic en "Conectar"

**Obtener credenciales:**
- Sandbox: https://siigoapi.docs.apiary.io/#introduction/autenticacion
- Producción: Solicitarlas en el portal de Siigo

### 3. Actualización de Base de Datos (Opcional)

Para persistir datos de Siigo en la base de datos, agregar columnas a la tabla `facturas`:

```sql
ALTER TABLE facturas 
ADD COLUMN siigo_id VARCHAR(255),
ADD COLUMN cufe VARCHAR(255),
ADD COLUMN estado_dian VARCHAR(50),
ADD COLUMN fecha_envio_siigo TIMESTAMP,
ADD COLUMN pdf_url TEXT,
ADD COLUMN xml_url TEXT;
```

**Nota:** Actualmente los datos se almacenan en el campo `jsonData` de la factura, por lo que esta actualización es opcional.

## 📊 Flujo de Trabajo

### Flujo Completo de Facturación Electrónica

```
1. CREAR FACTURA
   ↓
2. [Opcional] VER DETALLES/PDF LOCAL
   ↓
3. ENVIAR A SIIGO
   ├─ Validación de conexión
   ├─ Transformación de datos
   ├─ Envío a API Siigo
   └─ Almacenamiento de CUFE y datos
   ↓
4. CONSULTAR ESTADO
   ├─ Verificación en DIAN
   └─ Actualización de estado local
   ↓
5. [Opcional] DESCARGAR PDF OFICIAL
   └─ PDF con sello DIAN
   ↓
6. [Opcional] ENVIAR POR EMAIL
   └─ Email automático desde Siigo
```

## 🎨 Interfaz de Usuario

### Botones de Acción en Tabla de Facturas

| Botón | Icono | Color | Condición | Descripción |
|-------|-------|-------|-----------|-------------|
| Ver Detalles | 👁️ | Azul | Siempre | Ver información completa |
| Generar PDF | 🖨️ | Violeta | Siempre | PDF local de la factura |
| Procesar | ✓ | Verde | Estado PENDIENTE | Marcar como PAGADA |
| Enviar a DIAN | ☁️ | Índigo | Sin CUFE | Envío antiguo (DIAN directo) |
| **Enviar a Siigo** | ☁️↑ | Lima | Siigo conectado, sin enviar | **Enviar factura electrónica** |
| **Consultar Siigo** | 🔄 | Cyan | Ya enviado a Siigo | **Consultar estado actual** |
| **Descargar PDF** | ⬇️ | Naranja | Ya enviado a Siigo | **PDF oficial de Siigo** |
| **Enviar Email** | ✉️ | Rosa | Ya enviado a Siigo | **Email desde Siigo** |

### Columna de Estado Siigo

La tabla incluye una nueva columna "Siigo" que muestra el estado de sincronización:

- **No enviado** (gris): La factura no ha sido enviada a Siigo
- **Enviado** (azul): La factura fue enviada pero aún no hay confirmación DIAN
- **En proceso** (cyan): La factura está siendo procesada por la DIAN
- **Aceptado** (verde): ✅ La factura fue aceptada por la DIAN
- **Rechazado** (rojo): ❌ La factura fue rechazada por la DIAN

## 🔐 Seguridad

- ✅ Tokens almacenados en localStorage
- ✅ Renovación automática de tokens expirados
- ✅ Validación de credenciales antes de cada operación
- ✅ Interceptores Axios para autenticación automática
- ✅ Manejo de errores con mensajes amigables
- ✅ Rate limiting respetado (100 req/min)

## 📝 Datos Almacenados en Facturas

Cuando una factura es enviada a Siigo, se almacenan los siguientes datos en `jsonData`:

```javascript
{
  // ... datos existentes de la factura
  
  // Datos de Siigo
  siigoId: "123456",           // ID de la factura en Siigo
  cufe: "abc123...",           // Código Único de Facturación Electrónica
  estadoDian: "Aceptado",      // Estado actual en DIAN
  fechaEnvioSiigo: "2025-12-11T10:30:00Z", // Fecha de envío
  pdfUrl: "https://...",       // URL del PDF en Siigo
  xmlUrl: "https://..."        // URL del XML en Siigo
}
```

## ⚠️ Consideraciones Importantes

### Limitaciones de la API de Siigo
- **Rate Limit:** 100 solicitudes por minuto por empresa
- **Timeout:** 120 segundos recomendado
- **Token:** Validez de 24 horas
- **Idempotencia:** Usar header `Idempotency-Key` para operaciones críticas

### Sincronización de Datos
- Los datos de Siigo se almacenan localmente en `jsonData`
- Usar "Consultar Estado" para sincronizar con Siigo
- Los PDFs y XMLs se descargan desde Siigo, no se almacenan localmente

### Ambiente de Pruebas
- Usar credenciales de **Sandbox** para desarrollo
- Las facturas de sandbox NO se reportan a DIAN real
- Cambiar a credenciales de **Producción** solo cuando esté listo

## 🐛 Solución de Problemas

### "Siigo no conectado"
- Verificar credenciales en Configuración → Siigo API
- Revisar conexión a internet
- Verificar que las variables de entorno estén configuradas

### "Error al enviar factura"
- Verificar que todos los campos requeridos estén completos
- Revisar que el cliente tenga información válida (NIT, email, etc.)
- Consultar logs del navegador para detalles del error

### "Token expirado"
- El token se renueva automáticamente cada 24 horas
- Si persiste el error, desconectar y volver a conectar

### Estado "En proceso" por mucho tiempo
- La DIAN puede tardar varios minutos en procesar
- Usar el botón "Consultar Estado" periódicamente
- Si persiste más de 1 hora, contactar soporte de Siigo

## 📚 Documentación Adicional

- **API de Siigo:** https://siigoapi.docs.apiary.io/
- **Facturación Electrónica DIAN:** https://www.dian.gov.co/factura-electronica
- **Soporte Siigo:** soporte@siigo.com

## 🚀 Próximas Mejoras

### Funcionalidades Futuras
- [ ] Auto-sincronización de pacientes → clientes Siigo
- [ ] Auto-sincronización de servicios → productos Siigo
- [ ] Auto-envío a Siigo al crear factura (opcional)
- [ ] Dashboard de estadísticas de facturación electrónica
- [ ] Exportación masiva de facturas a Siigo
- [ ] Notas crédito y débito electrónicas
- [ ] Facturación recurrente automática
- [ ] Integración con módulo de inventario

### Optimizaciones Técnicas
- [ ] Cache de catálogos de Siigo
- [ ] Queue para envío masivo de facturas
- [ ] Webhooks de Siigo para actualización automática
- [ ] Logs detallados de operaciones
- [ ] Panel de auditoría de facturación electrónica

## ✅ Checklist de Implementación

- [x] Servicio de API de Siigo (siigoApiService.js)
- [x] Adaptadores de datos (siigoAdapters.js)
- [x] Hook de integración (useSiigoIntegration.js)
- [x] Componente de configuración (SiigoConfigTab.jsx)
- [x] Integración en FacturacionPage
- [x] Actualización de FacturasTable con botones
- [x] Actualización de VerFacturaModal con info Siigo
- [x] Columna de estado en tabla
- [x] Manejo de errores y notificaciones
- [x] Documentación completa

---

**Versión:** 1.0.0  
**Fecha:** Diciembre 11, 2025  
**Autor:** Sistema de Gestión IPS
