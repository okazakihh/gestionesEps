package com.ipsSystem.gestions.auth.dto;

import com.ipsSystem.gestions.auth.entity.PersonalInfo;
import com.ipsSystem.gestions.auth.entity.ContactInfo;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public class RegisterRequest {
    
    @NotBlank(message = "El username es requerido")
    @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
    private String username;
    
    @NotBlank(message = "El email es requerido")
    @Email(message = "El email debe tener un formato válido")
    private String email;
    
    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres")
    private String password;
    
    private PersonalInfo personalInfo;
    
    private ContactInfo contactInfo;
    
    private Set<String> roles;
    
    public RegisterRequest() {}
    
    public RegisterRequest(String username, String email, String password, 
                          PersonalInfo personalInfo, ContactInfo contactInfo, Set<String> roles) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.personalInfo = personalInfo;
        this.contactInfo = contactInfo;
        this.roles = roles;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public PersonalInfo getPersonalInfo() {
        return personalInfo;
    }
    
    public void setPersonalInfo(PersonalInfo personalInfo) {
        this.personalInfo = personalInfo;
    }
    
    public ContactInfo getContactInfo() {
        return contactInfo;
    }
    
    public void setContactInfo(ContactInfo contactInfo) {
        this.contactInfo = contactInfo;
    }
    
    public Set<String> getRoles() {
        return roles;
    }
    
    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}
