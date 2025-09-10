package com.ipsSystem.gestions.auth.dto;

import com.ipsSystem.gestions.auth.entity.User;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Set;
import java.util.stream.Collectors;

public class LoginResponse {
    
    @JsonProperty("token")
    private String token;
    
    @JsonProperty("user")
    private UserInfo user;
    
    public LoginResponse() {}
    
    public LoginResponse(String token, User user) {
        this.token = token;
        this.user = new UserInfo(user);
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public UserInfo getUser() {
        return user;
    }
    
    public void setUser(UserInfo user) {
        this.user = user;
    }
    
    public static class UserInfo {
        @JsonProperty("id")
        private Long id;
        
        @JsonProperty("username")
        private String username;
        
        @JsonProperty("email")
        private String email;
        
        @JsonProperty("personalInfo")
        private com.ipsSystem.gestions.auth.entity.PersonalInfo personalInfo;
        
        @JsonProperty("contactInfo")
        private com.ipsSystem.gestions.auth.entity.ContactInfo contactInfo;
        
        @JsonProperty("roles")
        private Set<String> roles;
        
        @JsonProperty("enabled")
        private boolean enabled;
        
        @JsonProperty("createdAt")
        private java.time.LocalDateTime createdAt;
        
        public UserInfo() {}
        
        public UserInfo(User user) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.personalInfo = user.getPersonalInfo();
            this.contactInfo = user.getContactInfo();
            this.roles = user.getRoles().stream()
                    .map(role -> role.getName())
                    .collect(Collectors.toSet());
            this.enabled = user.isEnabled();
            this.createdAt = user.getCreatedAt();
        }
        
        // Getters and setters
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
        
        public com.ipsSystem.gestions.auth.entity.PersonalInfo getPersonalInfo() {
            return personalInfo;
        }
        
        public void setPersonalInfo(com.ipsSystem.gestions.auth.entity.PersonalInfo personalInfo) {
            this.personalInfo = personalInfo;
        }
        
        public com.ipsSystem.gestions.auth.entity.ContactInfo getContactInfo() {
            return contactInfo;
        }
        
        public void setContactInfo(com.ipsSystem.gestions.auth.entity.ContactInfo contactInfo) {
            this.contactInfo = contactInfo;
        }
        
        public Set<String> getRoles() {
            return roles;
        }
        
        public void setRoles(Set<String> roles) {
            this.roles = roles;
        }
        
        public boolean isEnabled() {
            return enabled;
        }
        
        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
        
        public java.time.LocalDateTime getCreatedAt() {
            return createdAt;
        }
        
        public void setCreatedAt(java.time.LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }
}
