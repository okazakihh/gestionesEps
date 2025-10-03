package com.gestioneps.pacientes.controller;

import com.gestioneps.pacientes.dto.CitaMedicaDTO;
import com.gestioneps.pacientes.service.CitaMedicaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "Citas Médicas", description = "Gestión de citas médicas")
@RestController
@RequestMapping("/citas")
public class CitaMedicaController {

    private static final Logger LOGGER = LoggerFactory.getLogger(CitaMedicaController.class);

    private final CitaMedicaService citaMedicaService;

    private static final String SUCCESS = "success";
    private static final String ERROR = "error";
    private static final String CITA_NO_ENCONTRADA = "Cita médica no encontrada: ";

    public CitaMedicaController(CitaMedicaService citaMedicaService) {
        this.citaMedicaService = citaMedicaService;
    }

    /**
     * Crear nueva cita médica desde JSON crudo
     */
    @Operation(summary = "Crear nueva cita médica desde JSON", description = "Crea una nueva cita médica para un paciente específico enviando JSON crudo.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Cita médica creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos en la solicitud")
    })
    @PostMapping("/paciente/{pacienteId}")
    public ResponseEntity<Map<String, Object>> crearCitaDesdeJson(
            @PathVariable Long pacienteId,
            @RequestBody String jsonData) {
        Map<String, Object> response = new HashMap<>();
        try {
            LOGGER.info("Creando cita medica para paciente {} con JSON crudo", pacienteId);
            CitaMedicaDTO citaCreada = citaMedicaService.crearCitaDesdeJson(pacienteId, jsonData);
            response.put(SUCCESS, true);
            response.put("data", citaCreada);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            LOGGER.error("Error creando cita medica desde JSON: {}", e.getMessage());
            response.put(SUCCESS, false);
            response.put(ERROR, "Datos inválidos: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            LOGGER.error("Error inesperado creando cita medica desde JSON: {}", e.getMessage(), e);
            response.put(SUCCESS, false);
            response.put(ERROR, "Error interno: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtener cita por ID
     */
    @Operation(summary = "Obtener cita por ID", description = "Devuelve una cita médica específica según su ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cita médica encontrada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Cita médica no encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerCita(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            CitaMedicaDTO cita = citaMedicaService.obtenerCitaPorId(id);
            response.put(SUCCESS, true);
            response.put("data", cita);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, CITA_NO_ENCONTRADA + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener citas por paciente
     */
    @Operation(summary = "Obtener citas por paciente", description = "Devuelve una lista paginada de citas médicas para un paciente específico.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Citas médicas obtenidas exitosamente")
    })
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<Map<String, Object>> obtenerCitasPorPaciente(
            @PathVariable Long pacienteId,
            @PageableDefault(size = 20) Pageable pageable) {
        Map<String, Object> response = new HashMap<>();
        try {
            Page<CitaMedicaDTO> citas = citaMedicaService.obtenerCitasPorPaciente(pacienteId, pageable);
            response.put(SUCCESS, true);
            response.put("data", citas);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Paciente no encontrado: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener citas activas por paciente
     */
    @Operation(summary = "Obtener citas activas por paciente", description = "Devuelve una lista de citas médicas activas para un paciente específico.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Citas médicas obtenidas exitosamente")
    })
    @GetMapping("/paciente/{pacienteId}/activas")
    public ResponseEntity<Map<String, Object>> obtenerCitasActivasPorPaciente(@PathVariable Long pacienteId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<CitaMedicaDTO> citas = citaMedicaService.obtenerCitasActivasPorPaciente(pacienteId);
            response.put(SUCCESS, true);
            response.put("data", citas);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Paciente no encontrado: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Actualizar cita médica
     */
    @Operation(summary = "Actualizar cita médica", description = "Actualiza una cita médica específica enviando JSON crudo.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cita médica actualizada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Cita médica no encontrada")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizarCita(
            @PathVariable Long id,
            @RequestBody String jsonData) {
        Map<String, Object> response = new HashMap<>();
        try {
            CitaMedicaDTO citaActualizada = citaMedicaService.actualizarCita(id, jsonData);
            response.put(SUCCESS, true);
            response.put("data", citaActualizada);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, CITA_NO_ENCONTRADA + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener todas las citas activas
     */
    @Operation(summary = "Obtener todas las citas activas", description = "Devuelve una lista paginada de todas las citas médicas activas.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Citas médicas obtenidas exitosamente")
    })
    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerTodasCitasActivas(
            @PageableDefault(size = 20) Pageable pageable) {
        Map<String, Object> response = new HashMap<>();
        try {
            Page<CitaMedicaDTO> citas = citaMedicaService.obtenerTodasCitasActivas(pageable);
            response.put(SUCCESS, true);
            response.put("data", citas);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LOGGER.error("Error obteniendo todas las citas activas: {}", e.getMessage(), e);
            response.put(SUCCESS, false);
            response.put(ERROR, "Error interno: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtener citas pendientes
     */
    @Operation(summary = "Obtener citas pendientes", description = "Devuelve una lista paginada de citas médicas pendientes (no completadas).")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Citas médicas pendientes obtenidas exitosamente")
    })
    @GetMapping("/pendientes")
    public ResponseEntity<Map<String, Object>> obtenerCitasPendientes(
            @PageableDefault(size = 20) Pageable pageable) {
        Map<String, Object> response = new HashMap<>();
        try {
            Page<CitaMedicaDTO> citas = citaMedicaService.obtenerCitasPendientes(pageable);
            response.put(SUCCESS, true);
            response.put("data", citas);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LOGGER.error("Error obteniendo citas pendientes: {}", e.getMessage(), e);
            response.put(SUCCESS, false);
            response.put(ERROR, "Error interno: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Actualizar estado de cita médica
     */
    @Operation(summary = "Actualizar estado de cita médica", description = "Actualiza el estado de una cita médica específica.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Estado de cita médica actualizado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Transición de estado no permitida"),
        @ApiResponse(responseCode = "404", description = "Cita médica no encontrada")
    })
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Map<String, Object>> actualizarEstadoCita(
            @PathVariable Long id,
            @RequestParam String estado) {
        Map<String, Object> response = new HashMap<>();
        try {
            LOGGER.info("Actualizando estado de cita {} a {}", id, estado);
            CitaMedicaDTO citaActualizada = citaMedicaService.actualizarEstadoCita(id, estado);
            response.put(SUCCESS, true);
            response.put("data", citaActualizada);
            response.put("message", "Estado de cita médica actualizado exitosamente.");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            LOGGER.error("Error actualizando estado de cita: {}", e.getMessage());
            response.put(SUCCESS, false);
            response.put(ERROR, e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            LOGGER.error("Error inesperado actualizando estado de cita: {}", e.getMessage(), e);
            response.put(SUCCESS, false);
            response.put(ERROR, "Error interno: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Eliminar cita médica (soft delete)
     */
    @Operation(summary = "Eliminar cita médica", description = "Elimina una cita médica específica (soft delete).")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Cita médica eliminada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Cita médica no encontrada")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarCita(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            citaMedicaService.eliminarCita(id);
            response.put(SUCCESS, true);
            response.put("message", "Cita médica eliminada exitosamente.");
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, CITA_NO_ENCONTRADA + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}