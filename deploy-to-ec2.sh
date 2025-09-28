#!/bin/bash

# Script completo de despliegue para microservicios en EC2
# Configuracióecho "📦 Copiando JARs a ~/jars..."
execute_remote "mkdir -p ~/jars"
execute_remote "cp $PROJECT_DIR/gestions/target/gestions-*.jar ~/jars/ 2>/dev/null || echo 'JAR de gestions no encontrado'"
execute_remote "cp $PROJECT_DIR/gateway/target/gateway-*.jar ~/jars/ 2>/dev/null || echo 'JAR de gateway no encontrado'"
execute_remote "cp $PROJECT_DIR/pacientes/target/pacientes-*.jar ~/jars/ 2>/dev/null || echo 'JAR de pacientes no encontrado'"

echo "📋 Copiando scripts..."
execute_remote "cp $PROJECT_DIR/run-services-ec2.sh ~/ 2>/dev/null || echo 'Script run-services-ec2.sh no encontrado'"
execute_remote "cp $PROJECT_DIR/restart-services.sh ~/ 2>/dev/null || echo 'Script restart-services.sh no encontrado'"
execute_remote "chmod +x ~/run-services-ec2.sh ~/restart-services.sh"a la instancia del usuario

set -e  # Salir si hay error

# Configuración
EC2_HOST="18.221.174.82"
EC2_USER="ubuntu"
KEY_FILE="jf1101178610.pem"
PROJECT_DIR="gestions"

echo "🚀 Iniciando despliegue de microservicios a EC2..."
echo "📍 Host: $EC2_HOST"
echo "👤 Usuario: $EC2_USER"
echo "🔑 Clave: $KEY_FILE"
echo "📁 Proyecto: $PROJECT_DIR"
echo ""

# Verificar que existe el archivo de clave
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Error: No se encuentra el archivo $KEY_FILE"
    echo "Asegúrate de que el archivo .pem esté en el directorio actual"
    exit 1
fi

# Ajustar permisos de la clave
chmod 400 "$KEY_FILE"
echo "✅ Permisos de clave ajustados"

# Función para ejecutar comandos remotos
execute_remote() {
    echo "🔧 Ejecutando: $1"
    ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=30 "$EC2_USER@$EC2_HOST" "$1"
}

# Verificar conexión SSH
echo "🔍 Verificando conexión SSH..."
if ! ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$EC2_USER@$EC2_HOST" "echo 'Conexión exitosa'" 2>/dev/null; then
    echo "❌ Error: No se puede conectar a $EC2_HOST"
    echo "Verifica que la instancia esté corriendo y el Security Group permita SSH"
    exit 1
fi
echo "✅ Conexión SSH verificada"

# Construir JARs localmente
echo ""
echo "🔨 Construyendo JARs localmente..."
echo "📦 Construyendo gestions..."
cd gestions && mvn clean package -DskipTests -q && cd ..
echo "📦 Construyendo gateway..."
cd gateway && mvn clean package -DskipTests -q && cd ..
echo "📦 Construyendo pacientes..."
cd pacientes && mvn clean package -DskipTests -q && cd ..
echo "✅ JARs construidos"

# Copiar proyecto
echo ""
echo "📦 Copiando proyecto a EC2..."
if scp -i "$KEY_FILE" -r "./$PROJECT_DIR" "$EC2_USER@$EC2_HOST":~/ 2>/dev/null; then
    echo "✅ Proyecto copiado exitosamente"
else
    echo "❌ Error copiando proyecto"
    exit 1
fi

# Instalar dependencias del sistema
echo ""
echo "� Instalando dependencias del sistema..."
execute_remote "sudo apt update -y"
execute_remote "sudo apt install -y openjdk-17-jdk postgresql postgresql-contrib htop curl"
echo "✅ Dependencias instaladas"

# Verificar instalaciones
echo ""
echo "🔍 Verificando instalaciones..."
JAVA_VERSION=$(execute_remote "java -version" 2>&1 | head -n 1 || echo "Error")
POSTGRES_VERSION=$(execute_remote "psql --version" 2>/dev/null || echo "Error")
echo "Java: $JAVA_VERSION"
echo "PostgreSQL: $POSTGRES_VERSION"

# Desplegar servicios usando script nativo
echo ""
echo "🚀 Desplegando servicios..."

echo "� Copiando JARs a ~/jars..."
execute_remote "mkdir -p ~/jars"
execute_remote "cp $PROJECT_DIR/gestions/target/gestions-*.jar ~/jars/ 2>/dev/null || echo 'JAR de gestions no encontrado'"
execute_remote "cp $PROJECT_DIR/gateway/target/gateway-*.jar ~/jars/ 2>/dev/null || echo 'JAR de gateway no encontrado'"
execute_remote "cp $PROJECT_DIR/pacientes/target/pacientes-*.jar ~/jars/ 2>/dev/null || echo 'JAR de pacientes no encontrado'"

echo "📊 Ejecutando script de servicios..."
execute_remote "chmod +x $PROJECT_DIR/run-services-ec2.sh"
execute_remote "cd $PROJECT_DIR && ./run-services-ec2.sh"

# Verificar despliegue
echo ""
echo "🔍 Verificando despliegue..."
SERVICES=$(execute_remote "ps aux | grep java | grep -v grep | awk '{print \$2, \$11}'" 2>/dev/null || echo "Error obteniendo servicios")
echo "Procesos Java corriendo:"
echo "$SERVICES"

# Monitorear recursos
echo ""
echo "📊 Monitoreo de recursos:"
RESOURCES=$(execute_remote "ps aux --no-headers -o pid,ppid,cmd,%mem,%cpu --sort=-%mem | head -5" 2>/dev/null || echo "Error obteniendo stats")
echo "$RESOURCES"

# Probar servicios
echo ""
echo "🧪 Probando servicios..."
test_service() {
    local service=$1
    local port=$2
    local name=$3
    echo -n "Probando $name ($port): "
    if execute_remote "curl -s -o /dev/null -w '%{http_code}' http://localhost:$port/actuator/health" 2>/dev/null | grep -q "200"; then
        echo "✅ OK"
    else
        echo "⚠️  No responde"
    fi
}

test_service "gateway" "8081" "Gateway"
test_service "gestions" "8080" "Gestions"
test_service "pacientes" "8082" "Pacientes"

# Información final
echo ""
echo "🎉 ¡Despliegue completado!"
echo ""
echo "🌐 URLs de acceso:"
echo "   Gateway:    http://$EC2_HOST:8081"
echo "   Gestions:   http://$EC2_HOST:8080"
echo "   Pacientes:  http://$EC2_HOST:8082"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs:     ssh -i $KEY_FILE $EC2_USER@$EC2_HOST 'tail -f ~/logs/*.log'"
echo "   Reiniciar:   ssh -i $KEY_FILE $EC2_USER@$EC2_HOST './restart-services.sh'"
echo "   Monitorear:  ssh -i $KEY_FILE $EC2_USER@$EC2_HOST 'htop'"
echo "   Ver BD:      ssh -i $KEY_FILE $EC2_USER@$EC2_HOST 'sudo -u postgres psql -d gestions_db -c \"SELECT * FROM usuarios;\"'"
echo ""
echo "⚠️  Recuerda monitorear los costos en AWS Billing"
echo "💡 El nivel gratuito incluye 750 horas de t2.micro por mes"