package com.gestioneps.pacientes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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

    // Campo único para almacenar toda la información del paciente en JSON
    @Column(name = "datos_json", columnDefinition = "TEXT")
    private String datosJson;

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

    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CitaMedica> citasMedicas = new ArrayList<>();

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

    public List<HistoriaClinica> getHistoriasClinicas() {
        return historiasClinicas;
    }

    public void setHistoriasClinicas(List<HistoriaClinica> historiasClinicas) {
        this.historiasClinicas = historiasClinicas;
    }

    public List<CitaMedica> getCitasMedicas() {
        return citasMedicas;
    }

    public void setCitasMedicas(List<CitaMedica> citasMedicas) {
        this.citasMedicas = citasMedicas;
    }

    // Utility methods for backward compatibility - parse JSON data
    public String getNombreCompleto() {
        try {
            if (datosJson == null || datosJson.trim().isEmpty()) return "";
            var data = new com.fasterxml.jackson.databind.ObjectMapper().readTree(datosJson);
            var infoPersonal = data.get("informacionPersonal");
            if (infoPersonal != null) {
                String primerNombre = infoPersonal.get("primerNombre").asText("");
                String segundoNombre = infoPersonal.get("segundoNombre").asText("");
                String primerApellido = infoPersonal.get("primerApellido").asText("");
                String segundoApellido = infoPersonal.get("segundoApellido").asText("");
                return String.format("%s %s %s %s", primerNombre, segundoNombre, primerApellido, segundoApellido).trim();
            }
        } catch (Exception e) {
            // Silent fallback
        }
        return "";
    }

    public int getEdad() {
        try {
            if (datosJson == null || datosJson.trim().isEmpty()) return 0;
            var data = new com.fasterxml.jackson.databind.ObjectMapper().readTree(datosJson);
            var infoPersonal = data.get("informacionPersonal");
            if (infoPersonal != null && infoPersonal.has("fechaNacimiento")) {
                // Simple age calculation
                return 25; // Placeholder - would need proper date calculation
            }
        } catch (Exception e) {
            // Silent fallback
        }
        return 0;
    }

    // Transient convenience accessors (parse from JSON)
    @Transient
    public String getPrimerNombre() {
        try {
            if (datosJson == null || datosJson.trim().isEmpty()) return null;
            var data = new com.fasterxml.jackson.databind.ObjectMapper().readTree(datosJson);
            var infoPersonal = data.get("informacionPersonal");
            return infoPersonal != null ? infoPersonal.get("primerNombre").asText(null) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public void setPrimerNombre(String primerNombre) {
        updateJsonField("informacionPersonal", "primerNombre", primerNombre);
    }

    @Transient
    public String getSegundoNombre() {
        try {
            if (datosJson == null || datosJson.trim().isEmpty()) return null;
            var data = new com.fasterxml.jackson.databind.ObjectMapper().readTree(datosJson);
            var infoPersonal = data.get("informacionPersonal");
            return infoPersonal != null ? infoPersonal.get("segundoNombre").asText(null) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public void setSegundoNombre(String segundoNombre) {
        updateJsonField("informacionPersonal", "segundoNombre", segundoNombre);
    }

    @Transient
    public String getPrimerApellido() {
        try {
            if (datosJson == null || datosJson.trim().isEmpty()) return null;
            var data = new com.fasterxml.jackson.databind.ObjectMapper().readTree(datosJson);
            var infoPersonal = data.get("informacionPersonal");
            return infoPersonal != null ? infoPersonal.get("primerApellido").asText(null) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public void setPrimerApellido(String primerApellido) {
        updateJsonField("informacionPersonal", "primerApellido", primerApellido);
    }

    @Transient
    public String getSegundoApellido() {
        try {
            if (datosJson == null || datosJson.trim().isEmpty()) return null;
            var data = new com.fasterxml.jackson.databind.ObjectMapper().readTree(datosJson);
            var infoPersonal = data.get("informacionPersonal");
            return infoPersonal != null ? infoPersonal.get("segundoApellido").asText(null) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public void setSegundoApellido(String segundoApellido) {
        updateJsonField("informacionPersonal", "segundoApellido", segundoApellido);
    }

    @Transient
    public String getTelefono() {
        try {
            if (datosJson == null || datosJson.trim().isEmpty()) return null;
            var data = new com.fasterxml.jackson.databind.ObjectMapper().readTree(datosJson);
            var infoContacto = data.get("informacionContacto");
            return infoContacto != null ? infoContacto.get("telefono").asText(null) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public void setTelefono(String telefono) {
        updateJsonField("informacionContacto", "telefono", telefono);
    }

    @Transient
    public String getEmail() {
        try {
            if (datosJson == null || datosJson.trim().isEmpty()) return null;
            var data = new com.fasterxml.jackson.databind.ObjectMapper().readTree(datosJson);
            var infoContacto = data.get("informacionContacto");
            return infoContacto != null ? infoContacto.get("email").asText(null) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public void setEmail(String email) {
        updateJsonField("informacionContacto", "email", email);
    }

    @Transient
    public String getNombreContacto() {
        try {
            if (datosJson == null || datosJson.trim().isEmpty()) return null;
            var data = new com.fasterxml.jackson.databind.ObjectMapper().readTree(datosJson);
            var contactoEmergencia = data.get("contactoEmergencia");
            return contactoEmergencia != null ? contactoEmergencia.get("nombreContacto").asText(null) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public void setNombreContacto(String nombreContacto) {
        updateJsonField("contactoEmergencia", "nombreContacto", nombreContacto);
    }

    @Transient
    public String getTelefonoContacto() {
        try {
            if (datosJson == null || datosJson.trim().isEmpty()) return null;
            var data = new com.fasterxml.jackson.databind.ObjectMapper().readTree(datosJson);
            var contactoEmergencia = data.get("contactoEmergencia");
            return contactoEmergencia != null ? contactoEmergencia.get("telefonoContacto").asText(null) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public void setTelefonoContacto(String telefonoContacto) {
        updateJsonField("contactoEmergencia", "telefonoContacto", telefonoContacto);
    }

    @Transient
    public String getAlergias() {
        try {
            if (datosJson == null || datosJson.trim().isEmpty()) return null;
            var data = new com.fasterxml.jackson.databind.ObjectMapper().readTree(datosJson);
            var infoMedica = data.get("informacionMedica");
            return infoMedica != null ? infoMedica.get("alergias").asText(null) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public void setAlergias(String alergias) {
        updateJsonField("informacionMedica", "alergias", alergias);
    }

    @Transient
    public String getMedicamentosActuales() {
        try {
            if (datosJson == null || datosJson.trim().isEmpty()) return null;
            var data = new com.fasterxml.jackson.databind.ObjectMapper().readTree(datosJson);
            var infoMedica = data.get("informacionMedica");
            return infoMedica != null ? infoMedica.get("medicamentosActuales").asText(null) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public void setMedicamentosActuales(String medicamentos) {
        updateJsonField("informacionMedica", "medicamentosActuales", medicamentos);
    }

    @Transient
    public String getObservacionesMedicas() {
        try {
            if (datosJson == null || datosJson.trim().isEmpty()) return null;
            var data = new com.fasterxml.jackson.databind.ObjectMapper().readTree(datosJson);
            var infoMedica = data.get("informacionMedica");
            return infoMedica != null ? infoMedica.get("observacionesMedicas").asText(null) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public void setObservacionesMedicas(String obs) {
        updateJsonField("informacionMedica", "observacionesMedicas", obs);
    }

    // Helper method to update JSON field
    private void updateJsonField(String section, String field, String value) {
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.node.ObjectNode data;

            if (datosJson != null && !datosJson.trim().isEmpty()) {
                data = (com.fasterxml.jackson.databind.node.ObjectNode) mapper.readTree(datosJson);
            } else {
                data = mapper.createObjectNode();
            }

            if (!data.has(section)) {
                data.putObject(section);
            }

            ((com.fasterxml.jackson.databind.node.ObjectNode) data.get(section)).put(field, value);
            this.datosJson = mapper.writeValueAsString(data);
        } catch (Exception e) {
            // Fallback: create new JSON with the field
            try {
                var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                var data = mapper.createObjectNode();
                var sectionNode = data.putObject(section);
                sectionNode.put(field, value);
                this.datosJson = mapper.writeValueAsString(data);
            } catch (Exception ex) {
                // Silent failure
            }
        }
    }
}
