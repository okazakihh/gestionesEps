package com.gestioneps.pacientes.entity;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.*;

@Embeddable
public class ContactoEmergencia {

    @Size(max = 100, message = "El nombre del contacto no puede exceder 100 caracteres")
    private String nombreContacto;

    @Size(max = 50, message = "La relación no puede exceder 50 caracteres")
    private String relacion;

    @Pattern(regexp = "^[0-9+\\-\\s()]*$", message = "El teléfono debe contener solo números y caracteres válidos")
    private String telefonoContacto;

    @Email(message = "El email debe tener un formato válido")
    private String emailContacto;

    // Constructors
    public ContactoEmergencia() {}

    // Getters and Setters
    public String getNombreContacto() {
        return nombreContacto;
    }

    public void setNombreContacto(String nombreContacto) {
        this.nombreContacto = nombreContacto;
    }

    public String getRelacion() {
        return relacion;
    }

    public void setRelacion(String relacion) {
        this.relacion = relacion;
    }

    public String getTelefonoContacto() {
        return telefonoContacto;
    }

    public void setTelefonoContacto(String telefonoContacto) {
        this.telefonoContacto = telefonoContacto;
    }

    public String getEmailContacto() {
        return emailContacto;
    }

    public void setEmailContacto(String emailContacto) {
        this.emailContacto = emailContacto;
    }
}
