package com.gestioneps.pacientes.controller;

import com.gestioneps.pacientes.dto.HistoriaClinicaDTO;
import com.gestioneps.pacientes.service.HistoriaClinicaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/historias-clinicas")
@CrossOrigin(origins = "*")
public class HistoriaClinicaController {

    @Autowired
    private HistoriaClinicaService historiaClinicaService;

    /**
     * Crear nueva historia clínica para un paciente
     */
    @PostMapping("/paciente/{pacienteId}")
    public ResponseEntity<HistoriaClinicaDTO> crearHistoriaClinica(
            @PathVariable Long pacienteId,
            @Valid @RequestBody HistoriaClinicaDTO historiaDTO) {
        try {
            HistoriaClinicaDTO historiaCreada = historiaClinicaService.crearHistoriaClinica(pacienteId, historiaDTO);
            return new ResponseEntity<>(historiaCreada, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Actualizar historia clínica existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<HistoriaClinicaDTO> actualizarHistoriaClinica(
            @PathVariable Long id,
            @Valid @RequestBody HistoriaClinicaDTO historiaDTO) {
        try {
            HistoriaClinicaDTO historiaActualizada = historiaClinicaService.actualizarHistoriaClinica(id, historiaDTO);
            return ResponseEntity.ok(historiaActualizada);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener historia clínica por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<HistoriaClinicaDTO> obtenerHistoriaClinica(@PathVariable Long id) {
        try {
            HistoriaClinicaDTO historia = historiaClinicaService.obtenerHistoriaClinicaPorId(id);
            return ResponseEntity.ok(historia);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener historia clínica por paciente
     */
    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<HistoriaClinicaDTO> obtenerHistoriaPorPaciente(@PathVariable Long pacienteId) {
        try {
            HistoriaClinicaDTO historia = historiaClinicaService.obtenerHistoriaClinicaPorPaciente(pacienteId);
            return ResponseEntity.ok(historia);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener historia clínica por número
     */
    @GetMapping("/numero/{numeroHistoria}")
    public ResponseEntity<HistoriaClinicaDTO> obtenerHistoriaPorNumero(@PathVariable String numeroHistoria) {
        try {
            HistoriaClinicaDTO historia = historiaClinicaService.obtenerHistoriaClinicaPorNumero(numeroHistoria);
            return ResponseEntity.ok(historia);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener todas las historias clínicas activas
     */
    @GetMapping
    public ResponseEntity<Page<HistoriaClinicaDTO>> obtenerHistoriasActivas(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<HistoriaClinicaDTO> historias = historiaClinicaService.obtenerHistoriasActivas(pageable);
        return ResponseEntity.ok(historias);
    }

    /**
     * Buscar historias clínicas por diagnóstico
     */
    @GetMapping("/buscar/diagnostico")
    public ResponseEntity<Page<HistoriaClinicaDTO>> buscarPorDiagnostico(
            @RequestParam String diagnostico,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<HistoriaClinicaDTO> historias = historiaClinicaService.buscarPorDiagnostico(diagnostico, pageable);
        return ResponseEntity.ok(historias);
    }

    /**
     * Obtener historias clínicas por rango de fechas
     */
    @GetMapping("/buscar/fechas")
    public ResponseEntity<Page<HistoriaClinicaDTO>> obtenerPorFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<HistoriaClinicaDTO> historias = historiaClinicaService.obtenerHistoriasPorFechas(fechaInicio, fechaFin, pageable);
        return ResponseEntity.ok(historias);
    }

    /**
     * Desactivar historia clínica
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivarHistoriaClinica(@PathVariable Long id) {
        try {
            historiaClinicaService.desactivarHistoriaClinica(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Verificar si un paciente tiene historia clínica
     */
    @GetMapping("/paciente/{pacienteId}/existe")
    public ResponseEntity<Boolean> pacienteTieneHistoria(@PathVariable Long pacienteId) {
        try {
            boolean tieneHistoria = historiaClinicaService.pacienteTieneHistoriaClinica(pacienteId);
            return ResponseEntity.ok(tieneHistoria);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
