package com.gestioneps.administrative.repository;

import com.gestioneps.administrative.entity.DisponibilidadMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DisponibilidadMedicoRepository extends JpaRepository<DisponibilidadMedico, Long> {

}
