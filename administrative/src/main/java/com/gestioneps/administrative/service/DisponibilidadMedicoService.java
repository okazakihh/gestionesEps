package com.gestioneps.administrative.service;

import com.gestioneps.administrative.dto.DisponibilidadMedicoDTO;
import com.gestioneps.administrative.entity.DisponibilidadMedico;
import com.gestioneps.administrative.repository.DisponibilidadMedicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DisponibilidadMedicoService {

    @Autowired
    private DisponibilidadMedicoRepository disponibilidadRepository;

    // Método para convertir Entidad a DTO
    private DisponibilidadMedicoDTO toDTO(DisponibilidadMedico entity) {
        DisponibilidadMedicoDTO dto = new DisponibilidadMedicoDTO();
        dto.setId(entity.getId());
        dto.setDatosJson(entity.getDatosJson());
        dto.setActivo(entity.isActivo());
        return dto;
    }

    public List<DisponibilidadMedicoDTO> getAll() {
        return disponibilidadRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<DisponibilidadMedicoDTO> getByDateRange(LocalDate start, LocalDate end) {
        // Como datos se guardan en JSON crudo, intentamos filtrar por ocurrencia de fechas en el JSON.
        ObjectMapper mapper = new ObjectMapper();
        return disponibilidadRepository.findAll().stream().filter(e -> {
            String datos = e.getDatosJson();
            if (datos == null || datos.isBlank()) return false;
            try {
                JsonNode node = mapper.readTree(datos);
                // Intentar leer campos comunes: 'fecha' o 'fechaHora'
                if (node.has("fecha")) {
                    String f = node.get("fecha").asText();
                    return f.compareTo(start.toString()) >= 0 && f.compareTo(end.toString()) <= 0;
                }
                if (node.has("fechaHora")) {
                    String f = node.get("fechaHora").asText();
                    String datePart = f.split("T")[0];
                    return datePart.compareTo(start.toString()) >= 0 && datePart.compareTo(end.toString()) <= 0;
                }
            } catch (Exception ex) {
                return false;
            }
            return false;
        }).map(this::toDTO).collect(Collectors.toList());
    }

    public DisponibilidadMedicoDTO create(DisponibilidadMedicoDTO dto) {
        DisponibilidadMedico entity = new DisponibilidadMedico();
        entity.setDatosJson(dto.getDatosJson());
        entity.setActivo(dto.isActivo());
        return toDTO(disponibilidadRepository.save(entity));
    }

    public void delete(Long id) {
        disponibilidadRepository.deleteById(id);
    }
    
    public DisponibilidadMedicoDTO getById(Long id) {
        return disponibilidadRepository.findById(id).map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Disponibilidad no encontrada con id: " + id));
    }
}
