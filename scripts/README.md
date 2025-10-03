# 🚀 Scripts de Gestión - IPS System

Scripts para monitoreo y gestión de servicios del sistema IPS. **Ubicación independiente** de los servicios específicos.

## 📋 Scripts Disponibles

### 1. `backup.sh` - Sistema de Backup

Script completo para backups de bases de datos y archivos del sistema IPS.

#### 🚀 Características:
- ✅ **Backup de Bases de Datos**: PostgreSQL completo con pg_dumpall
- ✅ **Backup de Archivos**: JARs, logs, scripts comprimidos
- ✅ **Compresión**: Archivos gzip para optimizar espacio
- ✅ **Limpieza Automática**: Mantener solo últimos 7 backups
- ✅ **Restauración**: Capacidad de restaurar bases de datos
- ✅ **Informes**: Estado y tamaño de backups existentes

#### 📖 Uso:

```bash
# Backup completo
./backup.sh

# Backup específico
./backup.sh --database    # Solo bases de datos
./backup.sh --files       # Solo archivos

# Limpieza de backups antiguos
./backup.sh --clean

# Restaurar base de datos
./backup.sh --restore gestions_db /path/to/backup.sql
```

#### 📊 Información de Backup:
- **Bases de Datos**: Todas las bases (gestions_db, pacientes_db)
- **Archivos**: `/home/ubuntu/jars/`, `/home/ubuntu/logs/`, `/home/ubuntu/scripts/`
- **Compresión**: Automática con gzip
- **Retención**: Últimos 7 backups automáticos

### 2. `diagnose-services.sh` - Diagnóstico de Servicios

Script de diagnóstico completo para identificar problemas de inicialización de servicios.

#### 🚀 Características:
- ✅ **Verificación de JARs**: Existencia y tamaño de archivos JAR
- ✅ **Verificación de BD**: Estado de PostgreSQL y bases de datos
- ✅ **Verificación de Puertos**: Disponibilidad de puertos de servicios
- ✅ **Análisis de Logs**: Errores recientes en logs de servicios
- ✅ **Conectividad de Red**: Verificación de conectividad local
- ✅ **Recursos del Sistema**: CPU, memoria, disco, procesos
- ✅ **Recomendaciones**: Sugerencias específicas para resolver problemas

#### 📖 Uso:

```bash
# Diagnóstico completo
./scripts/diagnose-services.sh

# El script automáticamente:
# - Verifica todos los componentes
# - Identifica problemas específicos
# - Da recomendaciones de solución
```

#### 📊 Información Diagnosticada:

**📦 JARs de Servicios:**
- Existencia de archivos JAR
- Tamaño de cada JAR
- Ubicación correcta

**🐘 Bases de Datos:**
- Estado de PostgreSQL
- Existencia de bases de datos (gestions_db, pacientes_db)
- Número de tablas por base de datos
- Configuración de usuario postgres

**🌐 Puertos:**
- Disponibilidad de puertos (8080, 8081, 8082)
- Procesos que ocupan puertos

**📝 Logs:**
- Errores recientes en logs
- Últimas entradas problemáticas

**💻 Sistema:**
- Uso de CPU, memoria, disco
- Número de procesos Java activos

### 3. `monitor.sh` - Monitor Avanzado del Sistema

Script completo de monitoreo con información detallada de CPU, memoria, disco, servicios y logs.

#### 🚀 Características:
- ✅ **Monitoreo de CPU**: Uso general, por núcleo, procesos más activos
- ✅ **Monitoreo de Memoria**: RAM, swap, procesos con mayor consumo
- ✅ **Monitoreo de Disco**: Espacio, I/O, directorios importantes
- ✅ **Estado de Servicios**: Java, PostgreSQL, conexiones activas
- ✅ **Logs Recientes**: Últimas líneas de cada servicio
- ✅ **Modo Watch**: Monitoreo continuo en tiempo real
- ✅ **Output Compacto**: Para integración con otros scripts

#### 📖 Uso:

