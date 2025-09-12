package com.gestioneps.pacientes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import org.hibernate.annotations.Type;

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

    @Type(JsonType.class)
    @Column(name = "informacion_medico", columnDefinition = "TEXT")
    @Valid
    @NotNull(message = "La información del médico es obligatoria")
    private InformacionMedicoConsulta informacionMedico;

    @Type(JsonType.class)
    @Column(name = "detalle_consulta", columnDefinition = "TEXT")
    @Valid
    @NotNull(message = "El detalle de la consulta es obligatorio")
    private DetalleConsulta detalleConsulta;

    @Type(JsonType.class)
    @Column(name = "examen_clinico", columnDefinition = "TEXT")
    @Valid
    private ExamenClinicoConsulta examenClinico;

    @Type(JsonType.class)
    @Column(name = "diagnostico_tratamiento", columnDefinition = "TEXT")
    @Valid
    @NotNull(message = "El diagnóstico y tratamiento es obligatorio")
    private DiagnosticoTratamientoConsulta diagnosticoTratamiento;

    @Type(JsonType.class)
    @Column(name = "seguimiento", columnDefinition = "TEXT")
    @Valid
    private SeguimientoConsulta seguimiento;

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

    public InformacionMedicoConsulta getInformacionMedico() {
        return informacionMedico;
    }

    public void setInformacionMedico(InformacionMedicoConsulta informacionMedico) {
        this.informacionMedico = informacionMedico;
    }

    public DetalleConsulta getDetalleConsulta() {
        return detalleConsulta;
    }

    public void setDetalleConsulta(DetalleConsulta detalleConsulta) {
        this.detalleConsulta = detalleConsulta;
    }

    public ExamenClinicoConsulta getExamenClinico() {
        return examenClinico;
    }

    public void setExamenClinico(ExamenClinicoConsulta examenClinico) {
        this.examenClinico = examenClinico;
    }

    public DiagnosticoTratamientoConsulta getDiagnosticoTratamiento() {
        return diagnosticoTratamiento;
    }

    public void setDiagnosticoTratamiento(DiagnosticoTratamientoConsulta diagnosticoTratamiento) {
        this.diagnosticoTratamiento = diagnosticoTratamiento;
    }

    public SeguimientoConsulta getSeguimiento() {
        return seguimiento;
    }

    public void setSeguimiento(SeguimientoConsulta seguimiento) {
        this.seguimiento = seguimiento;
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

    // Métodos de compatibilidad hacia atrás
    public LocalDateTime getFechaConsulta() {
        return detalleConsulta != null ? detalleConsulta.getFechaConsulta() : null;
    }

    public void setFechaConsulta(LocalDateTime fechaConsulta) {
        if (detalleConsulta == null) {
            detalleConsulta = new DetalleConsulta();
        }
        detalleConsulta.setFechaConsulta(fechaConsulta);
    }

    public String getMedicoTratante() {
        return informacionMedico != null ? informacionMedico.getMedicoTratante() : null;
    }

    public void setMedicoTratante(String medicoTratante) {
        if (informacionMedico == null) {
            informacionMedico = new InformacionMedicoConsulta();
        }
        informacionMedico.setMedicoTratante(medicoTratante);
    }

    public String getEspecialidad() {
        return informacionMedico != null ? informacionMedico.getEspecialidad() : null;
    }

    public void setEspecialidad(String especialidad) {
        if (informacionMedico == null) {
            informacionMedico = new InformacionMedicoConsulta();
        }
        informacionMedico.setEspecialidad(especialidad);
    }

    public String getMotivoConsulta() {
        return detalleConsulta != null ? detalleConsulta.getMotivoConsulta() : null;
    }

    public void setMotivoConsulta(String motivoConsulta) {
        if (detalleConsulta == null) {
            detalleConsulta = new DetalleConsulta();
        }
        detalleConsulta.setMotivoConsulta(motivoConsulta);
    }

    public String getEnfermedadActual() {
        return detalleConsulta != null ? detalleConsulta.getEnfermedadActual() : null;
    }

    public void setEnfermedadActual(String enfermedadActual) {
        if (detalleConsulta == null) {
            detalleConsulta = new DetalleConsulta();
        }
        detalleConsulta.setEnfermedadActual(enfermedadActual);
    }

    public String getExamenFisico() {
        return examenClinico != null ? examenClinico.getExamenFisico() : null;
    }

    public void setExamenFisico(String examenFisico) {
        if (examenClinico == null) {
            examenClinico = new ExamenClinicoConsulta();
        }
        examenClinico.setExamenFisico(examenFisico);
    }

    public String getSignosVitales() {
        return examenClinico != null ? examenClinico.getSignosVitales() : null;
    }

    public void setSignosVitales(String signosVitales) {
        if (examenClinico == null) {
            examenClinico = new ExamenClinicoConsulta();
        }
        examenClinico.setSignosVitales(signosVitales);
    }

    public String getDiagnosticoPrincipal() {
        return diagnosticoTratamiento != null ? diagnosticoTratamiento.getDiagnosticoPrincipal() : null;
    }

    public void setDiagnosticoPrincipal(String diagnosticoPrincipal) {
        if (diagnosticoTratamiento == null) {
            diagnosticoTratamiento = new DiagnosticoTratamientoConsulta();
        }
        diagnosticoTratamiento.setDiagnosticoPrincipal(diagnosticoPrincipal);
    }

    public String getDiagnosticosSecundarios() {
        return diagnosticoTratamiento != null ? diagnosticoTratamiento.getDiagnosticosSecundarios() : null;
    }

    public void setDiagnosticosSecundarios(String diagnosticosSecundarios) {
        if (diagnosticoTratamiento == null) {
            diagnosticoTratamiento = new DiagnosticoTratamientoConsulta();
        }
        diagnosticoTratamiento.setDiagnosticosSecundarios(diagnosticosSecundarios);
    }

    public String getPlanManejo() {
        return diagnosticoTratamiento != null ? diagnosticoTratamiento.getPlanManejo() : null;
    }

    public void setPlanManejo(String planManejo) {
        if (diagnosticoTratamiento == null) {
            diagnosticoTratamiento = new DiagnosticoTratamientoConsulta();
        }
        diagnosticoTratamiento.setPlanManejo(planManejo);
    }

    public String getMedicamentosFormulados() {
        return diagnosticoTratamiento != null ? diagnosticoTratamiento.getMedicamentosFormulados() : null;
    }

    public void setMedicamentosFormulados(String medicamentosFormulados) {
        if (diagnosticoTratamiento == null) {
            diagnosticoTratamiento = new DiagnosticoTratamientoConsulta();
        }
        diagnosticoTratamiento.setMedicamentosFormulados(medicamentosFormulados);
    }

    public String getExamenesSolicitados() {
        return diagnosticoTratamiento != null ? diagnosticoTratamiento.getExamenesSolicitados() : null;
    }

    public void setExamenesSolicitados(String examenesSolicitados) {
        if (diagnosticoTratamiento == null) {
            diagnosticoTratamiento = new DiagnosticoTratamientoConsulta();
        }
        diagnosticoTratamiento.setExamenesSolicitados(examenesSolicitados);
    }

    public String getRecomendaciones() {
        return diagnosticoTratamiento != null ? diagnosticoTratamiento.getRecomendaciones() : null;
    }

    public void setRecomendaciones(String recomendaciones) {
        if (diagnosticoTratamiento == null) {
            diagnosticoTratamiento = new DiagnosticoTratamientoConsulta();
        }
        diagnosticoTratamiento.setRecomendaciones(recomendaciones);
    }
}
