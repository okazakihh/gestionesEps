package com.gestioneps.administrative.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entidad NotaContable
 * 
 * Representa notas crédito y débito asociadas a facturas.
 * Sigue el patrón de jsonData crudo para flexibilidad.
 * 
 * Estructura del jsonData:
 * {
 *   "tipoNota": "CREDITO|DEBITO",
 *   "numeroNota": "NC-001",
 *   "facturaId": 123,
 *   "numeroFacturaRelacionada": "FAC-001",
 *   "siigoId": "abc123",
 *   "motivoDian": "01",
 *   "motivo": "Devolución de servicio",
 *   "observaciones": "...",
 *   "subtotal": 100000,
 *   "total": 100000,
 *   "serviciosAfectados": [...],
 *   "estadoSiigo": "ACEPTADA",
 *   "fechaCreacion": "2025-12-17T10:30:00",
 *   "cliente": {...}
 * }
 */
@SuppressWarnings("unused")
@Entity
@Table(name = "notas_contables")
public class NotaContable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Campo para almacenar toda la información de la nota como JSON crudo
    @Column(name = "json_data", columnDefinition = "TEXT", nullable = false)
    private String jsonData;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    // Constructors
    public NotaContable() {
        // Constructor vacío necesario para JPA/Hibernate
    }

    public NotaContable(String jsonData) {
        this.jsonData = jsonData;
        this.activo = true;
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

    @Override
    public String toString() {
        return "NotaContable{" +
                "id=" + id +
                ", activo=" + activo +
                ", fechaCreacion=" + fechaCreacion +
                ", fechaActualizacion=" + fechaActualizacion +
                '}';
    }
}
