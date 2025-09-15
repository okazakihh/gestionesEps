package com.gateway.security;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import reactor.core.publisher.Mono;

@Service
public class TokenBlacklistService {

    private final ReactiveStringRedisTemplate redisTemplate;

    @Autowired
    public TokenBlacklistService(ReactiveStringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public Mono<Boolean> isBlacklisted(String jti) {
        if (jti == null || jti.isBlank()) {
            return Mono.just(false);
        }
        String key = "token:blacklist:" + jti;
        return redisTemplate.hasKey(key);
    }
}
