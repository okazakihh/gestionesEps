package com.gestioneps.pacientes.dto;

import com.gestioneps.pacientes.entity.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public class ConsultaMedicaDTO {

    private Long id;

    private Long historiaClinicaId;

    private String numeroHistoria;

    private String pacienteNombre;

    @Valid
    @NotNull(message = "La información del médico es obligatoria")
    private InformacionMedicoConsulta informacionMedico;

    @Valid
    @NotNull(message = "El detalle de la consulta es obligatorio")
    private DetalleConsulta detalleConsulta;

    @Valid
    private ExamenClinicoConsulta examenClinico;

    @Valid
    @NotNull(message = "El diagnóstico y tratamiento es obligatorio")
    private DiagnosticoTratamientoConsulta diagnosticoTratamiento;

    @Valid
    private SeguimientoConsulta seguimiento;

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

    public LocalDateTime getProximaCita() {
        return seguimiento != null ? seguimiento.getProximaCita() : null;
    }

    public void setProximaCita(LocalDateTime proximaCita) {
        if (seguimiento == null) {
            seguimiento = new SeguimientoConsulta();
        }
        seguimiento.setProximaCita(proximaCita);
    }

    public TipoConsulta getTipoConsulta() {
        return detalleConsulta != null ? detalleConsulta.getTipoConsulta() : null;
    }

    public void setTipoConsulta(TipoConsulta tipoConsulta) {
        if (detalleConsulta == null) {
            detalleConsulta = new DetalleConsulta();
        }
        detalleConsulta.setTipoConsulta(tipoConsulta);
    }
}
