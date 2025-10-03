package com.gestioneps.pacientes.service;

import com.gestioneps.pacientes.dto.ConsultaMedicaDTO;
import com.gestioneps.pacientes.entity.ConsultaMedica;
import com.gestioneps.pacientes.entity.HistoriaClinica;
import com.gestioneps.pacientes.entity.TipoConsulta;
import com.gestioneps.pacientes.repository.ConsultaMedicaRepository;
import com.gestioneps.pacientes.repository.HistoriaClinicaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ConsultaMedicaService {

    private final ConsultaMedicaRepository consultaMedicaRepository;
    private final HistoriaClinicaRepository historiaClinicaRepository;

    public ConsultaMedicaService(ConsultaMedicaRepository consultaMedicaRepository,
                                HistoriaClinicaRepository historiaClinicaRepository) {
        this.consultaMedicaRepository = consultaMedicaRepository;
        this.historiaClinicaRepository = historiaClinicaRepository;
    }

    /**
     * Crear nueva consulta médica desde JSON crudo
     */
    public ConsultaMedicaDTO crearConsultaDesdeJson(Long historiaId, String jsonData) {
        HistoriaClinica historia = historiaClinicaRepository.findById(historiaId)
            .orElseThrow(() -> new IllegalArgumentException("Historia clínica no encontrada con ID: " + historiaId));

        ConsultaMedica consulta = new ConsultaMedica();
        consulta.setDatosJson(jsonData);
        consulta.setHistoriaClinica(historia);

        ConsultaMedica consultaGuardada = consultaMedicaRepository.save(consulta);
        return convertirEntidadADto(consultaGuardada);
    }

    /**
     * Crear nueva consulta médica desde una cita
     */
    public ConsultaMedicaDTO crearConsultaDesdeCita(Long citaId, Long historiaId, String jsonData) {
        HistoriaClinica historia = historiaClinicaRepository.findById(historiaId)
            .orElseThrow(() -> new IllegalArgumentException("Historia clínica no encontrada con ID: " + historiaId));

        ConsultaMedica consulta = new ConsultaMedica();
        consulta.setDatosJson(jsonData);
        consulta.setHistoriaClinica(historia);
        consulta.setCitaId(citaId);

        ConsultaMedica consultaGuardada = consultaMedicaRepository.save(consulta);
        return convertirEntidadADto(consultaGuardada);
    }

    /**
     * Obtener consulta por ID
     */
    @Transactional(readOnly = true)
    public ConsultaMedicaDTO obtenerConsultaPorId(Long id) {
        ConsultaMedica consulta = consultaMedicaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Consulta médica no encontrada con ID: " + id));
        return convertirEntidadADto(consulta);
    }

    /**
     * Obtener consultas por historia clínica
     */
    @Transactional(readOnly = true)
    public Page<ConsultaMedicaDTO> obtenerConsultasPorHistoria(Long historiaId, Pageable pageable) {
        HistoriaClinica historia = historiaClinicaRepository.findById(historiaId)
            .orElseThrow(() -> new IllegalArgumentException("Historia clínica no encontrada con ID: " + historiaId));

        List<ConsultaMedica> consultas = consultaMedicaRepository.findByHistoriaClinicaOrderByFechaCreacionDesc(historia);

        // Aplicar paginación manualmente
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), consultas.size());

        if (start > consultas.size()) {
            return Page.empty();
        }

        List<ConsultaMedica> pageContent = consultas.subList(start, end);
        List<ConsultaMedicaDTO> dtos = pageContent.stream()
            .map(this::convertirEntidadADto)
            .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, consultas.size());
    }


    /**
     * Eliminar consulta médica
     */
    public void eliminarConsulta(Long id) {
        if (!consultaMedicaRepository.existsById(id)) {
            throw new IllegalArgumentException("Consulta médica no encontrada con ID: " + id);
        }
        consultaMedicaRepository.deleteById(id);
    }

    /**
     * Convertir entidad a DTO
     */
    private ConsultaMedicaDTO convertirEntidadADto(ConsultaMedica consulta) {
        ConsultaMedicaDTO dto = new ConsultaMedicaDTO();

        dto.setId(consulta.getId());
        dto.setHistoriaClinicaId(consulta.getHistoriaClinica().getId());
        dto.setNumeroHistoria(consulta.getHistoriaClinica().getNumeroHistoria());
        dto.setPacienteNombre(consulta.getHistoriaClinica().getPaciente().getNombreCompleto());
        dto.setDatosJson(consulta.getDatosJson());
        dto.setFechaCreacion(consulta.getFechaCreacion());
        dto.setFechaActualizacion(consulta.getFechaActualizacion());
        dto.setCitaId(consulta.getCitaId());

        return dto;
    }

}