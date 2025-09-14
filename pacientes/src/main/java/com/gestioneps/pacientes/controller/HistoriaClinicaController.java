package com.gestioneps.pacientes.controller;

import com.gestioneps.pacientes.dto.HistoriaClinicaDTO;
import com.gestioneps.pacientes.service.HistoriaClinicaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Tag(name = "Historias Clínicas", description = "Gestión de historias clínicas")
@RestController
@RequestMapping("/api/historias-clinicas")
@CrossOrigin(origins = "*")
public class HistoriaClinicaController {

    private final HistoriaClinicaService historiaClinicaService;

    private static final String SUCCESS = "success";
    private static final String ERROR = "error";
    private static final String HISTORIA_NO_ENCONTRADA = "Historia clínica no encontrada: ";

    public HistoriaClinicaController(HistoriaClinicaService historiaClinicaService) {
        this.historiaClinicaService = historiaClinicaService;
    }

    /**
     * Crear nueva historia clínica para un paciente
     */
    @Operation(summary = "Crear nueva historia clínica", description = "Crea una nueva historia clínica para un paciente específico.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Historia clínica creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos en la solicitud")
    })
    @PostMapping("/paciente/{pacienteId}")
    public ResponseEntity<Map<String, Object>> crearHistoriaClinica(
            @PathVariable Long pacienteId,
            @Valid @RequestBody HistoriaClinicaDTO historiaDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            HistoriaClinicaDTO historiaCreada = historiaClinicaService.crearHistoriaClinica(pacienteId, historiaDTO);
            response.put(SUCCESS, true);
            response.put("data", historiaCreada);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Datos inválidos: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Actualizar historia clínica existente
     */
    @Operation(summary = "Actualizar historia clínica", description = "Actualiza los datos de una historia clínica existente.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Historia clínica actualizada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Historia clínica no encontrada")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizarHistoriaClinica(
            @PathVariable Long id,
            @Valid @RequestBody HistoriaClinicaDTO historiaDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            HistoriaClinicaDTO historiaActualizada = historiaClinicaService.actualizarHistoriaClinica(id, historiaDTO);
            response.put(SUCCESS, true);
            response.put("data", historiaActualizada);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, HISTORIA_NO_ENCONTRADA + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener historia clínica por ID
     */
    @Operation(summary = "Obtener historia clínica por ID", description = "Devuelve una historia clínica específica según su ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Historia clínica encontrada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Historia clínica no encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerHistoriaClinica(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            HistoriaClinicaDTO historia = historiaClinicaService.obtenerHistoriaClinicaPorId(id);
            response.put(SUCCESS, true);
            response.put("data", historia);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, HISTORIA_NO_ENCONTRADA + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener historia clínica por paciente
     */
    @Operation(summary = "Obtener historia clínica por paciente", description = "Devuelve la historia clínica de un paciente específico.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Historia clínica encontrada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Historia clínica no encontrada")
    })
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<Map<String, Object>> obtenerHistoriaPorPaciente(@PathVariable Long pacienteId) {
        Map<String, Object> response = new HashMap<>();
        try {
            HistoriaClinicaDTO historia = historiaClinicaService.obtenerHistoriaClinicaPorPaciente(pacienteId);
            response.put(SUCCESS, true);
            response.put("data", historia);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, HISTORIA_NO_ENCONTRADA + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener historia clínica por número
     */
    @Operation(summary = "Obtener historia clínica por número", description = "Devuelve una historia clínica específica según su número.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Historia clínica encontrada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Historia clínica no encontrada")
    })
    @GetMapping("/numero/{numeroHistoria}")
    public ResponseEntity<Map<String, Object>> obtenerHistoriaPorNumero(@PathVariable String numeroHistoria) {
        Map<String, Object> response = new HashMap<>();
        try {
            HistoriaClinicaDTO historia = historiaClinicaService.obtenerHistoriaClinicaPorNumero(numeroHistoria);
            response.put(SUCCESS, true);
            response.put("data", historia);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, HISTORIA_NO_ENCONTRADA + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener todas las historias clínicas activas
     */
    @Operation(summary = "Obtener historias clínicas activas", description = "Devuelve una lista paginada de todas las historias clínicas activas.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Historias clínicas obtenidas exitosamente")
    })
    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerHistoriasActivas(
            @PageableDefault(size = 20) Pageable pageable) {
        Map<String, Object> response = new HashMap<>();
        Page<HistoriaClinicaDTO> historias = historiaClinicaService.obtenerHistoriasActivas(pageable);
        response.put(SUCCESS, true);
        response.put("data", historias);
        return ResponseEntity.ok(response);
    }

    /**
     * Buscar historias clínicas por diagnóstico
     */
    @Operation(summary = "Buscar historias clínicas por diagnóstico", description = "Devuelve una lista paginada de historias clínicas que coinciden con el diagnóstico proporcionado.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Historias clínicas obtenidas exitosamente")
    })
    @GetMapping("/buscar/diagnostico")
    public ResponseEntity<Map<String, Object>> buscarPorDiagnostico(
            @RequestParam String diagnostico,
            @PageableDefault(size = 20) Pageable pageable) {
        Map<String, Object> response = new HashMap<>();
        Page<HistoriaClinicaDTO> historias = historiaClinicaService.buscarPorDiagnostico(diagnostico, pageable);
        response.put(SUCCESS, true);
        response.put("data", historias);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener historias clínicas por rango de fechas
     */
    @Operation(summary = "Obtener historias clínicas por rango de fechas", description = "Devuelve una lista paginada de historias clínicas dentro del rango de fechas proporcionado.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Historias clínicas obtenidas exitosamente")
    })
    @GetMapping("/buscar/fechas")
    public ResponseEntity<Map<String, Object>> obtenerPorFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin,
            @PageableDefault(size = 20) Pageable pageable) {
        Map<String, Object> response = new HashMap<>();
        Page<HistoriaClinicaDTO> historias = historiaClinicaService.obtenerHistoriasPorFechas(fechaInicio, fechaFin, pageable);
        response.put(SUCCESS, true);
        response.put("data", historias);
        return ResponseEntity.ok(response);
    }

    /**
     * Desactivar historia clínica
     */
    @Operation(summary = "Desactivar historia clínica", description = "Desactiva una historia clínica específica según su ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Historia clínica desactivada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Historia clínica no encontrada")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> desactivarHistoriaClinica(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            historiaClinicaService.desactivarHistoriaClinica(id);
            response.put(SUCCESS, true);
            response.put("message", "Historia clínica desactivada exitosamente.");
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, HISTORIA_NO_ENCONTRADA + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Verificar si un paciente tiene historia clínica
     */
    @Operation(summary = "Verificar si un paciente tiene historia clínica", description = "Devuelve un booleano indicando si un paciente tiene una historia clínica registrada.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Verificación realizada exitosamente"),
        @ApiResponse(responseCode = "404", description = "Paciente no encontrado")
    })
    @GetMapping("/paciente/{pacienteId}/existe")
    public ResponseEntity<Map<String, Object>> pacienteTieneHistoria(@PathVariable Long pacienteId) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean tieneHistoria = historiaClinicaService.pacienteTieneHistoriaClinica(pacienteId);
            response.put(SUCCESS, true);
            response.put("data", tieneHistoria);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Paciente no encontrado: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}
