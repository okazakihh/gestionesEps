# Microservicio de Pacientes e Historias Clínicas

Este microservicio maneja la gestión de pacientes y sus historias clínicas electrónicas, cumpliendo con la Resolución 1995 de 1999 del Ministerio de Salud de Colombia.

## Características Principales

### 📋 Gestión de Pacientes
- Registro completo de pacientes con validaciones médicas
- Búsqueda avanzada por documento, nombre, EPS, etc.
- Información demográfica y de contacto
- Contactos de emergencia
- Información de afiliación (EPS, régimen)

### 🏥 Historias Clínicas Electrónicas
- Cumplimiento Resolución 1995 de 1999
- Numeración automática de historias
- Antecedentes médicos completos
- Trazabilidad de cambios
- Respaldo y auditoría

### 👩‍⚕️ Consultas Médicas
- Registro de consultas por especialidad
- Diagnósticos CIE-10
- Planes de tratamiento
- Fórmulas médicas
- Seguimiento de citas

### 📄 Documentos Médicos
- Almacenamiento seguro de documentos
- Soporte para múltiples formatos
- Clasificación por tipo de documento
- Control de versiones
- Descarga segura

## Tecnologías Utilizadas

- **Spring Boot 3.2.1** - Framework principal
- **Spring Data JPA** - Persistencia de datos
- **Spring Security** - Seguridad y autenticación
- **PostgreSQL** - Base de datos principal
- **Apache Tika** - Procesamiento de documentos
- **iText PDF** - Generación de reportes médicos

## Estructura del Proyecto

```
src/main/java/com/gestioneps/pacientes/
├── controller/          # Controladores REST
├── service/            # Lógica de negocio
├── repository/         # Acceso a datos
├── entity/            # Entidades JPA
├── dto/               # Objetos de transferencia
├── config/            # Configuraciones
└── exception/         # Manejo de excepciones
```

## Entidades Principales

### Paciente
- Información personal completa
- Documentos de identificación
- Datos demográficos
- Información de contacto
- Afiliación a EPS
- Contactos de emergencia

### Historia Clínica
- Número único de historia
- Antecedentes médicos
- Información del médico responsable
- Trazabilidad completa

### Consulta Médica
- Motivo de consulta
- Examen físico
- Diagnósticos
- Plan de tratamiento
- Próximas citas

### Documento Médico
- Resultados de laboratorio
- Imágenes diagnósticas
- Fórmulas médicas
- Certificados médicos

## Configuración

### Base de Datos
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/pacientes_db
    username: postgres
    password: password
```

### Almacenamiento de Documentos
```yaml
historias-clinicas:
  storage:
    path: ./storage/historias-clinicas
  documents:
    max-size: 10MB
    allowed-types: pdf,doc,docx,jpg,jpeg,png
```

## API Endpoints

### Pacientes
- `GET /api/pacientes` - Listar pacientes
- `POST /api/pacientes` - Crear paciente
- `GET /api/pacientes/{id}` - Obtener paciente
- `PUT /api/pacientes/{id}` - Actualizar paciente
- `DELETE /api/pacientes/{id}` - Eliminar paciente

### Historias Clínicas
- `GET /api/historias-clinicas` - Listar historias
- `POST /api/historias-clinicas` - Crear historia
- `GET /api/historias-clinicas/{id}` - Obtener historia
- `PUT /api/historias-clinicas/{id}` - Actualizar historia

### Consultas Médicas
- `GET /api/consultas` - Listar consultas
- `POST /api/consultas` - Registrar consulta
- `GET /api/consultas/{id}` - Obtener consulta

### Documentos Médicos
- `GET /api/documentos` - Listar documentos
- `POST /api/documentos` - Subir documento
- `GET /api/documentos/{id}/download` - Descargar documento

## Cumplimiento Normativo

### Resolución 1995 de 1999
- ✅ Historia clínica única por paciente
- ✅ Numeración consecutiva
- ✅ Información mínima requerida
- ✅ Trazabilidad de cambios
- ✅ Conservación de documentos
- ✅ Acceso controlado

### Seguridad
- Autenticación JWT
- Autorización por roles
- Auditoría de accesos
- Encriptación de datos sensibles
- Respaldo automático

## Instalación y Ejecución

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd pacientes
```

2. **Configurar base de datos**
```bash
createdb pacientes_db
```

3. **Ejecutar la aplicación**
```bash
mvn spring-boot:run
```

4. **Acceder a la aplicación**
```
http://localhost:8082/api
```

## Testing

```bash
# Ejecutar tests
mvn test

# Ejecutar tests con cobertura
mvn test jacoco:report
```

## Monitoreo

La aplicación incluye Spring Boot Actuator para monitoreo:
- `/actuator/health` - Estado de salud
- `/actuator/info` - Información de la aplicación
- `/actuator/metrics` - Métricas de rendimiento

## Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.
