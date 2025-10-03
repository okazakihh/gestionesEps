#!/bin/bash

# Script avanzado de monitoreo para IPS System
# Incluye monitoreo de CPU, memoria, disco, servicios y bases de datos
# Uso: ./monitor.sh [opciones]

set -e

# Configuración
LOG_DIR="/home/ubuntu/logs"
JAR_DIR="/home/ubuntu/jars"
BACKUP_DIR="/home/ubuntu/backups"
SERVICES=("gateway" "gestions" "pacientes")
PORTS=("8081" "8080" "8082")
DATABASES=("gestions_db" "pacientes_db")

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}📊 IPS System - Monitor Avanzado${NC}"
    echo ""
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  -h, --help          Mostrar esta ayuda"
    echo "  -c, --cpu           Mostrar solo información de CPU"
    echo "  -m, --memory        Mostrar solo información de memoria"
    echo "  -d, --disk          Mostrar solo información de disco"
    echo "  -s, --services      Mostrar solo estado de servicios"
    echo "  -l, --logs          Mostrar solo logs recientes"
    echo "  -w, --watch         Monitoreo continuo (Ctrl+C para salir)"
    echo "  --compact           Output compacto para scripts"
    echo ""
    echo "Sin opciones: Monitoreo completo del sistema"
}

# Función para obtener uso de CPU
get_cpu_info() {
    echo -e "${CYAN}🖥️  Información de CPU:${NC}"

    # CPU general
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    cpu_cores=$(nproc)
    cpu_model=$(lscpu | grep "Model name" | cut -d: -f2 | sed 's/^ *//')

    echo -e "   Modelo: ${cpu_model}"
    echo -e "   Núcleos: ${cpu_cores}"
    echo -e "   Uso total: ${cpu_usage}%"

    # CPU por núcleo (últimos 5 segundos)
    echo -e "   Uso por núcleo (últimos 5s):"
    mpstat -P ALL 1 1 | tail -n +4 | head -n -1 | awk '{printf "     Núcleo %d: %.1f%%\n", $2, 100-$12}' 2>/dev/null || echo -e "     ${YELLOW}mpstat no disponible${NC}"

    # Procesos que más CPU consumen
    echo -e "   Procesos con mayor uso de CPU:"
    ps aux --sort=-%cpu | head -6 | tail -5 | while read line; do
        pid=$(echo $line | awk '{print $2}')
        cpu=$(echo $line | awk '{print $3}')
        command=$(echo $line | awk '{for(i=11;i<=NF;i++) printf "%s ", $i; print ""}' | cut -d' ' -f1-3)
        printf "     PID %-6s CPU %-5s %s\n" "$pid" "${cpu}%" "$command"
    done
}

# Función para obtener información de memoria
get_memory_info() {
    echo -e "${CYAN}🧠 Información de Memoria:${NC}"

    # Memoria del sistema
    mem_info=$(free -h | grep "^Mem:")
    total=$(echo $mem_info | awk '{print $2}')
    used=$(echo $mem_info | awk '{print $3}')
    free=$(echo $mem_info | awk '{print $4}')
    available=$(echo $mem_info | awk '{print $7}')

    # Calcular porcentaje
    used_percent=$(echo "scale=1; $(free | grep "^Mem:" | awk '{print $3}') * 100 / $(free | grep "^Mem:" | awk '{print $2}')" | bc 2>/dev/null || echo "N/A")

    echo -e "   Total: ${total}"
    echo -e "   Usada: ${used} (${used_percent}%)"
    echo -e "   Libre: ${free}"
    echo -e "   Disponible: ${available}"

    # Swap
    swap_info=$(free -h | grep "^Swap:")
    swap_total=$(echo $swap_info | awk '{print $2}')
    swap_used=$(echo $swap_info | awk '{print $3}')

    if [ "$swap_total" != "0B" ]; then
        swap_percent=$(echo "scale=1; $(free | grep "^Swap:" | awk '{print $3}') * 100 / $(free | grep "^Swap:" | awk '{print $2}')" | bc 2>/dev/null || echo "N/A")
        echo -e "   Swap: ${swap_used}/${swap_total} (${swap_percent}%)"
    fi

    # Procesos que más memoria consumen
    echo -e "   Procesos con mayor uso de memoria:"
    ps aux --sort=-%mem | head -6 | tail -5 | while read line; do
        pid=$(echo $line | awk '{print $2}')
        mem=$(echo $line | awk '{print $4}')
        command=$(echo $line | awk '{for(i=11;i<=NF;i++) printf "%s ", $i; print ""}' | cut -d' ' -f1-3)
        printf "     PID %-6s MEM %-5s %s\n" "$pid" "${mem}%" "$command"
    done
}