```bash
# Monitoreo completo
./monitor.sh

# Monitoreo específico
./monitor.sh --cpu        # Solo CPU
./monitor.sh --memory     # Solo memoria
./monitor.sh --services   # Solo servicios
./monitor.sh --logs       # Solo logs

# Modo continuo (Ctrl+C para salir)
./monitor.sh --watch

# Output compacto para scripts
./monitor.sh --compact
```

#### 📊 Información Mostrada:

**🖥️ CPU:**
- Modelo y núcleos del procesador
- Uso total de CPU
- Uso por núcleo (últimos 5 segundos)
- Top 5 procesos por uso de CPU

**🧠 Memoria:**
- Memoria total, usada, libre y disponible
- Información de swap
- Top 5 procesos por uso de memoria

**💾 Disco:**
- Sistema de archivos, tamaño, uso
- Espacio por directorios importantes
- I/O de disco (si disponible)

**🔧 Servicios:**
- Estado de servicios Java (PID, CPU, memoria)
- Estado de PostgreSQL
- Número de conexiones activas por base de datos

**📝 Logs:**
- Últimas 3 líneas de cada servicio
- Rutas de archivos de log

### 4. `manage-services.sh` - Gestión Avanzada de Servicios

Script completo para iniciar, detener y gestionar servicios individualmente o en conjunto.

#### 🚀 Características:
- ✅ **Gestión Individual**: start/stop/restart por servicio
- ✅ **Gestión Masiva**: start-all/stop-all/restart-all
- ✅ **Monitoreo**: status, logs por servicio
- ✅ **Configuración**: setup-db para bases de datos
- ✅ **Validación**: Verificación de existencia de JARs
- ✅ **Feedback Visual**: Colores y mensajes informativos
- ✅ **Manejo Seguro**: Timeouts y señales apropiadas

#### 📖 Uso:

```bash
# Gestión individual
./manage-services.sh start pacientes
./manage-services.sh stop gateway
./manage-services.sh restart gestions

# Gestión masiva
./manage-services.sh start-all
./manage-services.sh stop-all
./manage-services.sh restart-all

# Monitoreo
./manage-services.sh status
./manage-services.sh logs pacientes

# Configuración
./manage-services.sh setup-db
```

### 5. `quick-start.sh` - Menú Interactivo

Interfaz de menú simple para operaciones comunes del día a día.

#### 🚀 Características:
- ✅ **Menú Visual**: Opciones numeradas claras
- ✅ **11 Operaciones**: Todas las funciones comunes
- ✅ **Interfaz Amigable**: Navegación intuitiva
- ✅ **Colores**: Feedback visual atractivo

#### 📖 Uso:

```bash
./quick-start.sh
```

**Opciones del Menú:**
1. 🔄 Reiniciar todos los servicios
2. ✅ Ver estado de servicios
3. 🛑 Detener todos los servicios
4. 🚀 Iniciar todos los servicios
5. 🔄 Reiniciar Gateway
6. 🔄 Reiniciar Gestions
7. 🔄 Reiniciar Pacientes
8. 📋 Ver logs de Gateway
9. 📋 Ver logs de Gestions
10. 📋 Ver logs de Pacientes
11. 🐳 Configurar base de datos
0. ❌ Salir

## 🏗️ Arquitectura del Sistema

### Servicios Gestionados:
| Servicio  | Puerto | Base de Datos    | JAR Pattern          |
|-----------|--------|------------------|---------------------|
| Gateway   | 8081   | N/A             | gateway-*.jar      |
| Gestions  | 8080   | gestions_db     | gestions-*.jar     |
| Pacientes | 8082   | pacientes_db    | pacientes-*.jar    |

### Estructura de Directorios Esperada:
```
/home/ubuntu/
├── jars/                    # JARs de los servicios
│   ├── gateway-1.0.0.jar
│   ├── gestions-1.0.0.jar
│   └── pacientes-1.0.0.jar
├── logs/                    # Logs de los servicios
│   ├── gateway.log
│   ├── gestions.log
│   └── pacientes.log
└── backups/                 # Backups (opcional)
```

