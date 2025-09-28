# 🚀 Despliegue Manual de Microservicios

Paquete completo para desplegar microservicios Spring Boot como JARs nativos en servidor Ubuntu.

## 📁 Estructura del Paquete

```
deployment/
├── jars/                          # 📦 JARs de los microservicios
│   ├── gateway-0.0.1-SNAPSHOT.jar
│   ├── gestions-0.0.1-SNAPSHOT.jar
│   └── pacientes-0.0.1-SNAPSHOT.jar
├── scripts/                       # 🔧 Scripts de automatización
│   ├── run-services-ec2.sh       # Script principal de despliegue
│   ├── restart-services.sh       # Script de reinicio seguro
│   ├── backup.sh                 # Script de backup
│   └── monitor.sh                # Script de monitoreo
├── logs/                         # 📝 Directorio para logs (vacío)
├── backups/                      # 💾 Directorio para backups (vacío)
└── README.md                     # 📖 Este archivo
```

## 🎯 Despliegue Manual

### Paso 1: Subir Archivos al Servidor
Sube la carpeta `deployment` completa a tu servidor Ubuntu usando tu método preferido (FTP, SCP, etc.).

### Paso 2: Organizar Archivos en el Servidor
```bash
# Mover archivos a las ubicaciones correctas
mv ~/deployment/jars/* ~/jars/  # O crea ~/jars si no existe
mv ~/deployment/scripts/* ~/scripts/  # O ~/scripts
mkdir -p ~/logs ~/backups

# Dar permisos de ejecución
chmod +x ~/scripts/*.sh
```

### Paso 3: Ejecutar Servicios
```bash
# Si es la primera vez
cd ~ && ./scripts/run-services-ec2.sh

# Para reiniciar servicios (recomendado)
cd ~ && ./scripts/restart-services.sh
```

### Paso 4: Verificar Despliegue
```bash
# Ver procesos
ps aux | grep java

# Ver logs
tail -f ~/logs/*.log

# Probar servicios
curl http://localhost:8081/actuator/health
curl http://localhost:8080/actuator/health
curl http://localhost:8082/actuator/health
```

## 🔧 Comandos Útiles

```bash
# Ver estado de servicios
ps aux | grep java

# Ver logs en tiempo real
tail -f ~/logs/*.log

# Reiniciar servicios de forma segura
~/scripts/restart-services.sh

# Hacer backup manual
~/scripts/backup.sh

# Monitorear recursos
~/scripts/monitor.sh
```

## ⚠️ Notas Importantes

- **Bases de datos**: Ya están creadas y tienen datos. Los scripts no las sobrescribirán.
- **PostgreSQL**: Asegúrate de que esté corriendo: `sudo systemctl status postgresql`
- **Puertos**: Los servicios usan 8081 (gateway), 8080 (gestions), 8082 (pacientes)
- **Reinicio seguro**: Usa `restart-services.sh` para reiniciar sin perder datos

## 🆘 Solución de Problemas

### Servicios no inician
```bash
# Ver logs detallados
cat ~/logs/*.log

# Verificar Java
java -version

# Verificar PostgreSQL
sudo -u postgres psql -c "SELECT version();"
```

### Bases de datos limpias
Si las bases se limpian al reiniciar, verifica:
1. Que no estés ejecutando comandos manuales que eliminen bases
2. Que PostgreSQL no se esté reiniciando desde cero
3. Revisa los logs de PostgreSQL: `sudo tail -f /var/log/postgresql/postgresql-*.log`

