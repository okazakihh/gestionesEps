package com.gestioneps.pacientes.entity;

public enum TipoDocumentoMedico {
    LABORATORIO("Resultado de Laboratorio"),
    IMAGEN_DIAGNOSTICA("Imagen Diagnóstica"),
    ELECTROCARDIOGRAMA("Electrocardiograma"),
    RADIOGRAFIA("Radiografía"),
    ECOGRAFIA("Ecografía"),
    TOMOGRAFIA("Tomografía"),
    RESONANCIA("Resonancia Magnética"),
    ENDOSCOPIA("Endoscopia"),
    BIOPSIA("Biopsia"),
    INTERCONSULTA("Interconsulta"),
    FORMULA_MEDICA("Fórmula Médica"),
    INCAPACIDAD("Incapacidad"),
    REMISION("Remisión"),
    CONSENTIMIENTO("Consentimiento Informado"),
    EPICRISIS("Epicrisis"),
    CERTIFICADO("Certificado Médico"),
    OTRO("Otro");

    private final String descripcion;

    TipoDocumentoMedico(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
