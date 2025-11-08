package com.ipsSystem.gestions.auth.controller;

import com.ipsSystem.gestions.auth.dto.RoleDTO;
import com.ipsSystem.gestions.auth.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestión de Roles
 * Endpoints para operaciones CRUD de roles del sistema
 */
@RestController
@RequestMapping("/roles")
@Tag(name = "Roles", description = "API para gestión de roles del sistema")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    // Constantes para respuestas
    private static final String SUCCESS = "success";
    private static final String ERROR = "error";
    private static final String DATA = "data";
    private static final String MESSAGE = "message";

    /**
     * Obtener todos los roles (paginado)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtener todos los roles", description = "Obtiene una lista paginada de todos los roles")
    public ResponseEntity<Map<String, Object>> getAllRoles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> response = new HashMap<>();
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<RoleDTO> roles = roleService.getAllRoles(pageable);
            
            response.put(SUCCESS, true);
            response.put(DATA, roles);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error al obtener roles: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtener todos los roles (lista completa sin paginar)
     * Accesible para usuarios autenticados (no requiere rol específico)
     */
    @GetMapping("/all")
    @Operation(summary = "Obtener todos los roles sin paginar", description = "Obtiene la lista completa de roles")
    public ResponseEntity<Map<String, Object>> getAllRolesList() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<RoleDTO> roles = roleService.getAllRoles();
            
            response.put(SUCCESS, true);
            response.put(DATA, roles);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error al obtener roles: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtener rol por ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtener rol por ID", description = "Obtiene un rol específico por su ID")
    public ResponseEntity<Map<String, Object>> getRoleById(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            RoleDTO role = roleService.getRoleById(id);
            
            response.put(SUCCESS, true);
            response.put(DATA, role);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error al obtener rol: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtener rol por nombre
     */
    @GetMapping("/nombre/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtener rol por nombre", description = "Obtiene un rol específico por su nombre")
    public ResponseEntity<Map<String, Object>> getRoleByName(@PathVariable String name) {
        Map<String, Object> response = new HashMap<>();
        try {
            RoleDTO role = roleService.getRoleByName(name);
            
            response.put(SUCCESS, true);
            response.put(DATA, role);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error al obtener rol: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Crear nuevo rol
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear nuevo rol", description = "Crea un nuevo rol en el sistema")
    public ResponseEntity<Map<String, Object>> createRole(@Valid @RequestBody RoleDTO roleDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            RoleDTO createdRole = roleService.createRole(roleDTO);
            
            response.put(SUCCESS, true);
            response.put(DATA, createdRole);
            response.put(MESSAGE, "Rol creado exitosamente");
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error al crear rol: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Actualizar rol existente
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar rol", description = "Actualiza un rol existente")
    public ResponseEntity<Map<String, Object>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleDTO roleDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            RoleDTO updatedRole = roleService.updateRole(id, roleDTO);
            
            response.put(SUCCESS, true);
            response.put(DATA, updatedRole);
            response.put(MESSAGE, "Rol actualizado exitosamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error al actualizar rol: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Eliminar rol
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar rol", description = "Elimina un rol del sistema")
    public ResponseEntity<Map<String, Object>> deleteRole(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            roleService.deleteRole(id);
            
            response.put(SUCCESS, true);
            response.put(MESSAGE, "Rol eliminado exitosamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error al eliminar rol: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Verificar si existe un rol por nombre
     */
    @GetMapping("/exists/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Verificar existencia de rol", description = "Verifica si existe un rol con el nombre especificado")
    public ResponseEntity<Map<String, Object>> existsByName(@PathVariable String name) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean exists = roleService.existsByName(name);
            
            response.put(SUCCESS, true);
            response.put(DATA, exists);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error al verificar rol: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
