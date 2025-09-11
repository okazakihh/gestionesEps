package com.gestioneps.pacientes.entity;

public enum TipoDocumento {
    CC("Cédula de Ciudadanía"),
    CE("Cédula de Extranjería"),
    TI("Tarjeta de Identidad"),
    RC("Registro Civil"),
    PA("Pasaporte"),
    MS("Menor Sin Identificación"),
    AS("Adulto Sin Identificación");

    private final String descripcion;

    TipoDocumento(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
