package com.gestioneps.pacientes.entity;

public enum EstadoCivil {
    SOLTERO("Soltero(a)"),
    CASADO("Casado(a)"),
    UNION_LIBRE("Unión Libre"),
    DIVORCIADO("Divorciado(a)"),
    VIUDO("Viudo(a)"),
    SEPARADO("Separado(a)");

    private final String descripcion;

    EstadoCivil(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
