package com.gestioneps.pacientes.entity;

public class ExamenClinicoConsulta {

    private String examenFisico;

    private String signosVitales;

    // Constructors
    public ExamenClinicoConsulta() {}

    public ExamenClinicoConsulta(String examenFisico, String signosVitales) {
        this.examenFisico = examenFisico;
        this.signosVitales = signosVitales;
    }

    // Getters and Setters
    public String getExamenFisico() {
        return examenFisico;
    }

    public void setExamenFisico(String examenFisico) {
        this.examenFisico = examenFisico;
    }

    public String getSignosVitales() {
        return signosVitales;
    }

    public void setSignosVitales(String signosVitales) {
        this.signosVitales = signosVitales;
    }
}
