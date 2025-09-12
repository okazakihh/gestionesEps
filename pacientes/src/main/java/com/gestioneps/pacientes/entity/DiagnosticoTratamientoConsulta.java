package com.gestioneps.pacientes.entity;

import jakarta.validation.constraints.*;

public class DiagnosticoTratamientoConsulta {

    @NotBlank(message = "El diagnóstico principal es obligatorio")
    private String diagnosticoPrincipal;

    private String diagnosticosSecundarios;

    private String planManejo;

    private String medicamentosFormulados;

    private String examenesSolicitados;

    private String recomendaciones;

    // Constructors
    public DiagnosticoTratamientoConsulta() {}

    public DiagnosticoTratamientoConsulta(String diagnosticoPrincipal, String diagnosticosSecundarios,
                                        String planManejo, String medicamentosFormulados,
                                        String examenesSolicitados, String recomendaciones) {
        this.diagnosticoPrincipal = diagnosticoPrincipal;
        this.diagnosticosSecundarios = diagnosticosSecundarios;
        this.planManejo = planManejo;
        this.medicamentosFormulados = medicamentosFormulados;
        this.examenesSolicitados = examenesSolicitados;
        this.recomendaciones = recomendaciones;
    }

    // Getters and Setters
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
}
