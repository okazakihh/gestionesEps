package com.gestioneps.pacientes.converter;

import com.gestioneps.pacientes.entity.ContactoEmergencia;

public class ContactoEmergenciaConverter extends AbstractJsonConverter<ContactoEmergencia> {
    @Override
    protected Class<ContactoEmergencia> getEntityClass() {
        return ContactoEmergencia.class;
    }
}
