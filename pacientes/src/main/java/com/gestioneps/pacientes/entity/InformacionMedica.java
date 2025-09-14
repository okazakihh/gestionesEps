package com.gestioneps.pacientes.entity;

// This class is stored as JSON in a single column using JsonType; do not mark it as @Embeddable
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.*;

public class InformacionMedica {

    @Size(max = 100, message = "La EPS no puede exceder 100 caracteres")
    private String eps;

    @Enumerated(EnumType.STRING)
    private Regimen regimen;

    @Size(max = 500, message = "Las alergias no pueden exceder 500 caracteres")
    private String alergias;

    @Size(max = 500, message = "Los antecedentes médicos no pueden exceder 500 caracteres")
    private String antecedentesMedicos;

    @Size(max = 500, message = "Los medicamentos actuales no pueden exceder 500 caracteres")
    private String medicamentosActuales;

    @Size(max = 500, message = "Las observaciones médicas no pueden exceder 500 caracteres")
    private String observacionesMedicas;

    // Constructors
    public InformacionMedica() {}

    // Getters and Setters
    public String getEps() {
        return eps;
    }

    public void setEps(String eps) {
        this.eps = eps;
    }

    public Regimen getRegimen() {
        return regimen;
    }

    public void setRegimen(Regimen regimen) {
        this.regimen = regimen;
    }

    public String getAlergias() {
        return alergias;
    }

    public void setAlergias(String alergias) {
        this.alergias = alergias;
    }

    public String getAntecedentesMedicos() {
        return antecedentesMedicos;
    }

    public void setAntecedentesMedicos(String antecedentesMedicos) {
        this.antecedentesMedicos = antecedentesMedicos;
    }

    public String getMedicamentosActuales() {
        return medicamentosActuales;
    }

    public void setMedicamentosActuales(String medicamentosActuales) {
        this.medicamentosActuales = medicamentosActuales;
    }

    public String getObservacionesMedicas() {
        return observacionesMedicas;
    }

    public void setObservacionesMedicas(String observacionesMedicas) {
        this.observacionesMedicas = observacionesMedicas;
    }
}
