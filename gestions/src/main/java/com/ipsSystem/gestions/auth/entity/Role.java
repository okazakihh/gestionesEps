package com.ipsSystem.gestions.auth.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "nombre", unique = true, nullable = false, length = 50)
    private String name;
    
    public Role() {}
    
    public Role(String name) {
        this.name = name;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    @Override
    public String toString() {
        return "Role{" +
                "id=" + id +
                ", nombre='" + name + '\'' +
                '}';
    }
}
