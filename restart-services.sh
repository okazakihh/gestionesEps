#!/bin/bash

# Script de reinicio seguro de servicios
# Hace backup automático antes de reiniciar

set -e

echo "🔄 Reiniciando servicios de forma segura..."

# Crear directorios necesarios
mkdir -p /home/ubuntu/logs /home/ubuntu/backups

# Verificar estado de PostgreSQL
if ! sudo systemctl is-active --quiet postgresql; then
    echo "🐘 PostgreSQL no está corriendo, iniciándolo..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    echo "✅ PostgreSQL iniciado"
else
    echo "✅ PostgreSQL ya está corriendo"
fi

# Hacer backup automático
echo "💾 Creando backup automático..."
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="~/backups/auto_backup_$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

# Backup de bases de datos
sudo -u postgres pg_dump gestions_db > ~/backups/gestions_auto_$TIMESTAMP.sql 2>/dev/null || echo "No se pudo hacer backup de gestions_db"
sudo -u postgres pg_dump pacientes_db > ~/backups/pacientes_auto_$TIMESTAMP.sql 2>/dev/null || echo "No se pudo hacer backup de pacientes_db"

echo "✅ Backup creado: ~/backups/*_auto_$TIMESTAMP.sql"

# Verificar datos antes de reinicio
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

# Ejecutar script de inicio
echo "🚀 Iniciando servicios..."
./run-services-ec2.sh

echo ""
echo "🎉 Reinicio completado!"
echo "📋 Backup disponible en: ~/backups/*_auto_$TIMESTAMP.sql"
echo "🔍 Revisa los logs para verificar que los datos persistan"