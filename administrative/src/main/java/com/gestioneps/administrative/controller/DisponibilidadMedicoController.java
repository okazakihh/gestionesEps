package com.gestioneps.administrative.controller;

import com.gestioneps.administrative.dto.DisponibilidadMedicoDTO;
import com.gestioneps.administrative.service.DisponibilidadMedicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/disponibilidad-medico")
public class DisponibilidadMedicoController {

    @Autowired
    private DisponibilidadMedicoService disponibilidadService;

    @PostMapping
    public ResponseEntity<DisponibilidadMedicoDTO> createDisponibilidad(@RequestBody DisponibilidadMedicoDTO dto) {
        // Log received DTO for debugging
        try {
            System.out.println("[DisponibilidadMedicoController] received datosJson=" + (dto != null ? dto.getDatosJson() : "<null>"));
        } catch (Exception e) {
            // ignore logging errors
        }

        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cuerpo de la solicitud vacío");
        }
        if (dto.getDatosJson() == null || dto.getDatosJson().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Campo 'datosJson' es requerido");
        }
        try {
            return ResponseEntity.ok(disponibilidadService.create(dto));
        } catch (Exception ex) {
            // Log the exception server-side for diagnosis
            ex.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creando disponibilidad: " + ex.getMessage(), ex);
        }
    }

    @GetMapping
    public ResponseEntity<List<DisponibilidadMedicoDTO>> getDisponibilidadByDateRange(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        if (fechaInicio != null && fechaFin != null) {
            return ResponseEntity.ok(disponibilidadService.getByDateRange(fechaInicio, fechaFin));
        }
        return ResponseEntity.ok(disponibilidadService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisponibilidadMedicoDTO> getDisponibilidadById(@PathVariable Long id) {
        return ResponseEntity.ok(disponibilidadService.getById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDisponibilidad(@PathVariable Long id) {
        disponibilidadService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
