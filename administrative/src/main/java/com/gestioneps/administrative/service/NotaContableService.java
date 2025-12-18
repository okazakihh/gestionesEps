package com.gestioneps.administrative.service;

import com.gestioneps.administrative.dto.NotaContableDTO;
import com.gestioneps.administrative.entity.NotaContable;
import com.gestioneps.administrative.repository.NotaContableRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service para gestión de notas contables (crédito y débito)
 */
@Service
@Transactional
public class NotaContableService {

    private final NotaContableRepository notaContableRepository;

    public NotaContableService(NotaContableRepository notaContableRepository) {
        this.notaContableRepository = notaContableRepository;
    }

    private static final String NOTA_NO_ENCONTRADA = "Nota contable no encontrada con ID: ";

    /**
     * Crear nueva nota contable desde JSON crudo
     * 
     * @param jsonData JSON con todos los datos de la nota
     * @return DTO de la nota creada
     */
    public NotaContableDTO crearNotaDesdeJson(String jsonData) {
        NotaContable nota = new NotaContable();
        nota.setJsonData(jsonData);
        nota.setActivo(true);

        NotaContable notaGuardada = notaContableRepository.save(nota);
        return convertirEntidadADTO(notaGuardada);
    }

    /**
     * Obtener nota contable por ID
     * 
     * @param id ID de la nota
     * @return DTO de la nota
     */
    @Transactional(readOnly = true)
    public NotaContableDTO obtenerNotaPorId(Long id) {
        NotaContable nota = notaContableRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(NOTA_NO_ENCONTRADA + id));
        return convertirEntidadADTO(nota);
    }

    /**
     * Obtener todas las notas activas (sin paginación)
     * 
     * @return Lista de DTOs de notas
     */
    @Transactional(readOnly = true)
    public List<NotaContableDTO> obtenerTodasLasNotas() {
        List<NotaContable> notas = notaContableRepository.findByActivoTrueOrderByFechaCreacionDesc();
        return notas.stream()
            .map(this::convertirEntidadADTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtener notas activas con paginación
     * 
     * @param pageable Configuración de paginación
     * @return Página de DTOs de notas
     */
    @Transactional(readOnly = true)
    public Page<NotaContableDTO> obtenerNotasActivas(Pageable pageable) {
        Page<NotaContable> notas = notaContableRepository.findByActivoTrue(pageable);
        return notas.map(this::convertirEntidadADTO);
    }

    /**
     * Obtener notas por rango de fechas
     * 
     * @param inicio Fecha inicial
     * @param fin Fecha final
     * @return Lista de DTOs de notas
     */
    @Transactional(readOnly = true)
    public List<NotaContableDTO> obtenerNotasPorRangoFechas(LocalDateTime inicio, LocalDateTime fin) {
        List<NotaContable> notas = notaContableRepository.findByFechaCreacionBetween(inicio, fin);
        return notas.stream()
            .map(this::convertirEntidadADTO)
            .collect(Collectors.toList());
    }

    /**
     * Actualizar nota contable
     * 
     * @param id ID de la nota
     * @param jsonData Nuevo JSON con datos actualizados
     * @return DTO de la nota actualizada
     */
    public NotaContableDTO actualizarNota(Long id, String jsonData) {
        NotaContable nota = notaContableRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(NOTA_NO_ENCONTRADA + id));

        nota.setJsonData(jsonData);
        NotaContable notaActualizada = notaContableRepository.save(nota);
        return convertirEntidadADTO(notaActualizada);
    }

    /**
     * Desactivar nota contable (soft delete)
     * 
     * @param id ID de la nota a desactivar
     */
    public void desactivarNota(Long id) {
        NotaContable nota = notaContableRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(NOTA_NO_ENCONTRADA + id));

        nota.setActivo(false);
        notaContableRepository.save(nota);
    }

    /**
     * Contar notas activas
     * 
     * @return Cantidad de notas activas
     */
    @Transactional(readOnly = true)
    public long contarNotasActivas() {
        return notaContableRepository.countByActivoTrue();
    }

    /**
     * Convertir entidad a DTO
     */
    private NotaContableDTO convertirEntidadADTO(NotaContable nota) {
        NotaContableDTO dto = new NotaContableDTO();
        dto.setId(nota.getId());
        dto.setJsonData(nota.getJsonData());
        dto.setActivo(nota.getActivo());
        dto.setFechaCreacion(nota.getFechaCreacion());
        dto.setFechaActualizacion(nota.getFechaActualizacion());
        return dto;
    }
}
