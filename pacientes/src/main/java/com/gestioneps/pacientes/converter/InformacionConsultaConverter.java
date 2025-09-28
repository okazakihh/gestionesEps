package com.gestioneps.pacientes.converter;

import com.gestioneps.pacientes.entity.InformacionConsulta;

public class InformacionConsultaConverter extends AbstractJsonConverter<InformacionConsulta> {
    @Override
    protected Class<InformacionConsulta> getEntityClass() {
        return InformacionConsulta.class;
    }
}
