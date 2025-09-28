package com.gestioneps.pacientes.repository;

import com.gestioneps.pacientes.entity.ConsultaMedica;
import com.gestioneps.pacientes.entity.HistoriaClinica;
import com.gestioneps.pacientes.entity.TipoConsulta;
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
       // detalleConsulta.fechaConsulta está dentro del JSON 'detalle_consulta' y no es un atributo mapeado
       // en la entidad ConsultaMedica. Para ordenar/consultar por fecha usaremos fechaCreacion (columna mapeada)
       List<ConsultaMedica> findByHistoriaClinicaOrderByFechaCreacionDesc(HistoriaClinica historiaClinica);

    /**
     * Buscar consultas por médico tratante
     */
    @Query(value = "SELECT * FROM consultas_medicas c WHERE LOWER(COALESCE(c.detalle_consulta->> 'medicoTratante','')) LIKE LOWER(CONCAT('%', :medico, '%')) OR LOWER(COALESCE(c.informacion_medico->> 'medicoTratante','')) LIKE LOWER(CONCAT('%', :medico, '%'))",
           nativeQuery = true)
    List<ConsultaMedica> findByMedicoTratanteContainingIgnoreCase(@Param("medico") String medico);

    /**
     * Buscar consultas por tipo
     */
    @Query(value = "SELECT * FROM consultas_medicas c WHERE LOWER(COALESCE(c.datos_json->> 'tipoConsulta','')) = LOWER(:tipoConsulta)",
           nativeQuery = true)
    List<ConsultaMedica> findByTipoConsulta(@Param("tipoConsulta") String tipoConsulta);

    /**
     * Buscar consultas por rango de fechas
     */
       // Buscar por rango usando la columna mapeada fechaCreacion
       List<ConsultaMedica> findByFechaCreacionBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    /**
     * Buscar consultas por especialidad
     */
    @Query(value = "SELECT * FROM consultas_medicas c WHERE LOWER(COALESCE(c.informacion_medico->> 'especialidad','')) LIKE LOWER(CONCAT('%', :especialidad, '%'))",
           nativeQuery = true)
    List<ConsultaMedica> findByEspecialidadContainingIgnoreCase(@Param("especialidad") String especialidad);

    /**
     * Buscar última consulta de una historia clínica
     */
       // Última consulta por fecha de creación
       ConsultaMedica findFirstByHistoriaClinicaOrderByFechaCreacionDesc(HistoriaClinica historiaClinica);

    /**
     * Contar consultas por médico en un período
     */
    // medicoTratante está dentro del JSON detalle_consulta o informacion_medico. Usamos consulta nativa
    // para contar consultas cuyo medico coincida (búsqueda case-insensitive simple) y caigan en el rango.
    @Query(value = "SELECT COUNT(1) FROM consultas_medicas c WHERE (LOWER(COALESCE(c.detalle_consulta->> 'medicoTratante','')) LIKE LOWER(CONCAT('%', :medico, '%')) OR LOWER(COALESCE(c.informacion_medico->> 'medicoTratante','')) LIKE LOWER(CONCAT('%', :medico, '%'))) " +
                   "AND c.fecha_creacion BETWEEN :fechaInicio AND :fechaFin",
           nativeQuery = true)
    long countConsultasByMedicoAndPeriodo(@Param("medico") String medico, 
                                         @Param("fechaInicio") LocalDateTime fechaInicio,
                                         @Param("fechaFin") LocalDateTime fechaFin);

    /**
     * Buscar consultas con próximas citas programadas
     */
    @Query(value = "SELECT * FROM consultas_medicas c WHERE c.datos_json->>'proximaCita' IS NOT NULL " +
            "AND (c.datos_json->>'proximaCita')::timestamp BETWEEN :fechaInicio AND :fechaFin",
           nativeQuery = true)
    List<ConsultaMedica> findConsultasConProximasCitas(@Param("fechaInicio") LocalDateTime fechaInicio,
                                                        @Param("fechaFin") LocalDateTime fechaFin);

    /**
     * Estadísticas de consultas por tipo
     */
    @Query(value = "SELECT c.datos_json->>'tipoConsulta', COUNT(1) FROM consultas_medicas c " +
            "WHERE c.fecha_creacion BETWEEN :fechaInicio AND :fechaFin " +
            "GROUP BY c.datos_json->>'tipoConsulta'",
           nativeQuery = true)
    List<Object[]> getEstadisticasPorTipo(@Param("fechaInicio") LocalDateTime fechaInicio,
                                          @Param("fechaFin") LocalDateTime fechaFin);
}
