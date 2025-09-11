package com.gestioneps.pacientes.repository;

import com.gestioneps.pacientes.entity.DocumentoMedico;
import com.gestioneps.pacientes.entity.HistoriaClinica;
import com.gestioneps.pacientes.entity.TipoDocumentoMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DocumentoMedicoRepository extends JpaRepository<DocumentoMedico, Long> {

    /**
     * Buscar documentos por historia clínica
     */
    List<DocumentoMedico> findByHistoriaClinicaAndActivoTrueOrderByFechaCreacionDesc(HistoriaClinica historiaClinica);

    /**
     * Buscar documentos por tipo
     */
    List<DocumentoMedico> findByTipoDocumentoAndActivoTrue(TipoDocumentoMedico tipoDocumento);

    /**
     * Buscar documentos por médico responsable
     */
    List<DocumentoMedico> findByMedicoResponsableContainingIgnoreCaseAndActivoTrue(String medicoResponsable);

    /**
     * Buscar documentos por rango de fechas
     */
    List<DocumentoMedico> findByFechaDocumentoBetweenAndActivoTrue(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    /**
     * Buscar documentos por nombre de archivo
     */
    List<DocumentoMedico> findByNombreArchivoContainingIgnoreCaseAndActivoTrue(String nombreArchivo);

    /**
     * Contar documentos por historia clínica
     */
    long countByHistoriaClinicaAndActivoTrue(HistoriaClinica historiaClinica);

    /**
     * Obtener tamaño total de documentos por historia clínica
     */
    @Query("SELECT COALESCE(SUM(d.tamañoArchivo), 0) FROM DocumentoMedico d " +
           "WHERE d.historiaClinica = :historiaClinica AND d.activo = true")
    Long getTamañoTotalDocumentos(@Param("historiaClinica") HistoriaClinica historiaClinica);

    /**
     * Estadísticas de documentos por tipo
     */
    @Query("SELECT d.tipoDocumento, COUNT(d) FROM DocumentoMedico d " +
           "WHERE d.activo = true GROUP BY d.tipoDocumento")
    List<Object[]> getEstadisticasPorTipo();
}
