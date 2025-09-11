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
@Table(name = "historias_clinicas")
public class HistoriaClinica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_historia", unique = true, nullable = false)
    @NotBlank(message = "El número de historia clínica es obligatorio")
    private String numeroHistoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    @NotNull(message = "El paciente es obligatorio")
    private Paciente paciente;

    @Column(name = "fecha_apertura", nullable = false)
    @NotNull(message = "La fecha de apertura es obligatoria")
    private LocalDateTime fechaApertura;

    // Información del médico agrupada en JSON
    @Type(JsonType.class)
    @Column(name = "informacion_medico", columnDefinition = "TEXT")
    @Valid
    private InformacionMedico informacionMedico;

    // Información de la consulta agrupada en JSON
    @Type(JsonType.class)
    @Column(name = "informacion_consulta", columnDefinition = "TEXT")
    @Valid
    private InformacionConsulta informacionConsulta;

    // Antecedentes clínicos agrupados en JSON
    @Type(JsonType.class)
    @Column(name = "antecedentes_clinico", columnDefinition = "TEXT")
    @Valid
    private AntecedentesClinico antecedentesClinico;

    // Examen clínico agrupado en JSON
    @Type(JsonType.class)
    @Column(name = "examen_clinico", columnDefinition = "TEXT")
    @Valid
    private ExamenClinico examenClinico;

    // Diagnóstico y tratamiento agrupados en JSON
    @Type(JsonType.class)
    @Column(name = "diagnostico_tratamiento", columnDefinition = "TEXT")
    @Valid
    private DiagnosticoTratamiento diagnosticoTratamiento;

    @Column(name = "activa", nullable = false)
    private Boolean activa = true;

    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    @OneToMany(mappedBy = "historiaClinica", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ConsultaMedica> consultas = new ArrayList<>();

    @OneToMany(mappedBy = "historiaClinica", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DocumentoMedico> documentos = new ArrayList<>();

    // Constructors
    public HistoriaClinica() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroHistoria() {
        return numeroHistoria;
    }

    public void setNumeroHistoria(String numeroHistoria) {
        this.numeroHistoria = numeroHistoria;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public LocalDateTime getFechaApertura() {
        return fechaApertura;
    }

    public void setFechaApertura(LocalDateTime fechaApertura) {
        this.fechaApertura = fechaApertura;
    }

    public InformacionMedico getInformacionMedico() {
        return informacionMedico;
    }

    public void setInformacionMedico(InformacionMedico informacionMedico) {
        this.informacionMedico = informacionMedico;
    }

    public InformacionConsulta getInformacionConsulta() {
        return informacionConsulta;
    }

    public void setInformacionConsulta(InformacionConsulta informacionConsulta) {
        this.informacionConsulta = informacionConsulta;
    }

    public AntecedentesClinico getAntecedentesClinico() {
        return antecedentesClinico;
    }

    public void setAntecedentesClinico(AntecedentesClinico antecedentesClinico) {
        this.antecedentesClinico = antecedentesClinico;
    }

    public ExamenClinico getExamenClinico() {
        return examenClinico;
    }

    public void setExamenClinico(ExamenClinico examenClinico) {
        this.examenClinico = examenClinico;
    }

    public DiagnosticoTratamiento getDiagnosticoTratamiento() {
        return diagnosticoTratamiento;
    }

    public void setDiagnosticoTratamiento(DiagnosticoTratamiento diagnosticoTratamiento) {
        this.diagnosticoTratamiento = diagnosticoTratamiento;
    }

    public Boolean getActiva() {
        return activa;
    }

    public void setActiva(Boolean activa) {
        this.activa = activa;
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

    public List<ConsultaMedica> getConsultas() {
        return consultas;
    }

    public void setConsultas(List<ConsultaMedica> consultas) {
        this.consultas = consultas;
    }

    public List<DocumentoMedico> getDocumentos() {
        return documentos;
    }

    public void setDocumentos(List<DocumentoMedico> documentos) {
        this.documentos = documentos;
    }

    // Utility methods for backward compatibility
    public String getMedicoResponsable() {
        return informacionMedico != null ? informacionMedico.getMedicoResponsable() : null;
    }

    public String getRegistroMedico() {
        return informacionMedico != null ? informacionMedico.getRegistroMedico() : null;
    }

    public String getMotivoConsulta() {
        return informacionConsulta != null ? informacionConsulta.getMotivoConsulta() : null;
    }

    public String getEnfermedadActual() {
        return informacionConsulta != null ? informacionConsulta.getEnfermedadActual() : null;
    }

    public String getRevisionSistemas() {
        return informacionConsulta != null ? informacionConsulta.getRevisionSistemas() : null;
    }

    public String getMedicamentosActuales() {
        return informacionConsulta != null ? informacionConsulta.getMedicamentosActuales() : null;
    }

    public String getObservaciones() {
        return informacionConsulta != null ? informacionConsulta.getObservaciones() : null;
    }

    public String getAntecedentesPersonales() {
        return antecedentesClinico != null ? antecedentesClinico.getAntecedentesPersonales() : null;
    }

    public String getAntecedentesFamiliares() {
        return antecedentesClinico != null ? antecedentesClinico.getAntecedentesFamiliares() : null;
    }

    public String getAntecedentesQuirurgicos() {
        return antecedentesClinico != null ? antecedentesClinico.getAntecedentesQuirurgicos() : null;
    }

    public String getAntecedentesAlergicos() {
        return antecedentesClinico != null ? antecedentesClinico.getAntecedentesAlergicos() : null;
    }

    public String getExamenFisico() {
        return examenClinico != null ? examenClinico.getExamenFisico() : null;
    }

    public String getSignosVitales() {
        return examenClinico != null ? examenClinico.getSignosVitales() : null;
    }

    public String getDiagnosticos() {
        return diagnosticoTratamiento != null ? diagnosticoTratamiento.getDiagnosticos() : null;
    }

    public String getPlanTratamiento() {
        return diagnosticoTratamiento != null ? diagnosticoTratamiento.getPlanTratamiento() : null;
    }
}
