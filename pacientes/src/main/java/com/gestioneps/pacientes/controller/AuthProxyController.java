package com.gestioneps.pacientes.controller;

import com.gestioneps.pacientes.dto.LoginProxyRequest;
import com.gestioneps.pacientes.service.AuthProxyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/proxy")
public class AuthProxyController {

    private final AuthProxyService authProxyService;

    public AuthProxyController(AuthProxyService authProxyService) {
        this.authProxyService = authProxyService;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginProxyRequest request) {
        return authProxyService.loginWithBase64Credentials(request.getCredentialsBase64());
    }
}
