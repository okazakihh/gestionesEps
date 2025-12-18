package com.gestioneps.administrative.dto;

import java.time.LocalDateTime;

/**
 * DTO para NotaContable
 * 
 * Transporta datos de notas contables entre capas
 */
public class NotaContableDTO {

    private Long id;
    private String jsonData;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    // Constructors
    public NotaContableDTO() {
    }

    public NotaContableDTO(Long id, String jsonData, Boolean activo, 
                           LocalDateTime fechaCreacion, LocalDateTime fechaActualizacion) {
        this.id = id;
        this.jsonData = jsonData;
        this.activo = activo;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getJsonData() {
        return jsonData;
    }

    public void setJsonData(String jsonData) {
        this.jsonData = jsonData;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    @Override
    public String toString() {
        return "NotaContableDTO{" +
                "id=" + id +
                ", activo=" + activo +
                ", fechaCreacion=" + fechaCreacion +
                ", fechaActualizacion=" + fechaActualizacion +
                '}';
    }
}
