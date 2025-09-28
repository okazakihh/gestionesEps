#!/bin/bash

# Script de backup para bases de datos PostgreSQL
# Uso: ./backup.sh

set -e

echo "💾 Iniciando backup de bases de datos..."

# Crear directorio de backups si no existe
mkdir -p ~/backups

# Timestamp para el backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="~/backups/backup_$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

echo "📊 Creando backup de gestions_db..."
sudo -u postgres pg_dump gestions_db > ~/backups/gestions_backup_$TIMESTAMP.sql

echo "📊 Creando backup de pacientes_db..."
sudo -u postgres pg_dump pacientes_db > ~/backups/pacientes_backup_$TIMESTAMP.sql

echo "📁 Creando backup de JARs..."
cp -r ~/jars "$BACKUP_DIR/"

echo "📝 Creando backup de configuración..."
cp -r ~/config "$BACKUP_DIR/" 2>/dev/null || true

# Comprimir el backup
echo "🗜️  Comprimiendo backup..."
cd ~/backups
tar -czf backup_$TIMESTAMP.tar.gz -C ~/backups gestions_backup_$TIMESTAMP.sql pacientes_backup_$TIMESTAMP.sql

echo "✅ Backup completado: ~/backups/backup_$TIMESTAMP.tar.gz"
echo ""
echo "📊 Resumen del backup:"
echo "   - Base de datos Gestions: gestions_backup_$TIMESTAMP.sql"
echo "   - Base de datos Pacientes: pacientes_backup_$TIMESTAMP.sql"
echo "   - JARs: $BACKUP_DIR/jars/"
echo "   - Archivo comprimido: backup_$TIMESTAMP.tar.gz"
echo ""
echo "💡 Para restaurar:"
echo "   sudo -u postgres psql -d gestions_db < ~/backups/gestions_backup_$TIMESTAMP.sql"
echo "   sudo -u postgres psql -d pacientes_db < ~/backups/pacientes_backup_$TIMESTAMP.sql"

# Limpiar backups antiguos (mantener solo los últimos 5)
echo "🧹 Limpiando backups antiguos..."
cd ~/backups
ls -t *.sql | tail -n +6 | xargs -r rm -f
ls -t *.tar.gz | tail -n +6 | xargs -r rm -f

echo "✅ Limpieza completada"