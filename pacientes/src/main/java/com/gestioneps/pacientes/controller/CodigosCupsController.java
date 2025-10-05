package com.gestioneps.pacientes.controller;

import com.gestioneps.pacientes.dto.CodigosCupsDTO;
import com.gestioneps.pacientes.service.CodigosCupsService;
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

@Tag(name = "Códigos CUPS", description = "Gestión de códigos CUPS")
@RestController
@RequestMapping("/codigos-cups")
public class CodigosCupsController {

    private static final Logger LOGGER = LoggerFactory.getLogger(CodigosCupsController.class);

    private final CodigosCupsService codigosCupsService;

    public CodigosCupsController(CodigosCupsService codigosCupsService) {
        this.codigosCupsService = codigosCupsService;
    }

    private static final String CODIGO_CUPS_NO_ENCONTRADO = "Código CUP no encontrado: ";
    private static final String SUCCESS = "success";
    private static final String ERROR = "error";

    /**
     * Crear un nuevo código CUP
     */
    @Operation(summary = "Crear un nuevo código CUP", description = "Crea un nuevo código CUP en el sistema.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Código CUP creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos en la solicitud")
    })
    @PostMapping
    public ResponseEntity<Map<String, Object>> crearCodigoCups(@Valid @RequestBody CodigosCupsDTO dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            CodigosCupsDTO creado = codigosCupsService.crearCodigoCups(dto);
            response.put(SUCCESS, true);
            response.put("data", creado);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Datos inválidos: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Actualizar código CUP
     */
    @Operation(summary = "Actualizar código CUP", description = "Actualiza un código CUP existente.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Código CUP actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Código CUP no encontrado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizarCodigoCups(
            @PathVariable Long id,
            @Valid @RequestBody CodigosCupsDTO dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            LOGGER.info("Actualizando código CUP con ID {}", id);
            CodigosCupsDTO actualizado = codigosCupsService.actualizarCodigoCups(id, dto);
            response.put(SUCCESS, true);
            response.put("data", actualizado);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            LOGGER.error("Error actualizando código CUP: {}", e.getMessage());
            response.put(SUCCESS, false);
            response.put(ERROR, CODIGO_CUPS_NO_ENCONTRADO + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            LOGGER.error("Error inesperado actualizando código CUP: {}", e.getMessage(), e);
            response.put(SUCCESS, false);
            response.put(ERROR, "Error interno: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtener código CUP por ID
     */
    @Operation(summary = "Obtener código CUP por ID", description = "Devuelve un código CUP específico según su ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Código CUP encontrado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Código CUP no encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerCodigoCups(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            CodigosCupsDTO codigoCups = codigosCupsService.obtenerCodigoCupsPorId(id);
            response.put(SUCCESS, true);
            response.put("data", codigoCups);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, CODIGO_CUPS_NO_ENCONTRADO + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener código CUP por código
     */
    @Operation(summary = "Obtener código CUP por código", description = "Devuelve un código CUP específico según su código.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Código CUP encontrado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Código CUP no encontrado")
    })
    @GetMapping("/codigo/{codigoCup}")
    public ResponseEntity<Map<String, Object>> obtenerCodigoCupsPorCodigo(@PathVariable String codigoCup) {
        Map<String, Object> response = new HashMap<>();
        try {
            CodigosCupsDTO codigoCups = codigosCupsService.obtenerCodigoCupsPorCodigo(codigoCup);
            response.put(SUCCESS, true);
            response.put("data", codigoCups);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, CODIGO_CUPS_NO_ENCONTRADO + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener todos los códigos CUP
     */
    @Operation(summary = "Obtener todos los códigos CUP", description = "Devuelve una lista paginada de todos los códigos CUP.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Códigos CUP obtenidos exitosamente")
    })
    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerTodosCodigosCups(
            @PageableDefault(size = 20) Pageable pageable) {
        Map<String, Object> response = new HashMap<>();
        Page<CodigosCupsDTO> codigosCups = codigosCupsService.obtenerTodosCodigosCups(pageable);
        response.put(SUCCESS, true);
        response.put("data", codigosCups);
        return ResponseEntity.ok(response);
    }

    /**
     * Buscar códigos CUP por nombre
     */
    @Operation(summary = "Buscar códigos CUP por nombre", description = "Devuelve una lista de códigos CUP que coinciden con el nombre dado.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de códigos CUP encontrados")
    })
    @GetMapping("/buscar/nombre")
    public ResponseEntity<Page<CodigosCupsDTO>> buscarPorNombre(
            @RequestParam String nombre,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<CodigosCupsDTO> codigosCups = codigosCupsService.buscarCodigosCupsPorNombre(nombre, pageable);
        return ResponseEntity.ok(codigosCups);
    }

    /**
     * Buscar códigos CUP por código
     */
    @Operation(summary = "Buscar códigos CUP por código", description = "Devuelve una lista de códigos CUP que coinciden con el código dado.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de códigos CUP encontrados")
    })
    @GetMapping("/buscar/codigo")
    public ResponseEntity<Page<CodigosCupsDTO>> buscarPorCodigo(
            @RequestParam String codigo,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<CodigosCupsDTO> codigosCups = codigosCupsService.buscarCodigosCupsPorCodigo(codigo, pageable);
        return ResponseEntity.ok(codigosCups);
    }

    /**
     * Búsqueda general de códigos CUP
     */
    @Operation(summary = "Búsqueda general de códigos CUP", description = "Devuelve una lista de códigos CUP que coinciden con el término de búsqueda.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de códigos CUP encontrados")
    })
    @GetMapping("/buscar")
    public ResponseEntity<Page<CodigosCupsDTO>> buscarGeneral(
            @RequestParam String termino,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<CodigosCupsDTO> codigosCups = codigosCupsService.buscarCodigosCups(termino, pageable);
        return ResponseEntity.ok(codigosCups);
    }

    /**
     * Eliminar código CUP
     */
    @Operation(summary = "Eliminar código CUP", description = "Elimina un código CUP del sistema.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Código CUP eliminado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Código CUP no encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String,Object>> eliminarCodigoCups(@PathVariable Long id) {
        Map<String,Object> response = new HashMap<>();
        try {
            codigosCupsService.eliminarCodigoCups(id);
            response.put(SUCCESS, true);
            response.put("data", null);
            response.put("message", "Código CUP eliminado");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put("message", CODIGO_CUPS_NO_ENCONTRADO + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Verificar si existe código CUP por código
     */
    @Operation(summary = "Verificar existencia de código CUP", description = "Verifica si un código CUP existe según su código.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Código CUP existe"),
        @ApiResponse(responseCode = "404", description = "Código CUP no encontrado")
    })
    @GetMapping("/existe/{codigoCup}")
    public ResponseEntity<Map<String,Object>> existeCodigoCups(@PathVariable String codigoCup) {
        Map<String,Object> response = new HashMap<>();
        boolean existe = codigosCupsService.existeCodigoCupsPorCodigo(codigoCup);
        response.put(SUCCESS, true);
        response.put("data", existe);
        return ResponseEntity.ok(response);
    }
}