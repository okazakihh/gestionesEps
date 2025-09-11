package com.gestioneps.pacientes.entity;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Size;

/**
 * Clase embebida para agrupar información de antecedentes clínicos
 */
@Embeddable
public class AntecedentesClinico {

    @Size(max = 2000, message = "Los antecedentes personales no pueden exceder 2000 caracteres")
    private String antecedentesPersonales;

    @Size(max = 2000, message = "Los antecedentes familiares no pueden exceder 2000 caracteres")
    private String antecedentesFamiliares;

    @Size(max = 2000, message = "Los antecedentes quirúrgicos no pueden exceder 2000 caracteres")
    private String antecedentesQuirurgicos;

    @Size(max = 1000, message = "Los antecedentes alérgicos no pueden exceder 1000 caracteres")
    private String antecedentesAlergicos;

    // Constructors
    public AntecedentesClinico() {}

    public AntecedentesClinico(String antecedentesPersonales, String antecedentesFamiliares, 
                              String antecedentesQuirurgicos, String antecedentesAlergicos) {
        this.antecedentesPersonales = antecedentesPersonales;
        this.antecedentesFamiliares = antecedentesFamiliares;
        this.antecedentesQuirurgicos = antecedentesQuirurgicos;
        this.antecedentesAlergicos = antecedentesAlergicos;
    }

    // Getters and Setters
    public String getAntecedentesPersonales() {
        return antecedentesPersonales;
    }

    public void setAntecedentesPersonales(String antecedentesPersonales) {
        this.antecedentesPersonales = antecedentesPersonales;
    }

    public String getAntecedentesFamiliares() {
        return antecedentesFamiliares;
    }

    public void setAntecedentesFamiliares(String antecedentesFamiliares) {
        this.antecedentesFamiliares = antecedentesFamiliares;
    }

    public String getAntecedentesQuirurgicos() {
        return antecedentesQuirurgicos;
    }

    public void setAntecedentesQuirurgicos(String antecedentesQuirurgicos) {
        this.antecedentesQuirurgicos = antecedentesQuirurgicos;
    }

    public String getAntecedentesAlergicos() {
        return antecedentesAlergicos;
    }

    public void setAntecedentesAlergicos(String antecedentesAlergicos) {
        this.antecedentesAlergicos = antecedentesAlergicos;
    }
}
