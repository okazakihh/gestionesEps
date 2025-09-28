#!/bin/bash

# Script para ejecutar servicios JAR en EC2
# Ejecutar en el servidor EC2

set -e

echo "🐳 Configurando PostgreSQL..."

# Instalar PostgreSQL si no está instalado
if ! command -v psql &> /dev/null; then
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
fi

# Iniciar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear bases de datos
sudo -u postgres psql -c "CREATE DATABASE IF NOT EXISTS gestions_db;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE IF NOT EXISTS pacientes_db;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER IF NOT EXISTS postgres WITH PASSWORD 'postgres';" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gestions_db TO postgres;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pacientes_db TO postgres;" 2>/dev/null || true

echo "✅ PostgreSQL configurado"

# Verificar datos existentes en las bases de datos
echo "📊 Verificando datos existentes..."
GESTIONS_COUNT=$(sudo -u postgres psql -d gestions_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")
PACIENTES_COUNT=$(sudo -u postgres psql -d pacientes_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")
echo "Tablas en gestions_db: $GESTIONS_COUNT"
echo "Tablas en pacientes_db: $PACIENTES_COUNT"

# Función para ejecutar servicio
run_service() {
    local service=$1
    local port=$2
    local db=$3
    local jar_file=$(ls /home/ubuntu/jars/${service}-*.jar 2>/dev/null | head -1)

    if [ -z "$jar_file" ]; then
        echo "❌ No se encontró JAR para $service en /home/ubuntu/jars/"
        return 1
    fi

    echo "🚀 Ejecutando $service en puerto $port con JAR: $jar_file"

    # Configurar variables de entorno según el servicio
    case $service in
        "gateway")
            export JAVA_OPTS="-Xmx200m -Xms100m"
            nohup java $JAVA_OPTS -jar "$jar_file" > /home/ubuntu/logs/${service}.log 2>&1 &
            ;;
        "gestions")
            export DATABASE_URL="jdbc:postgresql://localhost:5432/${db}"
            export DATABASE_USERNAME="postgres"
            export DATABASE_PASSWORD="postgres"
            export JAVA_OPTS="-Xmx250m -Xms120m"
            nohup java $JAVA_OPTS -jar "$jar_file" > /home/ubuntu/logs/${service}.log 2>&1 &
            ;;
        "pacientes")
            export DB_URL="jdbc:postgresql://localhost:5432/${db}"
            export DB_USERNAME="postgres"
            export DB_PASSWORD="postgres"
            export JAVA_OPTS="-Xmx200m -Xms100m"
            nohup java $JAVA_OPTS -jar "$jar_file" > /home/ubuntu/logs/${service}.log 2>&1 &
            ;;
    esac

    echo "✅ $service iniciado (PID: $!)"
}

# Ejecutar servicios
run_service "gateway" "8081" ""
run_service "gestions" "8080" "gestions_db"
run_service "pacientes" "8082" "pacientes_db"

echo ""
echo "⏳ Esperando 10 segundos para que los servicios inicien..."
sleep 10

echo "📊 Verificando datos después del despliegue..."
GESTIONS_COUNT_AFTER=$(sudo -u postgres psql -d gestions_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")
PACIENTES_COUNT_AFTER=$(sudo -u postgres psql -d pacientes_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")
echo "Tablas en gestions_db después: $GESTIONS_COUNT_AFTER"
echo "Tablas en pacientes_db después: $PACIENTES_COUNT_AFTER"

echo ""
echo "🎉 Servicios desplegados!"
echo ""
echo "📊 Verificar estado:"
echo "ps aux | grep java"
echo "tail -f /home/ubuntu/logs/*.log"
echo ""
echo "🌐 URLs:"
echo "Gateway:  http://localhost:8081"
echo "Gestions: http://localhost:8080"
echo "Pacientes: http://localhost:8082"
echo ""
echo "🛑 Para detener:"
echo "pkill -f 'java.*jar'"