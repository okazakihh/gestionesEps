package com.gestioneps.pacientes.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public class DocumentoMedicoDTO {

    private Long id;

    private Long citaMedicaId;

    private String numeroHistoria;

    private String pacienteNombre;

    @NotBlank(message = "El nombre del archivo es obligatorio")
    @Size(max = 255, message = "El nombre del archivo no puede exceder 255 caracteres")
    private String nombreArchivo;

    @NotBlank(message = "El tipo de archivo es obligatorio")
    @Size(max = 100, message = "El tipo de archivo no puede exceder 100 caracteres")
    private String tipoArchivo;

    private String archivoBase64;

    @Size(max = 500, message = "El documento no puede exceder 500 caracteres")
    private String documento;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaActualizacion;

    // Constructors
    public DocumentoMedicoDTO() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCitaMedicaId() {
        return citaMedicaId;
    }

    public void setCitaMedicaId(Long citaMedicaId) {
        this.citaMedicaId = citaMedicaId;
    }

    public String getNumeroHistoria() {
        return numeroHistoria;
    }

    public void setNumeroHistoria(String numeroHistoria) {
        this.numeroHistoria = numeroHistoria;
    }

    public String getPacienteNombre() {
        return pacienteNombre;
    }

    public void setPacienteNombre(String pacienteNombre) {
        this.pacienteNombre = pacienteNombre;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public String getTipoArchivo() {
        return tipoArchivo;
    }

    public void setTipoArchivo(String tipoArchivo) {
        this.tipoArchivo = tipoArchivo;
    }

    public String getArchivoBase64() {
        return archivoBase64;
    }

    public void setArchivoBase64(String archivoBase64) {
        this.archivoBase64 = archivoBase64;
    }

    public String getDocumento() {
        return documento;
    }

    public void setDocumento(String documento) {
        this.documento = documento;
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
