package com.gestioneps.pacientes.dto;

import com.gestioneps.pacientes.entity.*;
import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;


public class HistoriaClinicaDTO {

    private Long id;

    private String numeroHistoria;

    private Long pacienteId;

    private String pacienteNombre;

    private String pacienteDocumento;

    @NotNull(message = "La fecha de apertura es obligatoria")
    private String fechaApertura;

    // JSON crudo sin procesar (como pacientes)
    private String datosJson;

    private Boolean activa;

    private String fechaCreacion;

    private String fechaActualizacion;

    private String consultasJson;

    // Campos calculados
    private Long numeroConsultas;
    private Long numeroDocumentos;
    private String ultimaConsulta;

    // Constructors
    // Constructor vacío necesario para frameworks de serialización/deserialización
    public HistoriaClinicaDTO() {
        // Este constructor está intencionalmente vacío.
        // Es requerido por frameworks como Hibernate o Jackson para crear instancias de la clase.
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroHistoria() {
        return numeroHistoria;
    }

    public void setNumeroHistoria(String numeroHistoria) {
        this.numeroHistoria = numeroHistoria;
    }

    public Long getPacienteId() {
        return pacienteId;
    }

    public void setPacienteId(Long pacienteId) {
        this.pacienteId = pacienteId;
    }

    public String getPacienteNombre() {
        return pacienteNombre;
    }

    public void setPacienteNombre(String pacienteNombre) {
        this.pacienteNombre = pacienteNombre;
    }

    public String getPacienteDocumento() {
        return pacienteDocumento;
    }

    public void setPacienteDocumento(String pacienteDocumento) {
        this.pacienteDocumento = pacienteDocumento;
    }

    public String getFechaApertura() {
        return fechaApertura;
    }

    public void setFechaApertura(String fechaApertura) {
        this.fechaApertura = fechaApertura;
    }

    public String getDatosJson() {
        return datosJson;
    }

    public void setDatosJson(String datosJson) {
        this.datosJson = datosJson;
    }

    public Boolean getActiva() {
        return activa;
    }

    public void setActiva(Boolean activa) {
        this.activa = activa;
    }

    public String getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(String fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public String getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(String fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public String getConsultasJson() {
        return consultasJson;
    }

    public void setConsultasJson(String consultasJson) {
        this.consultasJson = consultasJson;
    }

    public Long getNumeroConsultas() {
        return numeroConsultas;
    }

    public void setNumeroConsultas(Long numeroConsultas) {
        this.numeroConsultas = numeroConsultas;
    }

    public Long getNumeroDocumentos() {
        return numeroDocumentos;
    }

    public void setNumeroDocumentos(Long numeroDocumentos) {
        this.numeroDocumentos = numeroDocumentos;
    }

    public String getUltimaConsulta() {
        return ultimaConsulta;
    }

    public void setUltimaConsulta(String ultimaConsulta) {
        this.ultimaConsulta = ultimaConsulta;
    }

}
