#!/bin/bash

# Script rápido para operaciones comunes de servicios
# Atajos convenientes para el día a día

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANAGE_SCRIPT="$SCRIPT_DIR/manage-services.sh"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Función para mostrar menú
show_menu() {
    echo -e "${BLUE}🚀 IPS System - Gestión Rápida de Servicios${NC}"
    echo "═══════════════════════════════════════════════"
    echo "1) 🔄 Reiniciar todos los servicios (preserva datos)"
    echo "2) ✅ Ver estado de servicios"
    echo "3) 🛑 Detener todos los servicios"
    echo "4) 🚀 Iniciar todos los servicios (preserva datos)"
    echo "5) 🔄 Reiniciar Gateway"
    echo "6) 🔄 Reiniciar Gestions"
    echo "7) 🔄 Reiniciar Pacientes"
    echo "8) 📋 Ver logs de Gateway"
    echo "9) 📋 Ver logs de Gestions"
    echo "10) 📋 Ver logs de Pacientes"
    echo "11) 🐳 Configurar base de datos (solo inicial)"
    echo "0) ❌ Salir"
    echo ""
}

# Función para ejecutar comando
run_command() {
    local cmd=$1
    echo -e "${BLUE}Ejecutando: $cmd${NC}"
    "$MANAGE_SCRIPT" $cmd
    echo ""
}

# Función principal
main() {
    while true; do
        show_menu
        read -p "Seleccione una opción (0-11): " choice
        echo ""

        case $choice in
            1)
                echo -e "${YELLOW}🔄 Reiniciando todos los servicios (datos preservados)...${NC}"
                run_command "restart-all"
                ;;
            2)
                run_command "status"
                ;;
            3)
                echo -e "${YELLOW}🛑 Deteniendo todos los servicios...${NC}"
                run_command "stop-all"
                ;;
            4)
                echo -e "${YELLOW}🚀 Iniciando todos los servicios (datos preservados)...${NC}"
                run_command "start-all"
                ;;
            5)
                echo -e "${YELLOW}🔄 Reiniciando Gateway...${NC}"
                run_command "restart gateway"
                ;;
            6)
                echo -e "${YELLOW}🔄 Reiniciando Gestions...${NC}"
                run_command "restart gestions"
                ;;
            7)
                echo -e "${YELLOW}🔄 Reiniciando Pacientes...${NC}"
                run_command "restart pacientes"
                ;;
            8)
                run_command "logs gateway"
                ;;
            9)
                run_command "logs gestions"
                ;;
            10)
                run_command "logs pacientes"
                ;;
            11)
                echo -e "${YELLOW}🐳 Configurando base de datos...${NC}"
                run_command "setup-db"
                ;;
            0)
                echo -e "${GREEN}👋 ¡Hasta luego!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Opción inválida. Intente nuevamente.${NC}"
                echo ""
                ;;
        esac

        if [ "$choice" != "0" ]; then
            read -p "Presione Enter para continuar..."
            clear
        fi
    done
}

# Verificar que el script de gestión existe
if [ ! -f "$MANAGE_SCRIPT" ]; then
    echo -e "${RED}❌ Error: No se encontró $MANAGE_SCRIPT${NC}"
    echo -e "${YELLOW}💡 Asegúrese de que está en el directorio correcto${NC}"
    exit 1
fi

# Verificar permisos de ejecución
if [ ! -x "$MANAGE_SCRIPT" ]; then
    echo -e "${YELLOW}⚠️  El script de gestión no tiene permisos de ejecución${NC}"
    echo -e "${BLUE}💡 Ejecutar: chmod +x $MANAGE_SCRIPT${NC}"
fi

# Ejecutar menú principal
clear
main