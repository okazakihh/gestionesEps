package com.gestioneps.pacientes.repository;

import com.gestioneps.pacientes.entity.ConsultaMedica;
import com.gestioneps.pacientes.entity.HistoriaClinica;
import com.gestioneps.pacientes.entity.TipoConsulta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsultaMedicaRepository extends JpaRepository<ConsultaMedica, Long> {

    /**
     * Buscar consultas por historia clínica
     */
    List<ConsultaMedica> findByHistoriaClinicaOrderByFechaConsultaDesc(HistoriaClinica historiaClinica);

    /**
     * Buscar consultas por médico tratante
     */
    List<ConsultaMedica> findByMedicoTratanteContainingIgnoreCase(String medicoTratante);

    /**
     * Buscar consultas por tipo
     */
    List<ConsultaMedica> findByTipoConsulta(TipoConsulta tipoConsulta);

    /**
     * Buscar consultas por rango de fechas
     */
    List<ConsultaMedica> findByFechaConsultaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    /**
     * Buscar consultas por especialidad
     */
    List<ConsultaMedica> findByEspecialidadContainingIgnoreCase(String especialidad);

    /**
     * Buscar última consulta de una historia clínica
     */
    ConsultaMedica findFirstByHistoriaClinicaOrderByFechaConsultaDesc(HistoriaClinica historiaClinica);

    /**
     * Contar consultas por médico en un período
     */
    @Query("SELECT COUNT(c) FROM ConsultaMedica c WHERE c.medicoTratante = :medico " +
           "AND c.fechaConsulta BETWEEN :fechaInicio AND :fechaFin")
    long countConsultasByMedicoAndPeriodo(@Param("medico") String medico, 
                                         @Param("fechaInicio") LocalDateTime fechaInicio,
                                         @Param("fechaFin") LocalDateTime fechaFin);

    /**
     * Buscar consultas con próximas citas programadas
     */
    @Query("SELECT c FROM ConsultaMedica c WHERE c.proximaCita IS NOT NULL " +
           "AND c.proximaCita BETWEEN :fechaInicio AND :fechaFin")
    List<ConsultaMedica> findConsultasConProximasCitas(@Param("fechaInicio") LocalDateTime fechaInicio,
                                                       @Param("fechaFin") LocalDateTime fechaFin);

    /**
     * Estadísticas de consultas por tipo
     */
    @Query("SELECT c.tipoConsulta, COUNT(c) FROM ConsultaMedica c " +
           "WHERE c.fechaConsulta BETWEEN :fechaInicio AND :fechaFin " +
           "GROUP BY c.tipoConsulta")
    List<Object[]> getEstadisticasPorTipo(@Param("fechaInicio") LocalDateTime fechaInicio,
                                         @Param("fechaFin") LocalDateTime fechaFin);
}
