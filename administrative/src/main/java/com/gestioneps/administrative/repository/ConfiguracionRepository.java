package com.gestioneps.administrative.repository;

import com.gestioneps.administrative.entity.Configuracion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracionRepository extends JpaRepository<Configuracion, Long> {

    /**
     * Busca configuraciones activas con paginación
     */
    Page<Configuracion> findByActivoTrue(Pageable pageable);

    /**
     * Busca una configuración por su clave única
     */
    Optional<Configuracion> findByClave(String clave);

    /**
     * Busca configuraciones por tipo
     */
    Page<Configuracion> findByTipoConfiguracionAndActivoTrue(String tipoConfiguracion, Pageable pageable);

    /**
     * Verifica si existe una configuración con una clave específica
     */
    boolean existsByClave(String clave);

    /**
     * Busca una configuración activa por clave
     */
    @Query("SELECT c FROM Configuracion c WHERE c.clave = :clave AND c.activo = true")
    Optional<Configuracion> findActiveByClave(@Param("clave") String clave);
}
