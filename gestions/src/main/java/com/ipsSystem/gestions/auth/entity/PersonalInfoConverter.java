package com.ipsSystem.gestions.auth.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class PersonalInfoConverter implements AttributeConverter<PersonalInfo, String> {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public String convertToDatabaseColumn(PersonalInfo personalInfo) {
        if (personalInfo == null) {
            return null;
        }
        
        try {
            return objectMapper.writeValueAsString(personalInfo);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al convertir PersonalInfo a JSON", e);
        }
    }
    
    @Override
    public PersonalInfo convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }
        
        try {
            return objectMapper.readValue(dbData, PersonalInfo.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al convertir JSON a PersonalInfo", e);
        }
    }
}
