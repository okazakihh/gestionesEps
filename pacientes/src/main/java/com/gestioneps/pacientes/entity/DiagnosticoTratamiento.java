package com.gestioneps.pacientes.entity;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Size;

/**
 * Clase embebida para agrupar información de diagnóstico y tratamiento
 */
@Embeddable
public class DiagnosticoTratamiento {

    @Size(max = 2000, message = "Los diagnósticos no pueden exceder 2000 caracteres")
    private String diagnosticos;

    @Size(max = 2000, message = "El plan de tratamiento no puede exceder 2000 caracteres")
    private String planTratamiento;

    // Constructors
    public DiagnosticoTratamiento() {}

    public DiagnosticoTratamiento(String diagnosticos, String planTratamiento) {
        this.diagnosticos = diagnosticos;
        this.planTratamiento = planTratamiento;
    }

    // Getters and Setters
    public String getDiagnosticos() {
        return diagnosticos;
    }

    public void setDiagnosticos(String diagnosticos) {
        this.diagnosticos = diagnosticos;
    }

    public String getPlanTratamiento() {
        return planTratamiento;
    }

    public void setPlanTratamiento(String planTratamiento) {
        this.planTratamiento = planTratamiento;
    }
}
