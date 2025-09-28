#!/bin/bash

# Script completo de despliegue para microservicios en EC2
# Estructura organizada: ~/jars, ~/logs, ~/scripts, ~/backups, ~/config

set -e

echo "🚀 Iniciando despliegue de microservicios en EC2..."
echo "📁 Creando estructura de directorios..."

# Crear estructura organizada
JARS_DIR="/home/ubuntu/jars"
mkdir -p "$JARS_DIR" ~/scripts ~/logs ~/backups ~/config

echo "🐳 Verificando PostgreSQL..."

# Instalar PostgreSQL si no está instalado
if ! command -v psql &> /dev/null; then
    echo "📦 Instalando PostgreSQL..."
    sudo apt update -y
    sudo apt install -y postgresql postgresql-contrib htop curl
fi

# Iniciar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear bases de datos separadas (solo si no existen)
echo "📊 Verificando bases de datos..."
sudo -u postgres createdb gestions_db 2>/dev/null || echo "Base gestions_db ya existe"
sudo -u postgres createdb pacientes_db 2>/dev/null || echo "Base pacientes_db ya existe"

# Configurar permisos
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gestions_db TO postgres;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pacientes_db TO postgres;" 2>/dev/null || true

echo "✅ PostgreSQL listo"

# Función para detener servicios existentes
stop_services() {
    echo "🛑 Deteniendo servicios existentes..."
    pkill -f "java.*gateway" 2>/dev/null || echo "Gateway no estaba corriendo"
    pkill -f "java.*gestions" 2>/dev/null || echo "Gestions no estaba corriendo"
    pkill -f "java.*pacientes" 2>/dev/null || echo "Pacientes no estaba corriendo"
    sleep 3
    echo "✅ Servicios detenidos"
}

# Función para ejecutar servicios
run_service() {
    local service=$1
    local port=$2
    local db=$3

    cd "$JARS_DIR"

    echo "🚀 Ejecutando $service en puerto $port..."

    case $service in
        "gateway")
            nohup java -Xmx200m -Xms100m \
                -jar gateway-*.jar \
                > ~/logs/gateway.log 2>&1 &
            ;;
        "gestions")
            export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/${db}"
            export SPRING_DATASOURCE_USERNAME="postgres"
            export SPRING_DATASOURCE_PASSWORD="postgres"
            export SPRING_JPA_HIBERNATE_DDL_AUTO="update"
            nohup java -Xmx250m -Xms120m \
                -jar gestions-*.jar \
                > ~/logs/gestions.log 2>&1 &
            ;;
        "pacientes")
            export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/${db}"
            export SPRING_DATASOURCE_USERNAME="postgres"
            export SPRING_DATASOURCE_PASSWORD="postgres"
            export SPRING_JPA_HIBERNATE_DDL_AUTO="update"
            nohup java -Xmx200m -Xms100m \
                -jar pacientes-*.jar \
                > ~/logs/pacientes.log 2>&1 &
            ;;
    esac

    echo "✅ $service ejecutándose (PID: $!)"
}

# Verificar si se solicita reinicio
if [ "$1" = "restart" ]; then
    stop_services
fi

# Ejecutar servicios en secuencia
run_service "gateway" "8081" ""
sleep 5
run_service "gestions" "8080" "gestions_db"
sleep 5
run_service "pacientes" "8082" "pacientes_db"

echo ""
echo "🎉 ¡Despliegue completado exitosamente!"
echo ""
echo "📁 Estructura creada:"
echo "   $JARS_DIR/     - JARs de los microservicios"
echo "   ~/logs/     - Logs de cada servicio"
echo "   ~/scripts/  - Scripts de automatización"
echo "   ~/backups/  - Backups de bases de datos"
echo "   ~/config/   - Archivos de configuración"
echo ""
echo "🌐 URLs de acceso:"
echo "   Gateway:    http://72.60.127.243:8081"
echo "   Gestions:   http://72.60.127.243:8080"
echo "   Pacientes:  http://72.60.127.243:8082"
echo ""
echo "🔧 Comandos de monitoreo:"
echo "   Ver procesos: ps aux | grep java"
echo "   Ver logs: tail -f ~/logs/*.log"
echo "   Monitoreo: ~/scripts/monitor.sh"
echo "   Reiniciar: ~/scripts/run-services-ec2.sh restart"
echo "   Detener: pkill -f 'java.*jar'"
echo ""
echo "💾 Backup de bases de datos:"
echo "   ~/scripts/backup.sh"
echo ""
echo "⚠️  IMPORTANTE: Monitorea el uso de memoria y CPU"
echo "💡 El nivel gratuito incluye 750 horas de t2.micro por mes"