package com.ipsSystem.gestions.auth.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class ContactInfoConverter implements AttributeConverter<ContactInfo, String> {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public String convertToDatabaseColumn(ContactInfo contactInfo) {
        if (contactInfo == null) {
            return null;
        }
        
        try {
            return objectMapper.writeValueAsString(contactInfo);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al convertir ContactInfo a JSON", e);
        }
    }
    
    @Override
    public ContactInfo convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        
        try {
            return objectMapper.readValue(dbData, ContactInfo.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al convertir JSON a ContactInfo", e);
        }
    }
}
