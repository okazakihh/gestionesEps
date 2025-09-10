package com.ipsSystem.gestions.auth.controller;

import com.ipsSystem.gestions.auth.dto.ApiResponse;
import com.ipsSystem.gestions.auth.dto.UserResponse;
import com.ipsSystem.gestions.auth.dto.UserUpdateRequest;
import com.ipsSystem.gestions.auth.dto.RegisterRequest;
import com.ipsSystem.gestions.auth.service.AuthService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UsersController {
    
    @Autowired
    private AuthService authService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        try {
            ApiResponse<List<UserResponse>> response = authService.getAllUsers();
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(500).body(response);
            }
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(403)
                .body(ApiResponse.error("Acceso denegado. No tiene permisos para ver los usuarios.", 403));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Error interno del servidor: " + e.getMessage(), 500));
        }
    }
    
    @GetMapping("/{username}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR') or #username == authentication.name")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByUsername(@PathVariable String username) {
        try {
            ApiResponse<UserResponse> response = authService.getUserByUsername(username);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error al buscar usuario: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{username}")
    @PreAuthorize("hasRole('ADMIN') or #username == authentication.name")
    public ResponseEntity<ApiResponse<String>> updateUser(@PathVariable String username, 
                                                         @Valid @RequestBody UserUpdateRequest request) {
        try {
            ApiResponse<String> response = authService.updateUser(username, request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error al actualizar usuario: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable String username) {
        try {
            ApiResponse<String> response = authService.deleteUser(username);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error al eliminar usuario: " + e.getMessage()));
        }
    }
    
    @PostMapping("/admin/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> createUserByAdmin(@Valid @RequestBody RegisterRequest request) {
        try {
            ApiResponse<String> response = authService.register(request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Error al crear usuario: " + e.getMessage()));
        }
    }
}
