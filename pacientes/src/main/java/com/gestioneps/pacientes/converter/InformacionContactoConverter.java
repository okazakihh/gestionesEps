package com.gestioneps.pacientes.converter;

import com.gestioneps.pacientes.entity.InformacionContacto;

public class InformacionContactoConverter extends AbstractJsonConverter<InformacionContacto> {
    @Override
    protected Class<InformacionContacto> getEntityClass() {
        return InformacionContacto.class;
    }
}
