package com.gestioneps.pacientes.converter;

import com.gestioneps.pacientes.entity.InformacionPersonal;

public class InformacionPersonalConverter extends AbstractJsonConverter<InformacionPersonal> {
    @Override
    protected Class<InformacionPersonal> getEntityClass() {
        return InformacionPersonal.class;
    }
}
