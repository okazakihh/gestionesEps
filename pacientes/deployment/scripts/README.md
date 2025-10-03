# 🚀 Gestión Avanzada de Servicios - IPS System

Scripts para gestionar los servicios Java (Gateway, Gestions, Pacientes) en el servidor EC2.

## 📋 Scripts Disponibles

### 1. `quick-start.sh` - Menú Interactivo (Recomendado)

Script con menú interactivo para operaciones comunes. **Ideal para uso diario**.

```bash
# Ejecutar menú interactivo
./quick-start.sh

# Opciones disponibles:
# 1) 🔄 Reiniciar todos los servicios
# 2) ✅ Ver estado de servicios
# 3) 🛑 Detener todos los servicios
# 4) 🚀 Iniciar todos los servicios
# 5) 🔄 Reiniciar Gateway
# 6) 🔄 Reiniciar Gestions
# 7) 🔄 Reiniciar Pacientes
# 8-10) 📋 Ver logs de servicios
# 11) 🐳 Configurar base de datos
```

### 2. `manage-services.sh` - Script Principal de Gestión

Script avanzado que permite controlar servicios individualmente o todos juntos.

#### 🚀 Instalación y Configuración

```bash
# Hacer ejecutable el script (solo en Linux/Mac)
chmod +x manage-services.sh

# Copiar a una ubicación conveniente (opcional)
sudo cp manage-services.sh /usr/local/bin/manage-services
```

#### 📖 Uso Básico

```bash
# Mostrar ayuda
./manage-services.sh help

# Ver estado de todos los servicios
./manage-services.sh status

# Configurar base de datos (primera vez)
./manage-services.sh setup-db
```

#### 🎯 Comandos Disponibles

##### Gestión Individual de Servicios
```bash
# Iniciar servicios individuales
./manage-services.sh start gateway
./manage-services.sh start gestions
./manage-services.sh start pacientes

# Detener servicios individuales
./manage-services.sh stop gateway
./manage-services.sh stop gestions
./manage-services.sh stop pacientes

# Reiniciar servicios individuales
./manage-services.sh restart gateway
./manage-services.sh restart gestions
./manage-services.sh restart pacientes
```

##### Gestión Masiva de Servicios
```bash
# Iniciar todos los servicios
./manage-services.sh start-all

# Detener todos los servicios
./manage-services.sh stop-all

# Reiniciar todos los servicios
./manage-services.sh restart-all
```

##### Monitoreo y Logs
```bash
# Ver estado detallado
./manage-services.sh status

# Ver logs de un servicio
./manage-services.sh logs gateway
./manage-services.sh logs gestions
./manage-services.sh logs pacientes
```

#### 📊 Servicios y Puertos

| Servicio  | Puerto | Base de Datos    | JAR Pattern          |
|-----------|--------|------------------|---------------------|
| Gateway   | 8081   | N/A             | gateway-*.jar      |
| Gestions  | 8080   | gestions_db     | gestions-*.jar     |
| Pacientes | 8082   | pacientes_db    | pacientes-*.jar    |

#### 📁 Estructura Esperada en el Servidor

```
/home/ubuntu/
├── jars/                    # JARs de los servicios
│   ├── gateway-1.0.0.jar
│   ├── gestions-1.0.0.jar
│   └── pacientes-1.0.0.jar
└── logs/                    # Logs de los servicios
    ├── gateway.log
    ├── gestions.log
    └── pacientes.log
```

### 2. `run-services-ec2.sh` - Script Legacy

Script original para despliegue inicial. **Usar solo para configuración inicial**.

```bash
# Configuración completa inicial (PostgreSQL + servicios)
./run-services-ec2.sh
```

## 🔧 Solución de Problemas

### Servicio no inicia
```bash
# Ver logs específicos
./manage-services.sh logs [servicio]

# Verificar que el JAR existe
ls -la /home/ubuntu/jars/

# Verificar procesos Java
ps aux | grep java
```

### Base de datos no disponible
```bash
# Verificar estado de PostgreSQL
sudo systemctl status postgresql

# Verificar bases de datos
sudo -u postgres psql -l

# Recrear bases de datos
./manage-services.sh setup-db
```

### Puertos ocupados
```bash
# Ver qué procesos usan los puertos
sudo netstat -tulpn | grep :808

# Matar procesos conflictivos
sudo fuser -k 8081/tcp  # Gateway
sudo fuser -k 8080/tcp  # Gestions
sudo fuser -k 8082/tcp  # Pacientes
```

## 📋 Comandos Útiles para Monitoreo

```bash
# Ver todos los procesos Java
ps aux | grep java

# Ver uso de memoria
free -h

# Ver uso de disco
df -h

# Ver logs en tiempo real
tail -f /home/ubuntu/logs/*.log

# Ver conexiones de red
sudo netstat -tulpn
```

## 🎯 Flujos de Trabajo Recomendados

### Despliegue Inicial
```bash
# 1. Configurar base de datos
./manage-services.sh setup-db

# 2. Iniciar todos los servicios
./manage-services.sh start-all

# 3. Verificar estado
./manage-services.sh status
```

### Actualización de Servicio
```bash
# 1. Detener servicio específico
./manage-services.sh stop pacientes

# 2. Actualizar JAR (copiar nuevo JAR)
cp pacientes-1.0.1.jar /home/ubuntu/jars/

# 3. Reiniciar servicio
./manage-services.sh restart pacientes

# 4. Verificar logs
./manage-services.sh logs pacientes
```

### Mantenimiento Programado
```bash
# Reiniciar todos los servicios (mínimo downtime)
./manage-services.sh restart-all

# Verificar que todo esté funcionando
./manage-services.sh status
```

## ⚠️ Notas Importantes

- **Backup**: Siempre hacer backup de bases de datos antes de reinicios
- **Orden**: Iniciar servicios en orden: Gateway → Gestions → Pacientes
- **Monitoreo**: Usar `status` y `logs` para verificar estado
- **Permisos**: Ejecutar con usuario que tenga acceso a `/home/ubuntu/`

## 🆘 Contacto

Para problemas específicos, revisar logs y usar los comandos de diagnóstico antes de reportar.