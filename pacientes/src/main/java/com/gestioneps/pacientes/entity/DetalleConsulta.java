package com.gestioneps.pacientes.entity;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class DetalleConsulta {

    @NotBlank(message = "El motivo de consulta es obligatorio")
    private String motivoConsulta;

    private String enfermedadActual;

    private String revisionSistemas;

    @NotNull(message = "La fecha de consulta es obligatoria")
    private String fechaConsulta;

    @NotNull(message = "El tipo de consulta es obligatorio")
    private TipoConsulta tipoConsulta;

    // Constructors
    public DetalleConsulta() {}

    public DetalleConsulta(String motivoConsulta, String enfermedadActual,
                          String fechaConsulta, TipoConsulta tipoConsulta) {
        this.motivoConsulta = motivoConsulta;
        this.enfermedadActual = enfermedadActual;
        this.fechaConsulta = fechaConsulta;
        this.tipoConsulta = tipoConsulta;
    }

    // Getters and Setters
    public String getMotivoConsulta() {
        return motivoConsulta;
    }

    public void setMotivoConsulta(String motivoConsulta) {
        this.motivoConsulta = motivoConsulta;
    }

    public String getEnfermedadActual() {
        return enfermedadActual;
    }

    public void setEnfermedadActual(String enfermedadActual) {
        this.enfermedadActual = enfermedadActual;
    }

    public String getRevisionSistemas() {
        return revisionSistemas;
    }

    public void setRevisionSistemas(String revisionSistemas) {
        this.revisionSistemas = revisionSistemas;
    }

    public String getFechaConsulta() {
        return fechaConsulta;
    }

    public void setFechaConsulta(String fechaConsulta) {
        this.fechaConsulta = fechaConsulta;
    }

    public TipoConsulta getTipoConsulta() {
        return tipoConsulta;
    }

    public void setTipoConsulta(TipoConsulta tipoConsulta) {
        this.tipoConsulta = tipoConsulta;
    }
}
