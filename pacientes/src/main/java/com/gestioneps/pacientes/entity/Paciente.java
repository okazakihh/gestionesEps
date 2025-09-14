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
@Access(AccessType.FIELD)
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

    // Información Personal agrupada en texto (JSON almacenado como TEXT)
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
    public Paciente() {
        // Empty constructor required by JPA for entity instantiation.
        // Intentionally left blank.
    }

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

    // Transient convenience accessors (map to JSON-backed fields)
    @Transient
    public String getPrimerNombre() {
        if (informacionPersonal == null) return null;
        return informacionPersonal.getPrimerNombre();
    }

    public void setPrimerNombre(String primerNombre) {
        if (informacionPersonal == null) informacionPersonal = new InformacionPersonal();
        informacionPersonal.setPrimerNombre(primerNombre);
    }

    @Transient
    public String getSegundoNombre() {
        if (informacionPersonal == null) return null;
        return informacionPersonal.getSegundoNombre();
    }

    public void setSegundoNombre(String segundoNombre) {
        if (informacionPersonal == null) informacionPersonal = new InformacionPersonal();
        informacionPersonal.setSegundoNombre(segundoNombre);
    }

    @Transient
    public String getPrimerApellido() {
        if (informacionPersonal == null) return null;
        return informacionPersonal.getPrimerApellido();
    }

    public void setPrimerApellido(String primerApellido) {
        if (informacionPersonal == null) informacionPersonal = new InformacionPersonal();
        informacionPersonal.setPrimerApellido(primerApellido);
    }

    @Transient
    public String getSegundoApellido() {
        if (informacionPersonal == null) return null;
        return informacionPersonal.getSegundoApellido();
    }

    public void setSegundoApellido(String segundoApellido) {
        if (informacionPersonal == null) informacionPersonal = new InformacionPersonal();
        informacionPersonal.setSegundoApellido(segundoApellido);
    }

    @Transient
    public String getTelefono() {
        if (informacionContacto == null) return null;
        return informacionContacto.getTelefono();
    }

    public void setTelefono(String telefono) {
        if (informacionContacto == null) informacionContacto = new InformacionContacto();
        informacionContacto.setTelefono(telefono);
    }

    @Transient
    public String getEmail() {
        if (informacionContacto == null) return null;
        return informacionContacto.getEmail();
    }

    public void setEmail(String email) {
        if (informacionContacto == null) informacionContacto = new InformacionContacto();
        informacionContacto.setEmail(email);
    }

    @Transient
    public String getNombreContacto() {
        if (contactoEmergencia == null) return null;
        return contactoEmergencia.getNombreContacto();
    }

    public void setNombreContacto(String nombreContacto) {
        if (contactoEmergencia == null) contactoEmergencia = new ContactoEmergencia();
        contactoEmergencia.setNombreContacto(nombreContacto);
    }

    @Transient
    public String getTelefonoContacto() {
        if (contactoEmergencia == null) return null;
        return contactoEmergencia.getTelefonoContacto();
    }

    public void setTelefonoContacto(String telefonoContacto) {
        if (contactoEmergencia == null) contactoEmergencia = new ContactoEmergencia();
        contactoEmergencia.setTelefonoContacto(telefonoContacto);
    }

    @Transient
    public String getAlergias() {
        if (informacionMedica == null) return null;
        return informacionMedica.getAlergias();
    }

    public void setAlergias(String alergias) {
        if (informacionMedica == null) informacionMedica = new InformacionMedica();
        informacionMedica.setAlergias(alergias);
    }

    @Transient
    public String getMedicamentosActuales() {
        if (informacionMedica == null) return null;
        return informacionMedica.getMedicamentosActuales();
    }

    public void setMedicamentosActuales(String medicamentos) {
        if (informacionMedica == null) informacionMedica = new InformacionMedica();
        informacionMedica.setMedicamentosActuales(medicamentos);
    }

    @Transient
    public String getObservacionesMedicas() {
        if (informacionMedica == null) return null;
        return informacionMedica.getObservacionesMedicas();
    }

    public void setObservacionesMedicas(String obs) {
        if (informacionMedica == null) informacionMedica = new InformacionMedica();
        informacionMedica.setObservacionesMedicas(obs);
    }
}
