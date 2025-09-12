package com.gestioneps.pacientes.repository;

import com.gestioneps.pacientes.entity.HistoriaClinica;
import com.gestioneps.pacientes.entity.Paciente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HistoriaClinicaRepository extends JpaRepository<HistoriaClinica, Long> {

    /**
     * Buscar historia clínica por número
     */
    Optional<HistoriaClinica> findByNumeroHistoria(String numeroHistoria);

    /**
     * Buscar historias clínicas por paciente
     */
    List<HistoriaClinica> findByPacienteAndActivaTrue(Paciente paciente);

    /**
     * Buscar historia clínica activa por paciente
     */
    Optional<HistoriaClinica> findByPacienteAndActivaTrueOrderByFechaAperturaDesc(Paciente paciente);

    /**
     * Buscar historias clínicas por médico responsable
     */
    List<HistoriaClinica> findByMedicoResponsableContainingIgnoreCaseAndActivaTrue(String medicoResponsable);

    /**
     * Buscar historias clínicas por rango de fechas
     */
    List<HistoriaClinica> findByFechaAperturaBetweenAndActivaTrue(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    /**
     * Verificar si existe historia clínica para un paciente
     */
    boolean existsByPacienteAndActivaTrue(Paciente paciente);

    /**
     * Contar historias clínicas activas
     */
    long countByActivaTrue();

    /**
     * Buscar historias clínicas con consultas recientes
     */
    @Query("SELECT DISTINCT h FROM HistoriaClinica h JOIN h.consultas c " +
           "WHERE h.activa = true AND c.fechaConsulta >= :fechaDesde")
    List<HistoriaClinica> findHistoriasConConsultasRecientes(@Param("fechaDesde") LocalDateTime fechaDesde);

    /**
     * Buscar historias clínicas por diagnóstico
     */
    @Query("SELECT DISTINCT h FROM HistoriaClinica h JOIN h.consultas c " +
           "WHERE h.activa = true AND " +
           "(LOWER(c.diagnosticoPrincipal) LIKE LOWER(CONCAT('%', :diagnostico, '%')) OR " +
           "LOWER(c.diagnosticosSecundarios) LIKE LOWER(CONCAT('%', :diagnostico, '%')))")
    List<HistoriaClinica> findByDiagnosticoContaining(@Param("diagnostico") String diagnostico);

    /**
     * Generar número de historia clínica automático
     */
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(h.numeroHistoria, 3) AS int)), 0) + 1 " +
           "FROM HistoriaClinica h WHERE h.numeroHistoria LIKE 'HC%'")
    Long generarSiguienteNumeroHistoria();

    /**
     * Buscar historias clínicas activas con paginación
     */
    Page<HistoriaClinica> findByActivaTrue(Pageable pageable);
}
