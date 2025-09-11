package main.java.com.gestioneps.pacientes.dto;

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

    @Valid
    @NotNull(message = "La información personal es obligatoria")
    private InformacionPersonal informacionPersonal;

    @Valid
    private InformacionContacto informacionContacto;

    @Valid
    private InformacionMedica informacionMedica;

    @Valid
    private ContactoEmergencia contactoEmergencia;

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

    public InformacionPersonal getInformacionPersonal() {
        return informacionPersonal;
    }

    public void setInformacionPersonal(InformacionPersonal informacionPersonal) {
        this.informacionPersonal = informacionPersonal;
    }

    public InformacionContacto getInformacionContacto() {
        return informacionContacto;
    }

    public void setInformacionContacto(InformacionContacto informacionContacto) {
        this.informacionContacto = informacionContacto;
    }

    public InformacionMedica getInformacionMedica() {
        return informacionMedica;
    }

    public void setInformacionMedica(InformacionMedica informacionMedica) {
        this.informacionMedica = informacionMedica;
    }

    public ContactoEmergencia getContactoEmergencia() {
        return contactoEmergencia;
    }

    public void setContactoEmergencia(ContactoEmergencia contactoEmergencia) {
        this.contactoEmergencia = contactoEmergencia;
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
}
