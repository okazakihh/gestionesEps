package com.gestioneps.administrative.repository;

import com.gestioneps.administrative.entity.Facturacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacturacionRepository extends JpaRepository<Facturacion, Long> {

    Page<Facturacion> findByActivoTrue(Pageable pageable);
}