package com.gestioneps.pacientes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "codigos_cups")
public class CodigosCups {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_cup", unique = true, nullable = false)
    @NotBlank(message = "El código CUP es obligatorio")
    private String codigoCup;

    @Column(name = "nombre_cup", nullable = false)
    @NotBlank(message = "El nombre del CUP es obligatorio")
    private String nombreCup;

    // Campo único para almacenar toda la información del código CUP en JSON
    @Column(name = "datos_json", columnDefinition = "TEXT")
    private String datosJson;

    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    // Constructors
    public CodigosCups() {
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

    public String getCodigoCup() {
        return codigoCup;
    }

    public void setCodigoCup(String codigoCup) {
        this.codigoCup = codigoCup;
    }

    public String getNombreCup() {
        return nombreCup;
    }

    public void setNombreCup(String nombreCup) {
        this.nombreCup = nombreCup;
    }

    public String getDatosJson() {
        return datosJson;
    }

    public void setDatosJson(String datosJson) {
        this.datosJson = datosJson;
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