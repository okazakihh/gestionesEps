package com.ipsSystem.gestions.auth.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ContactInfo {
    
    @JsonProperty("telefono")
    private String telefono;
    
    @JsonProperty("direccion")
    private String direccion;
    
    @JsonProperty("ciudad")
    private String ciudad;
    
    @JsonProperty("departamento")
    private String departamento;
    
    @JsonProperty("pais")
    private String pais;
    
    @JsonProperty("codigoPostal")
    private String codigoPostal;
    
    public ContactInfo() {}
    
    public ContactInfo(String telefono, String direccion, String ciudad) {
        this.telefono = telefono;
        this.direccion = direccion;
        this.ciudad = ciudad;
    }
    
    public String getTelefono() {
        return telefono;
    }
    
    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
    
    public String getDireccion() {
        return direccion;
    }
    
    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
    
    public String getCiudad() {
        return ciudad;
    }
    
    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }
    
    public String getDepartamento() {
        return departamento;
    }
    
    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }
    
    public String getPais() {
        return pais;
    }
    
    public void setPais(String pais) {
        this.pais = pais;
    }
    
    public String getCodigoPostal() {
        return codigoPostal;
    }
    
    public void setCodigoPostal(String codigoPostal) {
        this.codigoPostal = codigoPostal;
    }
    
    @Override
    public String toString() {
        return "ContactInfo{" +
                "telefono='" + telefono + '\'' +
                ", direccion='" + direccion + '\'' +
                ", ciudad='" + ciudad + '\'' +
                ", departamento='" + departamento + '\'' +
                ", pais='" + pais + '\'' +
                ", codigoPostal='" + codigoPostal + '\'' +
                '}';
    }
}
