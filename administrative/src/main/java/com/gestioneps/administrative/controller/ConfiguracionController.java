package com.gestioneps.administrative.controller;

import com.gestioneps.administrative.dto.ConfiguracionDTO;
import com.gestioneps.administrative.service.ConfiguracionService;
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
@RequestMapping("/configuracion")
@Tag(name = "Configuración", description = "API para gestión de configuración del sistema IPS")
public class ConfiguracionController {

    private final ConfiguracionService configuracionService;

    public ConfiguracionController(ConfiguracionService configuracionService) {
        this.configuracionService = configuracionService;
    }

    // Constantes para mensajes de respuesta
    private static final String SUCCESS = "success";
    private static final String ERROR = "error";
    private static final String DATA = "data";
    private static final String MESSAGE = "message";
    private static final String CONFIGURACION_NO_ENCONTRADA = "Configuración no encontrada";

    @PostMapping
    @Operation(summary = "Crear configuración", description = "Crea una nueva configuración desde JSON crudo")
    public ResponseEntity<Map<String, Object>> crearConfiguracion(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String jsonData = request.get("jsonData");
            String clave = request.get("clave");
            String tipoConfiguracion = request.get("tipoConfiguracion");

            if (jsonData == null || clave == null) {
                response.put(SUCCESS, false);
                response.put(ERROR, "jsonData y clave son requeridos");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            ConfiguracionDTO configuracion = configuracionService.crearConfiguracionDesdeJson(
                jsonData, clave, tipoConfiguracion
            );
            response.put(SUCCESS, true);
            response.put(DATA, configuracion);
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
    @Operation(summary = "Obtener configuración por ID", description = "Obtiene una configuración específica por su ID")
    public ResponseEntity<Map<String, Object>> obtenerConfiguracion(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            ConfiguracionDTO configuracion = configuracionService.obtenerConfiguracionPorId(id);
            response.put(SUCCESS, true);
            response.put(DATA, configuracion);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, CONFIGURACION_NO_ENCONTRADA);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/clave/{clave}")
    @Operation(summary = "Obtener configuración por clave", description = "Obtiene una configuración específica por su clave única")
    public ResponseEntity<Map<String, Object>> obtenerConfiguracionPorClave(@PathVariable String clave) {
        Map<String, Object> response = new HashMap<>();
        try {
            ConfiguracionDTO configuracion = configuracionService.obtenerConfiguracionPorClave(clave);
            response.put(SUCCESS, true);
            response.put(DATA, configuracion);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, CONFIGURACION_NO_ENCONTRADA);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping
    @Operation(summary = "Obtener configuraciones activas", description = "Obtiene una lista paginada de configuraciones activas")
    public ResponseEntity<Map<String, Object>> obtenerConfiguracionesActivas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> response = new HashMap<>();
        Pageable pageable = PageRequest.of(page, size);
        Page<ConfiguracionDTO> configuraciones = configuracionService.obtenerConfiguracionesActivas(pageable);
        response.put(SUCCESS, true);
        response.put(DATA, configuraciones);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tipo/{tipoConfiguracion}")
    @Operation(summary = "Obtener configuraciones por tipo", description = "Obtiene configuraciones filtradas por tipo")
    public ResponseEntity<Map<String, Object>> obtenerConfiguracionesPorTipo(
            @PathVariable String tipoConfiguracion,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> response = new HashMap<>();
        Pageable pageable = PageRequest.of(page, size);
        Page<ConfiguracionDTO> configuraciones = configuracionService
            .obtenerConfiguracionesPorTipo(tipoConfiguracion, pageable);
        response.put(SUCCESS, true);
        response.put(DATA, configuraciones);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar configuración", description = "Actualiza una configuración existente por ID")
    public ResponseEntity<Map<String, Object>> actualizarConfiguracion(
            @PathVariable Long id, 
            @RequestBody String jsonData) {
        Map<String, Object> response = new HashMap<>();
        try {
            ConfiguracionDTO configuracion = configuracionService.actualizarConfiguracion(id, jsonData);
            response.put(SUCCESS, true);
            response.put(DATA, configuracion);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, CONFIGURACION_NO_ENCONTRADA);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error interno: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/clave/{clave}")
    @Operation(summary = "Actualizar configuración por clave", description = "Actualiza una configuración existente por su clave")
    public ResponseEntity<Map<String, Object>> actualizarConfiguracionPorClave(
            @PathVariable String clave, 
            @RequestBody String jsonData) {
        Map<String, Object> response = new HashMap<>();
        try {
            ConfiguracionDTO configuracion = configuracionService.actualizarConfiguracionPorClave(clave, jsonData);
            response.put(SUCCESS, true);
            response.put(DATA, configuracion);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, CONFIGURACION_NO_ENCONTRADA);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Error interno: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PatchMapping("/{id}/desactivar")
    @Operation(summary = "Desactivar configuración", description = "Desactiva una configuración (soft delete)")
    public ResponseEntity<Map<String, Object>> desactivarConfiguracion(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            configuracionService.desactivarConfiguracion(id);
            response.put(SUCCESS, true);
            response.put(DATA, null);
            response.put(MESSAGE, "Configuración desactivada");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(MESSAGE, CONFIGURACION_NO_ENCONTRADA);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar configuración", description = "Elimina permanentemente una configuración")
    public ResponseEntity<Map<String, Object>> eliminarConfiguracion(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            configuracionService.eliminarConfiguracion(id);
            response.put(SUCCESS, true);
            response.put(DATA, null);
            response.put(MESSAGE, "Configuración eliminada");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(MESSAGE, CONFIGURACION_NO_ENCONTRADA);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}
