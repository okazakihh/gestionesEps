package com.gestioneps.pacientes.entity;

public enum TipoConsulta {
    PRIMERA_VEZ("Primera vez"),
    CONTROL("Control"),
    URGENCIAS("Urgencias"),
    ESPECIALIZADA("Especializada"),
    TELEMEDICINA("Telemedicina"),
    PROCEDIMIENTO("Procedimiento"),
    CIRUGIA("Cirugía");

    private final String descripcion;

    TipoConsulta(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
