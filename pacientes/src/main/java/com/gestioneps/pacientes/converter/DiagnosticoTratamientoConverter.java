package com.gestioneps.pacientes.converter;

import com.gestioneps.pacientes.entity.DiagnosticoTratamiento;

public class DiagnosticoTratamientoConverter extends AbstractJsonConverter<DiagnosticoTratamiento> {
    @Override
    protected Class<DiagnosticoTratamiento> getEntityClass() {
        return DiagnosticoTratamiento.class;
    }
}
