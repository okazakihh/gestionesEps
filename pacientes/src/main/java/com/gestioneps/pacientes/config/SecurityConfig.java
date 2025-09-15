package com.gestioneps.pacientes.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import java.util.Base64;
import java.nio.charset.StandardCharsets;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.gestioneps.pacientes.dto.ApiError;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                        "/actuator/health",
                        "/actuator/info",
                        "/api/auth/proxy/**",
                        "/api/auth/**"
                ).permitAll()
                .anyRequest().authenticated()
            )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt())
                .exceptionHandling(ex -> ex
                    .authenticationEntryPoint(unauthorizedEntryPoint())
                    .accessDeniedHandler(accessDeniedHandler())
                );

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder(@Value("${jwt.secret}") String secret) {
        // Auth service (gestions) derives a 512-bit key by applying SHA-512 to the configured secret.
        // Replicate the same derivation here so signature validation succeeds across services.
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-512");
            byte[] keyBytes = digest.digest(secret.getBytes(StandardCharsets.UTF_8));
            SecretKeySpec key = new SecretKeySpec(keyBytes, "HmacSHA512");
            // Log only the derived key length to aid debugging (do NOT log the key material)
            logger.debug("Derived HMAC key length (bytes)={}", keyBytes.length);
            NimbusJwtDecoder baseDecoder = NimbusJwtDecoder.withSecretKey(key).build();

            // Wrap the decoder to log token header/payload on decode failures to aid debugging
            return new JwtDecoder() {
                @Override
                public Jwt decode(String token) throws JwtException {
                    try {
                        return baseDecoder.decode(token);
                    } catch (JwtException | IllegalArgumentException ex) {
                        try {
                            // Try to extract header and payload (no signature verification) for debugging
                            String[] parts = token.split("\\.");
                            if (parts.length >= 2) {
                                String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]), StandardCharsets.UTF_8);
                                String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
                                logger.error("JWT decode failed: {}. Token header: {}", ex.getMessage(), headerJson);
                                logger.error("JWT decode failed: {}. Token payload: {}", ex.getMessage(), payloadJson);
                            } else {
                                logger.error("JWT decode failed and token has unexpected format: {}", ex.getMessage());
                            }
                        } catch (Exception inner) {
                            logger.error("Failed to parse JWT for debugging: {}", inner.getMessage());
                        }
                        throw ex;
                    }
                }
            };
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Unable to initialize JWT decoder: SHA-512 algorithm not available", e);
        }
    }

    @Bean
    public AuthenticationEntryPoint unauthorizedEntryPoint() {
        return (HttpServletRequest request, HttpServletResponse response, org.springframework.security.core.AuthenticationException authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            ApiError e = new ApiError();
            e.setSuccess(false);
            e.setMessage("Unauthorized: " + authException.getMessage());
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            response.getWriter().write(mapper.writeValueAsString(e));
        };
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (HttpServletRequest request, HttpServletResponse response, org.springframework.security.access.AccessDeniedException accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json;charset=UTF-8");
            ApiError e = new ApiError();
            e.setSuccess(false);
            e.setMessage("Forbidden: " + accessDeniedException.getMessage());
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            response.getWriter().write(mapper.writeValueAsString(e));
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
