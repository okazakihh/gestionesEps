#!/bin/bash

# Generar reporte diario
REPORT_FILE="/var/log/reporte-seguridad-$(date +%Y%m%d).log"

echo "?? REPORTE DIARIO DE SEGURIDAD - $(date)" > $REPORT_FILE
echo "======================================" >> $REPORT_FILE

# Resumen de 24h
echo -e "\n?? ATAQUES SSH (Últimas 24h):" >> $REPORT_FILE
sudo grep "Failed password" /var/log/auth.log | grep "$(date -d '24 hours ago' '+%Y-%m-%d')" | wc -l >> $REPORT_FILE

echo -e "\n?? TOP 10 IPs ATAQUES:" >> $REPORT_FILE
sudo grep "Failed password" /var/log/auth.log | grep "$(date -d '24 hours ago' '+%Y-%m-%d')" | awk '{print $11}' | sort | uniq -c | sort -nr | head -10 >> $REPORT_FILE

echo -e "\n???  FAIL2BAN RESUMEN:" >> $REPORT_FILE
sudo fail2ban-client status sshd >> $REPORT_FILE 2>&1

echo -e "\n?? Reporte guardado en: $REPORT_FILE"