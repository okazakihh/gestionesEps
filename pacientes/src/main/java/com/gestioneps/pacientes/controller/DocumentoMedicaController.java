package com.gestioneps.pacientes.controller;

import com.gestioneps.pacientes.dto.DocumentoMedicoDTO;
import com.gestioneps.pacientes.service.DocumentoMedicoService;
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

@Tag(name = "Documentos Médicos", description = "Gestión de documentos médicos")
@RestController
@RequestMapping("/documentos")
public class DocumentoMedicaController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DocumentoMedicaController.class);

    private final DocumentoMedicoService documentoMedicoService;

    private static final String SUCCESS = "success";
    private static final String ERROR = "error";
    private static final String DOCUMENTO_NO_ENCONTRADO = "Documento médico no encontrado: ";

    public DocumentoMedicaController(DocumentoMedicoService documentoMedicoService) {
        this.documentoMedicoService = documentoMedicoService;
    }

    /**
     * Crear nuevo documento médico
     */
    @Operation(summary = "Crear nuevo documento médico", description = "Crea un nuevo documento médico para una historia clínica específica.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Documento médico creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos en la solicitud")
    })
    @PostMapping("/historia/{historiaId}")
    public ResponseEntity<Map<String, Object>> crearDocumento(
            @PathVariable Long historiaId,
            @Valid @RequestBody DocumentoMedicoDTO documentoDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            LOGGER.info("Creando documento médico para historia {}: {}", historiaId, documentoDTO);
            DocumentoMedicoDTO documentoCreado = documentoMedicoService.crearDocumento(historiaId, documentoDTO);
            response.put(SUCCESS, true);
            response.put("data", documentoCreado);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            LOGGER.error("Error creando documento médico: {}", e.getMessage());
            response.put(SUCCESS, false);
            response.put(ERROR, "Datos inválidos: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            LOGGER.error("Error inesperado creando documento médico: {}", e.getMessage(), e);
            response.put(SUCCESS, false);
            response.put(ERROR, "Error interno: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtener documento por ID
     */
    @Operation(summary = "Obtener documento por ID", description = "Devuelve un documento médico específico según su ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Documento médico encontrado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Documento médico no encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerDocumento(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            DocumentoMedicoDTO documento = documentoMedicoService.obtenerDocumentoPorId(id);
            response.put(SUCCESS, true);
            response.put("data", documento);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, DOCUMENTO_NO_ENCONTRADO + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener documentos por historia clínica
     */
    @Operation(summary = "Obtener documentos por historia clínica", description = "Devuelve una lista paginada de documentos médicos para una historia clínica específica.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Documentos médicos obtenidos exitosamente")
    })
    @GetMapping("/historia/{historiaId}")
    public ResponseEntity<Map<String, Object>> obtenerDocumentosPorHistoria(
            @PathVariable Long historiaId,
            @PageableDefault(size = 20) Pageable pageable) {
        Map<String, Object> response = new HashMap<>();
        try {
            Page<DocumentoMedicoDTO> documentos = documentoMedicoService.obtenerDocumentosPorHistoria(historiaId, pageable);
            response.put(SUCCESS, true);
            response.put("data", documentos);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, "Historia clínica no encontrada: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Actualizar documento médico
     */
    @Operation(summary = "Actualizar documento médico", description = "Actualiza los datos de un documento médico existente.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Documento médico actualizado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Documento médico no encontrado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizarDocumento(
            @PathVariable Long id,
            @Valid @RequestBody DocumentoMedicoDTO documentoDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            DocumentoMedicoDTO documentoActualizado = documentoMedicoService.actualizarDocumento(id, documentoDTO);
            response.put(SUCCESS, true);
            response.put("data", documentoActualizado);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, DOCUMENTO_NO_ENCONTRADO + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Eliminar documento médico
     */
    @Operation(summary = "Eliminar documento médico", description = "Elimina un documento médico específico según su ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Documento médico eliminado exitosamente"),
        @ApiResponse(responseCode = "404", description = "Documento médico no encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarDocumento(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            documentoMedicoService.eliminarDocumento(id);
            response.put(SUCCESS, true);
            response.put("message", "Documento médico eliminado exitosamente.");
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            response.put(SUCCESS, false);
            response.put(ERROR, DOCUMENTO_NO_ENCONTRADO + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}