# Función para obtener información de disco
get_disk_info() {
    echo -e "${CYAN}💾 Información de Disco:${NC}"

    # Disco principal
    disk_info=$(df -h / | tail -1)
    filesystem=$(echo $disk_info | awk '{print $1}')
    size=$(echo $disk_info | awk '{print $2}')
    used=$(echo $disk_info | awk '{print $3}')
    available=$(echo $disk_info | awk '{print $4}')
    use_percent=$(echo $disk_info | awk '{print $5}')

    echo -e "   Sistema: ${filesystem}"
    echo -e "   Tamaño: ${size}"
    echo -e "   Usado: ${used} (${use_percent})"
    echo -e "   Disponible: ${available}"

    # I/O de disco (si iotop está disponible)
    if command -v iotop &> /dev/null; then
        echo -e "   I/O de disco (últimos 5s):"
        timeout 5 iotop -b -n 1 | head -10 | tail -5 | sed 's/^/     /' 2>/dev/null || echo -e "     ${YELLOW}No se pudo medir I/O${NC}"
    fi

    # Espacio por directorios importantes
    echo -e "   Espacio por directorios:"
    for dir in "$LOG_DIR" "$JAR_DIR" "$BACKUP_DIR"; do
        if [ -d "$dir" ]; then
            size=$(du -sh "$dir" 2>/dev/null | awk '{print $1}' || echo "N/A")
            echo -e "     $(basename "$dir"): ${size}"
        fi
    done
}

# Función para verificar servicios
get_services_info() {
    echo -e "${CYAN}🔧 Estado de Servicios:${NC}"

    for i in "${!SERVICES[@]}"; do
        service=${SERVICES[$i]}
        port=${PORTS[$i]}

        # Verificar si el JAR existe
        jar_file=$(ls ${JAR_DIR}/${service}-*.jar 2>/dev/null | head -1)
        if [ -z "$jar_file" ]; then
            echo -e "   ${RED}❌ $service${NC} - JAR no encontrado"
            continue
        fi

        # Verificar si está ejecutándose
        if pgrep -f "$jar_file" > /dev/null; then
            pid=$(pgrep -f "$jar_file")
            # Obtener uso de CPU y memoria del proceso
            cpu_mem=$(ps -p $pid -o %cpu,%mem --no-headers 2>/dev/null || echo "N/A N/A")
            cpu=$(echo $cpu_mem | awk '{print $1}')
            mem=$(echo $cpu_mem | awk '{print $2}')

            echo -e "   ${GREEN}✅ $service${NC} - Ejecutándose (PID: $pid, Puerto: $port)"
            echo -e "      CPU: ${cpu}%, Memoria: ${mem}%"
        else
            echo -e "   ${RED}❌ $service${NC} - Detenido (Puerto: $port)"
        fi
    done

    # Verificar PostgreSQL
    echo -e "   ${CYAN}🐘 PostgreSQL:${NC}"
    if sudo systemctl is-active --quiet postgresql 2>/dev/null; then
        echo -e "      ${GREEN}✅ Servicio activo${NC}"

        # Conexiones por base de datos
        for db in "${DATABASES[@]}"; do
            connections=$(sudo -u postgres psql -d $db -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null || echo "N/A")
            echo -e "      📊 $db: $connections conexiones"
        done
    else
        echo -e "      ${RED}❌ Servicio inactivo${NC}"
    fi
}

# Función para mostrar logs recientes
get_logs_info() {
    echo -e "${CYAN}📝 Logs Recientes:${NC}"

    for service in "${SERVICES[@]}"; do
        log_file="${LOG_DIR}/${service}.log"
        if [ -f "$log_file" ]; then
            echo -e "   ${BLUE}🔍 $service (${YELLOW}últimas 3 líneas${BLUE}):${NC}"
            tail -3 "$log_file" | sed 's/^/      /' 2>/dev/null || echo -e "      ${YELLOW}No se pudo leer el log${NC}"
            echo ""
        else
            echo -e "   ${YELLOW}⚠️  $service: Log no encontrado${NC}"
        fi
    done
}

