package com.gestioneps.administrative.repository;

import com.gestioneps.administrative.entity.Nomina;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NominaRepository extends JpaRepository<Nomina, Long> {

    Page<Nomina> findByActivoTrue(Pageable pageable);

    List<Nomina> findByEmpleadoIdAndActivoTrue(Long empleadoId);
}