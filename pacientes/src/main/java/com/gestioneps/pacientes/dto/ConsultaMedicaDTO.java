package main.java.com.gestioneps.pacientes.dto;

import com.gestioneps.pacientes.entity.TipoConsulta;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public class ConsultaMedicaDTO {

    private Long id;

    private Long historiaClinicaId;

    private String numeroHistoria;

    private String pacienteNombre;

    @NotNull(message = "La fecha de consulta es obligatoria")
    private LocalDateTime fechaConsulta;

    @NotBlank(message = "El médico tratante es obligatorio")
    @Size(max = 100, message = "El nombre del médico no puede exceder 100 caracteres")
    private String medicoTratante;

    @Size(max = 100, message = "La especialidad no puede exceder 100 caracteres")
    private String especialidad;

    @NotBlank(message = "El motivo de consulta es obligatorio")
    private String motivoConsulta;

    private String enfermedadActual;

    private String examenFisico;

    private String signosVitales;

    @NotBlank(message = "El diagnóstico principal es obligatorio")
    private String diagnosticoPrincipal;

    private String diagnosticosSecundarios;

    private String planManejo;

    private String medicamentosFormulados;

    private String examenesSolicitados;

    private String recomendaciones;

    private LocalDateTime proximaCita;

    @NotNull(message = "El tipo de consulta es obligatorio")
    private TipoConsulta tipoConsulta;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaActualizacion;

    // Constructors
    public ConsultaMedicaDTO() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getHistoriaClinicaId() {
        return historiaClinicaId;
    }

    public void setHistoriaClinicaId(Long historiaClinicaId) {
        this.historiaClinicaId = historiaClinicaId;
    }

    public String getNumeroHistoria() {
        return numeroHistoria;
    }

    public void setNumeroHistoria(String numeroHistoria) {
        this.numeroHistoria = numeroHistoria;
    }

    public String getPacienteNombre() {
        return pacienteNombre;
    }

    public void setPacienteNombre(String pacienteNombre) {
        this.pacienteNombre = pacienteNombre;
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
