package com.gestioneps.pacientes.controller;

import com.gestioneps.pacientes.dto.ConsultaMedicaDTO;
import com.gestioneps.pacientes.service.ConsultaMedicaService;
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
import java.util.Map;

@Tag(name = "Consultas Médicas", description = "Gestión de consultas médicas")
@RestController
@RequestMapping("/consultas")
public class ConsultaMedicaController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ConsultaMedicaController.class);

    private final ConsultaMedicaService consultaMedicaService;

    private static final String SUCCESS = "success";
    private static final String ERROR = "error";
    private static final String CONSULTA_NO_ENCONTRADA = "Consulta médica no encontrada: ";

    public ConsultaMedicaController(ConsultaMedicaService consultaMedicaService) {
        this.consultaMedicaService = consultaMedicaService;
    }

    /**
     * Crear nueva consulta médica desde JSON crudo
     */
    @Operation(summary = "Crear nueva consulta médica desde JSON", description = "Crea una nueva consulta médica para una historia clínica específica enviando JSON crudo.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Consulta médica creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos en la solicitud")
    })
    @PostMapping("/historia/{historiaId}")
    public ResponseEntity<Map<String, Object>> crearConsultaDesdeJson(
            @PathVariable Long historiaId,
            @RequestBody String jsonData) {
        Map<String, Object> response = new HashMap<>();
        try {
            LOGGER.info("Creando consulta medica para historia {} con JSON crudo", historiaId);
            ConsultaMedicaDTO consultaCreada = consultaMedicaService.crearConsultaDesdeJson(historiaId, jsonData);
            response.put(SUCCESS, true);
            response.put("data", consultaCreada);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            LOGGER.error("Error creando consulta medica desde JSON: {}", e.getMessage());
            response.put(SUCCESS, false);
            response.put(ERROR, "Datos inválidos: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            LOGGER.error("Error inesperado creando consulta medica desde JSON: {}", e.getMessage(), e);
            response.put(SUCCESS, false);
            response.put(ERROR, "Error interno: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * Obtener consulta por ID
     */
    @Operation(summary = "Obtener consulta por ID", description = "Devuelve una consulta médica específica según su ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Consulta médica encontrada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Consulta médica no encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerConsulta(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            ConsultaMedicaDTO consulta = consultaMedicaService.obtenerConsultaPorId(id);
            response.put(SUCCESS, true);
            response.put("data", consulta);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, CONSULTA_NO_ENCONTRADA + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener consultas por historia clínica
     */
    @Operation(summary = "Obtener consultas por historia clínica", description = "Devuelve una lista paginada de consultas médicas para una historia clínica específica.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Consultas médicas obtenidas exitosamente")
    })
    @GetMapping("/historia/{historiaId}")
    public ResponseEntity<Map<String, Object>> obtenerConsultasPorHistoria(
            @PathVariable Long historiaId,
            @PageableDefault(size = 20) Pageable pageable) {
        Map<String, Object> response = new HashMap<>();
        try {
            Page<ConsultaMedicaDTO> consultas = consultaMedicaService.obtenerConsultasPorHistoria(historiaId, pageable);
            response.put(SUCCESS, true);
            response.put("data", consultas);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Historia clínica no encontrada: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }


    /**
     * Eliminar consulta médica
     */
    @Operation(summary = "Eliminar consulta médica", description = "Elimina una consulta médica específica según su ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Consulta médica eliminada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Consulta médica no encontrada")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarConsulta(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            consultaMedicaService.eliminarConsulta(id);
            response.put(SUCCESS, true);
            response.put("message", "Consulta médica eliminada exitosamente.");
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, CONSULTA_NO_ENCONTRADA + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}