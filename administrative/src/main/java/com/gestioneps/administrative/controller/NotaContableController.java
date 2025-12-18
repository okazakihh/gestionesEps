package com.gestioneps.administrative.controller;

import com.gestioneps.administrative.dto.NotaContableDTO;
import com.gestioneps.administrative.service.NotaContableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller para gestión de notas contables (crédito y débito)
 */
@RestController
@RequestMapping("/notas-contables")
@Tag(name = "Notas Contables", description = "API para gestión de notas crédito y débito")
public class NotaContableController {

    private final NotaContableService notaContableService;

    public NotaContableController(NotaContableService notaContableService) {
        this.notaContableService = notaContableService;
    }

    private static final String SUCCESS = "success";
    private static final String ERROR = "error";
    private static final String DATA = "data";
    private static final String MESSAGE = "message";

    /**
     * Crear nueva nota contable
     * POST /api/notas-contables
     */
    @PostMapping
    @Operation(summary = "Crear nota contable", description = "Crea una nueva nota crédito o débito desde JSON crudo")
    public ResponseEntity<Map<String, Object>> crearNota(@RequestBody String jsonData) {
        Map<String, Object> response = new HashMap<>();
        try {
            NotaContableDTO nota = notaContableService.crearNotaDesdeJson(jsonData);
            response.put(SUCCESS, true);
            response.put(DATA, nota);
            response.put(MESSAGE, "Nota contable creada exitosamente");
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

    /**
     * Obtener nota contable por ID
     * GET /api/notas-contables/{id}
     */
    @GetMapping("/{id}")
    @Operation(summary = "Obtener nota por ID", description = "Obtiene una nota contable específica por su ID")
    public ResponseEntity<Map<String, Object>> obtenerNotaPorId(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            NotaContableDTO nota = notaContableService.obtenerNotaPorId(id);
            response.put(SUCCESS, true);
            response.put(DATA, nota);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Nota no encontrada: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener todas las notas contables activas
     * GET /api/notas-contables
     */
    @GetMapping
    @Operation(summary = "Obtener todas las notas", description = "Obtiene todas las notas contables activas sin paginación")
    public ResponseEntity<Map<String, Object>> obtenerTodasLasNotas() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<NotaContableDTO> notas = notaContableService.obtenerTodasLasNotas();
            response.put(SUCCESS, true);
            response.put(DATA, notas);
            response.put("total", notas.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error obteniendo notas: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtener notas contables con paginación
     * GET /api/notas-contables/paginated?page=0&size=10
     */
    @GetMapping("/paginated")
    @Operation(summary = "Obtener notas paginadas", description = "Obtiene una lista paginada de notas contables activas")
    public ResponseEntity<Map<String, Object>> obtenerNotasPaginadas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> response = new HashMap<>();
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<NotaContableDTO> notas = notaContableService.obtenerNotasActivas(pageable);
            response.put(SUCCESS, true);
            response.put(DATA, notas);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error obteniendo notas: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtener notas por rango de fechas
     * GET /api/notas-contables/rango?inicio=2025-01-01T00:00:00&fin=2025-12-31T23:59:59
     */
    @GetMapping("/rango")
    @Operation(summary = "Obtener notas por rango de fechas", description = "Obtiene notas contables filtradas por rango de fechas")
    public ResponseEntity<Map<String, Object>> obtenerNotasPorRangoFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<NotaContableDTO> notas = notaContableService.obtenerNotasPorRangoFechas(inicio, fin);
            response.put(SUCCESS, true);
            response.put(DATA, notas);
            response.put("total", notas.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error obteniendo notas: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Actualizar nota contable
     * PUT /api/notas-contables/{id}
     */
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar nota contable", description = "Actualiza los datos de una nota contable existente")
    public ResponseEntity<Map<String, Object>> actualizarNota(
            @PathVariable Long id,
            @RequestBody String jsonData) {
        Map<String, Object> response = new HashMap<>();
        try {
            NotaContableDTO nota = notaContableService.actualizarNota(id, jsonData);
            response.put(SUCCESS, true);
            response.put(DATA, nota);
            response.put(MESSAGE, "Nota contable actualizada exitosamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Nota no encontrada: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error actualizando nota: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Desactivar nota contable (soft delete)
     * DELETE /api/notas-contables/{id}
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar nota contable", description = "Desactiva una nota contable (soft delete)")
    public ResponseEntity<Map<String, Object>> desactivarNota(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            notaContableService.desactivarNota(id);
            response.put(SUCCESS, true);
            response.put(MESSAGE, "Nota contable desactivada exitosamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Nota no encontrada: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error desactivando nota: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtener estadísticas de notas contables
     * GET /api/notas-contables/stats
     */
    @GetMapping("/stats")
    @Operation(summary = "Obtener estadísticas", description = "Obtiene estadísticas de notas contables")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        Map<String, Object> response = new HashMap<>();
        try {
            long totalNotas = notaContableService.contarNotasActivas();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalNotas", totalNotas);
            
            response.put(SUCCESS, true);
            response.put(DATA, stats);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error obteniendo estadísticas: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
