package com.gestioneps.administrative.controller;

import com.gestioneps.administrative.dto.NominaDTO;
import com.gestioneps.administrative.service.NominaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/nomina")
@Tag(name = "Nómina", description = "API para gestión de nómina")
public class NominaController {

    private final NominaService nominaService;

    public NominaController(NominaService nominaService) {
        this.nominaService = nominaService;
    }

    @PostMapping("/empleado/{empleadoId}")
    @Operation(summary = "Crear nómina", description = "Crea una nueva nómina para un empleado desde JSON crudo")
    public ResponseEntity<NominaDTO> crearNomina(@PathVariable Long empleadoId, @RequestBody String jsonData) {
        try {
            NominaDTO nomina = nominaService.crearNominaDesdeJson(empleadoId, jsonData);
            return ResponseEntity.status(HttpStatus.CREATED).body(nomina);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener nómina por ID", description = "Obtiene una nómina específica por su ID")
    public ResponseEntity<NominaDTO> obtenerNomina(@PathVariable Long id) {
        try {
            NominaDTO nomina = nominaService.obtenerNominaPorId(id);
            return ResponseEntity.ok(nomina);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    @Operation(summary = "Obtener nóminas activas", description = "Obtiene una lista paginada de nóminas activas")
    public ResponseEntity<Page<NominaDTO>> obtenerNominasActivas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NominaDTO> nominas = nominaService.obtenerNominasActivas(pageable);
        return ResponseEntity.ok(nominas);
    }

    @GetMapping("/empleado/{empleadoId}")
    @Operation(summary = "Obtener nóminas por empleado", description = "Obtiene nóminas de un empleado específico")
    public ResponseEntity<Page<NominaDTO>> obtenerNominasPorEmpleado(
            @PathVariable Long empleadoId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NominaDTO> nominas = nominaService.obtenerNominasPorEmpleado(empleadoId, pageable);
        return ResponseEntity.ok(nominas);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar nómina", description = "Actualiza una nómina existente")
    public ResponseEntity<NominaDTO> actualizarNomina(@PathVariable Long id, @RequestBody String jsonData) {
        try {
            NominaDTO nomina = nominaService.actualizarNomina(id, jsonData);
            return ResponseEntity.ok(nomina);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/desactivar")
    @Operation(summary = "Desactivar nómina", description = "Desactiva una nómina (soft delete)")
    public ResponseEntity<Void> desactivarNomina(@PathVariable Long id) {
        try {
            nominaService.desactivarNomina(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar nómina", description = "Elimina permanentemente una nómina")
    public ResponseEntity<Void> eliminarNomina(@PathVariable Long id) {
        try {
            nominaService.eliminarNomina(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}