#!/bin/bash

# Script de backup para IPS System
# Realiza backups de bases de datos y archivos importantes

set -e

# Configuración
BACKUP_DIR="/home/ubuntu/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="ips_backup_$TIMESTAMP"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}💾 IPS System - Backup Script${NC}"
    echo ""
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  -h, --help          Mostrar esta ayuda"
    echo "  -d, --database      Backup solo de bases de datos"
    echo "  -f, --files         Backup solo de archivos"
    echo "  -c, --clean         Limpiar backups antiguos (mantener últimos 7)"
    echo "  --restore DB FILE   Restaurar base de datos desde archivo"
    echo ""
    echo "Sin opciones: Backup completo (bases de datos + archivos)"
}

# Función para crear directorio de backup
setup_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        echo -e "${GREEN}✅ Directorio de backup creado: $BACKUP_DIR${NC}"
    fi
}

# Función para backup de bases de datos
backup_databases() {
    echo -e "${BLUE}🐘 Realizando backup de bases de datos...${NC}"

    local backup_file="$BACKUP_DIR/${BACKUP_NAME}_databases.sql"

    # Verificar que PostgreSQL esté ejecutándose
    if ! sudo systemctl is-active --quiet postgresql; then
        echo -e "${RED}❌ PostgreSQL no está ejecutándose${NC}"
        return 1
    fi

    # Crear backup de todas las bases de datos
    echo "Creando backup en: $backup_file"
    sudo -u postgres pg_dumpall > "$backup_file"

    if [ $? -eq 0 ]; then
        # Comprimir el archivo
        gzip "$backup_file"
        local compressed_file="${backup_file}.gz"
        local size=$(du -h "$compressed_file" | cut -f1)

        echo -e "${GREEN}✅ Backup de bases de datos completado: $compressed_file (${size})${NC}"
        return 0
    else
        echo -e "${RED}❌ Error al crear backup de bases de datos${NC}"
        return 1
    fi
}

