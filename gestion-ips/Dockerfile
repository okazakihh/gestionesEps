# Multi-stage build para optimizar la imagen final

# Stage 1: Build
FROM node:20-alpine AS builder

# Instalar dependencias necesarias
RUN apk add --no-cache git

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Instalar dependencias
RUN npm ci --only=production=false

# Copiar código fuente
COPY public ./public
COPY src ./src
COPY index.html ./

# Variables de entorno para build
ARG VITE_API_URL=http://localhost:8080/api
ARG VITE_APP_TITLE="Sistema de Gestión IPS"
ARG VITE_APP_VERSION=1.0.0

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_TITLE=$VITE_APP_TITLE
ENV VITE_APP_VERSION=$VITE_APP_VERSION

# Build de la aplicación
RUN npm run build

# Stage 2: Production server
FROM nginx:1.25-alpine

# Instalar curl para health checks
RUN apk add --no-cache curl

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S reactuser -u 1001

# Copiar archivos build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear directorio para logs
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log && \
    touch /var/log/nginx/error.log && \
    chown -R reactuser:nodejs /usr/share/nginx/html && \
    chown -R reactuser:nodejs /var/log/nginx && \
    chown -R reactuser:nodejs /var/cache/nginx && \
    chown -R reactuser:nodejs /var/run

# Cambiar al usuario no-root
USER reactuser

# Puerto expuesto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
