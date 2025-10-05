package com.gestioneps.pacientes.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class CodigosCupsDTO {

    private Long id;

    @NotBlank(message = "El código CUP es obligatorio")
    private String codigoCup;

    @NotBlank(message = "El nombre del CUP es obligatorio")
    private String nombreCup;

    // Campo opcional para almacenar información adicional en JSON
    private String datosJson;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaActualizacion;

    // Constructors
    public CodigosCupsDTO() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigoCup() {
        return codigoCup;
    }

    public void setCodigoCup(String codigoCup) {
        this.codigoCup = codigoCup;
    }

    public String getNombreCup() {
        return nombreCup;
    }

    public void setNombreCup(String nombreCup) {
        this.nombreCup = nombreCup;
    }

    public String getDatosJson() {
        return datosJson;
    }

    public void setDatosJson(String datosJson) {
        this.datosJson = datosJson;
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
}