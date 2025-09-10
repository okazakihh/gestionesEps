package com.ipsSystem.gestions.auth.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PersonalInfo {
    
    @JsonProperty("nombres")
    private String nombres;
    
    @JsonProperty("apellidos")
    private String apellidos;
    
    @JsonProperty("documento")
    private String documento;
    
    @JsonProperty("tipoDocumento")
    private String tipoDocumento;
    
    @JsonProperty("fechaNacimiento")
    private String fechaNacimiento;
    
    @JsonProperty("genero")
    private String genero;
    
    public PersonalInfo() {}
    
    public PersonalInfo(String nombres, String apellidos, String documento, String tipoDocumento) {
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.documento = documento;
        this.tipoDocumento = tipoDocumento;
    }
    
    public String getNombres() {
        return nombres;
    }
    
    public void setNombres(String nombres) {
        this.nombres = nombres;
    }
    
    public String getApellidos() {
        return apellidos;
    }
    
    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }
    
    public String getDocumento() {
        return documento;
    }
    
    public void setDocumento(String documento) {
        this.documento = documento;
    }
    
    public String getTipoDocumento() {
        return tipoDocumento;
    }
    
    public void setTipoDocumento(String tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }
    
    public String getFechaNacimiento() {
        return fechaNacimiento;
    }
    
    public void setFechaNacimiento(String fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }
    
    public String getGenero() {
        return genero;
    }
    
    public void setGenero(String genero) {
        this.genero = genero;
    }
    
    @Override
    public String toString() {
        return "PersonalInfo{" +
                "nombres='" + nombres + '\'' +
                ", apellidos='" + apellidos + '\'' +
                ", documento='" + documento + '\'' +
                ", tipoDocumento='" + tipoDocumento + '\'' +
                ", fechaNacimiento='" + fechaNacimiento + '\'' +
                ", genero='" + genero + '\'' +
                '}';
    }
}
