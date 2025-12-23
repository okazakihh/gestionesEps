package com.gestioneps.administrative.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entidad ClienteFacturacion
 * 
 * Representa entidades o personas a las cuales se dirigen las facturas.
 * Sigue el patrón de jsonData crudo para flexibilidad.
 * 
 * Estructura del jsonData:
 * {
 *   "tipoDocumento": "CC|NIT|CE|TI|PAS",
 *   "numeroDocumento": "123456789",
 *   "tipoPersona": "NATURAL|JURIDICA",
 *   "nombreCompleto": "Juan Pérez" | "Empresa SA",
 *   "nombres": "Juan",
 *   "apellidos": "Pérez",
 *   "razonSocial": "Empresa SA",
 *   "email": "cliente@example.com",
 *   "telefono": "3001234567",
 *   "direccion": {
 *     "calle": "Calle 123 #45-67",
 *     "ciudad": "Bogotá",
 *     "departamento": "Cundinamarca",
 *     "codigoPostal": "110111"
 *   },
 *   "siigoId": "abc123",
 *   "codigoClienteSiigo": "CLI-001",
 *   "informacionTributaria": {
 *     "responsableIVA": true,
 *     "granContribuyente": false,
 *     "regimenFiscal": "COMUN|SIMPLIFICADO"
 *   },
 *   "observaciones": "...",
 *   "activo": true
 * }
 */
@SuppressWarnings("unused")
@Entity
@Table(name = "clientes_facturacion")
public class ClienteFacturacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Campo para almacenar toda la información del cliente como JSON crudo
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
    public ClienteFacturacion() {
        // Constructor vacío necesario para JPA/Hibernate
    }

    public ClienteFacturacion(String jsonData) {
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
        return "ClienteFacturacion{" +
                "id=" + id +
                ", activo=" + activo +
                ", fechaCreacion=" + fechaCreacion +
                ", fechaActualizacion=" + fechaActualizacion +
                '}';
    }
}
