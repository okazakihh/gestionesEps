package com.gestioneps.pacientes.service;

import com.gestioneps.pacientes.dto.CitaMedicaDTO;
import com.gestioneps.pacientes.entity.CitaMedica;
import com.gestioneps.pacientes.entity.Paciente;
import com.gestioneps.pacientes.repository.CitaMedicaRepository;
import com.gestioneps.pacientes.repository.PacienteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CitaMedicaService {

    private final CitaMedicaRepository citaMedicaRepository;
    private final PacienteRepository pacienteRepository;

    public CitaMedicaService(CitaMedicaRepository citaMedicaRepository, PacienteRepository pacienteRepository) {
        this.citaMedicaRepository = citaMedicaRepository;
        this.pacienteRepository = pacienteRepository;
    }

    public CitaMedicaDTO crearCitaDesdeJson(Long pacienteId, String jsonData) {
        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado: " + pacienteId));

        CitaMedica cita = new CitaMedica();
        cita.setPaciente(paciente);
        cita.setDatosJson(jsonData);
        cita.setActiva(true);

        CitaMedica saved = citaMedicaRepository.save(cita);
        return mapToDTO(saved);
    }

    public CitaMedicaDTO obtenerCitaPorId(Long id) {
        CitaMedica cita = citaMedicaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cita médica no encontrada: " + id));
        return mapToDTO(cita);
    }

    public Page<CitaMedicaDTO> obtenerCitasPorPaciente(Long pacienteId, Pageable pageable) {
        return citaMedicaRepository.findByPacienteId(pacienteId, pageable)
                .map(this::mapToDTO);
    }

    public List<CitaMedicaDTO> obtenerCitasActivasPorPaciente(Long pacienteId) {
        return citaMedicaRepository.findActiveByPacienteId(pacienteId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CitaMedicaDTO actualizarCita(Long id, String jsonData) {
        CitaMedica cita = citaMedicaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cita médica no encontrada: " + id));

        cita.setDatosJson(jsonData);
        CitaMedica updated = citaMedicaRepository.save(cita);
        return mapToDTO(updated);
    }

    public void eliminarCita(Long id) {
        CitaMedica cita = citaMedicaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cita médica no encontrada: " + id));
        cita.setActiva(false);
        citaMedicaRepository.save(cita);
    }

    public CitaMedicaDTO actualizarEstadoCita(Long id, String nuevoEstado) {
        CitaMedica cita = citaMedicaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cita médica no encontrada: " + id));

        // Validar transiciones de estado permitidas
        String estadoActual = obtenerEstadoActual(cita);
        validarTransicionEstado(estadoActual, nuevoEstado);

        // Actualizar el estado en datosJson
        String datosJsonActualizados = actualizarEstadoEnJson(cita.getDatosJson(), nuevoEstado);
        cita.setDatosJson(datosJsonActualizados);

        CitaMedica citaActualizada = citaMedicaRepository.save(cita);
        return mapToDTO(citaActualizada);
    }

    private String obtenerEstadoActual(CitaMedica cita) {
        try {
            if (cita.getDatosJson() != null) {
                var data = new com.fasterxml.jackson.databind.ObjectMapper().readTree(cita.getDatosJson());
                return data.get("estado").asText("PROGRAMADO");
            }
        } catch (Exception e) {
            // Fallback
        }
        return "PROGRAMADO";
    }

    private void validarTransicionEstado(String estadoActual, String nuevoEstado) {
        // Definir transiciones permitidas
        switch (estadoActual) {
            case "PROGRAMADO":
                if (!nuevoEstado.equals("EN_SALA") && !nuevoEstado.equals("NO_SE_PRESENTO")) {
                    throw new IllegalArgumentException("Desde PROGRAMADO solo se puede cambiar a EN_SALA o NO_SE_PRESENTO");
                }
                break;
            case "EN_SALA":
                if (!nuevoEstado.equals("ATENDIDO")) {
                    throw new IllegalArgumentException("Desde EN_SALA solo se puede cambiar a ATENDIDO");
                }
                break;
            case "ATENDIDO":
            case "NO_SE_PRESENTO":
                throw new IllegalArgumentException("No se puede cambiar el estado de una cita " + estadoActual);
            default:
                throw new IllegalArgumentException("Estado actual no válido: " + estadoActual);
        }
    }

    private String actualizarEstadoEnJson(String datosJson, String nuevoEstado) {
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.node.ObjectNode data;

            if (datosJson != null && !datosJson.trim().isEmpty()) {
                data = (com.fasterxml.jackson.databind.node.ObjectNode) mapper.readTree(datosJson);
            } else {
                data = mapper.createObjectNode();
            }

            data.put("estado", nuevoEstado);
            return mapper.writeValueAsString(data);
        } catch (Exception e) {
            throw new RuntimeException("Error al actualizar estado en JSON", e);
        }
    }

    public Page<CitaMedicaDTO> obtenerTodasCitasActivas(Pageable pageable) {
        return citaMedicaRepository.findAllActive(pageable)
                .map(this::mapToDTO);
    }

    public Page<CitaMedicaDTO> obtenerCitasPendientes(Pageable pageable) {
        return citaMedicaRepository.findPendingAppointments(pageable)
                .map(this::mapToDTO);
    }

    private CitaMedicaDTO mapToDTO(CitaMedica cita) {
        CitaMedicaDTO dto = new CitaMedicaDTO();
        dto.setId(cita.getId());
        dto.setPacienteId(cita.getPaciente().getId());
        dto.setPacienteNombre(cita.getPaciente().getNombreCompleto());
        dto.setDatosJson(cita.getDatosJson());
        dto.setActiva(cita.getActiva());
        dto.setFechaCreacion(cita.getFechaCreacion());
        dto.setFechaActualizacion(cita.getFechaActualizacion());
        return dto;
    }
}