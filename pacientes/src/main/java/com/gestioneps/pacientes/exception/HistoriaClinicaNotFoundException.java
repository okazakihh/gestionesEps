package com.gestioneps.pacientes.exception;

public class HistoriaClinicaNotFoundException extends RuntimeException {
    public HistoriaClinicaNotFoundException(String message) {
        super(message);
    }
    
    public HistoriaClinicaNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
