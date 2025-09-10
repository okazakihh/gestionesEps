package com.gateway.filter;

import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.Arrays;

@Component
public class LoggingAndAuthFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(LoggingAndAuthFilter.class);
    
    // Lista de rutas públicas que NO requieren Authorization
    private static final List<String> PUBLIC_PATHS = Arrays.asList(
        "/api/auth/login",
        "/api/auth/register", 
        "/api/auth/refresh",
        "/api/public/",
        "/api/actuator/"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethod().name();
        log.info("Incoming request {} {}", method, path);

        // TEMPORALMENTE: permitir todas las peticiones sin validación
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -100;
    }
}