#!/bin/bash

# Script avanzado para gestionar servicios JAR en EC2
# Permite iniciar, detener y reiniciar servicios individualmente o todos juntos
# Ejecutar en el servidor EC2

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
JARS_DIR="/home/ubuntu/jars"
LOGS_DIR="/home/ubuntu/logs"
SERVICES=("gateway" "gestions" "pacientes")
PORTS=("8081" "8080" "8082")
DATABASES=("" "gestions_db" "pacientes_db")

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}🚀 Gestión Avanzada de Servicios - IPS System${NC}"
    echo ""
    echo "Uso: $0 [comando] [servicio]"
    echo ""
    echo "Comandos:"
    echo "  start [servicio]     - Iniciar un servicio específico"
    echo "  stop [servicio]      - Detener un servicio específico"
    echo "  restart [servicio]   - Reiniciar un servicio específico"
    echo "  start-all           - Iniciar todos los servicios"
    echo "  stop-all            - Detener todos los servicios"
    echo "  restart-all         - Reiniciar todos los servicios"
    echo "  status              - Mostrar estado de todos los servicios"
    echo "  logs [servicio]      - Ver logs de un servicio"
    echo "  setup-db            - Configurar bases de datos PostgreSQL"
    echo ""
    echo "Servicios disponibles: gateway, gestions, pacientes"
    echo ""
    echo "Ejemplos:"
    echo "  $0 start pacientes     # Iniciar solo pacientes"
    echo "  $0 restart-all         # Reiniciar todos los servicios"
    echo "  $0 status              # Ver estado de servicios"
    echo "  $0 logs gateway        # Ver logs del gateway"
}

