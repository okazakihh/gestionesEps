package com.gestioneps.pacientes.repository;

import com.gestioneps.pacientes.entity.Paciente;
import com.gestioneps.pacientes.entity.TipoDocumento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    /**
     * Buscar paciente por número de documento
     */
    Optional<Paciente> findByNumeroDocumento(String numeroDocumento);

    /**
     * Buscar paciente por número de documento y tipo de documento
     */
    Optional<Paciente> findByNumeroDocumentoAndTipoDocumento(String numeroDocumento, TipoDocumento tipoDocumento);

    /**
     * Verificar si existe un paciente con el número de documento
     */
    boolean existsByNumeroDocumento(String numeroDocumento);

    /**
     * Buscar pacientes activos
     */
    List<Paciente> findByActivoTrue();

    /**
     * Buscar pacientes activos con paginación
     */
    Page<Paciente> findByActivoTrue(Pageable pageable);

    /**
     * Buscar pacientes por nombre (usando JSON)
     */
    @Query("SELECT p FROM Paciente p WHERE " +
           "LOWER(CONCAT(p.informacionPersonal.primerNombre, ' ', " +
           "COALESCE(p.informacionPersonal.segundoNombre, ''), ' ', " +
           "p.informacionPersonal.primerApellido, ' ', " +
           "COALESCE(p.informacionPersonal.segundoApellido, ''))) " +
           "LIKE LOWER(CONCAT('%', :nombre, '%')) AND p.activo = true")
    Page<Paciente> findByNombreContainingIgnoreCase(@Param("nombre") String nombre, Pageable pageable);

    /**
     * Buscar pacientes por EPS (usando JSON)
     */
    @Query("SELECT p FROM Paciente p WHERE " +
           "LOWER(p.informacionMedica.eps) LIKE LOWER(CONCAT('%', :eps, '%')) AND p.activo = true")
    Page<Paciente> findByEpsContainingIgnoreCase(@Param("eps") String eps, Pageable pageable);

    /**
     * Buscar pacientes por rango de edad (usando JSON)
     */
    @Query("SELECT p FROM Paciente p WHERE " +
           "YEAR(CURRENT_DATE) - YEAR(p.informacionPersonal.fechaNacimiento) BETWEEN :edadMinima AND :edadMaxima " +
           "AND p.activo = true")
    Page<Paciente> findByEdadBetween(@Param("edadMinima") int edadMinima, @Param("edadMaxima") int edadMaxima, Pageable pageable);

    /**
     * Buscar pacientes por ciudad (usando JSON)
     */
    @Query("SELECT p FROM Paciente p WHERE " +
           "LOWER(p.informacionContacto.ciudad) LIKE LOWER(CONCAT('%', :ciudad, '%')) AND p.activo = true")
    Page<Paciente> findByCiudadContainingIgnoreCase(@Param("ciudad") String ciudad, Pageable pageable);

    /**
     * Contar pacientes activos
     */
    long countByActivoTrue();

    /**
     * Contar pacientes por EPS (usando JSON)
     */
    @Query("SELECT p.informacionMedica.eps, COUNT(p) FROM Paciente p WHERE p.activo = true AND p.informacionMedica.eps IS NOT NULL GROUP BY p.informacionMedica.eps")
    List<Object[]> countPacientesByEps();

    /**
     * Buscar pacientes con historias clínicas
     */
    @Query("SELECT DISTINCT p FROM Paciente p JOIN p.historiasClinicas h WHERE p.activo = true AND h.activa = true")
    List<Paciente> findPacientesConHistoriasClinicas();

    /**
     * Búsqueda general de pacientes
     */
    @Query("SELECT p FROM Paciente p WHERE " +
           "(LOWER(p.numeroDocumento) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
           "LOWER(p.primerNombre) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
           "LOWER(p.segundoNombre) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
           "LOWER(p.primerApellido) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
           "LOWER(p.segundoApellido) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :termino, '%'))) " +
           "AND p.activo = true")
    Page<Paciente> buscarPacientes(@Param("termino") String termino, Pageable pageable);
}
