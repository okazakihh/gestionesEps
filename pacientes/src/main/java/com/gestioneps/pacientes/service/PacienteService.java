package com.gestioneps.pacientes.service;

import com.gestioneps.pacientes.dto.PacienteDTO;
import com.gestioneps.pacientes.entity.*;
import com.gestioneps.pacientes.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class PacienteService {

    @Autowired
    private PacienteRepository pacienteRepository;

    /**
     * Crear un nuevo paciente
     */
    public PacienteDTO crearPaciente(PacienteDTO pacienteDTO) {
        // Validar que no exista un paciente con el mismo documento
        if (pacienteRepository.existsByNumeroDocumento(pacienteDTO.getNumeroDocumento())) {
            throw new IllegalArgumentException("Ya existe un paciente con el documento: " + pacienteDTO.getNumeroDocumento());
        }

        Paciente paciente = convertirDTOAEntidad(pacienteDTO);
        paciente.setActivo(true);
        
        Paciente pacienteGuardado = pacienteRepository.save(paciente);
        return convertirEntidadADTO(pacienteGuardado);
    }

    /**
     * Actualizar un paciente existente
     */
    public PacienteDTO actualizarPaciente(Long id, PacienteDTO pacienteDTO) {
        Paciente pacienteExistente = pacienteRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado con ID: " + id));

        // Validar que no exista otro paciente con el mismo documento
        Optional<Paciente> pacienteConMismoDocumento = pacienteRepository.findByNumeroDocumento(pacienteDTO.getNumeroDocumento());
        if (pacienteConMismoDocumento.isPresent() && !pacienteConMismoDocumento.get().getId().equals(id)) {
            throw new IllegalArgumentException("Ya existe otro paciente con el documento: " + pacienteDTO.getNumeroDocumento());
        }

        // Actualizar campos básicos
        pacienteExistente.setNumeroDocumento(pacienteDTO.getNumeroDocumento());
        pacienteExistente.setTipoDocumento(pacienteDTO.getTipoDocumento());
        
        // Actualizar información agrupada
        pacienteExistente.setInformacionPersonal(pacienteDTO.getInformacionPersonal());
        pacienteExistente.setInformacionContacto(pacienteDTO.getInformacionContacto());
        pacienteExistente.setInformacionMedica(pacienteDTO.getInformacionMedica());
        pacienteExistente.setContactoEmergencia(pacienteDTO.getContactoEmergencia());

        if (pacienteDTO.getActivo() != null) {
            pacienteExistente.setActivo(pacienteDTO.getActivo());
        }

        Paciente pacienteActualizado = pacienteRepository.save(pacienteExistente);
        return convertirEntidadADTO(pacienteActualizado);
    }

    /**
     * Obtener paciente por ID
     */
    @Transactional(readOnly = true)
    public PacienteDTO obtenerPacientePorId(Long id) {
        Paciente paciente = pacienteRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado con ID: " + id));
        return convertirEntidadADTO(paciente);
    }

    /**
     * Obtener paciente por número de documento
     */
    @Transactional(readOnly = true)
    public PacienteDTO obtenerPacientePorDocumento(String numeroDocumento) {
        Paciente paciente = pacienteRepository.findByNumeroDocumento(numeroDocumento)
            .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado con documento: " + numeroDocumento));
        return convertirEntidadADTO(paciente);
    }

    /**
     * Buscar pacientes por nombre
     */
    @Transactional(readOnly = true)
    public Page<PacienteDTO> buscarPacientesPorNombre(String nombre, Pageable pageable) {
        Page<Paciente> pacientes = pacienteRepository.findByNombreContainingIgnoreCase(nombre, pageable);
        return pacientes.map(this::convertirEntidadADTO);
    }

    /**
     * Obtener todos los pacientes activos
     */
    @Transactional(readOnly = true)
    public Page<PacienteDTO> obtenerPacientesActivos(Pageable pageable) {
        Page<Paciente> pacientes = pacienteRepository.findByActivoTrue(pageable);
        return pacientes.map(this::convertirEntidadADTO);
    }

    /**
     * Buscar pacientes por EPS
     */
    @Transactional(readOnly = true)
    public Page<PacienteDTO> buscarPacientesPorEPS(String eps, Pageable pageable) {
        Page<Paciente> pacientes = pacienteRepository.findByEpsContainingIgnoreCase(eps, pageable);
        return pacientes.map(this::convertirEntidadADTO);
    }

    /**
     * Buscar pacientes por rango de edad
     */
    @Transactional(readOnly = true)
    public Page<PacienteDTO> buscarPacientesPorEdad(int edadMinima, int edadMaxima, Pageable pageable) {
        Page<Paciente> pacientes = pacienteRepository.findByEdadBetween(edadMinima, edadMaxima, pageable);
        return pacientes.map(this::convertirEntidadADTO);
    }

    /**
     * Desactivar paciente (soft delete)
     */
    public void desactivarPaciente(Long id) {
        Paciente paciente = pacienteRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado con ID: " + id));
        
        paciente.setActivo(false);
        pacienteRepository.save(paciente);
    }

    /**
     * Reactivar paciente
     */
    public void reactivarPaciente(Long id) {
        Paciente paciente = pacienteRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado con ID: " + id));
        
        paciente.setActivo(true);
        pacienteRepository.save(paciente);
    }

    /**
     * Verificar si existe un paciente por documento
     */
    @Transactional(readOnly = true)
    public boolean existePacientePorDocumento(String numeroDocumento) {
        return pacienteRepository.existsByNumeroDocumento(numeroDocumento);
    }

    /**
     * Obtener estadísticas de pacientes
     */
    @Transactional(readOnly = true)
    public EstadisticasPacientes obtenerEstadisticas() {
        long totalPacientes = pacienteRepository.count();
        long pacientesActivos = pacienteRepository.countByActivoTrue();
        long pacientesInactivos = totalPacientes - pacientesActivos;

        return new EstadisticasPacientes(totalPacientes, pacientesActivos, pacientesInactivos);
    }

    // Métodos de conversión
    private Paciente convertirDTOAEntidad(PacienteDTO dto) {
        Paciente paciente = new Paciente();
        
        paciente.setNumeroDocumento(dto.getNumeroDocumento());
        paciente.setTipoDocumento(dto.getTipoDocumento());
        paciente.setInformacionPersonal(dto.getInformacionPersonal());
        paciente.setInformacionContacto(dto.getInformacionContacto());
        paciente.setInformacionMedica(dto.getInformacionMedica());
        paciente.setContactoEmergencia(dto.getContactoEmergencia());
        
        if (dto.getActivo() != null) {
            paciente.setActivo(dto.getActivo());
        }

        return paciente;
    }

    private PacienteDTO convertirEntidadADTO(Paciente paciente) {
        PacienteDTO dto = new PacienteDTO();
        
        dto.setId(paciente.getId());
        dto.setNumeroDocumento(paciente.getNumeroDocumento());
        dto.setTipoDocumento(paciente.getTipoDocumento());
        dto.setInformacionPersonal(paciente.getInformacionPersonal());
        dto.setInformacionContacto(paciente.getInformacionContacto());
        dto.setInformacionMedica(paciente.getInformacionMedica());
        dto.setContactoEmergencia(paciente.getContactoEmergencia());
        dto.setActivo(paciente.getActivo());
        dto.setFechaCreacion(paciente.getFechaCreacion());
        dto.setFechaActualizacion(paciente.getFechaActualizacion());
        
        // Campos calculados
        dto.setNombreCompleto(paciente.getNombreCompleto());
        dto.setEdad(paciente.getEdad());
        dto.setNumeroHistoriasClinicas((long) paciente.getHistoriasClinicas().size());

        return dto;
    }

    // Clase interna para estadísticas
    public static class EstadisticasPacientes {
        private final long totalPacientes;
        private final long pacientesActivos;
        private final long pacientesInactivos;

        public EstadisticasPacientes(long totalPacientes, long pacientesActivos, long pacientesInactivos) {
            this.totalPacientes = totalPacientes;
            this.pacientesActivos = pacientesActivos;
            this.pacientesInactivos = pacientesInactivos;
        }

        public long getTotalPacientes() { return totalPacientes; }
        public long getPacientesActivos() { return pacientesActivos; }
        public long getPacientesInactivos() { return pacientesInactivos; }
    }
}