# Función para verificar si un servicio está ejecutándose
is_service_running() {
    local service=$1
    local jar_file=$(ls ${JARS_DIR}/${service}-*.jar 2>/dev/null | head -1)

    if [ -z "$jar_file" ]; then
        return 1
    fi

    # Buscar proceso Java con el JAR específico
    if pgrep -f "$jar_file" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Función para obtener PID de un servicio
get_service_pid() {
    local service=$1
    local jar_file=$(ls ${JARS_DIR}/${service}-*.jar 2>/dev/null | head -1)

    if [ -z "$jar_file" ]; then
        echo ""
        return
    fi

    pgrep -f "$jar_file" || echo ""
}

# Función para mostrar estado de servicios
show_status() {
    echo -e "${BLUE}📊 Estado de Servicios${NC}"
    echo "═══════════════════════════════════════════════"

    for i in "${!SERVICES[@]}"; do
        service=${SERVICES[$i]}
        port=${PORTS[$i]}

        if is_service_running "$service"; then
            pid=$(get_service_pid "$service")
            echo -e "${GREEN}✅ $service${NC} - Ejecutándose (PID: $pid, Puerto: $port)"
        else
            echo -e "${RED}❌ $service${NC} - Detenido (Puerto: $port)"
        fi
    done

    echo ""
    echo -e "${YELLOW}💡 Para más detalles: ps aux | grep java${NC}"
}

# Función para configurar base de datos
setup_database() {
    echo -e "${BLUE}🐳 Configurando PostgreSQL...${NC}"

    # Instalar PostgreSQL si no está instalado
    if ! command -v psql &> /dev/null; then
        echo "Instalando PostgreSQL..."
        sudo apt update
        sudo apt install -y postgresql postgresql-contrib
    fi

    # Iniciar PostgreSQL
    sudo systemctl start postgresql
    sudo systemctl enable postgresql

    # Crear bases de datos
    echo "Creando bases de datos..."
    sudo -u postgres psql -c "CREATE DATABASE IF NOT EXISTS gestions_db;" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE IF NOT EXISTS pacientes_db;" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE USER IF NOT EXISTS postgres WITH PASSWORD 'postgres';" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gestions_db TO postgres;" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pacientes_db TO postgres;" 2>/dev/null || true

    echo -e "${GREEN}✅ PostgreSQL configurado${NC}"
}

# Función para iniciar un servicio
start_service() {
    local service=$1
    local jar_file=$(ls ${JARS_DIR}/${service}-*.jar 2>/dev/null | head -1)

    if [ -z "$jar_file" ]; then
        echo -e "${RED}❌ No se encontró JAR para $service en ${JARS_DIR}/${NC}"
        return 1
    fi

    if is_service_running "$service"; then
        echo -e "${YELLOW}⚠️  $service ya está ejecutándose${NC}"
        return 0
    fi

    echo -e "${BLUE}🚀 Iniciando $service...${NC}"

    # Crear directorio de logs si no existe
    mkdir -p "$LOGS_DIR"

    # Configurar variables de entorno según el servicio
    # IMPORTANTE: NO establecer ddl-auto aquí para preservar datos existentes
    case $service in
        "gateway")
            export JAVA_OPTS="-Xmx200m -Xms100m"
            nohup java $JAVA_OPTS -jar "$jar_file" > "${LOGS_DIR}/${service}.log" 2>&1 &
            ;;
        "gestions")
            export DATABASE_URL="jdbc:postgresql://localhost:5432/gestions_db"
            export DATABASE_USERNAME="postgres"
            export DATABASE_PASSWORD="postgres"
            export JAVA_OPTS="-Xmx250m -Xms120m"
            # NO establecer SPRING_JPA_HIBERNATE_DDL_AUTO para usar configuración del application.properties
            nohup java $JAVA_OPTS -jar "$jar_file" > "${LOGS_DIR}/${service}.log" 2>&1 &
            ;;
        "pacientes")
            export DB_URL="jdbc:postgresql://localhost:5432/pacientes_db"
            export DB_USERNAME="postgres"
            export DB_PASSWORD="postgres"
            export JAVA_OPTS="-Xmx200m -Xms100m"
            # NO establecer SPRING_JPA_HIBERNATE_DDL_AUTO para usar configuración del application.properties
            nohup java $JAVA_OPTS -jar "$jar_file" > "${LOGS_DIR}/${service}.log" 2>&1 &
            ;;
    esac

    # Esperar un momento para que el servicio inicie
    sleep 3

    if is_service_running "$service"; then
        local pid=$(get_service_pid "$service")
        echo -e "${GREEN}✅ $service iniciado correctamente (PID: $pid)${NC}"
    else
        echo -e "${RED}❌ Error al iniciar $service${NC}"
        echo -e "${YELLOW}📋 Revisar logs: tail -f ${LOGS_DIR}/${service}.log${NC}"
        return 1
    fi
}

# Función para detener un servicio
stop_service() {
    local service=$1
    local jar_file=$(ls ${JARS_DIR}/${service}-*.jar 2>/dev/null | head -1)

    if [ -z "$jar_file" ]; then
        echo -e "${RED}❌ No se encontró JAR para $service${NC}"
        return 1
    fi

    if ! is_service_running "$service"; then
        echo -e "${YELLOW}⚠️  $service ya está detenido${NC}"
        return 0
    fi

    echo -e "${BLUE}🛑 Deteniendo $service...${NC}"

    # Matar el proceso
    pkill -f "$jar_file"

    # Esperar hasta 10 segundos para que se detenga
    local count=0
    while is_service_running "$service" && [ $count -lt 10 ]; do
        sleep 1
        count=$((count + 1))
    done

    if is_service_running "$service"; then
        echo -e "${RED}❌ No se pudo detener $service normalmente, forzando...${NC}"
        pkill -9 -f "$jar_file"
        sleep 2
    fi

    if ! is_service_running "$service"; then
        echo -e "${GREEN}✅ $service detenido correctamente${NC}"
    else
        echo -e "${RED}❌ Error al detener $service${NC}"
        return 1
    fi
}

# Función para reiniciar un servicio
restart_service() {
    local service=$1
    echo -e "${BLUE}🔄 Reiniciando $service...${NC}"

    stop_service "$service"
    sleep 2
    start_service "$service"
}

