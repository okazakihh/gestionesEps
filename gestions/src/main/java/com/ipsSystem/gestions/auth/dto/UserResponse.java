package com.ipsSystem.gestions.auth.dto;

import com.ipsSystem.gestions.auth.entity.User;
import com.ipsSystem.gestions.auth.entity.PersonalInfo;
import com.ipsSystem.gestions.auth.entity.ContactInfo;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

public class UserResponse {
    
    private Long id;
    private String username;
    private String email;
    private PersonalInfo personalInfo;
    private ContactInfo contactInfo;
    private Set<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isActive;
    
    public UserResponse() {}
    
    public UserResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.personalInfo = user.getPersonalInfo();
        this.contactInfo = user.getContactInfo();
        this.isActive = user.isEnabled();
        this.roles = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet());
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
    }
    
    // Constructor para tests
    public UserResponse(Long id, String username, String email, Set<String> roles) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isActive() {
        return isActive;
    }
}
