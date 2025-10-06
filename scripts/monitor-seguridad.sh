#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

LOG_FILE="/var/log/monitor-seguridad.log"

echo -e "${BLUE}???  MONITOR DE SEGURIDAD - $(date)${NC}"
echo "=========================================="

monitorear_ssh_mejorado() {
    echo -e "\n${YELLOW}?? MONITOREO SSH MEJORADO${NC}"
    
    # Formato correcto para Ubuntu 22.04+
    echo -e "\n${YELLOW}?? ÚLTIMOS 10 ATAQUES SSH:${NC}"
    sudo grep "Failed password" /var/log/auth.log | tail -10 | while read line; do
        ip=$(echo "$line" | grep -oE 'from [0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | cut -d' ' -f2)
        user=$(echo "$line" | grep -oE 'for [a-zA-Z0-9_]+' | cut -d' ' -f2)
        if [ -n "$ip" ]; then
            echo "IP: $ip - Usuario: $user"
        fi
    done
    
    # Contador por IP
    echo -e "\n${YELLOW}?? TOP IPs ATAQUES:${NC}"
    sudo grep "Failed password" /var/log/auth.log | grep -oE 'from [0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | cut -d' ' -f2 | sort | uniq -c | sort -nr | head -10
}

monitorear_firewall_mejorado() {
    echo -e "\n${YELLOW}?? FIREWALL DETALLADO${NC}"
    
    # Mostrar todas las reglas
    echo -e "\n${YELLOW}?? REGLAS INPUT:${NC}"
    sudo iptables -L INPUT -n --line-numbers
    
    # IPs bloqueadas específicamente
    echo -e "\n${YELLOW}?? IPS BLOQUEADAS ESPECÍFICAS:${NC}"
    sudo iptables -L INPUT -n | grep "DROP" | grep -v "0.0.0.0/0" | grep -v "::/0"
}

monitorear_conexiones_activas() {
    echo -e "\n${YELLOW}?? CONEXIONES EXTERNAS ACTIVAS:${NC}"
    
    # Conexiones SSH
    echo -e "${YELLOW}SSH:${NC}"
    sudo netstat -tunp | grep ":22" | grep ESTABLISHED | while read conn; do
        ip=$(echo $conn | awk '{print $5}' | cut -d: -f1)
        if [ "$ip" != "127.0.0.1" ] && [ "$ip" != "::1" ]; then
            echo "? $conn"
        fi
    done
    
    # Conexiones PostgreSQL
    echo -e "\n${YELLOW}PostgreSQL:${NC}"
    sudo netstat -tunp | grep ":5432" | grep ESTABLISHED | while read conn; do
        ip=$(echo $conn | awk '{print $5}' | cut -d: -f1)
        if [ "$ip" != "127.0.0.1" ] && [ "$ip" != "::1" ]; then
            echo "? $conn"
        fi
    done
}

verificar_configuracion_seguridad() {
    echo -e "\n${YELLOW}??  VERIFICACIÓN CONFIGURACIÓN${NC}"
    
    # Puerto SSH
    ssh_port=$(sudo grep "^Port" /etc/ssh/sshd_config | awk '{print $2}')
    echo "Puerto SSH: $ssh_port"
    
    # Fail2Ban config
    echo -e "\n${YELLOW}???  FAIL2BAN CONFIG:${NC}"
    sudo fail2ban-client get sshd findtime
    sudo fail2ban-client get sshd maxretry
    sudo fail2ban-client get sshd bantime
}

# Ejecutar funciones mejoradas
monitorear_ssh_mejorado
monitorear_firewall_mejorado  
monitorear_conexiones_activas
verificar_configuracion_seguridad

echo -e "\n${GREEN}? Monitoreo mejorado completado${NC}"