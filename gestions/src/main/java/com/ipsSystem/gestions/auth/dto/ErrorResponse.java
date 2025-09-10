package com.ipsSystem.gestions.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public class ErrorResponse {
    
    @JsonProperty("success")
    private boolean success = false;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("error")
    private String error;
    
    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
    
    @JsonProperty("path")
    private String path;
    
    public ErrorResponse() {
        this.timestamp = LocalDateTime.now();
    }
    
    public ErrorResponse(String message) {
        this();
        this.message = message;
    }
    
    public ErrorResponse(String message, String error) {
        this(message);
        this.error = error;
    }
    
    public ErrorResponse(String message, String error, String path) {
        this(message, error);
        this.path = path;
    }
    
    // Getters and setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getPath() {
        return path;
    }
    
    public void setPath(String path) {
        this.path = path;
    }
}
