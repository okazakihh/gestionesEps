package com.gestioneps.pacientes.converter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.persistence.AttributeConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Generic base class for JSON <-> String JPA converters using Jackson.
 * Subclasses must provide the concrete entity class via getEntityClass().
 */
public abstract class AbstractJsonConverter<T> implements AttributeConverter<T, String> {

    private static final Logger LOGGER = LoggerFactory.getLogger(AbstractJsonConverter.class);

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    protected abstract Class<T> getEntityClass();

    @Override
    public String convertToDatabaseColumn(T attribute) {
        if (attribute == null) return null;
        try {
            LOGGER.debug("Serializing attribute of type: {}", getEntityClass().getSimpleName());
            String result = MAPPER.writeValueAsString(attribute);
            LOGGER.debug("Serialization successful for {}", getEntityClass().getSimpleName());
            return result;
        } catch (Exception e) {
            LOGGER.error("Error serializing JSON attribute for {}: {}", getEntityClass().getSimpleName(), e.getMessage());
            throw new IllegalArgumentException("Error serializing JSON attribute: " + e.getMessage(), e);
        }
    }

    @Override
    public T convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        dbData = dbData.trim();
        if (dbData.isEmpty()) return null;
        try {
            return MAPPER.readValue(dbData, getEntityClass());
        } catch (Exception e) {
            // Defensive: do not break the whole request when some DB rows contain malformed JSON.
            // Log a compact warning with the offending snippet and return null so the application can continue.
            String snippet = dbData.length() > 200 ? dbData.substring(0, 200) + "..." : dbData;
            LOGGER.warn("Failed to parse JSON for {} : {}", getEntityClass().getSimpleName(), e.getMessage());
            LOGGER.warn("DB content snippet: {}", snippet);
            // Return null to indicate absence / malformed content. Upstream code should handle nulls.
            return null;
        }
    }
}
