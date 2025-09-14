package com.ipsSystem.gestions.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import jakarta.annotation.PostConstruct;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    // secret key material is stored in holderKey and initialized at startup

    @Value("${jwt.expiration:86400000}") // 24 horas por defecto
    private int jwtExpiration;

    @Value("${jwt.secret:}")
    private String configuredSecret;

    public JwtUtil() {
        // Default constructor will be called by Spring; key initialization happens in @PostConstruct init()
    }

    // Spring will call this constructor-like init via @Value injection; use a factory method to build key
    @PostConstruct
    private void init() {
        if (configuredSecret != null && !configuredSecret.isBlank()) {
            // Derive a 512-bit key from the configured secret using SHA-512 digest
            try {
                MessageDigest digest = MessageDigest.getInstance("SHA-512");
                byte[] keyBytes = digest.digest(configuredSecret.getBytes(StandardCharsets.UTF_8));
                // Use the digest bytes as key material for HmacSHA512
                SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "HmacSHA512");
                // assign to field via reflection not possible; use holder pattern below
                setSecretKey(keySpec);
            } catch (NoSuchAlgorithmException e) {
                throw new IllegalStateException("Unable to initialize JWT secret key", e);
            }
        } else {
            // Fallback: derive key from a random source so tokens remain valid for this JVM only
            // Use a generated key via HmacSHA512 with random bytes
            try {
                byte[] randomBytes = java.util.UUID.randomUUID().toString().getBytes(StandardCharsets.UTF_8);
                MessageDigest digest = MessageDigest.getInstance("SHA-512");
                byte[] keyBytes = digest.digest(randomBytes);
                SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "HmacSHA512");
                setSecretKey(keySpec);
            } catch (NoSuchAlgorithmException e) {
                throw new IllegalStateException("Unable to initialize fallback JWT secret key", e);
            }
        }
    }

    // Use a mutable holder for secretKey because field was final previously
    private volatile SecretKey holderKey;

    private void setSecretKey(SecretKey key) {
        this.holderKey = key;
    }
    
    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }
    
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }
    
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }
    
    private Claims getAllClaimsFromToken(String token) {
        SecretKey key = holderKey;
        if (key == null) {
            throw new IllegalStateException("JWT signing key not initialized");
        }
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }
    
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        SecretKey key = holderKey;
        if (key == null) {
            throw new IllegalStateException("JWT signing key not initialized");
        }
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
