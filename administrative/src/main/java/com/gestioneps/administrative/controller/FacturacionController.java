package com.gestioneps.administrative.controller;

import com.gestioneps.administrative.dto.FacturacionDTO;
import com.gestioneps.administrative.service.FacturacionService;
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
@RequestMapping("/facturacion")
@Tag(name = "Facturación", description = "API para gestión de facturación")
public class FacturacionController {

    private final FacturacionService facturacionService;

    public FacturacionController(FacturacionService facturacionService) {
        this.facturacionService = facturacionService;
    }

    // Constantes para mensajes de respuesta
    private static final String SUCCESS = "success";
    private static final String ERROR = "error";
    private static final String DATA = "data";
    private static final String FACTURACION_NO_ENCONTRADA = "Facturación no encontrada con ID: ";

    @PostMapping
    @Operation(summary = "Crear facturación", description = "Crea una nueva facturación desde JSON crudo")
    public ResponseEntity<Map<String, Object>> crearFacturacion(@RequestBody String jsonData) {
        Map<String, Object> response = new HashMap<>();
        try {
            FacturacionDTO facturacion = facturacionService.crearFacturacionDesdeJson(jsonData);
            response.put(SUCCESS, true);
            response.put(DATA, facturacion);
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
    @Operation(summary = "Obtener facturación por ID", description = "Obtiene una facturación específica por su ID")
    public ResponseEntity<Map<String, Object>> obtenerFacturacion(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            FacturacionDTO facturacion = facturacionService.obtenerFacturacionPorId(id);
            response.put(SUCCESS, true);
            response.put(DATA, facturacion);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, FACTURACION_NO_ENCONTRADA + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping
    @Operation(summary = "Obtener facturaciones activas", description = "Obtiene una lista paginada de facturaciones activas")
    public ResponseEntity<Map<String, Object>> obtenerFacturacionesActivas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> response = new HashMap<>();
        Pageable pageable = PageRequest.of(page, size);
        Page<FacturacionDTO> facturaciones = facturacionService.obtenerFacturacionesActivas(pageable);
        response.put(SUCCESS, true);
        response.put(DATA, facturaciones);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar facturación", description = "Actualiza una facturación existente")
    public ResponseEntity<Map<String, Object>> actualizarFacturacion(@PathVariable Long id, @RequestBody String jsonData) {
        Map<String, Object> response = new HashMap<>();
        try {
            FacturacionDTO facturacion = facturacionService.actualizarFacturacion(id, jsonData);
            response.put(SUCCESS, true);
            response.put(DATA, facturacion);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, FACTURACION_NO_ENCONTRADA + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error interno: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PatchMapping("/{id}/desactivar")
    @Operation(summary = "Desactivar facturación", description = "Desactiva una facturación (soft delete)")
    public ResponseEntity<Map<String, Object>> desactivarFacturacion(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            facturacionService.desactivarFacturacion(id);
            response.put(SUCCESS, true);
            response.put(DATA, null);
            response.put("message", "Facturación desactivada");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put("message", FACTURACION_NO_ENCONTRADA + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar facturación", description = "Elimina permanentemente una facturación")
    public ResponseEntity<Map<String, Object>> eliminarFacturacion(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            facturacionService.eliminarFacturacion(id);
            response.put(SUCCESS, true);
            response.put(DATA, null);
            response.put("message", "Facturación eliminada");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put("message", FACTURACION_NO_ENCONTRADA + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}