#!/bin/bash

# Script de monitoreo para microservicios
# Uso: ./monitor.sh

echo "📊 Monitoreo del Sistema - $(date)"
echo "================================="

# Verificar servicios Java
echo ""
echo "🔍 Servicios Java corriendo:"
ps aux | grep java | grep -v grep | while read line; do
    pid=$(echo $line | awk '{print $2}')
    memory=$(echo $line | awk '{print $4}')
    command=$(echo $line | awk '{for(i=11;i<=NF;i++) printf "%s ", $i; print ""}' | cut -d' ' -f1-3)
    echo "   PID: $pid | Memoria: ${memory}% | Comando: $command"
done

# Verificar conexiones a bases de datos
echo ""
echo "🗄️  Conexiones a PostgreSQL:"
sudo -u postgres psql -c "SELECT datname, numbackends FROM pg_stat_database WHERE datname IN ('gestions_db', 'pacientes_db');" 2>/dev/null || echo "   No se pudo conectar a PostgreSQL"

# Verificar puertos
echo ""
echo "🌐 Puertos en uso:"
netstat -tlnp 2>/dev/null | grep -E ":(8080|8081|8082|5432)" | while read line; do
    port=$(echo $line | awk '{print $4}' | cut -d: -f2)
    program=$(echo $line | awk '{print $7}' | cut -d/ -f1)
    echo "   Puerto $port: $program"
done

# Verificar logs recientes
echo ""
echo "📝 Logs recientes (últimas 5 líneas de cada servicio):"
for service in gateway gestions pacientes; do
    if [ -f ~/logs/${service}.log ]; then
        echo ""
        echo "🔍 $service log:"
        tail -5 ~/logs/${service}.log | sed 's/^/   /'
    fi
done

# Uso de recursos
echo ""
echo "💻 Uso de recursos del sistema:"
echo "   Memoria: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
echo "   Disco: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " usado)"}')"

# Espacio en backups
echo ""
echo "💾 Espacio usado por backups:"
if [ -d ~/backups ]; then
    du -sh ~/backups 2>/dev/null || echo "   No se pudo calcular"
else
    echo "   Directorio de backups no existe"
fi

echo ""
echo "✅ Monitoreo completado - $(date)"