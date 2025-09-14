package com.gestioneps.pacientes.repository;

import com.gestioneps.pacientes.entity.Paciente;
import com.gestioneps.pacientes.entity.TipoDocumento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


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
    // Los campos personales están dentro de JSON (informacion_personal). Usamos consulta nativa para buscar
    // por nombre completo dentro del JSON. Se provee countQuery para paginación.
    @Query(value = "SELECT p.* FROM pacientes p WHERE p.activo = true AND LOWER(CONCAT(COALESCE(p.informacion_personal->> 'primerNombre',''), ' ', COALESCE(p.informacion_personal->> 'segundoNombre',''), ' ', COALESCE(p.informacion_personal->> 'primerApellido',''), ' ', COALESCE(p.informacion_personal->> 'segundoApellido',''))) LIKE LOWER(CONCAT('%', :nombre, '%'))",
           countQuery = "SELECT COUNT(1) FROM pacientes p WHERE p.activo = true AND LOWER(CONCAT(COALESCE(p.informacion_personal->> 'primerNombre',''), ' ', COALESCE(p.informacion_personal->> 'segundoNombre',''), ' ', COALESCE(p.informacion_personal->> 'primerApellido',''), ' ', COALESCE(p.informacion_personal->> 'segundoApellido',''))) LIKE LOWER(CONCAT('%', :nombre, '%'))",
           nativeQuery = true)
    Page<Paciente> findByNombreContainingIgnoreCase(@Param("nombre") String nombre, Pageable pageable);

    /**
     * Buscar pacientes por EPS (usando JSON)
     */
    @Query(value = "SELECT p.* FROM pacientes p WHERE p.activo = true AND LOWER(COALESCE(p.informacion_medica->> 'eps','')) LIKE LOWER(CONCAT('%', :eps, '%'))",
           countQuery = "SELECT COUNT(1) FROM pacientes p WHERE p.activo = true AND LOWER(COALESCE(p.informacion_medica->> 'eps','')) LIKE LOWER(CONCAT('%', :eps, '%'))",
           nativeQuery = true)
    Page<Paciente> findByEpsContainingIgnoreCase(@Param("eps") String eps, Pageable pageable);

    /**
     * Buscar pacientes por rango de edad (usando JSON)
     */
    // Buscar por edad usando fechaNacimiento dentro del JSON. Traducimos a SQL usando age()/date_part
    @Query(value = "SELECT p.* FROM pacientes p WHERE p.activo = true AND (date_part('year', age((p.informacion_personal->> 'fechaNacimiento')::date))) BETWEEN :edadMinima AND :edadMaxima",
           countQuery = "SELECT COUNT(1) FROM pacientes p WHERE p.activo = true AND (date_part('year', age((p.informacion_personal->> 'fechaNacimiento')::date))) BETWEEN :edadMinima AND :edadMaxima",
           nativeQuery = true)
    Page<Paciente> findByEdadBetween(@Param("edadMinima") int edadMinima, @Param("edadMaxima") int edadMaxima, Pageable pageable);

    /**
     * Buscar pacientes por ciudad (usando JSON)
     */
    @Query(value = "SELECT p.* FROM pacientes p WHERE p.activo = true AND LOWER(COALESCE(p.informacion_contacto->> 'ciudad','')) LIKE LOWER(CONCAT('%', :ciudad, '%'))",
           countQuery = "SELECT COUNT(1) FROM pacientes p WHERE p.activo = true AND LOWER(COALESCE(p.informacion_contacto->> 'ciudad','')) LIKE LOWER(CONCAT('%', :ciudad, '%'))",
           nativeQuery = true)
    Page<Paciente> findByCiudadContainingIgnoreCase(@Param("ciudad") String ciudad, Pageable pageable);

    /**
     * Contar pacientes activos
     */
    long countByActivoTrue();

    /**
     * Contar pacientes por EPS (usando JSON)
     */
    @Query(value = "SELECT COALESCE(p.informacion_medica->> 'eps', '') AS eps, COUNT(1) FROM pacientes p WHERE p.activo = true AND COALESCE(p.informacion_medica->> 'eps','') <> '' GROUP BY eps",
           nativeQuery = true)
    List<Object[]> countPacientesByEps();

    /**
     * Buscar pacientes con historias clínicas
     */
       @Query("SELECT DISTINCT p FROM Paciente p JOIN p.historiasClinicas h WHERE p.activo = true AND h.activa = true")
       List<Paciente> findPacientesConHistoriasClinicas();

    /**
     * Búsqueda general de pacientes
     */
    // Búsqueda general que combina columnas mapeadas y campos dentro de JSON. Usamos una consulta nativa
    // para garantizar que los campos JSON sean accesibles.
    @Query(value = "SELECT p.* FROM pacientes p WHERE p.activo = true AND (LOWER(p.numero_documento) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
                 "LOWER(COALESCE(p.informacion_personal->> 'primerNombre','')) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
                 "LOWER(COALESCE(p.informacion_personal->> 'segundoNombre','')) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
                 "LOWER(COALESCE(p.informacion_personal->> 'primerApellido','')) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
                 "LOWER(COALESCE(p.informacion_personal->> 'segundoApellido','')) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
                 "LOWER(COALESCE(p.informacion_contacto->> 'email','')) LIKE LOWER(CONCAT('%', :termino, '%')))",
          countQuery = "SELECT COUNT(1) FROM pacientes p WHERE p.activo = true AND (LOWER(p.numero_documento) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
                 "LOWER(COALESCE(p.informacion_personal->> 'primerNombre','')) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
                 "LOWER(COALESCE(p.informacion_personal->> 'segundoNombre','')) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
                 "LOWER(COALESCE(p.informacion_personal->> 'primerApellido','')) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
                 "LOWER(COALESCE(p.informacion_personal->> 'segundoApellido','')) LIKE LOWER(CONCAT('%', :termino, '%')) OR " +
                 "LOWER(COALESCE(p.informacion_contacto->> 'email','')) LIKE LOWER(CONCAT('%', :termino, '%')))",
          nativeQuery = true)
    Page<Paciente> buscarPacientes(@Param("termino") String termino, Pageable pageable);
}