# Función para monitoreo continuo
watch_mode() {
    echo -e "${BLUE}👀 Modo de monitoreo continuo (Ctrl+C para salir)${NC}"
    echo -e "${YELLOW}Actualización cada 5 segundos...${NC}"
    echo ""

    while true; do
        clear
        echo -e "${BLUE}📊 IPS System Monitor - $(date)${NC}"
        echo "═══════════════════════════════════════════════"
        get_cpu_info
        echo ""
        get_memory_info
        echo ""
        get_services_info
        echo ""
        sleep 5
    done
}

# Función para output compacto
compact_output() {
    # CPU
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    # Memoria
    mem_info=$(free | grep "^Mem:")
    mem_used_percent=$(echo "scale=1; $(echo $mem_info | awk '{print $3}') * 100 / $(echo $mem_info | awk '{print $2}')" | bc 2>/dev/null || echo "N/A")
    # Disco
    disk_use=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    # Servicios
    services_up=0
    for service in "${SERVICES[@]}"; do
        jar_file=$(ls ${JAR_DIR}/${service}-*.jar 2>/dev/null | head -1)
        if [ -n "$jar_file" ] && pgrep -f "$jar_file" > /dev/null; then
            ((services_up++))
        fi
    done

    echo "CPU:${cpu_usage}% MEM:${mem_used_percent}% DISK:${disk_use}% SERVICES:${services_up}/${#SERVICES[@]}"
}

# Función principal
main() {
    local show_cpu=false
    local show_memory=false
    local show_disk=false
    local show_services=false
    local show_logs=false
    local watch=false
    local compact=false

    # Parsear argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -c|--cpu)
                show_cpu=true
                ;;
            -m|--memory)
                show_memory=true
                ;;
            -d|--disk)
                show_disk=true
                ;;
            -s|--services)
                show_services=true
                ;;
            -l|--logs)
                show_logs=true
                ;;
            -w|--watch)
                watch=true
                ;;
            --compact)
                compact=true
                ;;
            *)
                echo -e "${RED}❌ Opción desconocida: $1${NC}"
                show_help
                exit 1
                ;;
        esac
        shift
    done

    # Modo compacto
    if [ "$compact" = true ]; then
        compact_output
        exit 0
    fi

    # Modo watch
    if [ "$watch" = true ]; then
        watch_mode
        exit 0
    fi

    # Header
    if [ "$show_cpu" = false ] && [ "$show_memory" = false ] && [ "$show_disk" = false ] && [ "$show_services" = false ] && [ "$show_logs" = false ]; then
        echo -e "${BLUE}📊 IPS System - Monitoreo Completo - $(date)${NC}"
        echo "═══════════════════════════════════════════════"
    fi

    # Mostrar información según flags
    local first=true

    if [ "$show_cpu" = true ] || ([ "$show_cpu" = false ] && [ "$show_memory" = false ] && [ "$show_disk" = false ] && [ "$show_services" = false ] && [ "$show_logs" = false ]); then
        [ "$first" = false ] && echo ""
        get_cpu_info
        first=false
    fi

    if [ "$show_memory" = true ] || ([ "$show_cpu" = false ] && [ "$show_memory" = false ] && [ "$show_disk" = false ] && [ "$show_services" = false ] && [ "$show_logs" = false ]); then
        [ "$first" = false ] && echo ""
        get_memory_info
        first=false
    fi

    if [ "$show_disk" = true ] || ([ "$show_cpu" = false ] && [ "$show_memory" = false ] && [ "$show_disk" = false ] && [ "$show_services" = false ] && [ "$show_logs" = false ]); then
        [ "$first" = false ] && echo ""
        get_disk_info
        first=false
    fi

    if [ "$show_services" = true ] || ([ "$show_cpu" = false ] && [ "$show_memory" = false ] && [ "$show_disk" = false ] && [ "$show_services" = false ] && [ "$show_logs" = false ]); then
        [ "$first" = false ] && echo ""
        get_services_info
        first=false
    fi

    if [ "$show_logs" = true ] || ([ "$show_cpu" = false ] && [ "$show_memory" = false ] && [ "$show_disk" = false ] && [ "$show_services" = false ] && [ "$show_logs" = false ]); then
        [ "$first" = false ] && echo ""
        get_logs_info
        first=false
    fi

    # Footer
    if [ "$show_cpu" = false ] && [ "$show_memory" = false ] && [ "$show_disk" = false ] && [ "$show_services" = false ] && [ "$show_logs" = false ]; then
        echo ""
        echo -e "${GREEN}✅ Monitoreo completado - $(date)${NC}"
    fi
}

# Ejecutar función principal
main "$@"