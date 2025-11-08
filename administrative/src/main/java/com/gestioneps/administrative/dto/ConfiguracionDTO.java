package com.gestioneps.administrative.dto;

public class ConfiguracionDTO {

    private Long id;
    private String jsonData;
    private String tipoConfiguracion;
    private String clave;
    private Boolean activo;
    private String fechaCreacion;
    private String fechaActualizacion;

    // Constructors
    public ConfiguracionDTO() {}

    public ConfiguracionDTO(Long id, String jsonData, String tipoConfiguracion, String clave, 
                           Boolean activo, String fechaCreacion, String fechaActualizacion) {
        this.id = id;
        this.jsonData = jsonData;
        this.tipoConfiguracion = tipoConfiguracion;
        this.clave = clave;
        this.activo = activo;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getJsonData() {
        return jsonData;
    }

    public void setJsonData(String jsonData) {
        this.jsonData = jsonData;
    }

    public String getTipoConfiguracion() {
        return tipoConfiguracion;
    }

    public void setTipoConfiguracion(String tipoConfiguracion) {
        this.tipoConfiguracion = tipoConfiguracion;
    }

    public String getClave() {
        return clave;
    }

    public void setClave(String clave) {
        this.clave = clave;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public String getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(String fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public String getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(String fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}
