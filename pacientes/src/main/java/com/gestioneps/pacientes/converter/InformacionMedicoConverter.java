package com.gestioneps.pacientes.converter;

import com.gestioneps.pacientes.entity.InformacionMedico;

public class InformacionMedicoConverter extends AbstractJsonConverter<InformacionMedico> {
    @Override
    protected Class<InformacionMedico> getEntityClass() {
        return InformacionMedico.class;
    }
}
