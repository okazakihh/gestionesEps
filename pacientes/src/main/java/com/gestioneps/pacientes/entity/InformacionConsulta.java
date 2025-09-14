package com.gestioneps.pacientes.entity;

// This class is stored as JSON in a single column using JsonType; do not mark it as @Embeddable
import jakarta.validation.constraints.Size;

/**
 * Clase embebida para agrupar información relacionada con la consulta médica
 */
public class InformacionConsulta {

    @Size(max = 2000, message = "El motivo de consulta no puede exceder 2000 caracteres")
    private String motivoConsulta;

    @Size(max = 2000, message = "La enfermedad actual no puede exceder 2000 caracteres")
    private String enfermedadActual;

    @Size(max = 2000, message = "La revisión por sistemas no puede exceder 2000 caracteres")
    private String revisionSistemas;

    @Size(max = 1000, message = "Los medicamentos actuales no pueden exceder 1000 caracteres")
    private String medicamentosActuales;

    @Size(max = 1000, message = "Las observaciones no pueden exceder 1000 caracteres")
    private String observaciones;

    // Constructors
    public InformacionConsulta() {}

    public InformacionConsulta(String motivoConsulta, String enfermedadActual, String revisionSistemas, 
                              String medicamentosActuales, String observaciones) {
        this.motivoConsulta = motivoConsulta;
        this.enfermedadActual = enfermedadActual;
        this.revisionSistemas = revisionSistemas;
        this.medicamentosActuales = medicamentosActuales;
        this.observaciones = observaciones;
    }

    // Getters and Setters
    public String getMotivoConsulta() {
        return motivoConsulta;
    }

    public void setMotivoConsulta(String motivoConsulta) {
        this.motivoConsulta = motivoConsulta;
    }

    public String getEnfermedadActual() {
        return enfermedadActual;
    }

    public void setEnfermedadActual(String enfermedadActual) {
        this.enfermedadActual = enfermedadActual;
    }

    public String getRevisionSistemas() {
        return revisionSistemas;
    }

    public void setRevisionSistemas(String revisionSistemas) {
        this.revisionSistemas = revisionSistemas;
    }

    public String getMedicamentosActuales() {
        return medicamentosActuales;
    }

    public void setMedicamentosActuales(String medicamentosActuales) {
        this.medicamentosActuales = medicamentosActuales;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}
