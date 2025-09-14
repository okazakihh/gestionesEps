package com.gestioneps.pacientes.entity;

// This class is stored as JSON in a single column using JsonType; do not mark it as @Embeddable
import jakarta.validation.constraints.Size;

/**
 * Clase embebida para agrupar información de diagnóstico y tratamiento
 */
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

    // Métodos adicionales
    public boolean isEmpty() {
        return (diagnosticos == null || diagnosticos.isEmpty()) &&
               (planTratamiento == null || planTratamiento.isEmpty());
    }

    // Método adicional
    public void setDiagnostico(String diagnostico) {
        this.diagnosticos = diagnostico;
    }
}
