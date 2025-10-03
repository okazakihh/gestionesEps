#!/bin/bash

# Script de reinicio seguro de servicios
# SOLO reinicia servicios - NO toca bases de datos

set -e

echo "🔄 Reiniciando servicios (sin tocar bases de datos)..."

# Crear directorios necesarios
mkdir -p /home/ubuntu/logs

# Verificar estado de PostgreSQL (solo verificar, no iniciar)
if ! sudo systemctl is-active --quiet postgresql; then
    echo "🐘 PostgreSQL no está corriendo. Inícielo manualmente si es necesario."
    echo "💡 Comando: sudo systemctl start postgresql"
else
    echo "✅ PostgreSQL ya está corriendo"
fi

# Verificar datos existentes antes de reinicio
echo "📊 Verificando datos existentes antes del reinicio..."
GESTIONS_TABLES=$(sudo -u postgres psql -d gestions_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")
PACIENTES_TABLES=$(sudo -u postgres psql -d pacientes_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")
echo "Tablas en gestions_db: $GESTIONS_TABLES"
echo "Tablas en pacientes_db: $PACIENTES_TABLES"

# Detener servicios existentes
echo "🛑 Deteniendo servicios existentes..."
pkill -f "java.*gateway" 2>/dev/null || echo "Gateway no estaba corriendo"
pkill -f "java.*gestions" 2>/dev/null || echo "Gestions no estaba corriendo"
pkill -f "java.*pacientes" 2>/dev/null || echo "Pacientes no estaba corriendo"
sleep 3
echo "✅ Servicios detenidos"

# Ejecutar script de inicio (sin configuración de BD)
echo "🚀 Iniciando servicios..."
./run-services-ec2.sh

echo ""
echo "🎉 Reinicio completado!"
echo "📋 Backup disponible en: ~/backups/*_auto_$TIMESTAMP.sql"
echo "🔍 Revisa los logs para verificar que los datos persistan"