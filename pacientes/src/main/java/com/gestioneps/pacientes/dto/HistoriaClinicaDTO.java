package com.gestioneps.pacientes.dto;

import com.gestioneps.pacientes.entity.*;
import jakarta.validation.constraints.*;
import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.List;

public class HistoriaClinicaDTO {

    private Long id;

    private String numeroHistoria;

    private Long pacienteId;

    private String pacienteNombre;

    private String pacienteDocumento;

    @NotNull(message = "La fecha de apertura es obligatoria")
    private LocalDateTime fechaApertura;

    // Información agrupada en JSON
    @Valid
    private InformacionMedico informacionMedico;

    @Valid
    private InformacionConsulta informacionConsulta;

    @Valid
    private AntecedentesClinico antecedentesClinico;

    @Valid
    private ExamenClinico examenClinico;

    @Valid
    private DiagnosticoTratamiento diagnosticoTratamiento;

    private Boolean activa;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaActualizacion;

    // Campos calculados
    private Long numeroConsultas;
    private Long numeroDocumentos;
    private LocalDateTime ultimaConsulta;

    // Constructors
    public HistoriaClinicaDTO() {}

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

    public Long getPacienteId() {
        return pacienteId;
    }

    public void setPacienteId(Long pacienteId) {
        this.pacienteId = pacienteId;
    }

    public String getPacienteNombre() {
        return pacienteNombre;
    }

    public void setPacienteNombre(String pacienteNombre) {
        this.pacienteNombre = pacienteNombre;
    }

    public String getPacienteDocumento() {
        return pacienteDocumento;
    }

    public void setPacienteDocumento(String pacienteDocumento) {
        this.pacienteDocumento = pacienteDocumento;
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

    public Long getNumeroConsultas() {
        return numeroConsultas;
    }

    public void setNumeroConsultas(Long numeroConsultas) {
        this.numeroConsultas = numeroConsultas;
    }

    public Long getNumeroDocumentos() {
        return numeroDocumentos;
    }

    public void setNumeroDocumentos(Long numeroDocumentos) {
        this.numeroDocumentos = numeroDocumentos;
    }

    public LocalDateTime getUltimaConsulta() {
        return ultimaConsulta;
    }

    public void setUltimaConsulta(LocalDateTime ultimaConsulta) {
        this.ultimaConsulta = ultimaConsulta;
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

    // Setter methods for backward compatibility
    public void setMedicoResponsable(String medicoResponsable) {
        if (informacionMedico == null) {
            informacionMedico = new InformacionMedico();
        }
        informacionMedico.setMedicoResponsable(medicoResponsable);
    }

    public void setRegistroMedico(String registroMedico) {
        if (informacionMedico == null) {
            informacionMedico = new InformacionMedico();
        }
        informacionMedico.setRegistroMedico(registroMedico);
    }

    public void setMotivoConsulta(String motivoConsulta) {
        if (informacionConsulta == null) {
            informacionConsulta = new InformacionConsulta();
        }
        informacionConsulta.setMotivoConsulta(motivoConsulta);
    }

    public void setEnfermedadActual(String enfermedadActual) {
        if (informacionConsulta == null) {
            informacionConsulta = new InformacionConsulta();
        }
        informacionConsulta.setEnfermedadActual(enfermedadActual);
    }

    public void setRevisionSistemas(String revisionSistemas) {
        if (informacionConsulta == null) {
            informacionConsulta = new InformacionConsulta();
        }
        informacionConsulta.setRevisionSistemas(revisionSistemas);
    }

    public void setMedicamentosActuales(String medicamentosActuales) {
        if (informacionConsulta == null) {
            informacionConsulta = new InformacionConsulta();
        }
        informacionConsulta.setMedicamentosActuales(medicamentosActuales);
    }

    public void setObservaciones(String observaciones) {
        if (informacionConsulta == null) {
            informacionConsulta = new InformacionConsulta();
        }
        informacionConsulta.setObservaciones(observaciones);
    }

    public void setAntecedentesPersonales(String antecedentesPersonales) {
        if (antecedentesClinico == null) {
            antecedentesClinico = new AntecedentesClinico();
        }
        antecedentesClinico.setAntecedentesPersonales(antecedentesPersonales);
    }

    public void setAntecedentesFamiliares(String antecedentesFamiliares) {
        if (antecedentesClinico == null) {
            antecedentesClinico = new AntecedentesClinico();
        }
        antecedentesClinico.setAntecedentesFamiliares(antecedentesFamiliares);
    }

    public void setAntecedentesQuirurgicos(String antecedentesQuirurgicos) {
        if (antecedentesClinico == null) {
            antecedentesClinico = new AntecedentesClinico();
        }
        antecedentesClinico.setAntecedentesQuirurgicos(antecedentesQuirurgicos);
    }

    public void setAntecedentesAlergicos(String antecedentesAlergicos) {
        if (antecedentesClinico == null) {
            antecedentesClinico = new AntecedentesClinico();
        }
        antecedentesClinico.setAntecedentesAlergicos(antecedentesAlergicos);
    }

    public void setExamenFisico(String examenFisico) {
        if (examenClinico == null) {
            examenClinico = new ExamenClinico();
        }
        examenClinico.setExamenFisico(examenFisico);
    }

    public void setSignosVitales(String signosVitales) {
        if (examenClinico == null) {
            examenClinico = new ExamenClinico();
        }
        examenClinico.setSignosVitales(signosVitales);
    }

    public void setDiagnosticos(String diagnosticos) {
        if (diagnosticoTratamiento == null) {
            diagnosticoTratamiento = new DiagnosticoTratamiento();
        }
        diagnosticoTratamiento.setDiagnosticos(diagnosticos);
    }

    public void setPlanTratamiento(String planTratamiento) {
        if (diagnosticoTratamiento == null) {
            diagnosticoTratamiento = new DiagnosticoTratamiento();
        }
        diagnosticoTratamiento.setPlanTratamiento(planTratamiento);
    }
}
