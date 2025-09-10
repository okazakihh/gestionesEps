package com.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class FallbackController {

    @RequestMapping("/fallback/api")
    public ResponseEntity<Map<String, Object>> apiFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                    "error", "Service temporarily unavailable",
                    "code", 503,
                    "message", "Please try again later"
                ));
    }
}
