package com.gestioneps.pacientes.converter;

import com.gestioneps.pacientes.entity.AntecedentesClinico;

public class AntecedentesClinicoConverter extends AbstractJsonConverter<AntecedentesClinico> {
    @Override
    protected Class<AntecedentesClinico> getEntityClass() {
        return AntecedentesClinico.class;
    }
}
