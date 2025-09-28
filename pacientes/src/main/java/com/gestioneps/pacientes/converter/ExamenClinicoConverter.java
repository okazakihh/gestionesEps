package com.gestioneps.pacientes.converter;

import com.gestioneps.pacientes.entity.ExamenClinico;

public class ExamenClinicoConverter extends AbstractJsonConverter<ExamenClinico> {
    @Override
    protected Class<ExamenClinico> getEntityClass() {
        return ExamenClinico.class;
    }
}
