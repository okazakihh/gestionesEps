#!/bin/bash

# Monitoreo continuo cada 5 minutos
INTERVAL=300
LOG_FILE="/var/log/monitor-continuo.log"

echo "?? Iniciando monitoreo continuo cada $INTERVAL segundos..."

while true; do
    echo "=== $(date) ===" >> $LOG_FILE
    /bin/bash /home/ubuntu/scripts/monitor-seguridad.sh >> $LOG_FILE 2>&1
    echo "Esperando $INTERVAL segundos..." >> $LOG_FILE
    sleep $INTERVAL
done