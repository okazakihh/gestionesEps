package com.gestioneps.pacientes.dto;

import com.gestioneps.pacientes.entity.*;
import jakarta.validation.constraints.*;
import jakarta.validation.Valid;

import java.time.LocalDateTime;

public class PacienteDTO {

    private Long id;

    @NotBlank(message = "El número de documento es obligatorio")
    private String numeroDocumento;

    @NotNull(message = "El tipo de documento es obligatorio")
    private TipoDocumento tipoDocumento;

    // JSON crudo de la base de datos
    private String datosJson;

    // Campos JSON individuales para el frontend
    private String informacionPersonalJson;
    private String informacionContactoJson;
    private String informacionMedicaJson;
    private String contactoEmergenciaJson;

    private Boolean activo;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaActualizacion;

    // Campos calculados
    private String nombreCompleto;
    private Integer edad;
    private Long numeroHistoriasClinicas;

    // Constructors
    public PacienteDTO() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroDocumento() {
        return numeroDocumento;
    }

    public void setNumeroDocumento(String numeroDocumento) {
        this.numeroDocumento = numeroDocumento;
    }

    public TipoDocumento getTipoDocumento() {
        return tipoDocumento;
    }

    public void setTipoDocumento(TipoDocumento tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }

    public String getDatosJson() {
        return datosJson;
    }

    public void setDatosJson(String datosJson) {
        this.datosJson = datosJson;
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

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public Integer getEdad() {
        return edad;
    }

    public void setEdad(Integer edad) {
        this.edad = edad;
    }

    public Long getNumeroHistoriasClinicas() {
        return numeroHistoriasClinicas;
    }

    public void setNumeroHistoriasClinicas(Long numeroHistoriasClinicas) {
        this.numeroHistoriasClinicas = numeroHistoriasClinicas;
    }

    public String getInformacionPersonalJson() {
        return informacionPersonalJson;
    }

    public void setInformacionPersonalJson(String informacionPersonalJson) {
        this.informacionPersonalJson = informacionPersonalJson;
    }

    public String getInformacionContactoJson() {
        return informacionContactoJson;
    }

    public void setInformacionContactoJson(String informacionContactoJson) {
        this.informacionContactoJson = informacionContactoJson;
    }

    public String getInformacionMedicaJson() {
        return informacionMedicaJson;
    }

    public void setInformacionMedicaJson(String informacionMedicaJson) {
        this.informacionMedicaJson = informacionMedicaJson;
    }

    public String getContactoEmergenciaJson() {
        return contactoEmergenciaJson;
    }

    public void setContactoEmergenciaJson(String contactoEmergenciaJson) {
        this.contactoEmergenciaJson = contactoEmergenciaJson;
    }
}
