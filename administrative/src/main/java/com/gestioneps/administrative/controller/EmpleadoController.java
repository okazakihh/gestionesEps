package com.gestioneps.administrative.controller;

import com.gestioneps.administrative.dto.EmpleadoDTO;
import com.gestioneps.administrative.service.EmpleadoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/empleados")
@Tag(name = "Empleados", description = "API para gestión de empleados")
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    public EmpleadoController(EmpleadoService empleadoService) {
        this.empleadoService = empleadoService;
    }

    // Constantes para mensajes de respuesta
    private static final String SUCCESS = "success";
    private static final String ERROR = "error";
    private static final String DATA = "data";
    private static final String EMPLEADO_NO_ENCONTRADO = "Empleado no encontrado con ID: ";

    @PostMapping
    @Operation(summary = "Crear empleado", description = "Crea un nuevo empleado desde JSON crudo")
    public ResponseEntity<Map<String, Object>> crearEmpleado(@RequestBody String jsonData) {
        Map<String, Object> response = new HashMap<>();
        try {
            EmpleadoDTO empleado = empleadoService.crearEmpleadoDesdeJson(jsonData);
            response.put(SUCCESS, true);
            response.put(DATA, empleado);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Datos inválidos: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error interno: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener empleado por ID", description = "Obtiene un empleado específico por su ID")
    public ResponseEntity<Map<String, Object>> obtenerEmpleado(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            EmpleadoDTO empleado = empleadoService.obtenerEmpleadoPorId(id);
            response.put(SUCCESS, true);
            response.put(DATA, empleado);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, EMPLEADO_NO_ENCONTRADO + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping
    @Operation(summary = "Obtener empleados activos", description = "Obtiene una lista paginada de empleados activos")
    public ResponseEntity<Map<String, Object>> obtenerEmpleadosActivos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> response = new HashMap<>();
        Pageable pageable = PageRequest.of(page, size);
        Page<EmpleadoDTO> empleados = empleadoService.obtenerEmpleadosActivos(pageable);
        response.put(SUCCESS, true);
        response.put(DATA, empleados);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar empleado", description = "Actualiza un empleado existente")
    public ResponseEntity<Map<String, Object>> actualizarEmpleado(@PathVariable Long id, @RequestBody String jsonData) {
        Map<String, Object> response = new HashMap<>();
        try {
            EmpleadoDTO empleado = empleadoService.actualizarEmpleado(id, jsonData);
            response.put(SUCCESS, true);
            response.put(DATA, empleado);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, EMPLEADO_NO_ENCONTRADO + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error interno: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PatchMapping("/{id}/desactivar")
    @Operation(summary = "Desactivar empleado", description = "Desactiva un empleado (soft delete)")
    public ResponseEntity<Map<String, Object>> desactivarEmpleado(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            empleadoService.desactivarEmpleado(id);
            response.put(SUCCESS, true);
            response.put(DATA, null);
            response.put("message", "Empleado desactivado");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put("message", EMPLEADO_NO_ENCONTRADO + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar empleado", description = "Elimina permanentemente un empleado")
    public ResponseEntity<Map<String, Object>> eliminarEmpleado(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            empleadoService.eliminarEmpleado(id);
            response.put(SUCCESS, true);
            response.put(DATA, null);
            response.put("message", "Empleado eliminado");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put("message", EMPLEADO_NO_ENCONTRADO + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}