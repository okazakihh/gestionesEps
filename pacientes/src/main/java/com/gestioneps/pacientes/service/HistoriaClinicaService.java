package com.gestioneps.pacientes.service;

import com.gestioneps.pacientes.dto.HistoriaClinicaDTO;
import com.gestioneps.pacientes.entity.HistoriaClinica;
import com.gestioneps.pacientes.entity.Paciente;
import com.gestioneps.pacientes.repository.HistoriaClinicaRepository;
import com.gestioneps.pacientes.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class HistoriaClinicaService {

    private final HistoriaClinicaRepository historiaClinicaRepository;
    private final PacienteRepository pacienteRepository;

    @Autowired
    public HistoriaClinicaService(HistoriaClinicaRepository historiaClinicaRepository, PacienteRepository pacienteRepository) {
        this.historiaClinicaRepository = historiaClinicaRepository;
        this.pacienteRepository = pacienteRepository;
    }

    /**
     * Crear nueva historia clínica para un paciente
     */
    public HistoriaClinicaDTO crearHistoriaClinica(Long pacienteId, HistoriaClinicaDTO historiaDTO) {
        Paciente paciente = pacienteRepository.findById(pacienteId)
            .orElseThrow(() -> new IllegalArgumentException(PACIENTE_NO_ENCONTRADO + pacienteId));

        // Verificar si ya existe una historia clínica para este paciente
        if (historiaClinicaRepository.existsByPacienteAndActivaTrue(paciente)) {
            throw new IllegalArgumentException("El paciente ya tiene una historia clínica asignada");
        }

        // Generar número consecutivo
        String numeroHistoria = generarNumeroHistoria();

        HistoriaClinica historia = new HistoriaClinica();
        historia.setNumeroHistoria(numeroHistoria);
        historia.setPaciente(paciente);
        historia.setMotivoConsulta(historiaDTO.getMotivoConsulta());
        historia.setEnfermedadActual(historiaDTO.getEnfermedadActual());
        historia.setAntecedentesPersonales(historiaDTO.getAntecedentesPersonales());
        historia.setAntecedentesFamiliares(historiaDTO.getAntecedentesFamiliares());
        historia.setExamenFisico(historiaDTO.getExamenFisico());
        historia.setDiagnostico(historiaDTO.getDiagnostico());
        historia.setPlanTratamiento(historiaDTO.getPlanTratamiento());
        historia.setObservaciones(historiaDTO.getObservaciones());
        historia.setActiva(true);

        HistoriaClinica historiaGuardada = historiaClinicaRepository.save(historia);
        return convertirEntidadADTO(historiaGuardada);
    }

    /**
     * Actualizar historia clínica existente
     */
    public HistoriaClinicaDTO actualizarHistoriaClinica(Long id, HistoriaClinicaDTO historiaDTO) {
        HistoriaClinica historia = historiaClinicaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(HISTORIA_NO_ENCONTRADA + id));

        historia.setMotivoConsulta(historiaDTO.getMotivoConsulta());
        historia.setEnfermedadActual(historiaDTO.getEnfermedadActual());
        historia.setAntecedentesPersonales(historiaDTO.getAntecedentesPersonales());
        historia.setAntecedentesFamiliares(historiaDTO.getAntecedentesFamiliares());
        historia.setExamenFisico(historiaDTO.getExamenFisico());
        historia.setDiagnostico(historiaDTO.getDiagnostico());
        historia.setPlanTratamiento(historiaDTO.getPlanTratamiento());
        historia.setObservaciones(historiaDTO.getObservaciones());

        HistoriaClinica historiaActualizada = historiaClinicaRepository.save(historia);
        return convertirEntidadADTO(historiaActualizada);
    }

    /**
     * Obtener historia clínica por ID
     */
    @Transactional(readOnly = true)
    public HistoriaClinicaDTO obtenerHistoriaClinicaPorId(Long id) {
        HistoriaClinica historia = historiaClinicaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(HISTORIA_NO_ENCONTRADA + id));
        return convertirEntidadADTO(historia);
    }

    /**
     * Obtener historia clínica por paciente
     */
    @Transactional(readOnly = true)
    public HistoriaClinicaDTO obtenerHistoriaClinicaPorPaciente(Long pacienteId) {
        Paciente paciente = pacienteRepository.findById(pacienteId)
            .orElseThrow(() -> new IllegalArgumentException(PACIENTE_NO_ENCONTRADO + pacienteId));

        HistoriaClinica historia = historiaClinicaRepository.findByPacienteAndActivaTrueOrderByFechaAperturaDesc(paciente)
            .orElseThrow(() -> new IllegalArgumentException("No se encontró historia clínica activa para el paciente"));
        
        return convertirEntidadADTO(historia);
    }

    /**
     * Obtener historia clínica por número
     */
    @Transactional(readOnly = true)
    public HistoriaClinicaDTO obtenerHistoriaClinicaPorNumero(String numeroHistoria) {
        HistoriaClinica historia = historiaClinicaRepository.findByNumeroHistoria(numeroHistoria)
            .orElseThrow(() -> new IllegalArgumentException("Historia clínica no encontrada con número: " + numeroHistoria));
        return convertirEntidadADTO(historia);
    }

    /**
     * Buscar historias clínicas por diagnóstico
     */
    @Transactional(readOnly = true)
    public Page<HistoriaClinicaDTO> buscarPorDiagnostico(String diagnostico, Pageable pageable) {
        // Usamos la implementación personalizada del repositorio
        List<HistoriaClinica> historias = historiaClinicaRepository.findByDiagnosticoContaining(diagnostico);
        
        // Aplicamos paginación manualmente
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), historias.size());
        
        if (start > historias.size()) {
            return Page.empty();
        }
        
        List<HistoriaClinica> pageContent = historias.subList(start, end);
        return new PageImpl<>(
            pageContent.stream().map(this::convertirEntidadADTO).toList(),
            pageable,
            historias.size()
        );
    }

    /**
     * Obtener historias clínicas activas
     */
    @Transactional(readOnly = true)
    public Page<HistoriaClinicaDTO> obtenerHistoriasActivas(Pageable pageable) {
        Page<HistoriaClinica> historias = historiaClinicaRepository.findByActivaTrue(pageable);
        return historias.map(this::convertirEntidadADTO);
    }

    /**
     * Obtener historias clínicas por rango de fechas
     */
    @Transactional(readOnly = true)
    public Page<HistoriaClinicaDTO> obtenerHistoriasPorFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin, Pageable pageable) {
        // Obtener todas las historias en el rango de fechas
        List<HistoriaClinica> historias = historiaClinicaRepository.findByFechaAperturaBetweenAndActivaTrue(fechaInicio, fechaFin);
        
        // Aplicar paginación manualmente
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), historias.size());
        
        if (start > historias.size()) {
            return Page.empty();
        }
        
        List<HistoriaClinica> pageContent = historias.subList(start, end);
        return new PageImpl<>(
            pageContent.stream().map(this::convertirEntidadADTO).toList(),
            pageable,
            historias.size()
        );
    }

    /**
     * Desactivar historia clínica
     */
    public void desactivarHistoriaClinica(Long id) {
        HistoriaClinica historia = historiaClinicaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(HISTORIA_NO_ENCONTRADA + id));
        
        historia.setActiva(false);
        historiaClinicaRepository.save(historia);
    }

    /**
     * Verificar si un paciente tiene historia clínica
     */
    @Transactional(readOnly = true)
    public boolean pacienteTieneHistoriaClinica(Long pacienteId) {
        Paciente paciente = pacienteRepository.findById(pacienteId)
            .orElseThrow(() -> new IllegalArgumentException(PACIENTE_NO_ENCONTRADO + pacienteId));
        return historiaClinicaRepository.existsByPacienteAndActivaTrue(paciente);
    }

    /**
     * Generar número consecutivo para historia clínica
     */
    private String generarNumeroHistoria() {
        // Usamos el método del repositorio que genera el siguiente número de historia
        Long siguienteNumero = historiaClinicaRepository.generarSiguienteNumeroHistoria();
        return String.format("HC%06d", siguienteNumero);
    }

    /**
     * Convertir entidad a DTO
     */
    private HistoriaClinicaDTO convertirEntidadADTO(HistoriaClinica historia) {
        HistoriaClinicaDTO dto = new HistoriaClinicaDTO();
        
        dto.setId(historia.getId());
        dto.setNumeroHistoria(historia.getNumeroHistoria());
        dto.setPacienteId(historia.getPaciente().getId());
        dto.setPacienteNombre(historia.getPaciente().getNombreCompleto());
        dto.setPacienteDocumento(historia.getPaciente().getNumeroDocumento());
        dto.setMotivoConsulta(historia.getMotivoConsulta());
        dto.setEnfermedadActual(historia.getEnfermedadActual());
        dto.setAntecedentesPersonales(historia.getAntecedentesPersonales());
        dto.setAntecedentesFamiliares(historia.getAntecedentesFamiliares());
        dto.setExamenFisico(historia.getExamenFisico());
        dto.setDiagnosticos(historia.getDiagnosticos());
        dto.setPlanTratamiento(historia.getPlanTratamiento());
        dto.setObservaciones(historia.getObservaciones());
        dto.setActiva(historia.getActiva());
        dto.setFechaCreacion(historia.getFechaCreacion());
        dto.setFechaActualizacion(historia.getFechaActualizacion());
        dto.setNumeroConsultas((long) historia.getConsultas().size());

        return dto;
    }

    // Refactorizar para usar constantes en mensajes de excepción
    private static final String PACIENTE_NO_ENCONTRADO = "Paciente no encontrado con ID: ";
    private static final String HISTORIA_NO_ENCONTRADA = "Historia clínica no encontrada con ID: ";
}
