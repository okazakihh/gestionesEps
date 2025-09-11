package com.gestioneps.pacientes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pacientes")
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_documento", unique = true, nullable = false)
    @NotBlank(message = "El número de documento es obligatorio")
    private String numeroDocumento;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_documento", nullable = false)
    @NotNull(message = "El tipo de documento es obligatorio")
    private TipoDocumento tipoDocumento;

    // Información Personal agrupada en JSON
    @Type(JsonType.class)
    @Column(name = "informacion_personal", columnDefinition = "TEXT")
    @Valid
    @NotNull(message = "La información personal es obligatoria")
    private InformacionPersonal informacionPersonal;

    // Información de Contacto agrupada en JSON
    @Type(JsonType.class)
    @Column(name = "informacion_contacto", columnDefinition = "TEXT")
    @Valid
    private InformacionContacto informacionContacto;

    // Información Médica agrupada en JSON
    @Type(JsonType.class)
    @Column(name = "informacion_medica", columnDefinition = "TEXT")
    @Valid
    private InformacionMedica informacionMedica;

    // Contacto de Emergencia agrupado en JSON
    @Type(JsonType.class)
    @Column(name = "contacto_emergencia", columnDefinition = "TEXT")
    @Valid
    private ContactoEmergencia contactoEmergencia;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HistoriaClinica> historiasClinicas = new ArrayList<>();

    // Constructors
    public Paciente() {}

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

    public List<HistoriaClinica> getHistoriasClinicas() {
        return historiasClinicas;
    }

    public void setHistoriasClinicas(List<HistoriaClinica> historiasClinicas) {
        this.historiasClinicas = historiasClinicas;
    }

    // Utility methods
    public String getNombreCompleto() {
        if (informacionPersonal == null) return "";
        return informacionPersonal.getNombreCompleto();
    }

    public int getEdad() {
        if (informacionPersonal == null) return 0;
        return informacionPersonal.getEdad();
    }
}