# Función para backup de archivos
backup_files() {
    echo -e "${BLUE}📁 Realizando backup de archivos...${NC}"

    local backup_file="$BACKUP_DIR/${BACKUP_NAME}_files.tar.gz"
    local dirs_to_backup=(
        "/home/ubuntu/jars"
        "/home/ubuntu/logs"
        "/home/ubuntu/scripts"
    )

    # Verificar que los directorios existen
    local valid_dirs=()
    for dir in "${dirs_to_backup[@]}"; do
        if [ -d "$dir" ]; then
            valid_dirs+=("$dir")
        fi
    done

    if [ ${#valid_dirs[@]} -eq 0 ]; then
        echo -e "${YELLOW}⚠️  No se encontraron directorios para backup${NC}"
        return 1
    fi

    # Crear archivo tar.gz
    echo "Creando backup en: $backup_file"
    tar -czf "$backup_file" "${valid_dirs[@]}"

    if [ $? -eq 0 ]; then
        local size=$(du -h "$backup_file" | cut -f1)
        echo -e "${GREEN}✅ Backup de archivos completado: $backup_file (${size})${NC}"
        echo -e "${YELLOW}📋 Directorios incluidos:${NC}"
        for dir in "${valid_dirs[@]}"; do
            echo -e "   - $dir"
        done
        return 0
    else
        echo -e "${RED}❌ Error al crear backup de archivos${NC}"
        return 1
    fi
}

# Función para limpiar backups antiguos
clean_old_backups() {
    echo -e "${BLUE}🧹 Limpiando backups antiguos...${NC}"

    # Mantener solo los últimos 7 backups
    local keep_count=7

    # Listar archivos de backup ordenados por fecha (más antiguos primero)
    local backup_files=($(ls -t "$BACKUP_DIR"/ips_backup_* 2>/dev/null))

    if [ ${#backup_files[@]} -le $keep_count ]; then
        echo -e "${GREEN}✅ No hay backups antiguos para limpiar (total: ${#backup_files[@]})${NC}"
        return 0
    fi

    local to_delete=$(( ${#backup_files[@]} - $keep_count ))
    echo "Eliminando $to_delete backups antiguos (manteniendo $keep_count más recientes)..."

    for ((i = $keep_count; i < ${#backup_files[@]}; i++)); do
        echo -e "${YELLOW}   Eliminando: ${backup_files[$i]}${NC}"
        rm -f "${backup_files[$i]}"
    done

    echo -e "${GREEN}✅ Limpieza completada${NC}"
}

# Función para mostrar información de backups
show_backup_info() {
    echo -e "${BLUE}📊 Información de Backups${NC}"
    echo "═══════════════════════════════════════════════"

    if [ ! -d "$BACKUP_DIR" ]; then
        echo -e "${YELLOW}⚠️  Directorio de backup no existe: $BACKUP_DIR${NC}"
        return
    fi

    local total_backups=$(ls "$BACKUP_DIR"/ips_backup_* 2>/dev/null | wc -l)
    local total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0B")

    echo -e "📁 Directorio: $BACKUP_DIR"
    echo -e "📦 Total de backups: $total_backups"
    echo -e "💾 Espacio total usado: $total_size"
    echo ""

    if [ $total_backups -gt 0 ]; then
        echo -e "${YELLOW}📋 Últimos 5 backups:${NC}"
        ls -lt "$BACKUP_DIR"/ips_backup_* 2>/dev/null | head -5 | while read line; do
            local size=$(echo $line | awk '{print $5}')
            local date=$(echo $line | awk '{print $6, $7, $8}')
            local file=$(echo $line | awk '{print $9}')
            echo -e "   $date - $(basename "$file") (${size})"
        done
    fi
}

# Función para restaurar base de datos
restore_database() {
    local db_name=$1
    local backup_file=$2

    if [ -z "$db_name" ] || [ -z "$backup_file" ]; then
        echo -e "${RED}❌ Uso: $0 --restore DB_NAME BACKUP_FILE${NC}"
        return 1
    fi

    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}❌ Archivo de backup no encontrado: $backup_file${NC}"
        return 1
    fi

    echo -e "${YELLOW}⚠️  ATENCIÓN: Esta operación sobrescribirá la base de datos '$db_name'${NC}"
    read -p "¿Está seguro de continuar? (escriba 'yes' para confirmar): " confirm

    if [ "$confirm" != "yes" ]; then
        echo -e "${BLUE}ℹ️  Operación cancelada${NC}"
        return 0
    fi

    echo -e "${BLUE}🔄 Restaurando base de datos '$db_name'...${NC}"

    # Detener servicios que usan la base de datos
    echo "Deteniendo servicios..."
    ./manage-services.sh stop-all 2>/dev/null || true

    # Restaurar base de datos
    echo "Restaurando desde: $backup_file"
    sudo -u postgres psql -d "$db_name" < "$backup_file"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Base de datos '$db_name' restaurada correctamente${NC}"
        echo -e "${YELLOW}💡 Recomendación: Reiniciar servicios manualmente${NC}"
    else
        echo -e "${RED}❌ Error al restaurar la base de datos${NC}"
        return 1
    fi
}

# Función principal
main() {
    local do_database=false
    local do_files=false
    local do_clean=false
    local do_restore=false
    local restore_db=""
    local restore_file=""

    # Parsear argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -d|--database)
                do_database=true
                ;;
            -f|--files)
                do_files=true
                ;;
            -c|--clean)
                do_clean=true
                ;;
            --restore)
                do_restore=true
                restore_db="$2"
                restore_file="$3"
                shift 2
                ;;
            *)
                echo -e "${RED}❌ Opción desconocida: $1${NC}"
                show_help
                exit 1
                ;;
        esac
        shift
    done

    # Configurar directorio de backup
    setup_backup_dir

    # Si no se especificaron opciones específicas, hacer backup completo
    if [ "$do_database" = false ] && [ "$do_files" = false ] && [ "$do_clean" = false ] && [ "$do_restore" = false ]; then
        do_database=true
        do_files=true
    fi

    # Header
    echo -e "${BLUE}💾 IPS System - Backup - $(date)${NC}"
    echo "═══════════════════════════════════════════════"

    # Ejecutar operaciones
    local success_count=0
    local total_operations=0

    if [ "$do_restore" = true ]; then
        restore_database "$restore_db" "$restore_file"
        exit $?
    fi

    if [ "$do_database" = true ]; then
        ((total_operations++))
        if backup_databases; then
            ((success_count++))
        fi
        echo ""
    fi

    if [ "$do_files" = true ]; then
        ((total_operations++))
        if backup_files; then
            ((success_count++))
        fi
        echo ""
    fi

    if [ "$do_clean" = true ]; then
        clean_old_backups
        echo ""
    fi

    # Mostrar información final
    show_backup_info

    # Resumen
    echo ""
    if [ $success_count -eq $total_operations ]; then
        echo -e "${GREEN}✅ Backup completado exitosamente ($success_count/$total_operations operaciones)${NC}"
    else
        echo -e "${RED}❌ Backup completado con errores ($success_count/$total_operations operaciones exitosas)${NC}"
        exit 1
    fi
}

# Ejecutar función principal
main "$@"