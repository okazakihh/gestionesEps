package com.gestioneps.administrative.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entidad para almacenar la configuración general del sistema IPS
 * Utiliza jsonData para almacenar toda la información de forma flexible
 */
@SuppressWarnings("unused")
@Entity
@Table(name = "configuracion")
public class Configuracion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Campo único para almacenar toda la información de configuración como JSON
    @Column(name = "json_data", columnDefinition = "TEXT", nullable = false)
    private String jsonData;

    // Tipo de configuración para categorizar (ej: "IPS", "SISTEMA", "NOTIFICACIONES")
    @Column(name = "tipo_configuracion", length = 50)
    private String tipoConfiguracion;

    // Clave única para identificar la configuración
    @Column(name = "clave", length = 100, unique = true, nullable = false)
    private String clave;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    // Constructors
    public Configuracion() {
        // Constructor vacío necesario para JPA/Hibernate
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

    public String getTipoConfiguracion() {
        return tipoConfiguracion;
    }

    public void setTipoConfiguracion(String tipoConfiguracion) {
        this.tipoConfiguracion = tipoConfiguracion;
    }

    public String getClave() {
        return clave;
    }

    public void setClave(String clave) {
        this.clave = clave;
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
}
