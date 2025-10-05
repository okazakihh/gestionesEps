package com.gestioneps.pacientes.repository;

import com.gestioneps.pacientes.entity.CodigosCups;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodigosCupsRepository extends JpaRepository<CodigosCups, Long> {

    /**
     * Buscar código CUP por código
     */
    Optional<CodigosCups> findByCodigoCup(String codigoCup);

    /**
     * Verificar si existe un código CUP
     */
    boolean existsByCodigoCup(String codigoCup);

    /**
     * Buscar códigos CUP por nombre (contiene)
     */
    @Query("SELECT c FROM CodigosCups c WHERE LOWER(c.nombreCup) LIKE LOWER(CONCAT('%', :nombre, '%'))")
    Page<CodigosCups> findByNombreCupContainingIgnoreCase(@Param("nombre") String nombre, Pageable pageable);

    /**
     * Buscar códigos CUP por código (contiene)
     */
    @Query("SELECT c FROM CodigosCups c WHERE LOWER(c.codigoCup) LIKE LOWER(CONCAT('%', :codigo, '%'))")
    Page<CodigosCups> findByCodigoCupContainingIgnoreCase(@Param("codigo") String codigo, Pageable pageable);

    /**
     * Búsqueda general de códigos CUP
     */
    @Query("SELECT c FROM CodigosCups c WHERE LOWER(c.codigoCup) LIKE LOWER(CONCAT('%', :termino, '%')) OR LOWER(c.nombreCup) LIKE LOWER(CONCAT('%', :termino, '%'))")
    Page<CodigosCups> buscarCodigosCups(@Param("termino") String termino, Pageable pageable);
}