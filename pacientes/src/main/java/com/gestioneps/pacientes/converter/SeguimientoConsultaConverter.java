package com.gestioneps.pacientes.converter;

import com.gestioneps.pacientes.entity.SeguimientoConsulta;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class SeguimientoConsultaConverter extends AbstractJsonConverter<SeguimientoConsulta> {

    @Override
    protected Class<SeguimientoConsulta> getEntityClass() {
        return SeguimientoConsulta.class;
    }

}
