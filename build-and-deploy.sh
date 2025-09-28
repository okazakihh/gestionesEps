#!/bin/bash

# Script para construir JARs y desplegar a EC2
# Uso: ./build-and-deploy.sh

set -e

# Configuración
EC2_HOST="18.221.174.82"
EC2_USER="ubuntu"
KEY_FILE="jf1101178610.pem"
SERVICES=("gateway" "gestions" "pacientes")

echo "🏗️  Construyendo JARs de microservicios..."

# Construir cada servicio
for service in "${SERVICES[@]}"; do
    echo "📦 Construyendo $service..."
    cd "$service"
    mvn clean package -DskipTests
    cd ..
    echo "✅ $service construido"
done

echo "📤 Subiendo JARs a EC2..."

# Crear directorio en EC2
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "mkdir -p ~/jars"

# Subir JARs
for service in "${SERVICES[@]}"; do
    scp -i "$KEY_FILE" "./$service/target/*.jar" "$EC2_USER@$EC2_HOST":~/jars/
done

echo "✅ JARs subidos exitosamente"
echo ""
echo "🚀 Para ejecutar en EC2:"
echo "ssh -i $KEY_FILE $EC2_USER@$EC2_HOST"
echo "cd ~/jars"
echo "# Ejecutar servicios..."
echo "java -jar gateway-*.jar &"
echo "java -jar gestions-*.jar &"
echo "java -jar pacientes-*.jar &"