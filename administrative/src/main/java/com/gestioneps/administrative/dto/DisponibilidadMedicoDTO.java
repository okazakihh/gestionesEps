package com.gestioneps.administrative.dto;

public class DisponibilidadMedicoDTO {
    private Long id;
    private String datosJson; // JSON crudo con la información de disponibilidad
    private boolean activo;

    public DisponibilidadMedicoDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDatosJson() { return datosJson; }
    public void setDatosJson(String datosJson) { this.datosJson = datosJson; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}
