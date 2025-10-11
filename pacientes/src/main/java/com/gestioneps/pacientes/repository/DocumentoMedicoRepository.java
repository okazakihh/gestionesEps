package com.gestioneps.pacientes.repository;

import com.gestioneps.pacientes.entity.CitaMedica;
import com.gestioneps.pacientes.entity.DocumentoMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentoMedicoRepository extends JpaRepository<DocumentoMedico, Long> {

    /**
     * Buscar documentos por cita médica
     */
    List<DocumentoMedico> findByCitaMedicaOrderByFechaCreacionDesc(CitaMedica citaMedica);

    /**
     * Contar documentos por cita médica
     */
    long countByCitaMedica(CitaMedica citaMedica);
}
