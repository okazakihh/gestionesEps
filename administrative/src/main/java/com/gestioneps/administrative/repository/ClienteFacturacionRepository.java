package com.gestioneps.administrative.repository;

import com.gestioneps.administrative.entity.ClienteFacturacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para ClienteFacturacion
 * 
 * Queries personalizados para filtrar clientes de facturación
 */
@Repository
public interface ClienteFacturacionRepository extends JpaRepository<ClienteFacturacion, Long> {

    // Obtener todos los clientes activos con paginación
    Page<ClienteFacturacion> findByActivoTrue(Pageable pageable);

    // Obtener todos los clientes activos sin paginación
    List<ClienteFacturacion> findByActivoTrueOrderByFechaCreacionDesc();

    // Buscar cliente por documento (requiere búsqueda en JSON)
    @Query(value = "SELECT * FROM clientes_facturacion WHERE activo = true AND json_data::jsonb->>'numeroDocumento' = :numeroDocumento", nativeQuery = true)
    Optional<ClienteFacturacion> findByNumeroDocumento(@Param("numeroDocumento") String numeroDocumento);

    // Buscar clientes por tipo de persona
    @Query(value = "SELECT * FROM clientes_facturacion WHERE activo = true AND json_data::jsonb->>'tipoPersona' = :tipoPersona ORDER BY fecha_creacion DESC", nativeQuery = true)
    List<ClienteFacturacion> findByTipoPersona(@Param("tipoPersona") String tipoPersona);

    // Buscar clientes por código Siigo
    @Query(value = "SELECT * FROM clientes_facturacion WHERE activo = true AND json_data::jsonb->>'codigoClienteSiigo' = :codigoSiigo", nativeQuery = true)
    Optional<ClienteFacturacion> findByCodigoSiigo(@Param("codigoSiigo") String codigoSiigo);

    // Buscar clientes por nombre o razón social (búsqueda parcial)
    @Query(value = "SELECT * FROM clientes_facturacion WHERE activo = true AND (json_data::jsonb->>'nombreCompleto' ILIKE %:busqueda% OR json_data::jsonb->>'razonSocial' ILIKE %:busqueda%) ORDER BY fecha_creacion DESC", nativeQuery = true)
    List<ClienteFacturacion> buscarPorNombre(@Param("busqueda") String busqueda);

    // Contar clientes activos
    long countByActivoTrue();
}
