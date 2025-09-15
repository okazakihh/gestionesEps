package com.gateway.filter;

import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import com.gateway.security.TokenBlacklistService;
import reactor.core.publisher.Mono;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import java.text.ParseException;
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

    @Autowired
    private TokenBlacklistService blacklistService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethod().name();
        log.info("Incoming request {} {}", method, path);

        // Check Authorization header for Bearer token and validate blacklist
        List<String> authHeaders = exchange.getRequest().getHeaders().getOrEmpty("Authorization");
        if (!authHeaders.isEmpty() && authHeaders.get(0).startsWith("Bearer ")) {
            String token = authHeaders.get(0).substring(7).trim();
            try {
                SignedJWT jwt = SignedJWT.parse(token);
                String jti = jwt.getJWTClaimsSet().getStringClaim("jti");
                return blacklistService.isBlacklisted(jti)
                        .flatMap(blacklisted -> {
                            if (blacklisted) {
                                ServerHttpResponse resp = exchange.getResponse();
                                resp.setStatusCode(HttpStatus.UNAUTHORIZED);
                                resp.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                                Map<String,Object> body = Map.of("success", false, "message", "Token revoked");
                                try {
                                    byte[] bytes = new ObjectMapper().writeValueAsBytes(body);
                                    return resp.writeWith(Mono.just(resp.bufferFactory().wrap(bytes)));
                                } catch (Exception e) {
                                    return resp.setComplete();
                                }
                            } else {
                                return chain.filter(exchange);
                            }
                        });
            } catch (ParseException e) {
                log.warn("Unable to parse JWT for blacklist check: {}", e.getMessage());
                // let the request continue; downstream security will reject if invalid
            }
        }

        // TEMPORALMENTE: permitir todas las peticiones sin validación
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -100;
    }
}