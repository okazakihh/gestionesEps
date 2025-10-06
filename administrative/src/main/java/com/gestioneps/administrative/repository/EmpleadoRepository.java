package com.gestioneps.administrative.repository;

import com.gestioneps.administrative.entity.Empleado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    Page<Empleado> findByActivoTrue(Pageable pageable);
}