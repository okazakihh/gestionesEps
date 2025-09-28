#!/bin/bash

# Script para subir archivos a EC2 (Linux/Mac)
# Uso: ./upload-to-ec2.sh

set -e

echo "🚀 Subiendo archivos a EC2..."
echo

# Configuración - MODIFICA estos valores
EC2_HOST="18.221.174.82"
KEY_FILE="jf1101178610.pem"

# Verificar que existe el archivo de clave
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ Error: No se encuentra el archivo $KEY_FILE"
    echo "Asegúrate de que esté en el mismo directorio que este script"
    exit 1
fi

echo "✅ Archivo de clave encontrado"
echo "📍 Subiendo a: ubuntu@$EC2_HOST"
echo

# Crear directorios en EC2
echo "📁 Creando estructura de directorios..."
ssh -i "$KEY_FILE" -o StrictHostKeyChecking=no ubuntu@$EC2_HOST "mkdir -p ~/jars ~/scripts ~/logs ~/backups ~/config"

# Subir JARs
echo "📦 Subiendo JARs..."
scp -i "$KEY_FILE" jars/gateway-*.jar ubuntu@$EC2_HOST:~/jars/
scp -i "$KEY_FILE" jars/gestions-*.jar ubuntu@$EC2_HOST:~/jars/
scp -i "$KEY_FILE" jars/pacientes-*.jar ubuntu@$EC2_HOST:~/jars/

# Subir scripts
echo "🔧 Subiendo scripts..."
scp -i "$KEY_FILE" scripts/run-services-ec2.sh ubuntu@$EC2_HOST:~/scripts/
scp -i "$KEY_FILE" scripts/backup.sh ubuntu@$EC2_HOST:~/scripts/
scp -i "$KEY_FILE" scripts/monitor.sh ubuntu@$EC2_HOST:~/scripts/

echo
echo "✅ ¡Subida completada!"
echo
echo "🎯 Para desplegar en EC2:"
echo "ssh -i \"$KEY_FILE\" ubuntu@$EC2_HOST"
echo "cd ~/scripts"
echo "chmod +x *.sh"
echo "./run-services-ec2.sh"
echo
echo "🌐 URLs después del despliegue:"
echo "Gateway:  http://$EC2_HOST:8081"
echo "Gestions: http://$EC2_HOST:8080"
echo "Pacientes: http://$EC2_HOST:8082"
echo
echo "💡 Para reiniciar servicios:"
echo "./run-services-ec2.sh restart"