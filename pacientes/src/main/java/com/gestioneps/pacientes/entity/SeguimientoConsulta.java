package com.gestioneps.pacientes.entity;

import java.time.LocalDateTime;

public class SeguimientoConsulta {

    private LocalDateTime proximaCita;

    // Constructors
    public SeguimientoConsulta() {}

    public SeguimientoConsulta(LocalDateTime proximaCita) {
        this.proximaCita = proximaCita;
    }

    // Getters and Setters
    public LocalDateTime getProximaCita() {
        return proximaCita;
    }

    public void setProximaCita(LocalDateTime proximaCita) {
        this.proximaCita = proximaCita;
    }
}
