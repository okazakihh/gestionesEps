package com.gestioneps.pacientes.controller;

import com.gestioneps.pacientes.dto.PacienteDTO;
import com.gestioneps.pacientes.service.PacienteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pacientes")
@CrossOrigin(origins = "*")
public class PacienteController {

    @Autowired
    private PacienteService pacienteService;

    /**
     * Crear nuevo paciente
     */
    @PostMapping
    public ResponseEntity<PacienteDTO> crearPaciente(@Valid @RequestBody PacienteDTO pacienteDTO) {
        try {
            PacienteDTO pacienteCreado = pacienteService.crearPaciente(pacienteDTO);
            return new ResponseEntity<>(pacienteCreado, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Actualizar paciente existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<PacienteDTO> actualizarPaciente(
            @PathVariable Long id, 
            @Valid @RequestBody PacienteDTO pacienteDTO) {
        try {
            PacienteDTO pacienteActualizado = pacienteService.actualizarPaciente(id, pacienteDTO);
            return ResponseEntity.ok(pacienteActualizado);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener paciente por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PacienteDTO> obtenerPaciente(@PathVariable Long id) {
        try {
            PacienteDTO paciente = pacienteService.obtenerPacientePorId(id);
            return ResponseEntity.ok(paciente);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener paciente por documento
     */
    @GetMapping("/documento/{numeroDocumento}")
    public ResponseEntity<PacienteDTO> obtenerPacientePorDocumento(@PathVariable String numeroDocumento) {
        try {
            PacienteDTO paciente = pacienteService.obtenerPacientePorDocumento(numeroDocumento);
            return ResponseEntity.ok(paciente);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Obtener todos los pacientes activos con paginación
     */
    @GetMapping
    public ResponseEntity<Page<PacienteDTO>> obtenerPacientesActivos(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<PacienteDTO> pacientes = pacienteService.obtenerPacientesActivos(pageable);
        return ResponseEntity.ok(pacientes);
    }

    /**
     * Buscar pacientes por nombre
     */
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
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivarPaciente(@PathVariable Long id) {
        try {
            pacienteService.desactivarPaciente(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Reactivar paciente
     */
    @PatchMapping("/{id}/reactivar")
    public ResponseEntity<Void> reactivarPaciente(@PathVariable Long id) {
        try {
            pacienteService.reactivarPaciente(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Verificar si existe paciente por documento
     */
    @GetMapping("/existe/{numeroDocumento}")
    public ResponseEntity<Boolean> existePaciente(@PathVariable String numeroDocumento) {
        boolean existe = pacienteService.existePacientePorDocumento(numeroDocumento);
        return ResponseEntity.ok(existe);
    }

    /**
     * Obtener estadísticas de pacientes
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<PacienteService.EstadisticasPacientes> obtenerEstadisticas() {
        PacienteService.EstadisticasPacientes estadisticas = pacienteService.obtenerEstadisticas();
        return ResponseEntity.ok(estadisticas);
    }
}
