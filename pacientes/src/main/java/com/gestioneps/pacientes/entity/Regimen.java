package com.gestioneps.pacientes.entity;

public enum Regimen {
    CONTRIBUTIVO("Contributivo"),
    SUBSIDIADO("Subsidiado"),
    ESPECIAL("Especial"),
    EXCEPCION("Excepción");

    private final String descripcion;

    Regimen(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
