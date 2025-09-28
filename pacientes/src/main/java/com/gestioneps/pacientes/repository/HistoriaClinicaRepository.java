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
       // El campo medicoResponsable está dentro del JSON 'informacion_medico'. No es un atributo mapeado,
       // por lo que no se puede usar una query derivada. Usamos una consulta nativa que extrae el valor
       // del JSON y realiza un LIKE case-insensitive.
       @Query(value = "SELECT DISTINCT h.* FROM historias_clinicas h " +
                               "WHERE h.activa = true AND LOWER(COALESCE(h.informacion_medico, '')) LIKE LOWER(CONCAT('%', :medico, '%'))",
                 nativeQuery = true)
       List<HistoriaClinica> findByMedicoResponsableContainingIgnoreCaseAndActivaTrue(@Param("medico") String medico);

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
    // detalleConsulta.fechaConsulta is stored inside a JSON column (detalle_consulta) and is not a mapped
    // attribute of ConsultaMedica, so we cannot reference it in JPQL. Use the created timestamp of the
    // ConsultaMedica instead (fechaCreacion) which is mapped as a column.
    @Query("SELECT DISTINCT h FROM HistoriaClinica h JOIN h.consultas c " +
           "WHERE h.activa = true AND c.fechaCreacion >= :fechaDesde")
    List<HistoriaClinica> findHistoriasConConsultasRecientes(@Param("fechaDesde") LocalDateTime fechaDesde);

    /**
     * Buscar historias clínicas por diagnóstico
     */
    // The diagnosis fields are stored inside the JSON column 'diagnostico_tratamiento' of consultas_medicas.
    // JPQL cannot inspect JSON content, so use a native SQL LIKE against the column text to perform a simple
    // contains search. This is a pragmatic approach; for more robust queries consider using PostgreSQL JSONB
    // operators or a full-text index.
    @Query(value = "SELECT DISTINCT h.* FROM historias_clinicas h JOIN consultas_medicas c ON c.historia_clinica_id = h.id " +
                   "WHERE h.activa = true AND LOWER(c.diagnostico_tratamiento) LIKE LOWER(CONCAT('%', :diagnostico, '%'))",
           nativeQuery = true)
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
