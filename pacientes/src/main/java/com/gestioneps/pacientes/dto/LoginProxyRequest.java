package com.gestioneps.pacientes.dto;

public class LoginProxyRequest {

    private String credentialsBase64;

    public LoginProxyRequest() {}

    public String getCredentialsBase64() {
        return credentialsBase64;
    }

    public void setCredentialsBase64(String credentialsBase64) {
        this.credentialsBase64 = credentialsBase64;
    }
}
