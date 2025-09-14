package com.gestioneps.pacientes.entity;

// This class is stored as JSON in a single column using JsonType; do not mark it as @Embeddable
import jakarta.validation.constraints.Size;

/**
 * Clase embebida para agrupar información del examen clínico
 */
public class ExamenClinico {

    @Size(max = 2000, message = "El examen físico no puede exceder 2000 caracteres")
    private String examenFisico;

    @Size(max = 1000, message = "Los signos vitales no pueden exceder 1000 caracteres")
    private String signosVitales;

    // Constructors
    public ExamenClinico() {}

    public ExamenClinico(String examenFisico, String signosVitales) {
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

    // Método adicional
    public void setDescripcion(String descripcion) {
        this.examenFisico = descripcion;
    }

    // Métodos adicionales
    public boolean isEmpty() {
        return (examenFisico == null || examenFisico.isEmpty()) &&
               (signosVitales == null || signosVitales.isEmpty());
    }
}
