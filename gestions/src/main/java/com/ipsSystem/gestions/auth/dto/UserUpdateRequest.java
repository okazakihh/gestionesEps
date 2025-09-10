package com.ipsSystem.gestions.auth.dto;

import com.ipsSystem.gestions.auth.entity.PersonalInfo;
import com.ipsSystem.gestions.auth.entity.ContactInfo;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UserUpdateRequest {
    
    @Email(message = "El email debe tener un formato válido")
    private String email;
    
    @Size(min = 6, max = 100, message = "La contraseña debe tener entre 6 y 100 caracteres")
    private String password;
    
    private PersonalInfo personalInfo;
    
    private ContactInfo contactInfo;

    private Boolean enabled;
    
    public UserUpdateRequest() {}
    
    public UserUpdateRequest(String email, String password, PersonalInfo personalInfo, ContactInfo contactInfo) {
        this.email = email;
        this.password = password;
        this.personalInfo = personalInfo;
        this.contactInfo = contactInfo;
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
}
