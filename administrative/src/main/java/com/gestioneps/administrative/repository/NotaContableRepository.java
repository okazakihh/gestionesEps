package com.gestioneps.administrative.repository;

import com.gestioneps.administrative.entity.NotaContable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository para NotaContable
 * 
 * Queries personalizados para filtrar notas contables
 */
@Repository
public interface NotaContableRepository extends JpaRepository<NotaContable, Long> {

    // Obtener todas las notas activas con paginación
    Page<NotaContable> findByActivoTrue(Pageable pageable);

    // Obtener todas las notas activas sin paginación
    List<NotaContable> findByActivoTrueOrderByFechaCreacionDesc();

    // Buscar notas por rango de fechas
    @Query("SELECT n FROM NotaContable n WHERE n.activo = true AND n.fechaCreacion BETWEEN :inicio AND :fin ORDER BY n.fechaCreacion DESC")
    List<NotaContable> findByFechaCreacionBetween(
        @Param("inicio") LocalDateTime inicio, 
        @Param("fin") LocalDateTime fin
    );

    // Contar notas activas
    long countByActivoTrue();
}
