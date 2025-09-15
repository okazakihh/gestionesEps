package com.ipsSystem.gestions.auth.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class RevokeController {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @PostMapping("/revoke")
    public String revokeToken(@RequestParam String jti, @RequestParam(required = false) Long ttlSeconds) {
        if (jti == null || jti.isBlank()) {
            return "missing jti";
        }
        String key = "token:blacklist:" + jti;
        long ttl = (ttlSeconds != null && ttlSeconds > 0) ? ttlSeconds : 3600L;
        redisTemplate.opsForValue().set(key, "revoked", Duration.ofSeconds(ttl));
        return "ok";
    }
}
