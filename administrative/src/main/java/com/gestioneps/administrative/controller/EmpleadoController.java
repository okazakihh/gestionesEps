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

@RestController
@RequestMapping("/empleados")
@Tag(name = "Empleados", description = "API para gestión de empleados")
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    public EmpleadoController(EmpleadoService empleadoService) {
        this.empleadoService = empleadoService;
    }

    @PostMapping
    @Operation(summary = "Crear empleado", description = "Crea un nuevo empleado desde JSON crudo")
    public ResponseEntity<EmpleadoDTO> crearEmpleado(@RequestBody String jsonData) {
        try {
            EmpleadoDTO empleado = empleadoService.crearEmpleadoDesdeJson(jsonData);
            return ResponseEntity.status(HttpStatus.CREATED).body(empleado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener empleado por ID", description = "Obtiene un empleado específico por su ID")
    public ResponseEntity<EmpleadoDTO> obtenerEmpleado(@PathVariable Long id) {
        try {
            EmpleadoDTO empleado = empleadoService.obtenerEmpleadoPorId(id);
            return ResponseEntity.ok(empleado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    @Operation(summary = "Obtener empleados activos", description = "Obtiene una lista paginada de empleados activos")
    public ResponseEntity<Page<EmpleadoDTO>> obtenerEmpleadosActivos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<EmpleadoDTO> empleados = empleadoService.obtenerEmpleadosActivos(pageable);
        return ResponseEntity.ok(empleados);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar empleado", description = "Actualiza un empleado existente")
    public ResponseEntity<EmpleadoDTO> actualizarEmpleado(@PathVariable Long id, @RequestBody String jsonData) {
        try {
            EmpleadoDTO empleado = empleadoService.actualizarEmpleado(id, jsonData);
            return ResponseEntity.ok(empleado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/desactivar")
    @Operation(summary = "Desactivar empleado", description = "Desactiva un empleado (soft delete)")
    public ResponseEntity<Void> desactivarEmpleado(@PathVariable Long id) {
        try {
            empleadoService.desactivarEmpleado(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar empleado", description = "Elimina permanentemente un empleado")
    public ResponseEntity<Void> eliminarEmpleado(@PathVariable Long id) {
        try {
            empleadoService.eliminarEmpleado(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}