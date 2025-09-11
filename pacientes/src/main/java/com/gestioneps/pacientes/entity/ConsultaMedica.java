package com.gestioneps.pacientes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "consultas_medicas")
public class ConsultaMedica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historia_clinica_id", nullable = false)
    @NotNull(message = "La historia clínica es obligatoria")
    private HistoriaClinica historiaClinica;

    @Column(name = "fecha_consulta", nullable = false)
    @NotNull(message = "La fecha de consulta es obligatoria")
    private LocalDateTime fechaConsulta;

    @Column(name = "medico_tratante", nullable = false)
    @NotBlank(message = "El médico tratante es obligatorio")
    @Size(max = 100, message = "El nombre del médico no puede exceder 100 caracteres")
    private String medicoTratante;

    @Column(name = "especialidad")
    @Size(max = 100, message = "La especialidad no puede exceder 100 caracteres")
    private String especialidad;

    @Column(name = "motivo_consulta", columnDefinition = "TEXT")
    @NotBlank(message = "El motivo de consulta es obligatorio")
    private String motivoConsulta;

    @Column(name = "enfermedad_actual", columnDefinition = "TEXT")
    private String enfermedadActual;

    @Column(name = "examen_fisico", columnDefinition = "TEXT")
    private String examenFisico;

    @Column(name = "signos_vitales")
    private String signosVitales;

    @Column(name = "diagnostico_principal", columnDefinition = "TEXT")
    @NotBlank(message = "El diagnóstico principal es obligatorio")
    private String diagnosticoPrincipal;

    @Column(name = "diagnosticos_secundarios", columnDefinition = "TEXT")
    private String diagnosticosSecundarios;

    @Column(name = "plan_manejo", columnDefinition = "TEXT")
    private String planManejo;

    @Column(name = "medicamentos_formulados", columnDefinition = "TEXT")
    private String medicamentosFormulados;

    @Column(name = "examenes_solicitados", columnDefinition = "TEXT")
    private String examenesSolicitados;

    @Column(name = "recomendaciones", columnDefinition = "TEXT")
    private String recomendaciones;

    @Column(name = "proxima_cita")
    private LocalDateTime proximaCita;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_consulta", nullable = false)
    @NotNull(message = "El tipo de consulta es obligatorio")
    private TipoConsulta tipoConsulta;

    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    // Constructors
    public ConsultaMedica() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public HistoriaClinica getHistoriaClinica() {
        return historiaClinica;
    }

    public void setHistoriaClinica(HistoriaClinica historiaClinica) {
        this.historiaClinica = historiaClinica;
    }

    public LocalDateTime getFechaConsulta() {
        return fechaConsulta;
    }

    public void setFechaConsulta(LocalDateTime fechaConsulta) {
        this.fechaConsulta = fechaConsulta;
    }

    public String getMedicoTratante() {
        return medicoTratante;
    }

    public void setMedicoTratante(String medicoTratante) {
        this.medicoTratante = medicoTratante;
    }

    public String getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }

    public String getMotivoConsulta() {
        return motivoConsulta;
    }

    public void setMotivoConsulta(String motivoConsulta) {
        this.motivoConsulta = motivoConsulta;
    }

    public String getEnfermedadActual() {
        return enfermedadActual;
    }

    public void setEnfermedadActual(String enfermedadActual) {
        this.enfermedadActual = enfermedadActual;
    }

    public String getExamenFisico() {
        return examenFisico;
    }

    public void setExamenFisico(String examenFisico) {
        this.examenFisico = examenFisico;
    }

    public String getSignosVitales() {
        return signosVitales;
    }

    public void setSignosVitales(String signosVitales) {
        this.signosVitales = signosVitales;
    }

    public String getDiagnosticoPrincipal() {
        return diagnosticoPrincipal;
    }

    public void setDiagnosticoPrincipal(String diagnosticoPrincipal) {
        this.diagnosticoPrincipal = diagnosticoPrincipal;
    }

    public String getDiagnosticosSecundarios() {
        return diagnosticosSecundarios;
    }

    public void setDiagnosticosSecundarios(String diagnosticosSecundarios) {
        this.diagnosticosSecundarios = diagnosticosSecundarios;
    }

    public String getPlanManejo() {
        return planManejo;
    }

    public void setPlanManejo(String planManejo) {
        this.planManejo = planManejo;
    }

    public String getMedicamentosFormulados() {
        return medicamentosFormulados;
    }

    public void setMedicamentosFormulados(String medicamentosFormulados) {
        this.medicamentosFormulados = medicamentosFormulados;
    }

    public String getExamenesSolicitados() {
        return examenesSolicitados;
    }

    public void setExamenesSolicitados(String examenesSolicitados) {
        this.examenesSolicitados = examenesSolicitados;
    }

    public String getRecomendaciones() {
        return recomendaciones;
    }

    public void setRecomendaciones(String recomendaciones) {
        this.recomendaciones = recomendaciones;
    }

    public LocalDateTime getProximaCita() {
        return proximaCita;
    }

    public void setProximaCita(LocalDateTime proximaCita) {
        this.proximaCita = proximaCita;
    }

    public TipoConsulta getTipoConsulta() {
        return tipoConsulta;
    }

    public void setTipoConsulta(TipoConsulta tipoConsulta) {
        this.tipoConsulta = tipoConsulta;
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