## 🔧 Instalación y Configuración

### En el Servidor:

```bash
# 1. Copiar scripts al servidor
scp scripts/* ubuntu@tu-servidor:/home/ubuntu/scripts/

# 2. Hacer ejecutables
chmod +x /home/ubuntu/scripts/*.sh

# 3. Crear directorios necesarios
sudo mkdir -p /home/ubuntu/jars /home/ubuntu/logs /home/ubuntu/backups

# 4. Configurar PostgreSQL (primera vez)
./scripts/manage-services.sh setup-db
```

### Verificación:
```bash
# Verificar instalación completa
./scripts/diagnose-services.sh

# Verificaciones específicas
./scripts/monitor.sh --services
./scripts/manage-services.sh status
```

## 📋 Flujos de Trabajo Recomendados

### Inicio del Sistema:
```bash
# Opción 1: Menú interactivo
./scripts/quick-start.sh

# Opción 2: Comando directo
./scripts/manage-services.sh start-all
```

### Monitoreo Continuo:
```bash
# Monitoreo en tiempo real
./scripts/monitor.sh --watch

# Monitoreo compacto para dashboards
./scripts/monitor.sh --compact
```

### Mantenimiento:
```bash
# Backup antes de mantenimiento
./scripts/backup.sh

# Reinicio completo
./scripts/manage-services.sh restart-all

# Actualización de servicio específico
./scripts/manage-services.sh stop pacientes
# Copiar nuevo JAR...
./scripts/manage-services.sh start pacientes
./scripts/manage-services.sh logs pacientes
```

### Diagnóstico:
```bash
# Diagnóstico completo automatizado
./scripts/diagnose-services.sh

# Ver estado completo
./scripts/monitor.sh

# Ver logs específicos
./scripts/manage-services.sh logs pacientes
```

## ⚠️ Notas Importantes

- **Ubicación**: Scripts ubicados fuera de servicios específicos
- **Permisos**: Ejecutar con usuario que tenga acceso a `/home/ubuntu/`
- **PostgreSQL**: Requiere configuración previa con `setup-db`
- **JARs**: Los archivos JAR deben estar en `/home/ubuntu/jars/`
- **Logs**: Se generan automáticamente en `/home/ubuntu/logs/`

## 🆘 Solución de Problemas

### Servicios no inician:
```bash
# Diagnóstico automatizado completo
./scripts/diagnose-services.sh

# Verificaciones específicas
ls -la /home/ubuntu/jars/                    # Verificar JARs
./scripts/manage-services.sh logs [servicio] # Ver logs
./scripts/monitor.sh --services             # Ver estado
```

### Base de datos no disponible:
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Recrear bases de datos
./scripts/manage-services.sh setup-db
```

### Puertos ocupados:
```bash
# Ver procesos en puertos
sudo netstat -tulpn | grep :808

# Liberar puertos
sudo fuser -k 8081/tcp  # Gateway
```

## 📈 Métricas y Monitoreo

### Métricas Disponibles:
- **CPU**: Uso total, por núcleo, procesos top
- **Memoria**: RAM, swap, procesos consumidores
- **Disco**: Espacio, I/O, directorios críticos
- **Servicios**: Estado, PIDs, conexiones DB
- **Logs**: Últimas entradas de cada servicio

### Integración:
```bash
# Output compacto para integración
CPU_USAGE=$(./scripts/monitor.sh --compact | cut -d: -f1)
MEM_USAGE=$(./scripts/monitor.sh --compact | cut -d: -f2)
```

## 🎯 Mejores Prácticas

1. **Backup**: Siempre hacer backup antes de reinicios
2. **Monitoreo**: Usar `monitor.sh --watch` durante despliegues
3. **Logs**: Revisar logs después de cambios
4. **Orden**: Iniciar servicios en orden: Gateway → Gestions → Pacientes
5. **Verificación**: Usar `status` para confirmar estados

---

**Documentación actualizada**: $(date)
**Versión**: 1.0.0