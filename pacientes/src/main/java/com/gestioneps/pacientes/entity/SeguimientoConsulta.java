package com.gestioneps.pacientes.entity;

import java.time.LocalDateTime;

public class SeguimientoConsulta {

    private String indicaciones;

    private String proximaCita;

    // Constructors
    public SeguimientoConsulta() {}

    public SeguimientoConsulta(String indicaciones, String proximaCita) {
        this.indicaciones = indicaciones;
        this.proximaCita = proximaCita;
    }

    // Getters and Setters
    public String getIndicaciones() {
        return indicaciones;
    }

    public void setIndicaciones(String indicaciones) {
        this.indicaciones = indicaciones;
    }

    public String getProximaCita() {
        return proximaCita;
    }

    public void setProximaCita(String proximaCita) {
        this.proximaCita = proximaCita;
    }
}
