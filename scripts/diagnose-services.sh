#!/bin/bash

# Script de diagnóstico para servicios IPS System
# Ayuda a identificar problemas de inicialización

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuración
JARS_DIR="/home/ubuntu/jars"
LOGS_DIR="/home/ubuntu/logs"
SERVICES=("gateway" "gestions" "pacientes")
PORTS=("8081" "8080" "8082")
DATABASES=("gestions_db" "pacientes_db")

echo -e "${BLUE}🔍 DIAGNÓSTICO DE SERVICIOS - IPS System${NC}"
echo "═══════════════════════════════════════════════"

# Función para verificar existencia de JARs
check_jars() {
    echo -e "\n${PURPLE}📦 Verificando JARs de servicios:${NC}"

    for service in "${SERVICES[@]}"; do
        jar_file=$(ls ${JARS_DIR}/${service}-*.jar 2>/dev/null | head -1)
        if [ -z "$jar_file" ]; then
            echo -e "   ${RED}❌ $service${NC} - JAR no encontrado en ${JARS_DIR}"
        else
            jar_size=$(du -h "$jar_file" | cut -f1)
            echo -e "   ${GREEN}✅ $service${NC} - JAR encontrado: $(basename "$jar_file") (${jar_size})"
        fi
    done
}

# Función para verificar bases de datos
check_databases() {
    echo -e "\n${PURPLE}🐘 Verificando bases de datos PostgreSQL:${NC}"

    # Verificar si PostgreSQL está ejecutándose
    if ! sudo systemctl is-active --quiet postgresql 2>/dev/null; then
        echo -e "   ${RED}❌ PostgreSQL no está ejecutándose${NC}"
        return 1
    fi

    echo -e "   ${GREEN}✅ PostgreSQL está ejecutándose${NC}"

    # Verificar bases de datos
    for db in "${DATABASES[@]}"; do
        if sudo -u postgres psql -lqt 2>/dev/null | cut -d\| -f1 | grep -qw "$db"; then
            # Contar tablas en la base de datos
            table_count=$(sudo -u postgres psql -d "$db" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")
            echo -e "   ${GREEN}✅ $db${NC} - Existe ($table_count tablas)"
        else
            echo -e "   ${RED}❌ $db${NC} - No existe"
        fi
    done

    # Verificar usuario postgres
    if sudo -u postgres psql -c "SELECT 1;" >/dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Usuario 'postgres' configurado correctamente${NC}"
    else
        echo -e "   ${RED}❌ Problema con usuario 'postgres'${NC}"
    fi
}

# Función para verificar puertos
check_ports() {
    echo -e "\n${PURPLE}🌐 Verificando puertos:${NC}"

    for i in "${!SERVICES[@]}"; do
        service=${SERVICES[$i]}
        port=${PORTS[$i]}

        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            pid=$(lsof -Pi :$port -sTCP:LISTEN -t)
            process_name=$(ps -p $pid -o comm= 2>/dev/null || echo "desconocido")
            echo -e "   ${YELLOW}⚠️  Puerto $port${NC} - En uso por $process_name (PID: $pid)"
        else
            echo -e "   ${GREEN}✅ Puerto $port${NC} - Disponible"
        fi
    done
}

# Función para verificar logs recientes
check_recent_logs() {
    echo -e "\n${PURPLE}📝 Verificando logs recientes de errores:${NC}"

    for service in "${SERVICES[@]}"; do
        log_file="${LOGS_DIR}/${service}.log"
        if [ -f "$log_file" ]; then
            # Buscar errores en las últimas 20 líneas
            errors=$(tail -20 "$log_file" 2>/dev/null | grep -i "error\|exception\|failed" | wc -l)
            if [ "$errors" -gt 0 ]; then
                echo -e "   ${RED}❌ $service${NC} - $errors errores encontrados en log reciente"
                echo -e "      ${YELLOW}Últimos errores:${NC}"
                tail -20 "$log_file" 2>/dev/null | grep -i "error\|exception\|failed" | tail -3 | sed 's/^/         /' || true
            else
                echo -e "   ${GREEN}✅ $service${NC} - Sin errores recientes en log"
            fi
        else
            echo -e "   ${YELLOW}⚠️  $service${NC} - Archivo de log no encontrado: $log_file"
        fi
    done
}

# Función para verificar conectividad de red
check_network() {
    echo -e "\n${PURPLE}🌍 Verificando conectividad de red:${NC}"

    # Verificar conectividad local
    for i in "${!SERVICES[@]}"; do
        service=${SERVICES[$i]}
        port=${PORTS[$i]}

        if timeout 5 bash -c "echo > /dev/tcp/localhost/$port" 2>/dev/null; then
            echo -e "   ${GREEN}✅ localhost:$port${NC} - Conectividad OK"
        else
            echo -e "   ${RED}❌ localhost:$port${NC} - Sin conectividad"
        fi
    done
}

# Función para verificar recursos del sistema
check_system_resources() {
    echo -e "\n${PURPLE}💻 Verificando recursos del sistema:${NC}"

    # CPU
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    echo -e "   CPU: ${cpu_usage}% usado"

    # Memoria
    mem_info=$(free | grep "^Mem:")
    mem_used_percent=$(echo "scale=1; $(echo $mem_info | awk '{print $3}') * 100 / $(echo $mem_info | awk '{print $2}')" | bc 2>/dev/null || echo "N/A")
    echo -e "   Memoria: ${mem_used_percent}% usada"

    # Disco
    disk_use=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    echo -e "   Disco: ${disk_use}% usado"

    # Procesos Java
    java_processes=$(pgrep -f java | wc -l)
    echo -e "   Procesos Java: $java_processes ejecutándose"
}

# Función para dar recomendaciones
give_recommendations() {
    echo -e "\n${PURPLE}💡 RECOMENDACIONES:${NC}"

    # Verificar si faltan JARs
    missing_jars=0
    for service in "${SERVICES[@]}"; do
        jar_file=$(ls ${JARS_DIR}/${service}-*.jar 2>/dev/null | head -1)
        if [ -z "$jar_file" ]; then
            ((missing_jars++))
        fi
    done

    if [ $missing_jars -gt 0 ]; then
        echo -e "   ${RED}❌ Faltan $missing_jars JAR(s) de servicio${NC}"
        echo -e "      ${YELLOW}Solución: Copiar JARs a ${JARS_DIR}${NC}"
    fi

    # Verificar bases de datos
    missing_dbs=0
    for db in "${DATABASES[@]}"; do
        if ! sudo -u postgres psql -lqt 2>/dev/null | cut -d\| -f1 | grep -qw "$db"; then
            ((missing_dbs++))
        fi
    done

    if [ $missing_dbs -gt 0 ]; then
        echo -e "   ${RED}❌ Faltan $missing_dbs base(s) de datos${NC}"
        echo -e "      ${YELLOW}Solución: Ejecutar './scripts/manage-services.sh setup-db'${NC}"
    fi

    # Verificar PostgreSQL
    if ! sudo systemctl is-active --quiet postgresql 2>/dev/null; then
        echo -e "   ${RED}❌ PostgreSQL no está ejecutándose${NC}"
        echo -e "      ${YELLOW}Solución: 'sudo systemctl start postgresql'${NC}"
    fi

    # Si todo parece estar bien
    if [ $missing_jars -eq 0 ] && [ $missing_dbs -eq 0 ] && sudo systemctl is-active --quiet postgresql 2>/dev/null; then
        echo -e "   ${GREEN}✅ Componentes básicos OK${NC}"
        echo -e "      ${YELLOW}Si los servicios no inician, revisar logs detallados${NC}"
        echo -e "      ${YELLOW}Comando: './scripts/manage-services.sh logs [servicio]'${NC}"
    fi
}

# Ejecutar todas las verificaciones
main() {
    check_jars
    check_databases
    check_ports
    check_recent_logs
    check_network
    check_system_resources
    give_recommendations

    echo -e "\n${GREEN}✅ Diagnóstico completado${NC}"
    echo -e "${BLUE}💡 Para iniciar servicios: ./scripts/manage-services.sh start-all${NC}"
    echo -e "${BLUE}💡 Para ver logs: ./scripts/manage-services.sh logs [servicio]${NC}"
}

# Ejecutar función principal
main "$@"