# En EC2
mv ~/deployment/* ~/
chmod +x ~/scripts/*.sh
~/scripts/run-services-ec2.sh
```

### Opción 3: Reinicio de Servicios
```bash
# Reiniciar servicios existentes
~/scripts/run-services-ec2.sh restart

# O detener y volver a iniciar
pkill -f "java.*jar"
~/scripts/run-services-ec2.sh
```

## ✅ Verificación del Despliegue

### Ver servicios corriendo
```bash
ps aux | grep java
# Deberías ver 3 procesos Java
```

### Ver logs
```bash
tail -f ~/logs/gateway.log
tail -f ~/logs/gestions.log
tail -f ~/logs/pacientes.log
```

### Probar APIs
```bash
curl http://localhost:8081/actuator/health
curl http://localhost:8080/actuator/health
curl http://localhost:8082/actuator/health
```

## 🌐 URLs de Acceso

- **Gateway**: `http://18.221.174.82:8081`
- **Gestions**: `http://18.221.174.82:8080`
- **Pacientes**: `http://18.221.174.82:8082`

## 🗄️ Arquitectura de Base de Datos

```
PostgreSQL (localhost:5432)
├── gestions_db    → Servicio Gestions
└── pacientes_db   → Servicio Pacientes
```

## 🔧 Scripts Disponibles

### Despliegue y Subida
```bash
# Scripts de subida (desde tu máquina local)
upload-to-ec2.bat               # Windows
./upload-to-ec2.sh              # Linux/Mac

# Script principal de despliegue (en EC2)
~/scripts/run-services-ec2.sh   # Despliega todos los servicios
~/scripts/run-services-ec2.sh restart  # Reinicia servicios
```

### Mantenimiento
```bash
~/scripts/backup.sh             # Crea backup de BDs
~/scripts/monitor.sh            # Monitorea sistema y servicios
```

### Comandos Útiles
```bash
# Reiniciar servicios
pkill -f "java.*jar"
~/scripts/run-services-ec2.sh

# Ver uso de recursos
htop

# Ver bases de datos
sudo -u postgres psql -c "\l"
```

## 📊 Recursos del Sistema

| Servicio | Memoria | Puerto | Base de Datos |
|----------|---------|--------|---------------|
| Gateway | 200MB | 8081 | No requiere |
| Gestions | 250MB | 8080 | gestions_db |
| Pacientes | 200MB | 250MB | pacientes_db |
| PostgreSQL | 150MB | 5432 | Sistema |
| **Total** | **800MB** | - | 2 bases |

## 💾 Backup y Recuperación

### Crear Backup
```bash
~/scripts/backup.sh
```

### Restaurar Base de Datos
```bash
# Restaurar gestions_db
sudo -u postgres psql -d gestions_db < ~/backups/gestions_backup_YYYYMMDD_HHMMSS.sql

# Restaurar pacientes_db
sudo -u postgres psql -d pacientes_db < ~/backups/pacientes_backup_YYYYMMDD_HHMMSS.sql
```

## 🔍 Monitoreo

### Monitoreo Automático
```bash
~/scripts/monitor.sh
```

### Monitoreo Manual
```bash
# Ver procesos
ps aux | grep java

# Ver logs en tiempo real
tail -f ~/logs/*.log

# Ver conexiones a BD
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Ver uso de memoria
free -h
```

## 🚨 Solución de Problemas

### Servicios no inician
```bash
# Ver logs específicos
tail -50 ~/logs/gateway.log
tail -50 ~/logs/gestions.log
tail -50 ~/logs/pacientes.log

# Verificar Java
java -version

# Verificar PostgreSQL
sudo systemctl status postgresql
```

### Problemas de memoria
```bash
# Verificar uso de memoria
free -h
ps aux --sort=-%mem | head -10

# Reiniciar con menos memoria si es necesario
# Editar ~/scripts/run-services-ec2.sh
```

### Problemas de conectividad
```bash
# Verificar puertos
netstat -tlnp | grep -E ":(8080|8081|8082|5432)"

# Probar conectividad local
curl http://localhost:8081/actuator/health
```

## ⚠️ Consideraciones de Seguridad

- ✅ Cambia la contraseña de PostgreSQL en producción
- ✅ Configura firewall (UFW) para restringir accesos
- ✅ Usa HTTPS en producción
- ✅ Implementa autenticación en APIs
- ✅ Monitorea logs de seguridad

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en `~/logs/`
2. Ejecuta `~/scripts/monitor.sh`
3. Verifica la conectividad de red
4. Revisa la configuración de PostgreSQL

## 🎉 ¡Listo para Producción!

Con este paquete tienes:
- ✅ Microservicios optimizados
- ✅ Base de datos separada por servicio
- ✅ Scripts de automatización
- ✅ Monitoreo y backup
- ✅ Estructura organizada

¡Tu aplicación está lista para desplegarse en AWS EC2!