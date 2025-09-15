package com.gestioneps.pacientes.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthProxyService {

    @Value("${auth.base-url:http://localhost:8080}")
    private String authBaseUrl;

    @Value("${credentials.secret:}")
    private String credentialsSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    public ResponseEntity<String> loginWithBase64Credentials(String credentialsBase64) {
        byte[] decoded = Base64.getDecoder().decode(credentialsBase64);
        String decodedStr = new String(decoded, StandardCharsets.UTF_8);

        String username;
        String password;

        // If decoded string contains ':', assume plain username:password
        if (decodedStr.contains(":")) {
            String[] parts = decodedStr.split(":", 2);
            if (parts.length != 2) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid credentials format");
            }
            username = parts[0];
            password = parts[1];
        } else {
            // Otherwise, assume decoded bytes represent IV (first 16 bytes) + ciphertext; perform AES-CBC decryption
            try {
                // Use configured secret or fallback to the provided default so testing works immediately.
                String secretToUse = (credentialsSecret == null || credentialsSecret.isBlank()) ? "u5u4r101$" : credentialsSecret;
                byte[] allBytes = Base64.getDecoder().decode(credentialsBase64);
                if (allBytes.length <= 16) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid encrypted payload");
                }
                byte[] iv = new byte[16];
                System.arraycopy(allBytes, 0, iv, 0, 16);
                byte[] cipherBytes = new byte[allBytes.length - 16];
                System.arraycopy(allBytes, 16, cipherBytes, 0, cipherBytes.length);

                // Derive AES-256 key from secretToUse using SHA-256
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                byte[] keyBytes = digest.digest(secretToUse.getBytes(StandardCharsets.UTF_8));
                SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");

                Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
                cipher.init(Cipher.DECRYPT_MODE, keySpec, new IvParameterSpec(iv));
                byte[] plain = cipher.doFinal(cipherBytes);
                String plainStr = new String(plain, StandardCharsets.UTF_8);
                String[] parts = plainStr.split(":", 2);
                if (parts.length != 2) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid decrypted credentials format");
                }
                username = parts[0];
                password = parts[1];
            } catch (Exception e) {
                // Include cause message but avoid leaking stack traces in HTTP body
                String msg = e.getMessage() != null ? e.getMessage() : "decryption error";
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unable to decrypt credentials: " + msg);
            }
        }

        Map<String, String> loginBody = new HashMap<>();
        loginBody.put("username", username);
        loginBody.put("password", password);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String,String>> request = new HttpEntity<>(loginBody, headers);

        String url = authBaseUrl + "/api/auth/login";
        return restTemplate.postForEntity(url, request, String.class);
    }
}
