package com.gestioneps.pacientes.converter;

import com.gestioneps.pacientes.entity.InformacionMedica;

public class InformacionMedicaConverter extends AbstractJsonConverter<InformacionMedica> {
    @Override
    protected Class<InformacionMedica> getEntityClass() {
        return InformacionMedica.class;
    }
}
