#!/bin/bash

# Script para diagnosticar configuración de base de datos
# Verifica que las bases de datos estén configuradas correctamente

set -e

echo "🔍 Diagnóstico de Bases de Datos - IPS System"
echo "═══════════════════════════════════════════════"

# Verificar PostgreSQL
echo "🐘 Verificando PostgreSQL..."
if ! sudo systemctl is-active --quiet postgresql; then
    echo "❌ PostgreSQL no está corriendo"
    echo "💡 Inícielo con: sudo systemctl start postgresql"
    exit 1
fi
echo "✅ PostgreSQL está corriendo"

# Verificar bases de datos
echo ""
echo "📊 Verificando bases de datos..."
DATABASES=("gestions_db" "pacientes_db")

for db in "${DATABASES[@]}"; do
    echo "🔍 Verificando $db..."

    # Verificar que la BD existe
    if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$db"; then
        echo "❌ Base de datos $db no existe"
        continue
    fi
    echo "✅ Base de datos $db existe"

    # Contar tablas
    TABLES_COUNT=$(sudo -u postgres psql -d "$db" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")
    echo "📋 Tablas en $db: $TABLES_COUNT"

    # Mostrar algunas tablas si existen
    if [ "$TABLES_COUNT" -gt 0 ]; then
        echo "📋 Tablas encontradas:"
        sudo -u postgres psql -d "$db" -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" | head -10
    fi

    echo ""
done

# Verificar configuración de Spring Boot
echo "🔧 Verificando configuración de Spring Boot..."
echo "📁 Archivos de configuración encontrados:"

find . -name "application*.properties" -o -name "application*.yml" | while read -r file; do
    echo "📄 $file"
    if grep -q "ddl-auto" "$file" 2>/dev/null; then
        echo "   DDL-AUTO: $(grep "ddl-auto" "$file" | head -1)"
    fi
done

echo ""
echo "🔧 Verificando configuración JPA de servicios en ejecución..."
for service in "gestions" "pacientes"; do
    jar_file=$(ls /home/ubuntu/jars/${service}-*.jar 2>/dev/null | head -1)
    if [ -n "$jar_file" ] && pgrep -f "$jar_file" > /dev/null; then
        pid=$(pgrep -f "$jar_file")
        echo "📋 $service (PID: $pid):"
        # Verificar variables de entorno del proceso
        env_vars=$(ps e -p $pid | grep -o "SPRING_JPA_HIBERNATE_DDL_AUTO=[^ ]*" || echo "")
        if [ -n "$env_vars" ]; then
            echo "   Variables de entorno: $env_vars"
        else
            echo "   Usando configuración de application.properties"
        fi
    fi
done

echo ""
echo "⚠️  IMPORTANTE: Si las bases de datos se están eliminando, verifica:"
echo "   1. Que no estés usando --spring.jpa.hibernate.ddl-auto=create-drop"
echo "   2. Que no tengas SPRING_JPA_HIBERNATE_DDL_AUTO=create-drop en variables de entorno"
echo "   3. Que los servicios se estén ejecutando con el perfil correcto (dev/prod)"
echo "   4. Que no haya argumentos --spring.jpa.hibernate.ddl-auto en la línea de comandos"
echo ""
echo "💡 Configuración actual recomendada: spring.jpa.hibernate.ddl-auto=update"
echo "💡 Esto PRESERVA los datos existentes y solo actualiza el esquema"
echo ""
echo "🔍 Para verificar procesos en detalle:"
echo "   ps aux | grep java"
echo "   cat /proc/<PID>/environ | tr '\\0' '\\n' | grep DDL"