# Función para mostrar logs
show_logs() {
    local service=$1
    local log_file="${LOGS_DIR}/${service}.log"

    if [ ! -f "$log_file" ]; then
        echo -e "${RED}❌ No se encontró archivo de log: $log_file${NC}"
        return 1
    fi

    echo -e "${BLUE}📋 Logs de $service (últimas 50 líneas):${NC}"
    echo "═══════════════════════════════════════════════"
    tail -50 "$log_file"
    echo ""
    echo -e "${YELLOW}💡 Para seguir viendo logs en tiempo real: tail -f $log_file${NC}"
}

# Función principal
main() {
    local command=$1
    local service=$2

    case $command in
        "start")
            if [ -z "$service" ]; then
                echo -e "${RED}❌ Debe especificar un servicio${NC}"
                show_help
                exit 1
            fi
            if [[ ! " ${SERVICES[@]} " =~ " ${service} " ]]; then
                echo -e "${RED}❌ Servicio '$service' no válido. Servicios disponibles: ${SERVICES[*]}${NC}"
                exit 1
            fi
            start_service "$service"
            ;;
        "stop")
            if [ -z "$service" ]; then
                echo -e "${RED}❌ Debe especificar un servicio${NC}"
                show_help
                exit 1
            fi
            if [[ ! " ${SERVICES[@]} " =~ " ${service} " ]]; then
                echo -e "${RED}❌ Servicio '$service' no válido. Servicios disponibles: ${SERVICES[*]}${NC}"
                exit 1
            fi
            stop_service "$service"
            ;;
        "restart")
            if [ -z "$service" ]; then
                echo -e "${RED}❌ Debe especificar un servicio${NC}"
                show_help
                exit 1
            fi
            if [[ ! " ${SERVICES[@]} " =~ " ${service} " ]]; then
                echo -e "${RED}❌ Servicio '$service' no válido. Servicios disponibles: ${SERVICES[*]}${NC}"
                exit 1
            fi
            restart_service "$service"
            ;;
        "start-all")
            echo -e "${BLUE}🚀 Iniciando todos los servicios...${NC}"
            echo -e "${YELLOW}💡 Nota: Las bases de datos deben estar ya configuradas${NC}"
            echo -e "${YELLOW}💡 Asegúrate de que spring.jpa.hibernate.ddl-auto=update en application.properties${NC}"
            for service in "${SERVICES[@]}"; do
                start_service "$service"
                sleep 2
            done
            echo ""
            echo -e "${GREEN}🎉 Todos los servicios iniciados!${NC}"
            show_status
            ;;
        "stop-all")
            echo -e "${BLUE}🛑 Deteniendo todos los servicios...${NC}"
            for service in "${SERVICES[@]}"; do
                stop_service "$service"
            done
            echo -e "${GREEN}✅ Todos los servicios detenidos${NC}"
            ;;
        "restart-all")
            echo -e "${BLUE}🔄 Reiniciando todos los servicios...${NC}"
            for service in "${SERVICES[@]}"; do
                restart_service "$service"
                sleep 3
            done
            echo ""
            echo -e "${GREEN}🎉 Todos los servicios reiniciados!${NC}"
            show_status
            ;;
        "status")
            show_status
            ;;
        "logs")
            if [ -z "$service" ]; then
                echo -e "${RED}❌ Debe especificar un servicio${NC}"
                show_help
                exit 1
            fi
            if [[ ! " ${SERVICES[@]} " =~ " ${service} " ]]; then
                echo -e "${RED}❌ Servicio '$service' no válido. Servicios disponibles: ${SERVICES[*]}${NC}"
                exit 1
            fi
            show_logs "$service"
            ;;
        "setup-db")
            setup_database
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            echo -e "${RED}❌ Comando '$command' no válido${NC}"
            show_help
            exit 1
            ;;
    esac
}

# Verificar si se ejecuta como root o con sudo
if [ "$EUID" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Ejecutando como root - esto está bien para configuración inicial${NC}"
fi

# Ejecutar función principal
main "$@"