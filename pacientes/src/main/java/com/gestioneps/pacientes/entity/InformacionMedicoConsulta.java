package com.gestioneps.pacientes.entity;

import jakarta.validation.constraints.*;

public class InformacionMedicoConsulta {

    @NotBlank(message = "El médico tratante es obligatorio")
    @Size(max = 100, message = "El nombre del médico no puede exceder 100 caracteres")
    private String medicoTratante;

    @Size(max = 50, message = "El registro médico no puede exceder 50 caracteres")
    private String registroMedico;

    @Size(max = 100, message = "La especialidad no puede exceder 100 caracteres")
    private String especialidad;

    // Constructors
    public InformacionMedicoConsulta() {}

    public InformacionMedicoConsulta(String medicoTratante, String especialidad) {
        this.medicoTratante = medicoTratante;
        this.especialidad = especialidad;
    }

    // Getters and Setters
    public String getMedicoTratante() {
        return medicoTratante;
    }

    public void setMedicoTratante(String medicoTratante) {
        this.medicoTratante = medicoTratante;
    }

    public String getRegistroMedico() {
        return registroMedico;
    }

    public void setRegistroMedico(String registroMedico) {
        this.registroMedico = registroMedico;
    }

    public String getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }
}
