package com.gestioneps.pacientes.controller;

import com.gestioneps.pacientes.dto.PacienteDTO;
import com.gestioneps.pacientes.service.PacienteService;
import com.gestioneps.pacientes.entity.TipoDocumento;
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

@Tag(name = "Pacientes", description = "Gestión de pacientes")
@RestController
@RequestMapping("/pacientes")
public class PacienteController {

    private static final Logger LOGGER = LoggerFactory.getLogger(PacienteController.class);

    private final PacienteService pacienteService;

    public PacienteController(PacienteService pacienteService) {
        this.pacienteService = pacienteService;
    }

    private static final String PACIENTE_NO_ENCONTRADO = "Paciente no encontrado: ";
    private static final String SUCCESS = "success";
    private static final String ERROR = "error";

    /**
     * Crear nuevo paciente desde JSON crudo
     */
    @Operation(summary = "Crear un nuevo paciente desde JSON", description = "Crea un nuevo paciente enviando JSON crudo con toda la información.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Paciente creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos en la solicitud")
    })
    @PostMapping
    public ResponseEntity<Map<String, Object>> crearPacienteDesdeJson(@RequestBody String datosJson) {
        Map<String, Object> response = new HashMap<>();
        try {
            PacienteDTO pacienteCreado = pacienteService.crearPacienteDesdeJson(datosJson);
            response.put(SUCCESS, true);
            response.put("data", pacienteCreado);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Datos inválidos: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Actualizar paciente desde JSON
     */
    @Operation(summary = "Actualizar paciente desde JSON", description = "Actualiza un paciente existente enviando JSON crudo.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Paciente actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Paciente no encontrado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizarPaciente(
            @PathVariable Long id,
            @RequestBody Map<String, Object> requestBody) {
        Map<String, Object> response = new HashMap<>();
        try {
            LOGGER.info("Actualizando paciente con ID {}", id);

            // Extraer datos del request
            String numeroDocumento = (String) requestBody.get("numeroDocumento");
            String tipoDocumentoStr = (String) requestBody.get("tipoDocumento");
            String datosJson = (String) requestBody.get("datosJson");
            Boolean activo = (Boolean) requestBody.get("activo");

            // Validar datos requeridos
            if (numeroDocumento == null || tipoDocumentoStr == null || datosJson == null) {
                response.put(SUCCESS, false);
                response.put(ERROR, "Datos requeridos faltantes: numeroDocumento, tipoDocumento, datosJson");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            // Actualizar paciente
            PacienteDTO pacienteActualizado = pacienteService.actualizarPacienteDesdeJson(id, datosJson);

            response.put(SUCCESS, true);
            response.put("data", pacienteActualizado);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            LOGGER.error("Error actualizando paciente: {}", e.getMessage());
            response.put(SUCCESS, false);
            response.put(ERROR, PACIENTE_NO_ENCONTRADO + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            LOGGER.error("Error inesperado actualizando paciente: {}", e.getMessage(), e);
            response.put(SUCCESS, false);
            response.put(ERROR, "Error interno: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtener paciente por ID
     */
    @Operation(summary = "Obtener paciente por ID", description = "Devuelve un paciente específico según su ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Paciente encontrado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Paciente no encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPaciente(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            PacienteDTO paciente = pacienteService.obtenerPacientePorId(id);
            response.put(SUCCESS, true);
            response.put("data", paciente);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, PACIENTE_NO_ENCONTRADO + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener paciente por documento
     */
    @Operation(summary = "Obtener paciente por documento", description = "Devuelve un paciente específico según su número de documento.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Paciente encontrado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Paciente no encontrado")
    })
    @GetMapping("/documento/{numeroDocumento}")
    public ResponseEntity<Map<String, Object>> obtenerPacientePorDocumento(@PathVariable String numeroDocumento) {
        Map<String, Object> response = new HashMap<>();
        try {
            PacienteDTO paciente = pacienteService.obtenerPacientePorDocumento(numeroDocumento);
            response.put(SUCCESS, true);
            response.put("data", paciente);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, PACIENTE_NO_ENCONTRADO + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener todos los pacientes activos con paginación
     */
    @Operation(summary = "Obtener pacientes activos", description = "Devuelve una lista paginada de todos los pacientes activos.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Pacientes obtenidos exitosamente")
    })
    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerPacientesActivos(
            @PageableDefault(size = 20) Pageable pageable) {
        Map<String, Object> response = new HashMap<>();
        Page<PacienteDTO> pacientes = pacienteService.obtenerPacientesActivos(pageable);
        response.put(SUCCESS, true);
        response.put("data", pacientes);
        return ResponseEntity.ok(response);
    }

    /**
     * Buscar pacientes por nombre
     */
    @Operation(summary = "Buscar pacientes por nombre", description = "Devuelve una lista de pacientes que coinciden con el nombre dado.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de pacientes encontrados")
    })
    @GetMapping("/buscar/nombre")
    public ResponseEntity<Page<PacienteDTO>> buscarPorNombre(
            @RequestParam String nombre,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<PacienteDTO> pacientes = pacienteService.buscarPacientesPorNombre(nombre, pageable);
        return ResponseEntity.ok(pacientes);
    }

    /**
     * Buscar pacientes por EPS
     */
    @Operation(summary = "Buscar pacientes por EPS", description = "Devuelve una lista de pacientes afiliados a la EPS dada.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de pacientes encontrados")
    })
    @GetMapping("/buscar/eps")
    public ResponseEntity<Page<PacienteDTO>> buscarPorEPS(
            @RequestParam String eps,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<PacienteDTO> pacientes = pacienteService.buscarPacientesPorEPS(eps, pageable);
        return ResponseEntity.ok(pacientes);
    }

    /**
     * Buscar pacientes por rango de edad
     */
    @Operation(summary = "Buscar pacientes por rango de edad", description = "Devuelve una lista de pacientes dentro del rango de edad especificado.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de pacientes encontrados")
    })
    @GetMapping("/buscar/edad")
    public ResponseEntity<Page<PacienteDTO>> buscarPorEdad(
            @RequestParam int edadMinima,
            @RequestParam int edadMaxima,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<PacienteDTO> pacientes = pacienteService.buscarPacientesPorEdad(edadMinima, edadMaxima, pageable);
        return ResponseEntity.ok(pacientes);
    }

    /**
     * Desactivar paciente
     */
    @Operation(summary = "Desactivar paciente", description = "Desactiva un paciente en el sistema.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Paciente desactivado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Paciente no encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String,Object>> desactivarPaciente(@PathVariable Long id) {
        Map<String,Object> response = new HashMap<>();
        try {
            pacienteService.desactivarPaciente(id);
            response.put(SUCCESS, true);
            response.put("data", null);
            response.put("message", "Paciente desactivado");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put("message", PACIENTE_NO_ENCONTRADO + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Reactivar paciente
     */
    @Operation(summary = "Reactivar paciente", description = "Reactiva un paciente desactivado en el sistema.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Paciente reactivado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Paciente no encontrado")
    })
    @PatchMapping("/{id}/reactivar")
    public ResponseEntity<Map<String,Object>> reactivarPaciente(@PathVariable Long id) {
        Map<String,Object> response = new HashMap<>();
        try {
            pacienteService.reactivarPaciente(id);
            response.put(SUCCESS, true);
            response.put("data", null);
            response.put("message", "Paciente reactivado");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put("message", PACIENTE_NO_ENCONTRADO + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Verificar si existe paciente por documento
     */
    @Operation(summary = "Verificar existencia de paciente", description = "Verifica si un paciente existe según su documento.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Paciente existe"),
        @ApiResponse(responseCode = "404", description = "Paciente no encontrado")
    })
    @GetMapping("/existe/{numeroDocumento}")
    public ResponseEntity<Map<String,Object>> existePaciente(@PathVariable String numeroDocumento) {
        Map<String,Object> response = new HashMap<>();
        boolean existe = pacienteService.existePacientePorDocumento(numeroDocumento);
        response.put(SUCCESS, true);
        response.put("data", existe);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener estadísticas de pacientes
     */
    @Operation(summary = "Obtener estadísticas de pacientes", description = "Devuelve estadísticas sobre los pacientes en el sistema.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Estadísticas de pacientes")
    })
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String,Object>> obtenerEstadisticas() {
        Map<String,Object> response = new HashMap<>();
        PacienteService.EstadisticasPacientes estadisticas = pacienteService.obtenerEstadisticas();
        response.put(SUCCESS, true);
        response.put("data", estadisticas);
        return ResponseEntity.ok(response);
    }
}
