package com.gestioneps.pacientes.entity;

// This class is stored as JSON in a single column using JsonType; do not mark it as @Embeddable
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Clase embebida para agrupar información del médico responsable
 */
public class InformacionMedico {

    @NotBlank(message = "El médico responsable es obligatorio")
    @Size(max = 100, message = "El nombre del médico no puede exceder 100 caracteres")
    private String medicoResponsable;

    @Size(max = 50, message = "El registro médico no puede exceder 50 caracteres")
    private String registroMedico;

    // Constructors
    public InformacionMedico() {}

    public InformacionMedico(String medicoResponsable, String registroMedico) {
        this.medicoResponsable = medicoResponsable;
        this.registroMedico = registroMedico;
    }

    // Getters and Setters
    public String getMedicoResponsable() {
        return medicoResponsable;
    }

    public void setMedicoResponsable(String medicoResponsable) {
        this.medicoResponsable = medicoResponsable;
    }

    public String getRegistroMedico() {
        return registroMedico;
    }

    public void setRegistroMedico(String registroMedico) {
        this.registroMedico = registroMedico;
    }
}
