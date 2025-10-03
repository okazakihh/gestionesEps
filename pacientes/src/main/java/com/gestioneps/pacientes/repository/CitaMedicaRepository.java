package com.gestioneps.pacientes.repository;

import com.gestioneps.pacientes.entity.CitaMedica;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CitaMedicaRepository extends JpaRepository<CitaMedica, Long> {

    Page<CitaMedica> findByPacienteId(Long pacienteId, Pageable pageable);

    List<CitaMedica> findByPacienteId(Long pacienteId);

    @Query("SELECT c FROM CitaMedica c WHERE c.paciente.id = :pacienteId AND c.activa = true ORDER BY c.fechaCreacion DESC")
    List<CitaMedica> findActiveByPacienteId(@Param("pacienteId") Long pacienteId);

    @Query("SELECT c FROM CitaMedica c WHERE c.activa = true AND " +
           "JSON_EXTRACT(c.datosJson, '$.fechaHoraCita') BETWEEN :startDate AND :endDate")
    List<CitaMedica> findCitasBetweenDates(@Param("startDate") String startDate, @Param("endDate") String endDate);

    @Query("SELECT c FROM CitaMedica c WHERE c.activa = true AND " +
           "JSON_EXTRACT(c.datosJson, '$.estado') = :estado")
    List<CitaMedica> findByEstado(@Param("estado") String estado);

    @Query("SELECT c FROM CitaMedica c WHERE c.activa = true ORDER BY c.fechaCreacion DESC")
    Page<CitaMedica> findAllActive(Pageable pageable);

    @Query("SELECT c FROM CitaMedica c WHERE c.activa = true ORDER BY c.fechaCreacion DESC")
    Page<CitaMedica> findPendingAppointments(Pageable pageable);
}